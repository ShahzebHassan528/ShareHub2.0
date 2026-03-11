/**
 * Admin Dashboard
 * Main dashboard for admin role users
 */

import { useAuth } from '../../contexts/AuthContext';
import { useDashboard } from '../../hooks/useDashboard';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const { user } = useAuth();
  const { stats, loading, error, refresh } = useDashboard();

  // Loading state
  if (loading) {
    return (
      <div className="admin-dashboard">
        <div className="loading-container">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="admin-dashboard">
        <div className="alert alert-danger" role="alert">
          <i className="bi bi-exclamation-circle me-2"></i>
          {error}
          <button onClick={refresh} className="btn btn-sm btn-outline-danger ms-3">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      {/* Welcome Section */}
      <div className="dashboard-header">
        <h1>Welcome back, {user?.name}!</h1>
        <p>System administration and management</p>
        <button onClick={refresh} className="btn btn-sm btn-outline-primary">
          <i className="bi bi-arrow-clockwise me-1"></i>
          Refresh
        </button>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon users">
            <i className="bi bi-people"></i>
          </div>
          <div className="stat-content">
            <h3>{stats?.users?.total || 0}</h3>
            <p>Total Users</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon products">
            <i className="bi bi-box-seam"></i>
          </div>
          <div className="stat-content">
            <h3>{stats?.products?.total || 0}</h3>
            <p>Total Products</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon orders">
            <i className="bi bi-bag-check"></i>
          </div>
          <div className="stat-content">
            <h3>{stats?.orders?.total || 0}</h3>
            <p>Total Orders</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon revenue">
            <i className="bi bi-graph-up"></i>
          </div>
          <div className="stat-content">
            <h3>${stats?.revenue?.total || '0.00'}</h3>
            <p>Total Revenue</p>
          </div>
        </div>
      </div>

      {/* System Overview */}
      <div className="dashboard-section">
        <div className="section-header">
          <h2>System Overview</h2>
          <a href="/admin/activity" className="view-all">View All</a>
        </div>
        <div className="activity-list">
          <div className="activity-item">
            <div className="activity-icon user">
              <i className="bi bi-people"></i>
            </div>
            <div className="activity-info">
              <h4>User Statistics</h4>
              <p>Sellers: {stats?.users?.sellers || 0} • NGOs: {stats?.users?.ngos || 0} • New this week: {stats?.users?.new_this_week || 0}</p>
            </div>
          </div>
          <div className="activity-item">
            <div className="activity-icon product">
              <i className="bi bi-box"></i>
            </div>
            <div className="activity-info">
              <h4>Product Statistics</h4>
              <p>Active: {stats?.products?.active || 0} • Inactive: {stats?.products?.inactive || 0} • New this week: {stats?.products?.new_this_week || 0}</p>
            </div>
          </div>
          <div className="activity-item">
            <div className="activity-icon order">
              <i className="bi bi-bag"></i>
            </div>
            <div className="activity-info">
              <h4>Order Statistics</h4>
              <p>Pending: {stats?.orders?.pending || 0} • Completed: {stats?.orders?.completed || 0} • New this week: {stats?.orders?.new_this_week || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="dashboard-section">
        <h2>Quick Actions</h2>
        <div className="quick-actions">
          <a href="/admin/users" className="action-btn">
            <i className="bi bi-people"></i>
            Manage Users
          </a>
          <a href="/admin/products" className="action-btn">
            <i className="bi bi-box-seam"></i>
            Manage Products
          </a>
          <a href="/admin/orders" className="action-btn">
            <i className="bi bi-bag"></i>
            Manage Orders
          </a>
          <a href="/admin/reports" className="action-btn">
            <i className="bi bi-file-text"></i>
            View Reports
          </a>
          <a href="/admin/settings" className="action-btn">
            <i className="bi bi-gear"></i>
            System Settings
          </a>
          <a href="/admin/logs" className="action-btn">
            <i className="bi bi-journal-text"></i>
            System Logs
          </a>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
