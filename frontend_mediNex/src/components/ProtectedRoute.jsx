import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ allowedRole }) => {
  const { user, token, role, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // If not logged in, redirect to Login
  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  // If logged in but role doesn't match, redirect to their respective dashboard
  if (allowedRole && role.toLowerCase() !== allowedRole.toLowerCase()) {
    if (role === "admin") return <Navigate to="/admin/dashboard" replace />;
    if (role === "broker") return <Navigate to="/broker/dashboard" replace />;
    if (role === "patient") return <Navigate to="/patient/dashboard" replace />;
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
