import { useState, useEffect } from 'react';
import adminAPI from '../../api/admin.api';
import { useToast } from '../../contexts/ToastContext';
import './AdminPages.css';

const AdminNGOs = () => {
  const toast = useToast();
  const [ngos, setNgos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('pending');
  const [modalData, setModalData] = useState(null);
  const [reason, setReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => { fetchNGOs(); }, [tab]);

  const fetchNGOs = async () => {
    try {
      setLoading(true);
      const res = tab === 'pending' ? await adminAPI.getPendingNGOs() : await adminAPI.getApprovedNGOs();
      setNgos(res.ngos || res.data || []);
    } catch (e) {
      toast.showToast('Failed to load NGOs', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (ngo) => {
    try {
      setActionLoading(true);
      await adminAPI.approveNGO(ngo.id);
      toast.showToast(`${ngo.ngo_name} verified!`, 'success');
      fetchNGOs();
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
      await adminAPI.rejectNGO(modalData.ngo.id, reason);
      toast.showToast('NGO rejected', 'success');
      setModalData(null);
      setReason('');
      fetchNGOs();
    } catch (e) {
      toast.showToast(e.message, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1><i className="bi bi-building me-2"></i>NGO Management</h1>
          <p>Verify NGO registrations for the donation system</p>
        </div>
      </div>

      <div className="tab-row">
        <button className={`tab-btn ${tab === 'pending' ? 'active' : ''}`} onClick={() => setTab('pending')}>
          <i className="bi bi-hourglass-split me-1"></i>Pending Verification
        </button>
        <button className={`tab-btn ${tab === 'approved' ? 'active' : ''}`} onClick={() => setTab('approved')}>
          <i className="bi bi-patch-check me-1"></i>Verified NGOs
        </button>
      </div>

      {loading ? (
        <div className="admin-loading"><div className="spinner-border text-primary"></div></div>
      ) : ngos.length === 0 ? (
        <div className="empty-state">
          <i className="bi bi-building-check"></i>
          <p>{tab === 'pending' ? 'No pending NGO applications!' : 'No verified NGOs yet'}</p>
        </div>
      ) : (
        <div className="cards-grid">
          {ngos.map(ngo => (
            <div key={ngo.id} className="seller-card">
              <div className="seller-card-header">
                <div className="seller-avatar ngo">{ngo.ngo_name?.charAt(0)?.toUpperCase() || 'N'}</div>
                <div className="seller-card-title">
                  <h3>{ngo.ngo_name}</h3>
                  <p>{ngo.email}</p>
                </div>
                <span className={`status-badge ${ngo.verification_status === 'approved' ? 'active' : 'pending'}`}>
                  {ngo.verification_status}
                </span>
              </div>
              <div className="seller-card-body">
                <div className="info-row"><span>Contact</span><strong>{ngo.full_name || '—'}</strong></div>
                <div className="info-row"><span>Reg. No.</span><strong>{ngo.registration_number || '—'}</strong></div>
                <div className="info-row"><span>Address</span><strong>{ngo.address || '—'}</strong></div>
                <div className="info-row"><span>Website</span><strong>{ngo.website || '—'}</strong></div>
                <div className="info-row"><span>Applied</span><strong>{ngo.created_at ? new Date(ngo.created_at).toLocaleDateString() : '—'}</strong></div>
                {ngo.description && (
                  <div className="ngo-desc">{ngo.description}</div>
                )}
              </div>
              {ngo.verification_status === 'pending' && (
                <div className="seller-card-actions">
                  <button className="action-btn-sm success" onClick={() => handleApprove(ngo)} disabled={actionLoading}>
                    <i className="bi bi-patch-check me-1"></i>Verify
                  </button>
                  <button className="action-btn-sm danger" onClick={() => { setModalData({ ngo }); setReason(''); }}>
                    <i className="bi bi-x-lg me-1"></i>Reject
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {modalData && (
        <div className="modal-overlay" onClick={() => setModalData(null)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <h3>Reject NGO Application</h3>
            <p>Rejecting <strong>{modalData.ngo.ngo_name}</strong></p>
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

export default AdminNGOs;
