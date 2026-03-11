import { useState, useEffect } from 'react';
import adminAPI from '../../api/admin.api';
import { useToast } from '../../contexts/ToastContext';
import './AdminPages.css';

const AdminSellers = () => {
  const toast = useToast();
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('pending');
  const [modalData, setModalData] = useState(null); // { seller, action: 'reject' }
  const [reason, setReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => { fetchSellers(); }, [tab]);

  const fetchSellers = async () => {
    try {
      setLoading(true);
      const res = tab === 'pending' ? await adminAPI.getPendingSellers() : await adminAPI.getAllSellers();
      setSellers(res.sellers || res.data || []);
    } catch (e) {
      toast.showToast('Failed to load sellers', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (seller) => {
    try {
      setActionLoading(true);
      await adminAPI.approveSeller(seller.id);
      toast.showToast(`${seller.business_name} approved!`, 'success');
      fetchSellers();
    } catch (e) {
      toast.showToast(e.message, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!reason.trim()) return toast.showToast('Please enter a rejection reason', 'error');
    try {
      setActionLoading(true);
      await adminAPI.rejectSeller(modalData.seller.id, reason);
      toast.showToast('Seller rejected', 'success');
      setModalData(null);
      setReason('');
      fetchSellers();
    } catch (e) {
      toast.showToast(e.message, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const statusColor = (status) => ({ approved: 'active', pending: 'pending', rejected: 'rejected' }[status] || 'pending');

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1><i className="bi bi-shop me-2"></i>Seller Management</h1>
          <p>Review and approve seller applications</p>
        </div>
      </div>

      <div className="tab-row">
        <button className={`tab-btn ${tab === 'pending' ? 'active' : ''}`} onClick={() => setTab('pending')}>
          <i className="bi bi-hourglass-split me-1"></i>Pending Approval
        </button>
        <button className={`tab-btn ${tab === 'all' ? 'active' : ''}`} onClick={() => setTab('all')}>
          <i className="bi bi-list-ul me-1"></i>All Sellers
        </button>
      </div>

      {loading ? (
        <div className="admin-loading"><div className="spinner-border text-primary"></div></div>
      ) : sellers.length === 0 ? (
        <div className="empty-state">
          <i className="bi bi-check-circle"></i>
          <p>{tab === 'pending' ? 'No pending applications!' : 'No sellers found'}</p>
        </div>
      ) : (
        <div className="cards-grid">
          {sellers.map(seller => (
            <div key={seller.id} className="seller-card">
              <div className="seller-card-header">
                <div className="seller-avatar">{seller.business_name?.charAt(0)?.toUpperCase() || 'S'}</div>
                <div className="seller-card-title">
                  <h3>{seller.business_name}</h3>
                  <p>{seller.email}</p>
                </div>
                <span className={`status-badge ${statusColor(seller.approval_status)}`}>{seller.approval_status}</span>
              </div>
              <div className="seller-card-body">
                <div className="info-row"><span>Owner</span><strong>{seller.full_name || '—'}</strong></div>
                <div className="info-row"><span>Phone</span><strong>{seller.phone || '—'}</strong></div>
                <div className="info-row"><span>Address</span><strong>{seller.business_address || '—'}</strong></div>
                <div className="info-row"><span>License</span><strong>{seller.business_license || '—'}</strong></div>
                <div className="info-row"><span>Applied</span><strong>{seller.created_at ? new Date(seller.created_at).toLocaleDateString() : '—'}</strong></div>
              </div>
              {seller.approval_status === 'pending' && (
                <div className="seller-card-actions">
                  <button className="action-btn-sm success" onClick={() => handleApprove(seller)} disabled={actionLoading}>
                    <i className="bi bi-check-lg me-1"></i>Approve
                  </button>
                  <button className="action-btn-sm danger" onClick={() => { setModalData({ seller }); setReason(''); }}>
                    <i className="bi bi-x-lg me-1"></i>Reject
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Reject Modal */}
      {modalData && (
        <div className="modal-overlay" onClick={() => setModalData(null)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <h3>Reject Seller Application</h3>
            <p>Rejecting <strong>{modalData.seller.business_name}</strong></p>
            <textarea
              className="modal-textarea"
              placeholder="Enter reason for rejection..."
              value={reason}
              onChange={e => setReason(e.target.value)}
              rows={3}
            />
            <div className="modal-actions">
              <button className="modal-btn cancel" onClick={() => setModalData(null)}>Cancel</button>
              <button className="modal-btn danger" onClick={handleReject} disabled={actionLoading}>
                {actionLoading ? 'Rejecting...' : 'Confirm Reject'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSellers;
