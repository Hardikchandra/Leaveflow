const db = require("../db/database");

// Helper to calculate leave days (inclusive of start and end date)
function calculateDays(fromDate, toDate) {
  const from = new Date(fromDate);
  const to = new Date(toDate);
  const diffTime = Math.abs(to - from);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  return diffDays;
}

// Create new leave request
exports.createLeave = (req, res) => {
  const { userId, leaveType, fromDate, toDate, reason, approvalMessage, medicalCertificate } = req.body;

  // Basic validation
  if (!userId || !leaveType || !fromDate || !toDate || !reason) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  if (new Date(fromDate) > new Date(toDate)) {
    return res.status(400).json({ message: "Invalid date range" });
  }

  const leaveDays = calculateDays(fromDate, toDate);

  // Check if paid leave was applied on time (1 day before 5 PM)
  let paidLeaveValidTime = false;
  if (leaveType === "PAID") {
    const now = new Date();
    const leaveStart = new Date(fromDate);
    const cutoffTime = new Date(leaveStart);
    cutoffTime.setDate(cutoffTime.getDate() - 1);
    cutoffTime.setHours(17, 0, 0, 0);
    
    paidLeaveValidTime = now <= cutoffTime;
  }

  // Emergency leave needs approval message
  if (leaveType === "EMERGENCY" && !approvalMessage) {
    return res.status(400).json({ 
      message: "Emergency leave requires an approval message" 
    });
  }

  // Warn if medical certificate is missing
  if (leaveType === "MEDICAL" && !medicalCertificate) {
    console.warn("Medical leave submitted without certificate");
  }

  // Get user's leave balance
  db.get(
    "SELECT * FROM leave_balances WHERE user_id = ?",
    [userId],
    (err, balance) => {
      if (err || !balance) {
        return res.status(500).json({ message: "Leave balance not found" });
      }

      // Default status and settings
      let status = "PENDING";
      let statusColor = "orange";
      let finalLeaveType = leaveType;
      let hrStatus = "PENDING";
      let managerStatus = "PENDING";

      // Emergency and medical leave go through HR approval first
      if (leaveType === "EMERGENCY") {
        hrStatus = "PENDING";
        managerStatus = "PENDING";
        statusColor = "red";
      }

      // Medical leave - goes to HR first
      if (leaveType === "MEDICAL") {
        hrStatus = "PENDING";
        managerStatus = "PENDING";
        statusColor = "orange";
      }

      // Auto-approve paid leave if applied on time and have balance
      if (leaveType === "PAID") {
        if (balance.remaining_paid >= leaveDays) {
          if (paidLeaveValidTime) {
            status = "APPROVED";
            statusColor = "green";
            hrStatus = "APPROVED";
            managerStatus = "APPROVED";
            
            // Deduct balance right away for auto-approved leaves
            db.run(
              `UPDATE leave_balances SET used_paid = used_paid + ?, remaining_paid = remaining_paid - ? WHERE user_id = ?`,
              [leaveDays, leaveDays, userId]
            );
          } else {
            hrStatus = "PENDING";
            managerStatus = "PENDING";
            statusColor = "orange";
          }
        } else {
          // Not enough paid leave balance - switch to unpaid
          finalLeaveType = "UNPAID";
          hrStatus = "PENDING";
          managerStatus = "PENDING";
          statusColor = "red";
        }
      }

      if (leaveType === "UNPAID") {
        hrStatus = "PENDING";
        managerStatus = "PENDING";
        statusColor = "red";
      }

      // Save leave request to database
      const insertQuery = `
        INSERT INTO leaves
        (user_id, leave_type, from_date, to_date, reason, approval_message, medical_certificate, 
         status, status_color, hr_status, manager_status, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
      `;

      db.run(
        insertQuery,
        [
          userId,
          finalLeaveType,
          fromDate,
          toDate,
          reason,
          approvalMessage || null,
          medicalCertificate || null,
          status,
          statusColor,
          hrStatus,
          managerStatus
        ],
        function (err) {
          if (err) {
            return res.status(500).json({ message: "Insert failed", error: err });
          }

          res.json({
            success: true,
            leaveId: this.lastID,
            status,
            finalLeaveType,
            hrStatus,
            managerStatus,
            message: finalLeaveType !== leaveType 
              ? "Paid leave balance exhausted. Applied as UNPAID leave."
              : "Leave application submitted successfully"
          });
        }
      );
    }
  );
};

// Get leave history for a user
exports.getLeavesByUser = (req, res) => {
  const userId = req.params.userId;

  db.all(
    `
    SELECT *
    FROM leaves
    WHERE user_id = ?
    ORDER BY created_at DESC
    `,
    [userId],
    (err, rows) => {
      if (err) {
        return res.status(500).json({ message: "Database error", error: err });
      }
      res.json(rows);
    }
  );
};

// Get all pending leaves for HR (first level approval)
exports.getPendingLeaves = (req, res) => {
  db.all(
    `
    SELECT 
      l.*,
      u.name as user_name,
      u.email as user_email
    FROM leaves l
    JOIN users u ON l.user_id = u.id
    WHERE l.hr_status = 'PENDING'
    ORDER BY 
      CASE WHEN l.leave_type = 'EMERGENCY' THEN 0 ELSE 1 END,
      l.created_at DESC
    `,
    [],
    (err, rows) => {
      if (err) {
        return res.status(500).json({ message: "Database error", error: err });
      }
      res.json(rows);
    }
  );
};

// Get all HR-approved leaves pending Manager approval
exports.getManagerPendingLeaves = (req, res) => {
  db.all(
    `
    SELECT 
      l.*,
      u.name as user_name,
      u.email as user_email
    FROM leaves l
    JOIN users u ON l.user_id = u.id
    WHERE l.hr_status = 'APPROVED' AND l.manager_status = 'PENDING'
    ORDER BY l.created_at DESC
    `,
    [],
    (err, rows) => {
      if (err) {
        return res.status(500).json({ message: "Database error", error: err });
      }
      res.json(rows);
    }
  );
};

// Update leave status by HR (first level approval)
exports.updateHRStatus = (req, res) => {
  const { leaveId, status, comment } = req.body;

  // Validate input
  if (!leaveId || !status) {
    return res.status(400).json({ message: "leaveId and status are required" });
  }

  if (!['APPROVED', 'REJECTED'].includes(status)) {
    return res.status(400).json({ message: "Invalid status" });
  }

  // Update HR status
  db.run(
    `
    UPDATE leaves
    SET hr_status = ?,
        hr_comment = ?,
        status = CASE WHEN ? = 'REJECTED' THEN 'REJECTED' ELSE status END,
        status_color = CASE WHEN ? = 'REJECTED' THEN 'gray' ELSE status_color END
    WHERE id = ?
    `,
    [status, comment || null, status, status, leaveId],
    function (err) {
      if (err) {
        return res.status(500).json({ message: "Update failed", error: err });
      }

      if (this.changes === 0) {
        return res.status(404).json({ message: "Leave not found" });
      }

      res.json({ 
        success: true, 
        message: status === 'APPROVED' 
          ? 'Leave approved by HR. Pending Manager approval.' 
          : 'Leave rejected by HR' 
      });
    }
  );
};

// Update leave status by Manager (final approval)
exports.updateLeaveStatus = (req, res) => {
  const { leaveId, status, managerComment } = req.body;

  // Validate input
  if (!leaveId || !status) {
    return res.status(400).json({ message: "leaveId and status are required" });
  }

  if (!['APPROVED', 'REJECTED'].includes(status)) {
    return res.status(400).json({ message: "Invalid status" });
  }

  // Determine final status and color
  const finalStatus = status;
  const statusColor = status === 'APPROVED' ? 'green' : 'gray';

  // Update the leave with Manager final decision
  db.run(
    `
    UPDATE leaves
    SET manager_status = ?,
        status = ?,
        status_color = ?,
        manager_comment = ?
    WHERE id = ? AND hr_status = 'APPROVED'
    `,
    [status, finalStatus, statusColor, managerComment || null, leaveId],
    function (err) {
      if (err) {
        return res.status(500).json({ message: "Update failed", error: err });
      }

      if (this.changes === 0) {
        return res.status(404).json({ message: "Leave not found or not HR-approved yet" });
      }

      // If approved, update leave balance for PAID leave
      if (status === 'APPROVED') {
        db.get("SELECT * FROM leaves WHERE id = ?", [leaveId], (err, leave) => {
          if (!err && leave && leave.leave_type === 'PAID') {
            // Calculate number of days
            const leaveDays = calculateDays(leave.from_date, leave.to_date);
            db.run(
              `
              UPDATE leave_balances
              SET used_paid = used_paid + ?,
                  remaining_paid = remaining_paid - ?
              WHERE user_id = ?
              `,
              [leaveDays, leaveDays, leave.user_id]
            );
          }
        });
      }

      res.json({ success: true, message: `Leave ${status.toLowerCase()} by Manager` });
    }
  );
};

// Get leave balance for a user
exports.getLeaveBalance = (req, res) => {
  const userId = req.params.userId;

  db.get(
    `SELECT * FROM leave_balances WHERE user_id = ?`,
    [userId],
    (err, balance) => {
      if (err) {
        return res.status(500).json({ message: "Database error", error: err });
      }

      if (!balance) {
        // Return default if not found
        return res.json({
          user_id: userId,
          total_paid: 12,
          used_paid: 0,
          remaining_paid: 12,
          excess_paid_count: 0
        });
      }

      res.json(balance);
    }
  );
};

// Get recent leave activity log (last 5 approved/rejected)
exports.getRecentLeaveLog = (req, res) => {
  db.all(
    `
    SELECT 
      l.*,
      u.name as user_name,
      u.email as user_email
    FROM leaves l
    JOIN users u ON l.user_id = u.id
    WHERE l.status IN ('APPROVED', 'REJECTED') OR l.hr_status != 'PENDING'
    ORDER BY l.created_at DESC
    LIMIT 5
    `,
    [],
    (err, rows) => {
      if (err) {
        return res.status(500).json({ message: "Database error", error: err });
      }
      res.json(rows);
    }
  );
};

// Get employees currently on leave
exports.getOnLeaveToday = (req, res) => {
  const today = new Date().toISOString().split('T')[0];
  
  db.all(
    `
    SELECT 
      l.*,
      u.name as user_name,
      u.email as user_email
    FROM leaves l
    JOIN users u ON l.user_id = u.id
    WHERE l.status = 'APPROVED' 
      AND l.from_date <= ? 
      AND l.to_date >= ?
    ORDER BY l.from_date ASC
    `,
    [today, today],
    (err, rows) => {
      if (err) {
        return res.status(500).json({ message: "Database error", error: err });
      }
      res.json(rows);
    }
  );
};
