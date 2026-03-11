/**
 * Buyer Dashboard
 * Main dashboard for buyer role users
 */

import { useAuth } from '../../contexts/AuthContext';
import { useDashboard } from '../../hooks/useDashboard';
import './BuyerDashboard.css';

const BuyerDashboard = () => {
  const { user } = useAuth();
  const { stats, loading, error, refresh } = useDashboard();

  // Loading state
  if (loading) {
    return (
      <div className="buyer-dashboard">
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
      <div className="buyer-dashboard">
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
    <div className="buyer-dashboard">
      {/* Welcome Section */}
      <div className="dashboard-header">
        <h1>Welcome back, {user?.full_name}!</h1>
        <p>Manage your orders, favorites, and profile</p>
        <button onClick={refresh} className="btn btn-sm btn-outline-primary">
          <i className="bi bi-arrow-clockwise me-1"></i>
          Refresh
        </button>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
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
          <div className="stat-icon favorites">
            <i className="bi bi-heart"></i>
          </div>
          <div className="stat-content">
            <h3>{stats?.orders?.pending || 0}</h3>
            <p>Pending Orders</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon cart">
            <i className="bi bi-gift"></i>
          </div>
          <div className="stat-content">
            <h3>{stats?.donations?.total || 0}</h3>
            <p>Donations</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon messages">
            <i className="bi bi-arrow-left-right"></i>
          </div>
          <div className="stat-content">
            <h3>{stats?.swaps?.total || 0}</h3>
            <p>Swaps</p>
          </div>
        </div>
      </div>

      {/* Order Summary */}
      <div className="dashboard-section">
        <div className="section-header">
          <h2>Order Summary</h2>
          <a href="/buyer/orders" className="view-all">View All</a>
        </div>
        <div className="orders-list">
          <div className="order-item">
            <div className="order-info">
              <h4>Completed Orders</h4>
              <p>{stats?.orders?.completed || 0} orders</p>
            </div>
            <span className="order-status delivered">Delivered</span>
          </div>
          <div className="order-item">
            <div className="order-info">
              <h4>Pending Orders</h4>
              <p>{stats?.orders?.pending || 0} orders</p>
            </div>
            <span className="order-status pending">Pending</span>
          </div>
          <div className="order-item">
            <div className="order-info">
              <h4>Total Spent</h4>
              <p>${stats?.orders?.total_spent || '0.00'}</p>
            </div>
            <span className="order-status shipping">Paid</span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="dashboard-section">
        <h2>Quick Actions</h2>
        <div className="quick-actions">
          <a href="/products" className="action-btn">
            <i className="bi bi-search"></i>
            Browse Products
          </a>
          <a href="/buyer/orders" className="action-btn">
            <i className="bi bi-bag"></i>
            My Orders
          </a>
          <a href="/buyer/favorites" className="action-btn">
            <i className="bi bi-heart"></i>
            Favorites
          </a>
          <a href="/buyer/profile" className="action-btn">
            <i className="bi bi-person"></i>
            Edit Profile
          </a>
        </div>
      </div>
    </div>
  );
};

export default BuyerDashboard;
