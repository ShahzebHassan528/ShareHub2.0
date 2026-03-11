/**
 * Role-Based Redirect Component
 * Automatically redirects users to their role-specific dashboard
 */

import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getDashboardRoute } from '../config/roles';

const RoleBasedRedirect = () => {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Redirect to role-specific dashboard
  const dashboardRoute = getDashboardRoute(user?.role);
  return <Navigate to={dashboardRoute} replace />;
};

export default RoleBasedRedirect;
