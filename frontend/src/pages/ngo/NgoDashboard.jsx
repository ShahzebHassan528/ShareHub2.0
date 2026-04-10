/**
 * NGO Dashboard
 * Enhanced dashboard for NGO donation management
 */

import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { getNGODonations, acceptDonation, rejectDonation } from '../../api/donation.api';
import { getMyProfile } from '../../api/user.api';
import StatusBadge from '../../components/common/StatusBadge';
import './NgoDashboard.css';

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, delay: i * 0.07, ease: 'easeOut' },
  }),
};

const NgoDashboard = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState({});
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, donation: null, action: null });

  const [stats, setStats] = useState({ total: 0, pending: 0, accepted: 0, rejected: 0 });

  useEffect(() => {
    getMyProfile()
      .then(data => {
        if (data?.data?.verification_status === 'pending') {
          navigate('/ngo/pending', { replace: true });
        }
      })
      .catch(() => {});
    fetchDonations();
  }, []);

  useEffect(() => {
    setStats({
      total: donations.length,
      pending: donations.filter(d => d.status === 'pending').length,
      accepted: donations.filter(d => d.status === 'accepted').length,
      rejected: donations.filter(d => d.status === 'rejected').length
    });
  }, [donations]);

  const fetchDonations = async () => {
    try {
      setLoading(true);
      const data = await getNGODonations();
      // FIX: controller returns { success, count, donations: [...] }
      setDonations(data.donations || []);
    } catch (err) {
      // FIX: client.js converts errors to plain Error objects — use err.message
      showToast(err.message || 'Failed to load donations', 'error');
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

      setDonations(prev => prev.map(d =>
        d.id === donation.id
          ? { ...d, status: action === 'accept' ? 'accepted' : 'rejected' }
          : d
      ));

      setConfirmModal({ isOpen: false, donation: null, action: null });
    } catch (err) {
      showToast(err.message || `Failed to ${action} donation`, 'error');
    } finally {
      setActionLoading(prev => ({ ...prev, [donation.id]: false }));
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const pendingDonations = donations.filter(d => d.status === 'pending');
  const recentDonations = donations.slice(0, 5);

  return (
    <motion.div className="ngo-dashboard" initial="hidden" animate="visible" variants={fadeUp}>
      <div className="dashboard-container">
        {/* Welcome Section */}
        <div className="welcome-section">
          <div>
            <h1>Welcome, {user?.full_name}! 🎁</h1>
            <p className="welcome-subtitle">Manage donation requests and help the community</p>
          </div>
          <Link to="/ngo/donations" className="btn-view-all">
            View All Donations →
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon total"><span>📦</span></div>
            <div className="stat-content">
              <h3>{stats.total}</h3>
              <p>Total Donations</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon pending"><span>⏳</span></div>
            <div className="stat-content">
              <h3>{stats.pending}</h3>
              <p>Pending Requests</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon accepted"><span>✅</span></div>
            <div className="stat-content">
              <h3>{stats.accepted}</h3>
              <p>Accepted Donations</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon rejected"><span>❌</span></div>
            <div className="stat-content">
              <h3>{stats.rejected}</h3>
              <p>Rejected</p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="dashboard-grid">
          {/* Left Column - Pending Donations */}
          <div className="dashboard-left">
            <div className="dashboard-card">
              <div className="card-header">
                <h2>Pending Donation Requests</h2>
                <span className="badge-count">{pendingDonations.length}</span>
              </div>
              <div className="card-content">
                {loading ? (
                  <div className="loading-state">
                    <div className="spinner-small"></div>
                    <p>Loading donations...</p>
                  </div>
                ) : pendingDonations.length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-icon">📭</div>
                    <h3>No Pending Requests</h3>
                    <p>All donation requests have been processed</p>
                  </div>
                ) : (
                  <div className="donations-list">
                    {pendingDonations.map(donation => (
                      <div key={donation.id} className="donation-card">
                        <div className="donation-header">
                          <div className="donor-info">
                            <div className="donor-avatar">
                              {donation.donor_name?.charAt(0) || 'D'}
                            </div>
                            <div>
                              <h4>{donation.donor_name || 'Anonymous'}</h4>
                              <p className="donor-date">{formatDate(donation.created_at)}</p>
                            </div>
                          </div>
                          <StatusBadge status={donation.status} />
                        </div>

                        <div className="donation-body">
                          <div className="product-info">
                            {donation.product_image && (
                              <img
                                src={donation.product_image}
                                alt={donation.product_title}
                                className="product-image"
                              />
                            )}
                            <div className="product-details">
                              <h4>{donation.product_title || 'Product'}</h4>
                              {donation.product_price && (
                                <p className="product-price">
                                  Value: Rs. {donation.product_price.toLocaleString()}
                                </p>
                              )}
                            </div>
                          </div>

                          {donation.message && (
                            <div className="donation-message">
                              <p className="message-label">Message:</p>
                              <p className="message-text">"{donation.message}"</p>
                            </div>
                          )}

                          {donation.donor_phone && (
                            <div className="contact-info">
                              <span className="contact-label">Contact:</span>
                              <span className="contact-value">{donation.donor_phone}</span>
                            </div>
                          )}
                        </div>

                        <div className="donation-actions">
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
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="dashboard-right">
            {/* NGO Profile */}
            <div className="dashboard-card">
              <div className="card-header">
                <h2>NGO Profile</h2>
                <Link to="/profile" className="edit-link">Edit</Link>
              </div>
              <div className="card-content">
                <div className="ngo-profile">
                  <div className="profile-avatar">
                    {user?.full_name?.charAt(0) || 'N'}
                  </div>
                  <div className="profile-info">
                    <h3>{user?.full_name}</h3>
                    <p className="profile-email">{user?.email}</p>
                    <span className="profile-badge">Verified NGO</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="dashboard-card">
              <div className="card-header">
                <h2>Recent Activity</h2>
                <Link to="/ngo/donations" className="view-all">View All →</Link>
              </div>
              <div className="card-content">
                {recentDonations.length === 0 ? (
                  <div className="empty-state-small">
                    <p>No recent activity</p>
                  </div>
                ) : (
                  <div className="activity-list">
                    {recentDonations.map(donation => (
                      <div key={donation.id} className="activity-item">
                        <div className="activity-icon">
                          {donation.status === 'accepted' ? '✅' :
                           donation.status === 'rejected' ? '❌' : '⏳'}
                        </div>
                        <div className="activity-content">
                          <p className="activity-title">{donation.product_title}</p>
                          <p className="activity-meta">
                            {donation.donor_name} • {formatDate(donation.created_at)}
                          </p>
                        </div>
                        <StatusBadge status={donation.status} />
                      </div>
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
                  <Link to="/ngo/donations" className="action-btn">
                    <span className="action-icon">📋</span>
                    All Donations
                  </Link>
                  <Link to="/profile" className="action-btn">
                    <span className="action-icon">⚙️</span>
                    Settings
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {confirmModal.isOpen && (
        <div className="modal-overlay" onClick={() => setConfirmModal({ isOpen: false, donation: null, action: null })}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Confirm {confirmModal.action === 'accept' ? 'Accept' : 'Reject'}</h3>
            <p>
              Are you sure you want to {confirmModal.action} this donation from{' '}
              <strong>{confirmModal.donation?.donor_name}</strong>?
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
    </motion.div>
  );
};

export default NgoDashboard;
