import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login, getCurrentUser } from "../services/authService";
import "../assets/styles.css";
import logo from "../assets/icons/1.png";

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // If already logged in, redirect to dashboard
  const existingUser = getCurrentUser();
  if (existingUser) {
    window.location.href = "/";
    return null;
  }

  /**
   * Handles login form submission
   * @param {Event} e - Form submit event
   */
  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(email, password);
      navigate("/");
    } catch {
      setError("Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      {/* LEFT SIDE - Branding */}
      <div className="login-left">
        <div className="login-brand-section">
          <div className="logo-container">
            <img src={logo} alt="LeaveFlow Logo" className="brand-logo" />
          </div>
          
          <h1 className="brand-title">LeaveFlow</h1>
          <p className="brand-tagline">
            A simple leave management system
            designed to make work-life balance effortless.
          </p>

          <div className="feature-list">
            <div className="feature-item">
              <div className="feature-icon-box">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="16" y1="2" x2="16" y2="6"></line>
                  <line x1="8" y1="2" x2="8" y2="6"></line>
                  <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
              </div>
              <span>Easy Leave Application</span>
            </div>
            <div className="feature-item">
              <div className="feature-icon-box">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="20" x2="18" y2="10"></line>
                  <line x1="12" y1="20" x2="12" y2="4"></line>
                  <line x1="6" y1="20" x2="6" y2="14"></line>
                </svg>
              </div>
              <span>Track Leave Balance</span>
            </div>
            <div className="feature-item">
              <div className="feature-icon-box">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </div>
              <span>Quick Approvals</span>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE - Login Form */}
      <div className="login-right">
        <div className="login-card">
          <h2>Welcome Back</h2>
          <p className="login-subtitle">Sign in to continue to your dashboard</p>

          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
              />
            </div>

            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          {error && <div className="error-text">{error}</div>}

          <div className="login-divider">
            <span>Demo Account For Tesing</span>
          </div>

          <div className="demo-accounts">
            <button 
              type="button" 
              className="demo-btn"
              onClick={() => { setEmail("hardik@leaveflow.com"); setPassword("123456"); }}
            >
              Employee
            </button>
            <button 
              type="button" 
              className="demo-btn"
              onClick={() => { setEmail("hr@leaveflow.com"); setPassword("123456"); }}
            >
              HR
            </button>
            <button 
              type="button" 
              className="demo-btn"
              onClick={() => { setEmail("manager@leaveflow.com"); setPassword("123456"); }}
            >
              Manager
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
