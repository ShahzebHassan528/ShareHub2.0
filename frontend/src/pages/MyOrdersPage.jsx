/**
 * My Orders Page
 * Lists all orders placed by the logged-in buyer at /my-orders
 */

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import orderAPI from '../api/order.api';
import './MyOrdersPage.css';

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, delay: i * 0.07, ease: 'easeOut' },
  }),
};

const STATUS_STYLES = {
  pending:   { bg: '#fff8e1', color: '#f59e0b', label: 'Pending' },
  confirmed: { bg: '#e0f2fe', color: '#0284c7', label: 'Confirmed' },
  shipped:   { bg: '#ede9fe', color: '#7c3aed', label: 'Shipped' },
  delivered: { bg: '#dcfce7', color: '#16a34a', label: 'Delivered' },
  cancelled: { bg: '#fee2e2', color: '#dc2626', label: 'Cancelled' },
};

const StatusBadge = ({ status }) => {
  const s = STATUS_STYLES[status] || { bg: '#f3f4f6', color: '#6b7280', label: status };
  return (
    <span
      className="order-status-badge"
      style={{ backgroundColor: s.bg, color: s.color }}
    >
      {s.label}
    </span>
  );
};

const formatPrice = (price) =>
  new Intl.NumberFormat('en-PK', {
    style: 'currency',
    currency: 'PKR',
    minimumFractionDigits: 0,
  }).format(price || 0);

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-PK', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const OrderSkeleton = () => (
  <div className="order-card skeleton-card">
    <div className="skeleton skeleton-title" />
    <div className="skeleton skeleton-line" />
    <div className="skeleton skeleton-line short" />
  </div>
);

const MyOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await orderAPI.getMyOrders();
        setOrders(response.data || []);
      } catch (err) {
        setError(err.message || 'Failed to load orders.');
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const filtered = filter === 'all'
    ? orders
    : orders.filter(o => (o.order_status || o.status) === filter);

  const tabs = [
    { key: 'all', label: 'All' },
    { key: 'pending', label: 'Pending' },
    { key: 'confirmed', label: 'Confirmed' },
    { key: 'shipped', label: 'Shipped' },
    { key: 'delivered', label: 'Delivered' },
    { key: 'cancelled', label: 'Cancelled' },
  ];

  return (
    <motion.div className="my-orders-page" initial="hidden" animate="visible" variants={fadeUp}>
      <div className="container py-4">

        {/* Header */}
        <div className="orders-header">
          <div>
            <h1 className="orders-title">
              <i className="bi bi-bag-check me-2"></i>
              My Orders
            </h1>
            <p className="orders-subtitle">
              {loading ? 'Loading…' : `${orders.length} order${orders.length !== 1 ? 's' : ''} placed`}
            </p>
          </div>
          <Link to="/browse" className="btn btn-primary btn-sm">
            <i className="bi bi-grid me-1"></i>
            Continue Shopping
          </Link>
        </div>

        {/* Error */}
        {error && (
          <div className="alert alert-danger">
            <i className="bi bi-exclamation-triangle me-2"></i>
            {error}
          </div>
        )}

        {/* Filter Tabs */}
        {!loading && !error && orders.length > 0 && (
          <div className="orders-tabs">
            {tabs.map(tab => (
              <button
                key={tab.key}
                className={`orders-tab ${filter === tab.key ? 'active' : ''}`}
                onClick={() => setFilter(tab.key)}
              >
                {tab.label}
                {tab.key === 'all' && (
                  <span className="tab-count">{orders.length}</span>
                )}
                {tab.key !== 'all' && (
                  <span className="tab-count">
                    {orders.filter(o => (o.order_status || o.status) === tab.key).length}
                  </span>
                )}
              </button>
            ))}
          </div>
        )}

        {/* Skeletons */}
        {loading && (
          <div className="orders-list">
            {[1, 2, 3].map(i => <OrderSkeleton key={i} />)}
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && orders.length === 0 && (
          <div className="orders-empty">
            <i className="bi bi-bag-x"></i>
            <h3>No orders yet</h3>
            <p>Your placed orders will appear here. Start shopping to place your first order!</p>
            <Link to="/browse" className="btn btn-primary">
              <i className="bi bi-grid me-2"></i>
              Browse Products
            </Link>
          </div>
        )}

        {/* Filtered Empty */}
        {!loading && !error && orders.length > 0 && filtered.length === 0 && (
          <div className="orders-empty small-empty">
            <i className="bi bi-inbox"></i>
            <p>No {filter} orders found.</p>
          </div>
        )}

        {/* Orders List */}
        {!loading && !error && filtered.length > 0 && (
          <div className="orders-list">
            {filtered.map(order => {
              const status = order.order_status || order.status || 'pending';
              const itemCount = order.items?.length ?? order.item_count ?? 0;
              return (
                <div key={order.id} className="order-card">
                  <div className="order-card-header">
                    <div className="order-card-meta">
                      <span className="order-number">
                        <i className="bi bi-hash"></i>
                        {order.order_number || `Order ${order.id}`}
                      </span>
                      <span className="order-date">
                        <i className="bi bi-calendar3 me-1"></i>
                        {formatDate(order.created_at)}
                      </span>
                    </div>
                    <StatusBadge status={status} />
                  </div>

                  <div className="order-card-body">
                    <div className="order-info-row">
                      <div className="order-info-item">
                        <span className="order-info-label">Total</span>
                        <span className="order-info-value price">
                          {formatPrice(order.total_amount)}
                        </span>
                      </div>
                      {itemCount > 0 && (
                        <div className="order-info-item">
                          <span className="order-info-label">Items</span>
                          <span className="order-info-value">
                            {itemCount} item{itemCount !== 1 ? 's' : ''}
                          </span>
                        </div>
                      )}
                      {order.payment_status && (
                        <div className="order-info-item">
                          <span className="order-info-label">Payment</span>
                          <span className={`order-info-value payment-${order.payment_status}`}>
                            {order.payment_status.charAt(0).toUpperCase() + order.payment_status.slice(1)}
                          </span>
                        </div>
                      )}
                      {order.shipping_address && (
                        <div className="order-info-item address">
                          <span className="order-info-label">
                            <i className="bi bi-geo-alt me-1"></i>Ship to
                          </span>
                          <span className="order-info-value text-muted small">
                            {order.shipping_address}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="order-card-footer">
                    <Link
                      to={`/orders/${order.id}`}
                      className="btn btn-sm btn-outline-primary"
                    >
                      <i className="bi bi-eye me-1"></i>
                      View Details
                    </Link>
                    {status === 'pending' && (
                      <span className="order-pending-note">
                        <i className="bi bi-clock me-1"></i>
                        Awaiting confirmation
                      </span>
                    )}
                    {status === 'delivered' && (
                      <span className="order-delivered-note">
                        <i className="bi bi-check-circle me-1"></i>
                        Delivered
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default MyOrdersPage;
