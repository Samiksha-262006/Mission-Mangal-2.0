import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../auth/session';
import { isRouteAllowed } from '../auth/rbac';
import AccessDeniedPage from '../pages/AccessDeniedPage';

export default function ProtectedRoute({ children, allowedRoles }) {
  const { isAuthenticated, currentUser, isInitialized } = useAuthStore();
  const location = useLocation();

  if (!isInitialized) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center font-mono text-xs text-cyan-300">
        <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping mr-2"></span>
        <span>Initializing Cryptographic Subsystem...</span>
      </div>
    );
  }

  if (!isAuthenticated || !currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check if role is allowed
  if (allowedRoles && !allowedRoles.includes(currentUser.role) && currentUser.role !== 'admin') {
    return <AccessDeniedPage requiredRole={allowedRoles.join(' / ')} />;
  }

  return children;
}
