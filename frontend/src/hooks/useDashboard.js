/**
 * Dashboard Custom Hook
 * Manages dashboard data fetching and state
 */

import { useState, useEffect, useCallback } from 'react';
import dashboardAPI from '../api/dashboard.api';
import { useAuth } from '../contexts/AuthContext';
import ROLES from '../config/roles';

export const useDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch dashboard stats based on user role
  const fetchStats = useCallback(async () => {
    if (!user?.role) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      let response;
      switch (user.role) {
        case ROLES.ADMIN:
          response = await dashboardAPI.getAdminStats();
          break;
        case ROLES.SELLER:
          response = await dashboardAPI.getSellerStats();
          break;
        case ROLES.BUYER:
          response = await dashboardAPI.getBuyerStats();
          break;
        case ROLES.NGO:
          response = await dashboardAPI.getNGOStats();
          break;
        default:
          throw new Error('Invalid user role');
      }

      setStats(response.stats);
    } catch (err) {
      console.error('Dashboard fetch error:', err);
      setError(err.message || 'Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  }, [user?.role]);

  // Fetch stats on mount and when user role changes
  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // Refresh stats manually
  const refresh = useCallback(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    stats,
    loading,
    error,
    refresh,
  };
};

export default useDashboard;
