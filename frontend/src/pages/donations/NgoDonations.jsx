import { useState, useEffect } from 'react';
import { getNGODonations, acceptDonation, rejectDonation } from '../../api/donation.api';
import { useToast } from '../../contexts/ToastContext';
import StatusBadge from '../../components/common/StatusBadge';
import './NgoDonations.css';

const NgoDonations = () => {
  const { showToast } = useToast();
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState({});
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, donation: null, action: null });

  useEffect(() => {
    fetchDonations();
  }, []);

  const fetchDonations = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getNGODonations();
      setDonations(data.donations || []);
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Failed to load donations';
      setError(errorMsg);
      showToast(errorMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = (donation) => {
    setConfirmModal({ isOpen: true, donation, action: 'accept' });
  };

  const handleReject = (donation) => {
    setConfirmModal({ isOpen: true, donation, action: 'reject' });
  };

  const confirmAction = async () => {
    const { donation, action } = confirmModal;
    
    try {
      setActionLoading(prev => ({ ...prev, [donation.id]: true }));
      
      if (action === 'accept') {
        await acceptDonation(donation.id);
        showToast('Donation accepted successfully', 'success');
      } else {
        await rejectDonation(donation.id);
        showToast('Donation rejected', 'info');
      }
      
      // Update local state
      setDonations(prev => prev.map(d => 
        d.id === donation.id 
          ? { ...d, status: action === 'accept' ? 'accepted' : 'rejected' }
          : d
      ));
      
      setConfirmModal({ isOpen: false, donation: null, action: null });
    } catch (err) {
      const errorMsg = err.response?.data?.error || `Failed to ${action} donation`;
      showToast(errorMsg, 'error');
    } finally {
      setActionLoading(prev => ({ ...prev, [donation.id]: false }));
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="ngo-donations-page">
        <div className="container">
          <h1>Donation Requests</h1>
          <div className="donations-loading">
            <div className="spinner"></div>
            <p>Loading donation requests...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error && donations.length === 0) {
    return (
      <div className="ngo-donations-page">
        <div className="container">
          <h1>Donation Requests</h1>
          <div className="donations-error">
            <div className="error-icon">⚠️</div>
            <h2>Failed to Load Donations</h2>
            <p>{error}</p>
            <button onClick={fetchDonations} className="btn-retry">
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (donations.length === 0) {
    return (
      <div className="ngo-donations-page">
        <div className="container">
          <h1>Donation Requests</h1>
          <div className="donations-empty">
            <div className="empty-icon">📦</div>
            <h2>No Donation Requests</h2>
            <p>You haven't received any donation requests yet.</p>
          </div>
        </div>
      </div>
    );
  }

  const pendingCount = donations.filter(d => d.status === 'pending').length;

  return (
    <div className="ngo-donations-page">
      <div className="container">
        <div className="page-header">
          <div>
            <h1>Donation Requests</h1>
            <p className="page-subtitle">
              {donations.length} total • {pendingCount} pending
            </p>
          </div>
        </div>

        <div className="donations-grid">
          {donations.map((donation) => (
            <div key={donation.id} className="ngo-donation-card">
              <div className="card-header">
                <StatusBadge status={donation.status} />
                <span className="donation-date">{formatDate(donation.created_at)}</span>
              </div>

              <div className="card-body">
                <div className="product-section">
                  {donation.product_image && (
                    <img 
                      src={donation.product_image} 
                      alt={donation.product_title}
                      className="product-image"
                    />
                  )}
                  <div className="product-details">
                    <h3>{donation.product_title || 'Product'}</h3>
                    {donation.product_price && (
                      <p className="product-price">
                        Value: Rs. {donation.product_price.toLocaleString()}
                      </p>
                    )}
                    {donation.product_condition && (
                      <p className="product-condition">
                        Condition: {donation.product_condition}
                      </p>
                    )}
                  </div>
                </div>

                <div className="donor-section">
                  <div className="info-row">
                    <span className="info-label">Donor:</span>
                    <span className="info-value">{donation.donor_name || 'Anonymous'}</span>
                  </div>
                  {donation.donor_phone && (
                    <div className="info-row">
                      <span className="info-label">Phone:</span>
                      <span className="info-value">{donation.donor_phone}</span>
                    </div>
                  )}
                </div>

                {donation.message && (
                  <div className="message-section">
                    <p className="message-label">Message from donor:</p>
                    <p className="message-text">"{donation.message}"</p>
                  </div>
                )}
              </div>

              {donation.status === 'pending' && (
                <div className="card-actions">
                  <button
                    onClick={() => handleReject(donation)}
                    className="btn-action btn-reject"
                    disabled={actionLoading[donation.id]}
                  >
                    {actionLoading[donation.id] ? 'Processing...' : 'Reject'}
                  </button>
                  <button
                    onClick={() => handleAccept(donation)}
                    className="btn-action btn-accept"
                    disabled={actionLoading[donation.id]}
                  >
                    {actionLoading[donation.id] ? 'Processing...' : 'Accept'}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Confirmation Modal */}
      {confirmModal.isOpen && (
        <div className="confirm-modal-overlay" onClick={() => setConfirmModal({ isOpen: false, donation: null, action: null })}>
          <div className="confirm-modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Confirm {confirmModal.action === 'accept' ? 'Accept' : 'Reject'}</h3>
            <p>
              Are you sure you want to {confirmModal.action} this donation of{' '}
              <strong>{confirmModal.donation?.product_title}</strong>?
            </p>
            <div className="modal-actions">
              <button
                onClick={() => setConfirmModal({ isOpen: false, donation: null, action: null })}
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

export default NgoDonations;
