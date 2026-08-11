import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export const RoleRoute = ({ children, allowedRoles }) => {
  const { user, isAuthenticated, loading, getDashboardForRole } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400 text-sm font-medium">
        Verifying permissions...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const userRole = (user?.role || '').toLowerCase().trim();
  const allowed = allowedRoles.map((r) => r.toLowerCase().trim());

  if (allowedRoles && !allowed.includes(userRole)) {
    // Auto-redirect to the correct dashboard for the user's actual role
    const fallbackUrl = getDashboardForRole(userRole);
    return <Navigate to={fallbackUrl} replace />;
  }

  return children;
};

export default RoleRoute;
