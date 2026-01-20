import React, { useState } from "react";
import { applyLeave } from "../services/leaveService";
import { getCurrentUser } from "../services/authService";

function LeaveForm({ onLeaveSubmitted }) {
  const [formData, setFormData] = useState({
    leaveType: "PAID",
    fromDate: "",
    toDate: "",
    reason: "",
    approvalMessage: "",
    medicalCertificate: ""
  });

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    const user = getCurrentUser();
    if (!user) {
      setError("Please login to apply for leave");
      setLoading(false);
      return;
    }

    try {
      const response = await applyLeave({
        userId: user.id,
        leaveType: formData.leaveType,
        fromDate: formData.fromDate,
        toDate: formData.toDate,
        reason: formData.reason,
        approvalMessage: formData.approvalMessage,
        medicalCertificate: formData.medicalCertificate
      });

      setResult(response);
      setFormData({
        leaveType: "PAID",
        fromDate: "",
        toDate: "",
        reason: "",
        approvalMessage: "",
        medicalCertificate: ""
      });

      // Notify parent to refresh data
      if (onLeaveSubmitted) {
        onLeaveSubmitted();
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit leave request. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="leave-form-container">
      <h2>Apply for Leave</h2>

      <form onSubmit={handleSubmit} className="leave-form">
        <div className="form-group">
          <label htmlFor="leaveType">Leave Type:</label>
          <select
            id="leaveType"
            name="leaveType"
            value={formData.leaveType}
            onChange={handleChange}
            className="form-input"
          >
            <option value="PAID">Paid Leave</option>
            <option value="MEDICAL">Medical Leave</option>
            <option value="EMERGENCY">Emergency Leave</option>
            <option value="UNPAID">Unpaid Leave</option>
          </select>
        </div>

        {formData.leaveType === "PAID" && (
          <div className="info-message" style={{ 
            backgroundColor: "#fff3cd", 
            color: "#856404", 
            padding: "10px", 
            borderRadius: "4px", 
            marginBottom: "15px",
            fontSize: "13px",
            border: "1px solid #ffeeba"
          }}>
            ⚠ <strong>Note:</strong> Apply for paid leave at least 1 day before 5 PM
          </div>
        )}

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="fromDate">From:</label>
            <input
              type="date"
              id="fromDate"
              name="fromDate"
              value={formData.fromDate}
              onChange={handleChange}
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="toDate">To:</label>
            <input
              type="date"
              id="toDate"
              name="toDate"
              value={formData.toDate}
              onChange={handleChange}
              className="form-input"
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="reason">Reason:</label>
          <textarea
            id="reason"
            name="reason"
            value={formData.reason}
            onChange={handleChange}
            className="form-input"
            rows="3"
            required
          />
        </div>

        {formData.leaveType === "EMERGENCY" && (
          <div className="form-group">
            <label htmlFor="approvalMessage">Approval Message: *</label>
            <textarea
              id="approvalMessage"
              name="approvalMessage"
              value={formData.approvalMessage}
              onChange={handleChange}
              className="form-input"
              rows="2"
              placeholder="Explain why this is an emergency..."
              required
            />
          </div>
        )}

        {formData.leaveType === "MEDICAL" && (
          <div className="form-group">
            <label htmlFor="medicalCertificate">Medical Certificate Link (optional):</label>
            <input
              type="url"
              id="medicalCertificate"
              name="medicalCertificate"
              value={formData.medicalCertificate}
              onChange={handleChange}
              className="form-input"
              placeholder="https://drive.google.com/... or paste certificate link"
            />
          </div>
        )}

        <button 
          type="submit" 
          className="submit-btn"
          disabled={loading}
        >
          {loading ? "Submitting..." : "Submit Request"}
        </button>
      </form>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {result && (
        <div 
          className="result-message"
          style={{ 
            backgroundColor: result.status === "APPROVED" ? "#d1fae5" : "#fef3c7",
            color: result.status === "APPROVED" ? "#065f46" : "#92400e"
          }}
        >
          <strong>{result.message || 'Leave application submitted'}</strong>
          {result.finalLeaveType === "UNPAID" && (
            <p style={{ marginTop: "8px", fontSize: "13px" }}>
              ⚠ Your paid leaves are exhausted. This has been submitted as unpaid leave.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export default LeaveForm;
