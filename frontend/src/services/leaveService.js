// API calls for leave management
const API_BASE_URL = "https://hardik.gigawiz.dev/api/leaves";

export async function applyLeave(data) {
  const res = await fetch(`${API_BASE_URL}/apply`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  });

  if (!res.ok) {
    throw new Error("Failed to apply leave");
  }

  return res.json();
}

export async function getLeaveHistory(userId) {
  const res = await fetch(`${API_BASE_URL}/${userId}`);

  if (!res.ok) {
    throw new Error("Failed to fetch leave history");
  }

  return res.json();
}

export async function getLeaveBalance(userId) {
  const res = await fetch(`${API_BASE_URL}/balance/${userId}`);

  if (!res.ok) {
    throw new Error("Failed to fetch leave balance");
  }

  return res.json();
}

export async function getHRPendingLeaves() {
  const res = await fetch(`${API_BASE_URL}/pending/hr`);

  if (!res.ok) {
    throw new Error("Failed to fetch HR pending leaves");
  }

  return res.json();
}

export async function getManagerPendingLeaves() {
  const res = await fetch(`${API_BASE_URL}/pending/manager`);

  if (!res.ok) {
    throw new Error("Failed to fetch Manager pending leaves");
  }

  return res.json();
}

export async function updateHRStatus(leaveId, status, comment) {
  const res = await fetch(`${API_BASE_URL}/hr-status`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      leaveId,
      status,
      comment
    })
  });

  if (!res.ok) {
    throw new Error("Failed to update HR status");
  }

  return res.json();
}

export async function updateLeaveStatus(leaveId, status, managerComment) {
  const res = await fetch(`${API_BASE_URL}/update-status`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      leaveId,
      status,
      managerComment
    })
  });

  if (!res.ok) {
    throw new Error("Failed to update leave status");
  }

  return res.json();
}

export async function getRecentLeaveLog() {
  const res = await fetch(`${API_BASE_URL}/recent-log`);

  if (!res.ok) {
    throw new Error("Failed to fetch recent leave log");
  }

  return res.json();
}

export async function getOnLeaveToday() {
  const res = await fetch(`${API_BASE_URL}/on-leave-today`);

  if (!res.ok) {
    throw new Error("Failed to fetch on leave today");
  }

  return res.json();
}
