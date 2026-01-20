const db = require("../db/database");

// Get all users (for Manager to view HR and Employees)
exports.getAllUsers = (req, res) => {
  db.all(
    `
    SELECT id, name, email, role, created_at
    FROM users
    ORDER BY 
      CASE role
        WHEN 'MANAGER' THEN 1
        WHEN 'HR' THEN 2
        WHEN 'EMPLOYEE' THEN 3
      END,
      name ASC
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

// Get all employees (for HR dashboard)
exports.getEmployees = (req, res) => {
  db.all(
    `
    SELECT id, name, email, role, created_at
    FROM users
    WHERE role = 'EMPLOYEE'
    ORDER BY name ASC
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

// Create new user (Manager can create HR or Employee)
exports.createUser = (req, res) => {
  const { name, email, role, createdBy } = req.body;

  // Validation
  if (!name || !email || !role) {
    return res.status(400).json({ message: "Name, email, and role are required" });
  }

  if (!['HR', 'EMPLOYEE'].includes(role)) {
    return res.status(400).json({ message: "Can only create HR or EMPLOYEE users" });
  }

  // Verify the creator is a Manager
  db.get(
    "SELECT role FROM users WHERE id = ?",
    [createdBy],
    (err, user) => {
      if (err || !user) {
        return res.status(403).json({ message: "Unauthorized" });
      }

      if (user.role !== 'MANAGER') {
        return res.status(403).json({ message: "Only Managers can create users" });
      }

      // Check if email already exists
      db.get(
        "SELECT id FROM users WHERE email = ?",
        [email],
        (err, existing) => {
          if (existing) {
            return res.status(400).json({ message: "Email already exists" });
          }

          // Create the user
          db.run(
            `
            INSERT INTO users (name, email, role, created_at)
            VALUES (?, ?, ?, datetime('now'))
            `,
            [name, email, role],
            function (err) {
              if (err) {
                return res.status(500).json({ message: "User creation failed", error: err });
              }

              const newUserId = this.lastID;

              // Create leave balance for the new user
              db.run(
                `
                INSERT INTO leave_balances (user_id, total_paid, used_paid, remaining_paid, excess_paid_count)
                VALUES (?, 12, 0, 12, 0)
                `,
                [newUserId],
                (err) => {
                  if (err) {
                    console.error("Failed to create leave balance:", err);
                  }
                }
              );

              res.json({
                success: true,
                message: `${role} user created successfully`,
                user: {
                  id: newUserId,
                  name,
                  email,
                  role
                }
              });
            }
          );
        }
      );
    }
  );
};
