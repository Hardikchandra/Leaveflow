import React, { useState, useEffect, useCallback } from "react";
import TimeClock from "../components/TimeClock";
import LeaveForm from "../components/LeaveForm";
import LeaveHistory from "../components/LeaveHistory";
import CalendarView from "../components/CalendarView";
import { getLeaveBalance } from "../services/leaveService";
import { getCurrentUser, logout } from "../services/authService";
import logo from "../assets/icons/1.png";
import "../assets/styles.css";

function EmployeeDashboard() {
  const [balance, setBalance] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const user = getCurrentUser();

  /**
   * Fetches leave balance from the API
   */
  const fetchBalance = useCallback(async () => {
    if (user) {
      try {
        const data = await getLeaveBalance(user.id);
        setBalance(data);
      } catch (err) {
        console.error("Failed to load balance");
      }
    }
  }, [user]);

  useEffect(() => {
    fetchBalance();
  }, [fetchBalance]);

  /**
   * Handles refresh after leave submission
   */
  const handleLeaveSubmitted = () => {
    setRefreshKey(prev => prev + 1);
    fetchBalance();
  };

  /**
   * Handles user logout
   */
  const handleLogout = () => {
    logout();
    window.location.href = "/login";
  };

  return (
    <div className="dashboard-container">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-left">
          <img src={logo} alt="LeaveFlow" className="header-logo" />
          <h1>LeaveFlow</h1>
          <span className="role-badge employee">Employee</span>
        </div>
        <div className="header-right">
          <span className="user-name">{user?.name}</span>
          <button onClick={handleLogout} className="logout-btn">
            Logout
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="dashboard-main">
        {/* Top Row - Clock and Balance */}
        <div className="dashboard-top">
          <div className="card clock-card">
            <TimeClock />
          </div>

          <div className="card balance-card">
            <h3>Leave Balance</h3>
            {balance ? (
              <div className="balance-grid">
                <div className="balance-item">
                  <span className="balance-value">{balance.total_paid}</span>
                  <span className="balance-label">Total Paid</span>
                </div>
                <div className="balance-item">
                  <span className="balance-value used">{balance.used_paid}</span>
                  <span className="balance-label">Used</span>
                </div>
                <div className="balance-item">
                  <span className="balance-value remaining">{balance.remaining_paid}</span>
                  <span className="balance-label">Remaining</span>
                </div>
              </div>
            ) : (
              <p>Loading balance...</p>
            )}
          </div>
        </div>

        {/* Middle Row - Form and History */}
        <div className="dashboard-middle">
          <div className="card form-card">
            <LeaveForm onLeaveSubmitted={handleLeaveSubmitted} />
          </div>

          <div className="card history-card">
            <LeaveHistory refreshTrigger={refreshKey} />
          </div>
        </div>

        {/* Bottom Row - Calendar */}
        <div className="card calendar-card">
          <CalendarView refreshTrigger={refreshKey} />
        </div>
      </main>
    </div>
  );
}

export default EmployeeDashboard;
