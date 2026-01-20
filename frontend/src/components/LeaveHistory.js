import React, { useEffect, useState } from "react";
import { getLeaveHistory } from "../services/leaveService";
import { getCurrentUser } from "../services/authService";

function LeaveHistory({ refreshTrigger }) {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /**
   * Fetches leave history from the API
   */
  const fetchLeaves = async () => {
    const user = getCurrentUser();
    if (!user) {
      setError("Please login to view leave history");
      setLoading(false);
      return;
    }

    try {
      const data = await getLeaveHistory(user.id);
      setLeaves(data);
      setError(null);
    } catch (err) {
      setError("Failed to load leave history");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, [refreshTrigger]);

  /**
   * Returns appropriate color for leave status
   * @param {string} status - Leave status
   * @returns {string} Color code
   */
  const getStatusColor = (status) => {
    switch (status) {
      case "AUTO_APPROVED":
      case "APPROVED":
        return "#10b981";
      case "PENDING":
        return "#f59e0b";
      case "PRIORITY_REVIEW":
        return "#f97316";
      case "REJECTED":
        return "#ef4444";
      default:
        return "#6b7280";
    }
  };

  if (loading) {
    return <p>Loading leave history...</p>;
  }

  if (error) {
    return <p className="error-text">{error}</p>;
  }

  if (leaves.length === 0) {
    return (
      <div className="leave-history-container">
        <h3>Leave History</h3>
        <p className="no-data">No leave history found. Apply for your first leave above!</p>
      </div>
    );
  }

  return (
    <div className="leave-history-container">
      <h3>Leave History</h3>

      <div className="leave-table-wrapper">
        <table className="leave-table">
          <thead>
            <tr>
              <th>Type</th>
              <th>From</th>
              <th>To</th>
              <th>Status</th>
              <th>Reason</th>
            </tr>
          </thead>

          <tbody>
            {leaves.map((leave) => (
              <tr key={leave.id}>
                <td>
                  <span 
                    className="leave-type-badge"
                    style={{
                      backgroundColor: leave.leave_type === "UNPAID" ? "#fee2e2" : "#d1fae5",
                      color: leave.leave_type === "UNPAID" ? "#991b1b" : "#065f46"
                    }}
                  >
                    {leave.leave_type}
                  </span>
                </td>

                <td>{leave.from_date}</td>
                <td>{leave.to_date}</td>

                <td>
                  <span 
                    className="status-badge"
                    style={{ 
                      backgroundColor: getStatusColor(leave.status) + "20",
                      color: getStatusColor(leave.status)
                    }}
                  >
                    {leave.status}
                  </span>
                </td>

                <td className="reason-cell">{leave.reason}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default LeaveHistory;
