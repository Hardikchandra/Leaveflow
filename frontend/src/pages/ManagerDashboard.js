import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentUser, logout } from "../services/authService";
import { getAllUsers, createUser } from "../services/userService";
import { getManagerPendingLeaves, updateLeaveStatus } from "../services/leaveService";
import CalendarView from "../components/CalendarView";
import logo from "../assets/icons/1.png";
import "../assets/styles.css";

function ManagerDashboard() {
  const navigate = useNavigate();
  const [user] = useState(() => getCurrentUser());

  const [users, setUsers] = useState([]);
  const [pendingLeaves, setPendingLeaves] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newUser, setNewUser] = useState({ name: "", email: "", role: "EMPLOYEE" });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || user.role !== "MANAGER") {
      navigate("/login");
      return;
    }
    
    const fetchData = async () => {
      try {
        const [usersData, leavesData] = await Promise.all([
          getAllUsers(),
          getManagerPendingLeaves()
        ]);
        setUsers(usersData);
        setPendingLeaves(leavesData);
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
      const [usersData, leavesData] = await Promise.all([
        getAllUsers(),
        getManagerPendingLeaves()
      ]);
      setUsers(usersData);
      setPendingLeaves(leavesData);
    } catch (error) {
      console.error("Error refreshing data:", error);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      await createUser(newUser.name, newUser.email, newUser.role, user.id);
      alert(`${newUser.role} created successfully! Default password: 123456`);
      setNewUser({ name: "", email: "", role: "EMPLOYEE" });
      setShowCreateForm(false);
      refreshData();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to create user");
    }
  };

  const handleApprove = async (leaveId) => {
    try {
      await updateLeaveStatus(leaveId, "APPROVED", "");
      alert("Leave approved successfully!");
      refreshData();
    } catch (error) {
      alert("Failed to approve leave");
    }
  };

  const handleReject = async (leaveId) => {
    try {
      await updateLeaveStatus(leaveId, "REJECTED", "");
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
            <h1>Manager Dashboard</h1>
            <p className="welcome-text">Welcome, {user?.name}</p>
          </div>
        </div>
        <button onClick={handleLogout} className="logout-btn">
          Logout
        </button>
      </header>

      <div className="dashboard-content">
        {/* User Management */}
        <div className="user-management-section">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h2>Users ({users.length})</h2>
            <button 
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="submit-btn"
              style={{ marginBottom: "15px" }}
            >
              {showCreateForm ? "Cancel" : "+ Create User"}
            </button>
          </div>

          {showCreateForm && (
            <form onSubmit={handleCreateUser} className="create-user-form" style={{
              backgroundColor: "#f8f9fa",
              padding: "20px",
              borderRadius: "8px",
              marginBottom: "20px"
            }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr auto", gap: "15px" }}>
                <div>
                  <label>Name:</label>
                  <input
                    type="text"
                    value={newUser.name}
                    onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                    className="form-input"
                    required
                  />
                </div>
                <div>
                  <label>Email:</label>
                  <input
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    className="form-input"
                    required
                  />
                </div>
                <div>
                  <label>Role:</label>
                  <select
                    value={newUser.role}
                    onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                    className="form-input"
                  >
                    <option value="EMPLOYEE">Employee</option>
                    <option value="HR">HR</option>
                  </select>
                </div>
                <div style={{ display: "flex", alignItems: "flex-end" }}>
                  <button type="submit" className="submit-btn">Create</button>
                </div>
              </div>
            </form>
          )}

          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Created</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td>{u.name}</td>
                    <td>{u.email}</td>
                    <td>
                      <span className={`role-badge ${u.role.toLowerCase()}`}>
                        {u.role}
                      </span>
                    </td>
                    <td>{new Date(u.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Final Approvals (HR-approved leaves) */}
        <div className="pending-approvals-section">
          <h2>Pending Final Approval ({pendingLeaves.length})</h2>
          <p style={{ fontSize: "13px", color: "#666", marginBottom: "15px" }}>
            These leaves have been approved by HR and require your final approval
          </p>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Type</th>
                  <th>From</th>
                  <th>To</th>
                  <th>Reason</th>
                  <th>HR Status</th>
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
                      <span className="status-badge approved">
                        {leave.hr_status}
                      </span>
                    </td>
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
                    <td colSpan="7" style={{ textAlign: "center", padding: "20px" }}>
                      No pending leave requests
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Calendar */}
        <CalendarView />
      </div>
    </div>
  );
}

export default ManagerDashboard;
