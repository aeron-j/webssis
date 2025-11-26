import React from "react";
import { Navigate } from "react-router-dom";

// Protected Route wrapper - requires authentication
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem("username") && localStorage.getItem("role");

  if (!isAuthenticated) {
    // Redirect to login if not authenticated
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;