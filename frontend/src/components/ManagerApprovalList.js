import React, { useEffect, useState } from "react";
import {
  getPendingLeaves,
  updateLeaveStatus
} from "../services/leaveService";

function ManagerApprovalList() {
  const [leaves, setLeaves] = useState([]);
  const [comments, setComments] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

 // Fetches pending leaves from the API
  const loadLeaves = async () => {
    try {
      const data = await getPendingLeaves();
      setLeaves(data);
      setError(null);
    } catch (err) {
      setError("Failed to load pending requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLeaves();
  }, []);

  /**
   * Handles comment input change
   * @param {number} leaveId - Leave ID
   * @param {string} value - Comment text
   */
  const handleCommentChange = (leaveId, value) => {
    setComments((prev) => ({
      ...prev,
      [leaveId]: value
    }));
  };

  /**
   * Handles approve/reject action
   * @param {number} leaveId - Leave ID
   * @param {string} status - APPROVED or REJECTED
   */
  const handleAction = async (leaveId, status) => {
    try {
      await updateLeaveStatus(
        leaveId,
        status,
        comments[leaveId] || ""
      );

      setComments((prev) => {
        const updated = { ...prev };
        delete updated[leaveId];
        return updated;
      });

      loadLeaves();
    } catch (err) {
      alert("Failed to update leave status");
    }
  };

  if (loading) {
    return <p>Loading pending requests...</p>;
  }

  if (error) {
    return <p className="error-text">{error}</p>;
  }

  if (leaves.length === 0) {
    return (
      <div>
        <h3>Pending Leave Requests</h3>
        <p className="no-data">No pending requests. All caught up!</p>
      </div>
    );
  }

  return (
    <div>
      <h3>Pending Leave Requests ({leaves.length})</h3>

      {leaves.map((leave) => (
        <div key={leave.id} className="approval-item">
          <p>
            <strong>Employee:</strong> {leave.user_name} ({leave.user_email})
          </p>

          <p>
            <strong>Leave Type:</strong>{" "}
            <span
              style={{
                color: leave.leave_type === "UNPAID" ? "#dc2626" : "#059669",
                fontWeight: "600"
              }}
            >
              {leave.leave_type}
            </span>
            {leave.status === "PRIORITY_REVIEW" && (
              <span
                style={{
                  marginLeft: "8px",
                  background: "#fef3c7",
                  color: "#92400e",
                  padding: "2px 8px",
                  borderRadius: "4px",
                  fontSize: "12px"
                }}
              >
                Priority
              </span>
            )}
          </p>

          <p>
            <strong>Dates:</strong> {leave.from_date} to {leave.to_date}
          </p>

          <p>
            <strong>Reason:</strong> {leave.reason}
          </p>

          <textarea
            placeholder="Add a comment (optional)"
            value={comments[leave.id] || ""}
            onChange={(e) => handleCommentChange(leave.id, e.target.value)}
            rows="2"
          />

          <div>
            <button onClick={() => handleAction(leave.id, "APPROVED")}>
              ✓ Approve
            </button>
            <button onClick={() => handleAction(leave.id, "REJECTED")}>
              ✕ Reject
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

export default ManagerApprovalList;
