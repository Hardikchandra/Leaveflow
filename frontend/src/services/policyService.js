// src/services/policyService.js

export function evaluateLeavePolicy({
  leaveType,
  leaveBalance,
  isTeamAvailable
}) {
  // Emergency / medical leave
  if (leaveType === "EMERGENCY") {
    return {
      status: "PRIORITY_REVIEW",
      color: "orange",
      message: "Emergency medical leave requires immediate review."
    };
  }

  // Paid leave with sufficient balance and team availability
  if (leaveBalance > 0 && isTeamAvailable) {
    return {
      status: "AUTO_APPROVED",
      color: "green",
      message: "Leave auto-approved as per policy."
    };
  }

  // Paid leave exhausted
  return {
    status: "MANUAL_APPROVAL",
    color: "red",
    message: "Paid leave exhausted. Manager approval required."
  };
}
