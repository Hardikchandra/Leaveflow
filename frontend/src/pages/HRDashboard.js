import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentUser, logout } from "../services/authService";
import { getEmployees } from "../services/userService";
import { getHRPendingLeaves, updateHRStatus, getLeaveBalance, getRecentLeaveLog, getOnLeaveToday } from "../services/leaveService";
import LeaveForm from "../components/LeaveForm";
import CalendarView from "../components/CalendarView";
import logo from "../assets/icons/1.png";

function HRDashboard() {
  const navigate = useNavigate();
  const [user] = useState(() => getCurrentUser());

  const [employees, setEmployees] = useState([]);
  const [pendingLeaves, setPendingLeaves] = useState([]);
  const [leaveBalance, setLeaveBalance] = useState(null);
  const [recentLog, setRecentLog] = useState([]);
  const [onLeaveToday, setOnLeaveToday] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || user.role !== "HR") {
      navigate("/login");
      return;
    }
    
    const fetchData = async () => {
      try {
        const [empData, pendingData, balanceData, logData, onLeaveData] = await Promise.all([
          getEmployees(),
          getHRPendingLeaves(),
          getLeaveBalance(user.id),
          getRecentLeaveLog(),
          getOnLeaveToday()
        ]);
        setEmployees(empData);
        setPendingLeaves(pendingData);
        setLeaveBalance(balanceData);
        setRecentLog(logData);
        setOnLeaveToday(onLeaveData);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [user, navigate]);

  const refreshData = async () => {
    try {
      const [empData, pendingData, balanceData, logData, onLeaveData] = await Promise.all([
        getEmployees(),
        getHRPendingLeaves(),
        getLeaveBalance(user.id),
        getRecentLeaveLog(),
        getOnLeaveToday()
      ]);
      setEmployees(empData);
      setPendingLeaves(pendingData);
      setLeaveBalance(balanceData);
      setRecentLog(logData);
      setOnLeaveToday(onLeaveData);
    } catch (error) {
      console.error("Error refreshing data:", error);
    }
  };

  const handleApprove = async (leaveId) => {
    try {
      await updateHRStatus(leaveId, "APPROVED", "");
      alert("Leave approved successfully. Sent to Manager for final approval.");
      refreshData();
    } catch (error) {
      alert("Failed to approve leave");
    }
  };

  const handleReject = async (leaveId) => {
    try {
      await updateHRStatus(leaveId, "REJECTED", "");
      alert("Leave rejected successfully.");
      refreshData();
    } catch (error) {
      alert("Failed to reject leave");
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="header-left">
          <img src={logo} alt="LeaveFlow" className="header-logo" />
          <div>
            <h1>HR Dashboard</h1>
            <p className="welcome-text">Welcome, {user?.name}</p>
          </div>
        </div>
        <button onClick={handleLogout} className="logout-btn">
          Logout
        </button>
      </header>

      <div className="dashboard-content">
        {/* Leave Balance */}
        {leaveBalance && (
          <div className="leave-balance-section">
            <h2>Your Leave Balance</h2>
            <div className="balance-grid">
              <div className="balance-item">
                <span className="balance-label">Total Paid</span>
                <span className="balance-value">{leaveBalance.total_paid}</span>
              </div>
              <div className="balance-item">
                <span className="balance-label">Used</span>
                <span className="balance-value">{leaveBalance.used_paid}</span>
              </div>
              <div className="balance-item">
                <span className="balance-label">Remaining</span>
                <span className="balance-value">{leaveBalance.remaining_paid}</span>
              </div>
            </div>
          </div>
        )}

        {/* Leave Form */}
        <LeaveForm onLeaveSubmitted={refreshData} />

        {/* Employee List */}
        <div className="employee-list-section">
          <h2>Employees ({employees.length})</h2>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Joined</th>
                </tr>
              </thead>
              <tbody>
                {employees.map((emp) => (
                  <tr key={emp.id}>
                    <td>{emp.name}</td>
                    <td>{emp.email}</td>
                    <td><span className="role-badge">{emp.role}</span></td>
                    <td>{new Date(emp.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pending Approvals */}
        <div className="pending-approvals-section">
          <h2>Pending Approvals ({pendingLeaves.length})</h2>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Type</th>
                  <th>From</th>
                  <th>To</th>
                  <th>Reason</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pendingLeaves.map((leave) => (
                  <tr key={leave.id}>
                    <td>{leave.user_name}</td>
                    <td>
                      <span className={`leave-type-badge ${leave.leave_type.toLowerCase()}`}>
                        {leave.leave_type}
                      </span>
                    </td>
                    <td>{new Date(leave.from_date).toLocaleDateString()}</td>
                    <td>{new Date(leave.to_date).toLocaleDateString()}</td>
                    <td>{leave.reason}</td>
                    <td>
                      <div className="action-buttons">
                        <button 
                          onClick={() => handleApprove(leave.id)}
                          className="approve-btn"
                        >
                          Approve
                        </button>
                        <button 
                          onClick={() => handleReject(leave.id)}
                          className="reject-btn"
                        >
                          Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {pendingLeaves.length === 0 && (
                  <tr>
                    <td colSpan="6" style={{ textAlign: "center", padding: "20px" }}>
                      No pending leave requests
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* On Leave Today & Recent Activity - Side by Side */}
        <div className="activity-row">
          {/* Employees On Leave Today */}
          <div className="on-leave-today-section">
            <h2>On Leave Today ({onLeaveToday.length})</h2>
            <div className="on-leave-list">
              {onLeaveToday.length > 0 ? (
                onLeaveToday.map((leave) => (
                  <div key={leave.id} className="on-leave-card">
                    <div className="on-leave-name">{leave.user_name}</div>
                    <span className={`leave-type-badge ${leave.leave_type.toLowerCase()}`}>
                      {leave.leave_type}
                    </span>
                  </div>
                ))
              ) : (
                <div className="no-data-message">Everyone is at work today!</div>
              )}
            </div>
          </div>

          {/* Recent Activity Log */}
          <div className="recent-log-section">
            <h2>Recent Activity (Last 5)</h2>
            <div className="log-list">
              {recentLog.length > 0 ? (
                recentLog.map((log) => (
                  <div key={log.id} className="log-item">
                    <div className="log-info">
                      <span className="log-name">{log.user_name}</span>
                      <span className="log-dates">
                        {new Date(log.from_date).toLocaleDateString()} - {new Date(log.to_date).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="log-status-row">
                      <span className={`leave-type-badge ${log.leave_type.toLowerCase()}`}>
                        {log.leave_type}
                      </span>
                      <span className={`status-badge ${log.status.toLowerCase()}`}>
                        {log.status}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-data-message">No recent activity</div>
              )}
            </div>
          </div>
        </div>

        {/* Calendar */}
        <CalendarView />
      </div>
    </div>
  );
}

export default HRDashboard;
