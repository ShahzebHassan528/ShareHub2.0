import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import productAPI from '../../api/product.api';
import { getMySwapRequests } from '../../api/swap.api';
import { getNotifications } from '../../api/notification.api';
import { useToast } from '../../contexts/ToastContext';
import './UserDashboard.css';

const UserDashboard = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  
  const [recentProducts, setRecentProducts] = useState([]);
  const [swaps, setSwaps] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [recommendedProducts, setRecommendedProducts] = useState([]);
  
  const [loading, setLoading] = useState({
    products: true,
    swaps: true,
    notifications: true,
    recommended: true
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    // Fetch all data in parallel
    await Promise.all([
      fetchRecentProducts(),
      fetchSwaps(),
      fetchNotifications(),
      fetchRecommendedProducts()
    ]);
  };

  const fetchRecentProducts = async () => {
    try {
      const data = await productAPI.getAllProducts({ limit: 4 });
      setRecentProducts(data.products?.slice(0, 4) || []);
    } catch (err) {
      console.error('Failed to fetch recent products:', err);
    } finally {
      setLoading(prev => ({ ...prev, products: false }));
    }
  };

  const fetchSwaps = async () => {
    try {
      const data = await getMySwapRequests();
      setSwaps(data.swaps?.slice(0, 3) || []);
    } catch (err) {
      console.error('Failed to fetch swaps:', err);
    } finally {
      setLoading(prev => ({ ...prev, swaps: false }));
    }
  };

  const fetchNotifications = async () => {
    try {
      const data = await getNotifications(true); // unread only
      setNotifications(data.notifications?.slice(0, 5) || []);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    } finally {
      setLoading(prev => ({ ...prev, notifications: false }));
    }
  };

  const fetchRecommendedProducts = async () => {
    try {
      const data = await productAPI.getAllProducts({ limit: 6 });
      setRecommendedProducts(data.products?.slice(0, 6) || []);
    } catch (err) {
      console.error('Failed to fetch recommended products:', err);
    } finally {
      setLoading(prev => ({ ...prev, recommended: false }));
    }
  };

  const formatPrice = (price) => {
    return `Rs. ${price?.toLocaleString() || '0'}`;
  };

  return (
    <div className="user-dashboard">
      <div className="dashboard-container">
        {/* Welcome Section */}
        <div className="welcome-section">
          <div>
            <h1>Welcome back, {user?.name}! 👋</h1>
            <p className="welcome-subtitle">Here's what's happening with your marketplace activity</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="stats-grid">
          <Link to="/swaps/my" className="stat-card">
            <div className="stat-icon swap">⇄</div>
            <div className="stat-content">
              <h3>{swaps.length}</h3>
              <p>Active Swaps</p>
            </div>
          </Link>

          <Link to="/donations/my" className="stat-card">
            <div className="stat-icon donation">❤️</div>
            <div className="stat-content">
              <h3>0</h3>
              <p>Donations</p>
            </div>
          </Link>

          <Link to="/notifications" className="stat-card">
            <div className="stat-icon notification">🔔</div>
            <div className="stat-content">
              <h3>{notifications.length}</h3>
              <p>Unread Notifications</p>
            </div>
          </Link>

          <div className="stat-card">
            <div className="stat-icon products">📦</div>
            <div className="stat-content">
              <h3>{recentProducts.length}</h3>
              <p>Recently Viewed</p>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="dashboard-grid">
          {/* Left Column */}
          <div className="dashboard-left">
            {/* Recently Viewed Products */}
            <div className="dashboard-card">
              <div className="card-header">
                <h2>Recently Viewed</h2>
                <Link to="/products" className="view-all">View All →</Link>
              </div>
              <div className="card-content">
                {loading.products ? (
                  <div className="loading-state">
                    <div className="spinner-small"></div>
                    <p>Loading products...</p>
                  </div>
                ) : recentProducts.length === 0 ? (
                  <div className="empty-state">
                    <p>No recently viewed products</p>
                    <Link to="/products" className="btn-browse">Browse Products</Link>
                  </div>
                ) : (
                  <div className="products-list">
                    {recentProducts.map(product => (
                      <Link 
                        key={product.id} 
                        to={`/products/${product.id}`}
                        className="product-item"
                      >
                        {product.image_url && (
                          <img src={product.image_url} alt={product.title} />
                        )}
                        <div className="product-info">
                          <h4>{product.title}</h4>
                          <p className="product-price">{formatPrice(product.price)}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* My Swap Requests */}
            <div className="dashboard-card">
              <div className="card-header">
                <h2>My Swap Requests</h2>
                <Link to="/swaps/my" className="view-all">View All →</Link>
              </div>
              <div className="card-content">
                {loading.swaps ? (
                  <div className="loading-state">
                    <div className="spinner-small"></div>
                    <p>Loading swaps...</p>
                  </div>
                ) : swaps.length === 0 ? (
                  <div className="empty-state">
                    <p>No active swap requests</p>
                    <Link to="/products" className="btn-browse">Browse Products</Link>
                  </div>
                ) : (
                  <div className="swaps-list">
                    {swaps.map(swap => (
                      <div key={swap.id} className="swap-item">
                        <div className="swap-products">
                          <span className="swap-title">{swap.requested_item_title}</span>
                          <span className="swap-arrow">⇄</span>
                          <span className="swap-title">{swap.offered_item_title}</span>
                        </div>
                        <span className={`status-badge ${swap.status}`}>
                          {swap.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="dashboard-right">
            {/* Notifications Preview */}
            <div className="dashboard-card">
              <div className="card-header">
                <h2>Notifications</h2>
                <Link to="/notifications" className="view-all">View All →</Link>
              </div>
              <div className="card-content">
                {loading.notifications ? (
                  <div className="loading-state">
                    <div className="spinner-small"></div>
                    <p>Loading...</p>
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="empty-state">
                    <p>No new notifications</p>
                  </div>
                ) : (
                  <div className="notifications-list">
                    {notifications.map(notif => (
                      <Link 
                        key={notif.id}
                        to="/notifications"
                        className="notification-item"
                      >
                        <div className="notif-icon">🔔</div>
                        <div className="notif-content">
                          <h4>{notif.title}</h4>
                          <p>{notif.message}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="dashboard-card">
              <div className="card-header">
                <h2>Quick Actions</h2>
              </div>
              <div className="card-content">
                <div className="quick-actions">
                  <Link to="/products" className="action-btn">
                    <span className="action-icon">🔍</span>
                    Browse Products
                  </Link>
                  <Link to="/profile" className="action-btn">
                    <span className="action-icon">👤</span>
                    Edit Profile
                  </Link>
                  <Link to="/cart" className="action-btn">
                    <span className="action-icon">🛒</span>
                    View Cart
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recommended Products */}
        <div className="dashboard-card full-width">
          <div className="card-header">
            <h2>Recommended for You</h2>
            <Link to="/products" className="view-all">View All →</Link>
          </div>
          <div className="card-content">
            {loading.recommended ? (
              <div className="loading-state">
                <div className="spinner-small"></div>
                <p>Loading recommendations...</p>
              </div>
            ) : recommendedProducts.length === 0 ? (
              <div className="empty-state">
                <p>No recommendations available</p>
              </div>
            ) : (
              <div className="recommended-grid">
                {recommendedProducts.map(product => (
                  <Link 
                    key={product.id}
                    to={`/products/${product.id}`}
                    className="recommended-card"
                  >
                    {product.image_url && (
                      <img src={product.image_url} alt={product.title} />
                    )}
                    <div className="recommended-info">
                      <h4>{product.title}</h4>
                      <p className="recommended-price">{formatPrice(product.price)}</p>
                      <span className="recommended-condition">{product.condition}</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
