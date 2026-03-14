/**
 * Seller Dashboard
 * Main dashboard for seller role users
 */

import { useAuth } from '../../contexts/AuthContext';
import { useDashboard } from '../../hooks/useDashboard';
import './SellerDashboard.css';

const SellerDashboard = () => {
  const { user } = useAuth();
  const { stats, loading, error, refresh } = useDashboard();

  // Loading state
  if (loading) {
    return (
      <div className="seller-dashboard">
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
      <div className="seller-dashboard">
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
    <div className="seller-dashboard">
      {/* Welcome Section */}
      <div className="dashboard-header">
        <h1>Welcome back, {user?.full_name}!</h1>
        <p>Manage your products, orders, and sales</p>
        <button onClick={refresh} className="btn btn-sm btn-outline-primary">
          <i className="bi bi-arrow-clockwise me-1"></i>
          Refresh
        </button>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon products">
            <i className="bi bi-box-seam"></i>
          </div>
          <div className="stat-content">
            <h3>{stats?.products?.active || 0}</h3>
            <p>Active Products</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon sales">
            <i className="bi bi-graph-up"></i>
          </div>
          <div className="stat-content">
            <h3>${stats?.revenue?.total || '0.00'}</h3>
            <p>Total Sales</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon orders">
            <i className="bi bi-bag-check"></i>
          </div>
          <div className="stat-content">
            <h3>{stats?.orders?.total || 0}</h3>
            <p>Orders</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon rating">
            <i className="bi bi-eye"></i>
          </div>
          <div className="stat-content">
            <h3>{stats?.products?.total_views || 0}</h3>
            <p>Total Views</p>
          </div>
        </div>
      </div>

      {/* Order Summary */}
      <div className="dashboard-section">
        <div className="section-header">
          <h2>Order Summary</h2>
          <a href="/seller/orders" className="view-all">View All</a>
        </div>
        <div className="orders-list">
          <div className="order-item">
            <div className="order-info">
              <h4>Pending Orders</h4>
              <p>{stats?.orders?.pending || 0} orders to process</p>
            </div>
            <span className="order-status pending">Pending</span>
          </div>
          <div className="order-item">
            <div className="order-info">
              <h4>Completed Orders</h4>
              <p>{stats?.orders?.completed || 0} orders delivered</p>
            </div>
            <span className="order-status completed">Completed</span>
          </div>
          <div className="order-item">
            <div className="order-info">
              <h4>Total Products</h4>
              <p>{stats?.products?.total || 0} products listed</p>
            </div>
            <span className="order-status processing">Active</span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="dashboard-section">
        <h2>Quick Actions</h2>
        <div className="quick-actions">
          <a href="/seller/products/add" className="action-btn">
            <i className="bi bi-plus-circle"></i>
            Add Product
          </a>
          <a href="/seller/products" className="action-btn">
            <i className="bi bi-box-seam"></i>
            My Products
          </a>
        </div>
      </div>
    </div>
  );
};

export default SellerDashboard;
