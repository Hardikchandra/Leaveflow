import React from "react";
import { Navigate } from "react-router-dom";
import { getCurrentUser } from "../services/authService";
import EmployeeDashboard from "./EmployeeDashboard";
import ManagerDashboard from "./ManagerDashboard";
import HRDashboard from "./HRDashboard";

function Dashboard() {
  const user = getCurrentUser();

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Show Manager dashboard for managers
  if (user.role === "MANAGER") {
    return <ManagerDashboard />;
  }

  // Show HR dashboard for HR role
  if (user.role === "HR") {
    return <HRDashboard />;
  }

  // Default to Employee dashboard
  return <EmployeeDashboard />;
}

export default Dashboard;
