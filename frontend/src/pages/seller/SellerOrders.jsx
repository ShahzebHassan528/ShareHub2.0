/**
 * Seller Orders Page
 * Lists all orders containing the seller's products at /seller/orders
 */

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import orderAPI from '../../api/order.api';
import { useToast } from '../../contexts/ToastContext';
import './SellerOrders.css';

const STATUS_STYLES = {
  pending:   { bg: '#fff8e1', color: '#f59e0b', label: 'Pending' },
  confirmed: { bg: '#e0f2fe', color: '#0284c7', label: 'Confirmed' },
  shipped:   { bg: '#ede9fe', color: '#7c3aed', label: 'Shipped' },
  delivered: { bg: '#dcfce7', color: '#16a34a', label: 'Delivered' },
  cancelled: { bg: '#fee2e2', color: '#dc2626', label: 'Cancelled' },
};

// What action buttons to show for each current status
const NEXT_ACTIONS = {
  pending:   [{ status: 'confirmed', label: 'Confirm Order',     icon: 'bi-check-circle', cls: 'btn-success' }],
  confirmed: [{ status: 'shipped',   label: 'Mark as Shipped',   icon: 'bi-truck',        cls: 'btn-primary' }],
  shipped:   [{ status: 'delivered', label: 'Mark as Delivered', icon: 'bi-check2-all',   cls: 'btn-success' }],
  delivered: [],
  cancelled: [],
};

const StatusBadge = ({ status }) => {
  const s = STATUS_STYLES[status] || { bg: '#f3f4f6', color: '#6b7280', label: status };
  return (
    <span className="seller-order-status-badge" style={{ backgroundColor: s.bg, color: s.color }}>
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
    year: 'numeric', month: 'short', day: 'numeric',
  });
};

const OrderSkeleton = () => (
  <div className="seller-order-card skeleton-card">
    <div className="skeleton skeleton-title" />
    <div className="skeleton skeleton-line" />
    <div className="skeleton skeleton-line short" />
  </div>
);

const TABS = [
  { key: 'all',       label: 'All' },
  { key: 'pending',   label: 'Pending' },
  { key: 'confirmed', label: 'Confirmed' },
  { key: 'shipped',   label: 'Shipped' },
  { key: 'delivered', label: 'Delivered' },
  { key: 'cancelled', label: 'Cancelled' },
];

const SellerOrders = () => {
  const [orders, setOrders]       = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');
  const [filter, setFilter]       = useState('all');
  const [updating, setUpdating]   = useState({}); // { [orderId]: true }
  const { showToast } = useToast();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await orderAPI.getSellerOrders();
        setOrders(response.data || []);
      } catch (err) {
        setError(err.message || 'Failed to load orders.');
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const getStatus = (o) => o.order_status || o.status || 'pending';

  const handleStatusUpdate = async (orderId, newStatus) => {
    setUpdating(prev => ({ ...prev, [orderId]: true }));
    try {
      await orderAPI.updateOrderStatus(orderId, newStatus);
      // Update locally without refetch
      setOrders(prev =>
        prev.map(o =>
          o.id === orderId
            ? { ...o, order_status: newStatus, status: newStatus }
            : o
        )
      );
      showToast(`Order marked as ${newStatus}`, 'success');
    } catch (err) {
      showToast(err.message || 'Failed to update order status', 'error');
    } finally {
      setUpdating(prev => ({ ...prev, [orderId]: false }));
    }
  };

  const filtered = filter === 'all'
    ? orders
    : orders.filter(o => getStatus(o) === filter);

  const countFor = (key) =>
    key === 'all' ? orders.length : orders.filter(o => getStatus(o) === key).length;

  return (
    <div className="seller-orders-page">
      <div className="container-fluid py-4">

        {/* Header */}
        <div className="seller-orders-header">
          <div>
            <h1 className="seller-orders-title">
              <i className="bi bi-bag-check me-2"></i>
              Orders
            </h1>
            <p className="seller-orders-subtitle">
              {loading ? 'Loading…' : `${orders.length} order${orders.length !== 1 ? 's' : ''} received`}
            </p>
          </div>
          <Link to="/seller/dashboard" className="btn btn-outline-secondary btn-sm">
            <i className="bi bi-arrow-left me-1"></i>
            Dashboard
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
        {!loading && !error && (
          <div className="seller-orders-tabs">
            {TABS.map(tab => (
              <button
                key={tab.key}
                className={`seller-orders-tab ${filter === tab.key ? 'active' : ''}`}
                onClick={() => setFilter(tab.key)}
              >
                {tab.label}
                <span className="tab-count">{countFor(tab.key)}</span>
              </button>
            ))}
          </div>
        )}

        {/* Skeletons */}
        {loading && (
          <div className="seller-orders-list">
            {[1, 2, 3].map(i => <OrderSkeleton key={i} />)}
          </div>
        )}

        {/* Empty — no orders at all */}
        {!loading && !error && orders.length === 0 && (
          <div className="seller-orders-empty">
            <i className="bi bi-inbox"></i>
            <h3>No orders yet</h3>
            <p>Orders placed for your products will appear here.</p>
            <Link to="/seller/products" className="btn btn-primary">
              <i className="bi bi-box-seam me-2"></i>
              View My Products
            </Link>
          </div>
        )}

        {/* Empty — filtered */}
        {!loading && !error && orders.length > 0 && filtered.length === 0 && (
          <div className="seller-orders-empty small-empty">
            <i className="bi bi-funnel"></i>
            <p>No <strong>{filter}</strong> orders found.</p>
          </div>
        )}

        {/* Orders List */}
        {!loading && !error && filtered.length > 0 && (
          <div className="seller-orders-list">
            {filtered.map(order => {
              const status    = getStatus(order);
              const itemCount = order.items?.length ?? 0;
              const actions   = NEXT_ACTIONS[status] || [];
              const isUpdating = !!updating[order.id];

              return (
                <div key={order.id} className="seller-order-card">

                  {/* Card Header */}
                  <div className="seller-order-card-header">
                    <div className="seller-order-meta">
                      <span className="seller-order-number">
                        <i className="bi bi-hash"></i>
                        {order.order_number || `Order ${order.id}`}
                      </span>
                      <span className="seller-order-date">
                        <i className="bi bi-calendar3 me-1"></i>
                        {formatDate(order.created_at)}
                      </span>
                    </div>
                    <StatusBadge status={status} />
                  </div>

                  {/* Card Body */}
                  <div className="seller-order-card-body">
                    <div className="seller-order-info-row">
                      <div className="seller-order-info-item">
                        <span className="seller-order-info-label">Order Total</span>
                        <span className="seller-order-info-value price">
                          {formatPrice(order.total_amount)}
                        </span>
                      </div>

                      {itemCount > 0 && (
                        <div className="seller-order-info-item">
                          <span className="seller-order-info-label">Items</span>
                          <span className="seller-order-info-value">
                            {itemCount} item{itemCount !== 1 ? 's' : ''}
                          </span>
                        </div>
                      )}

                      {order.payment_status && (
                        <div className="seller-order-info-item">
                          <span className="seller-order-info-label">Payment</span>
                          <span className={`seller-order-info-value payment-${order.payment_status}`}>
                            {order.payment_status.charAt(0).toUpperCase() + order.payment_status.slice(1)}
                          </span>
                        </div>
                      )}

                      {order.shipping_address && (
                        <div className="seller-order-info-item address">
                          <span className="seller-order-info-label">
                            <i className="bi bi-geo-alt me-1"></i>Ship to
                          </span>
                          <span className="seller-order-info-value text-muted small">
                            {order.shipping_address}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Items Preview */}
                    {order.items?.length > 0 && (
                      <div className="seller-order-items-preview">
                        {order.items.map(item => (
                          <div key={item.id} className="seller-order-item-row">
                            <span className="item-title">
                              <i className="bi bi-box me-1 text-muted"></i>
                              {item.title || `Product #${item.product_id}`}
                            </span>
                            <span className="item-qty-price">
                              x{item.quantity} &nbsp;·&nbsp; {formatPrice(item.price * item.quantity)}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Card Footer — action buttons */}
                  <div className="seller-order-card-footer">
                    <div className="seller-order-footer-left">
                      <Link
                        to={`/orders/${order.id}`}
                        className="btn btn-sm btn-outline-secondary"
                      >
                        <i className="bi bi-eye me-1"></i>
                        View Details
                      </Link>
                    </div>

                    <div className="seller-order-footer-right">
                      {/* Status progress hint */}
                      {status === 'pending' && (
                        <span className="seller-order-note pending">
                          <i className="bi bi-clock me-1"></i>
                          Awaiting your confirmation
                        </span>
                      )}
                      {status === 'delivered' && (
                        <span className="seller-order-note delivered">
                          <i className="bi bi-check-circle me-1"></i>
                          Order completed
                        </span>
                      )}
                      {status === 'cancelled' && (
                        <span className="seller-order-note cancelled">
                          <i className="bi bi-x-circle me-1"></i>
                          Cancelled
                        </span>
                      )}

                      {/* Action buttons */}
                      {actions.map(action => (
                        <button
                          key={action.status}
                          className={`btn btn-sm ${action.cls}`}
                          disabled={isUpdating}
                          onClick={() => handleStatusUpdate(order.id, action.status)}
                        >
                          {isUpdating ? (
                            <>
                              <span className="spinner-border spinner-border-sm me-1" role="status" />
                              Updating…
                            </>
                          ) : (
                            <>
                              <i className={`bi ${action.icon} me-1`}></i>
                              {action.label}
                            </>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
};

export default SellerOrders;
