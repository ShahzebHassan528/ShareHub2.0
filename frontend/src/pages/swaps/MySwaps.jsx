import { useState, useEffect } from 'react';
import { getMySwapRequests, cancelSwap } from '../../api/swap.api';
import { useToast } from '../../contexts/ToastContext';
import StatusBadge from '../../components/common/StatusBadge';
import './MySwaps.css';

const MySwaps = () => {
  const { showToast } = useToast();
  const [swaps, setSwaps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState({});
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, swap: null });

  useEffect(() => {
    fetchSwaps();
  }, []);

  const fetchSwaps = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getMySwapRequests();
      // FIX: controller returns { success, count, data: [...] }
      setSwaps(data.data || []);
    } catch (err) {
      // FIX: client.js converts errors to plain Error objects
      const errorMsg = err.message || 'Failed to load swap requests';
      setError(errorMsg);
      showToast(errorMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = (swap) => {
    setConfirmModal({ isOpen: true, swap });
  };

  const confirmCancel = async () => {
    const { swap } = confirmModal;
    try {
      setActionLoading(prev => ({ ...prev, [swap.id]: true }));
      await cancelSwap(swap.id);
      setSwaps(prev => prev.map(s =>
        s.id === swap.id ? { ...s, status: 'cancelled' } : s
      ));
      showToast('Swap request cancelled', 'info');
      setConfirmModal({ isOpen: false, swap: null });
    } catch (err) {
      showToast(err.message || 'Failed to cancel swap', 'error');
    } finally {
      setActionLoading(prev => ({ ...prev, [swap.id]: false }));
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="my-swaps-page">
        <div className="container">
          <h1>My Swap Requests</h1>
          <div className="swaps-loading">
            <div className="spinner"></div>
            <p>Loading your swap requests...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error && swaps.length === 0) {
    return (
      <div className="my-swaps-page">
        <div className="container">
          <h1>My Swap Requests</h1>
          <div className="swaps-error">
            <div className="error-icon">⚠️</div>
            <h2>Failed to Load Swaps</h2>
            <p>{error}</p>
            <button onClick={fetchSwaps} className="btn-retry">Try Again</button>
          </div>
        </div>
      </div>
    );
  }

  if (swaps.length === 0) {
    return (
      <div className="my-swaps-page">
        <div className="container">
          <h1>My Swap Requests</h1>
          <div className="swaps-empty">
            <div className="empty-icon">⇄</div>
            <h2>No Swap Requests</h2>
            <p>You haven't requested any item swaps yet.</p>
            <p className="empty-hint">
              Browse products and click "Request Swap" to exchange items.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="my-swaps-page">
      <div className="container">
        <div className="page-header">
          <h1>My Swap Requests</h1>
          <p className="page-subtitle">
            {swaps.length} {swaps.length === 1 ? 'request' : 'requests'}
          </p>
        </div>

        <div className="swaps-list">
          {swaps.map((swap) => (
            <div key={swap.id} className="swap-card">
              <div className="swap-card-header">
                <StatusBadge status={swap.status} />
                <span className="swap-date">{formatDate(swap.created_at)}</span>
              </div>

              <div className="swap-card-body">
                <div className="swap-items">
                  <div className="swap-item">
                    <h4>You Want</h4>
                    <div className="item-card">
                      {swap.requested_item_image && (
                        <img
                          src={swap.requested_item_image}
                          alt={swap.requested_item_title}
                          className="item-image"
                        />
                      )}
                      <div className="item-info">
                        <h3>{swap.requested_item_title || 'Product'}</h3>
                        {swap.requested_item_price && (
                          <p className="item-price">
                            Rs. {swap.requested_item_price.toLocaleString()}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="swap-arrow">⇄</div>

                  <div className="swap-item">
                    <h4>You Offer</h4>
                    <div className="item-card">
                      {swap.offered_item_image && (
                        <img
                          src={swap.offered_item_image}
                          alt={swap.offered_item_title}
                          className="item-image"
                        />
                      )}
                      <div className="item-info">
                        <h3>{swap.offered_item_title || 'Product'}</h3>
                        {swap.offered_item_price && (
                          <p className="item-price">
                            Rs. {swap.offered_item_price.toLocaleString()}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="swap-details">
                  <div className="detail-row">
                    <span className="detail-label">Seller:</span>
                    <span className="detail-value">{swap.owner_name || 'N/A'}</span>
                  </div>
                  {swap.message && (
                    <div className="detail-row">
                      <span className="detail-label">Message:</span>
                      <span className="detail-value message-text">{swap.message}</span>
                    </div>
                  )}
                </div>
              </div>

              {swap.status === 'pending' && (
                <div className="swap-card-actions">
                  <button
                    onClick={() => handleCancel(swap)}
                    className="btn-cancel-swap"
                    disabled={actionLoading[swap.id]}
                  >
                    {actionLoading[swap.id] ? 'Cancelling...' : 'Cancel Request'}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {confirmModal.isOpen && (
        <div className="confirm-modal-overlay" onClick={() => setConfirmModal({ isOpen: false, swap: null })}>
          <div className="confirm-modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Cancel Swap Request</h3>
            <p>Are you sure you want to cancel this swap request?</p>
            <div className="modal-actions">
              <button
                onClick={() => setConfirmModal({ isOpen: false, swap: null })}
                className="btn-modal-cancel"
              >
                No, Keep It
              </button>
              <button onClick={confirmCancel} className="btn-modal-confirm">
                Yes, Cancel Request
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MySwaps;
