// Simple auth service - stores user in localStorage
export async function login(email, password) {
  const res = await fetch("http://154.201.127.68:5001/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  });

  if (!res.ok) {
    throw new Error("Login failed");
  }

  const user = await res.json();
  localStorage.setItem("leaveflow_user", JSON.stringify(user));
  return user;
}

export function logout() {
  localStorage.removeItem("leaveflow_user");
}

export function getCurrentUser() {
  const user = localStorage.getItem("leaveflow_user");
  return user ? JSON.parse(user) : null;
}

export function hasRole(role) {
  const user = getCurrentUser();
  return user?.role === role;
}
