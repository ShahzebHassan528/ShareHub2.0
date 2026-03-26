import { useState, useEffect } from 'react';
import { getMySwapOffers, acceptSwap, rejectSwap } from '../../api/swap.api';
import { useToast } from '../../contexts/ToastContext';
import StatusBadge from '../../components/common/StatusBadge';
import './SwapOffers.css';

const SwapOffers = () => {
  const { showToast } = useToast();
  const [swaps, setSwaps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState({});
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, swap: null, action: null });

  useEffect(() => {
    fetchSwaps();
  }, []);

  const fetchSwaps = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getMySwapOffers();
      // FIX: controller returns { success, count, data: [...] }
      setSwaps(data.data || []);
    } catch (err) {
      // FIX: client.js converts errors to plain Error objects
      const errorMsg = err.message || 'Failed to load swap offers';
      setError(errorMsg);
      showToast(errorMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = (swap) => {
    setConfirmModal({ isOpen: true, swap, action: 'accept' });
  };

  const handleReject = (swap) => {
    setConfirmModal({ isOpen: true, swap, action: 'reject' });
  };

  const confirmAction = async () => {
    const { swap, action } = confirmModal;
    try {
      setActionLoading(prev => ({ ...prev, [swap.id]: true }));
      if (action === 'accept') {
        await acceptSwap(swap.id);
        showToast('Swap accepted successfully', 'success');
      } else {
        await rejectSwap(swap.id);
        showToast('Swap rejected', 'info');
      }
      setSwaps(prev => prev.map(s =>
        s.id === swap.id
          ? { ...s, status: action === 'accept' ? 'accepted' : 'rejected' }
          : s
      ));
      setConfirmModal({ isOpen: false, swap: null, action: null });
    } catch (err) {
      showToast(err.message || `Failed to ${action} swap`, 'error');
    } finally {
      setActionLoading(prev => ({ ...prev, [swap.id]: false }));
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="swap-offers-page">
        <div className="container">
          <h1>Swap Offers</h1>
          <div className="swaps-loading">
            <div className="spinner"></div>
            <p>Loading swap offers...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error && swaps.length === 0) {
    return (
      <div className="swap-offers-page">
        <div className="container">
          <h1>Swap Offers</h1>
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
      <div className="swap-offers-page">
        <div className="container">
          <h1>Swap Offers</h1>
          <div className="swaps-empty">
            <div className="empty-icon">📦</div>
            <h2>No Swap Offers</h2>
            <p>You haven't received any swap offers yet.</p>
          </div>
        </div>
      </div>
    );
  }

  const pendingCount = swaps.filter(s => s.status === 'pending').length;

  return (
    <div className="swap-offers-page">
      <div className="container">
        <div className="page-header">
          <div>
            <h1>Swap Offers</h1>
            <p className="page-subtitle">
              {swaps.length} total • {pendingCount} pending
            </p>
          </div>
        </div>

        <div className="swaps-grid">
          {swaps.map((swap) => (
            <div key={swap.id} className="swap-offer-card">
              <div className="card-header">
                <StatusBadge status={swap.status} />
                <span className="swap-date">{formatDate(swap.created_at)}</span>
              </div>

              <div className="card-body">
                <div className="swap-exchange">
                  <div className="exchange-item">
                    <h4>They Want</h4>
                    <div className="item-preview">
                      {swap.requested_item_image && (
                        <img
                          src={swap.requested_item_image}
                          alt={swap.requested_item_title}
                          className="preview-image"
                        />
                      )}
                      <div className="preview-info">
                        <h3>{swap.requested_item_title || 'Your Product'}</h3>
                        {swap.requested_item_price && (
                          <p className="preview-price">
                            Rs. {swap.requested_item_price.toLocaleString()}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="exchange-arrow">⇄</div>

                  <div className="exchange-item">
                    <h4>They Offer</h4>
                    <div className="item-preview">
                      {swap.offered_item_image && (
                        <img
                          src={swap.offered_item_image}
                          alt={swap.offered_item_title}
                          className="preview-image"
                        />
                      )}
                      <div className="preview-info">
                        <h3>{swap.offered_item_title || 'Product'}</h3>
                        {swap.offered_item_price && (
                          <p className="preview-price">
                            Rs. {swap.offered_item_price.toLocaleString()}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="requester-section">
                  <div className="info-row">
                    <span className="info-label">Buyer:</span>
                    <span className="info-value">{swap.requester_name || 'Anonymous'}</span>
                  </div>
                  {swap.requester_phone && (
                    <div className="info-row">
                      <span className="info-label">Phone:</span>
                      <span className="info-value">{swap.requester_phone}</span>
                    </div>
                  )}
                </div>

                {swap.message && (
                  <div className="message-section">
                    <p className="message-label">Message from buyer:</p>
                    <p className="message-text">"{swap.message}"</p>
                  </div>
                )}
              </div>

              {swap.status === 'pending' && (
                <div className="card-actions">
                  <button
                    onClick={() => handleReject(swap)}
                    className="btn-action btn-reject"
                    disabled={actionLoading[swap.id]}
                  >
                    {actionLoading[swap.id] ? 'Processing...' : 'Reject'}
                  </button>
                  <button
                    onClick={() => handleAccept(swap)}
                    className="btn-action btn-accept"
                    disabled={actionLoading[swap.id]}
                  >
                    {actionLoading[swap.id] ? 'Processing...' : 'Accept'}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {confirmModal.isOpen && (
        <div className="confirm-modal-overlay" onClick={() => setConfirmModal({ isOpen: false, swap: null, action: null })}>
          <div className="confirm-modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Confirm {confirmModal.action === 'accept' ? 'Accept' : 'Reject'}</h3>
            <p>Are you sure you want to {confirmModal.action} this swap offer?</p>
            <div className="modal-actions">
              <button
                onClick={() => setConfirmModal({ isOpen: false, swap: null, action: null })}
                className="btn-cancel"
              >
                Cancel
              </button>
              <button
                onClick={confirmAction}
                className={`btn-confirm ${confirmModal.action === 'accept' ? 'btn-confirm-accept' : 'btn-confirm-reject'}`}
              >
                Yes, {confirmModal.action === 'accept' ? 'Accept' : 'Reject'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SwapOffers;
