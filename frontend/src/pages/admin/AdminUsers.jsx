import { useState, useEffect } from 'react';
import adminAPI from '../../api/admin.api';
import { useToast } from '../../contexts/ToastContext';
import './AdminPages.css';

const AdminUsers = () => {
  const toast = useToast();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [modalUser, setModalUser] = useState(null);
  const [reason, setReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await adminAPI.getAllUsers();
      setUsers(res.data || []);
    } catch (e) {
      toast.showToast('Failed to load users', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSuspend = async () => {
    if (!reason.trim()) return toast.showToast('Please enter a reason', 'error');
    try {
      setActionLoading(true);
      await adminAPI.suspendUser(modalUser.id, reason);
      toast.showToast('User suspended successfully', 'success');
      setModalUser(null);
      setReason('');
      fetchUsers();
    } catch (e) {
      toast.showToast(e.message, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReactivate = async (userId) => {
    try {
      await adminAPI.reactivateUser(userId);
      toast.showToast('User reactivated successfully', 'success');
      fetchUsers();
    } catch (e) {
      toast.showToast(e.message, 'error');
    }
  };

  const filtered = users.filter(u => {
    const matchesFilter = filter === 'all' || u.role === filter || (filter === 'suspended' && u.is_suspended);
    const matchesSearch = !search || u.full_name?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const roleColor = (role) => ({ admin: '#7c3aed', seller: '#2563eb', buyer: '#16a34a', ngo: '#d97706' }[role] || '#6b7280');

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1><i className="bi bi-people me-2"></i>User Management</h1>
          <p>{users.length} total users registered</p>
        </div>
      </div>

      {/* Filters */}
      <div className="admin-filters">
        <input
          className="admin-search"
          placeholder="🔍 Search by name or email..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <div className="filter-tabs">
          {['all', 'buyer', 'seller', 'ngo', 'admin', 'suspended'].map(f => (
            <button key={f} className={`filter-tab ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="admin-loading"><div className="spinner-border text-primary"></div></div>
      ) : (
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>#</th>
                <th>User</th>
                <th>Role</th>
                <th>Phone</th>
                <th>Status</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan="7" className="empty-row">No users found</td></tr>
              ) : filtered.map((user, i) => (
                <tr key={user.id} className={user.is_suspended ? 'row-suspended' : ''}>
                  <td>{i + 1}</td>
                  <td>
                    <div className="user-cell">
                      <div className="user-avatar-sm" style={{ background: roleColor(user.role) }}>
                        {user.full_name?.charAt(0)?.toUpperCase() || '?'}
                      </div>
                      <div>
                        <div className="user-name">{user.full_name || 'N/A'}</div>
                        <div className="user-email">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td><span className="role-badge" style={{ background: roleColor(user.role) + '20', color: roleColor(user.role), border: `1px solid ${roleColor(user.role)}40` }}>{user.role}</span></td>
                  <td>{user.phone || '—'}</td>
                  <td>
                    {user.is_suspended
                      ? <span className="status-badge suspended">Suspended</span>
                      : user.is_active
                        ? <span className="status-badge active">Active</span>
                        : <span className="status-badge inactive">Inactive</span>}
                  </td>
                  <td>{user.created_at ? new Date(user.created_at).toLocaleDateString() : '—'}</td>
                  <td>
                    {user.role !== 'admin' && (
                      user.is_suspended
                        ? <button className="action-btn-sm success" onClick={() => handleReactivate(user.id)}>Reactivate</button>
                        : <button className="action-btn-sm danger" onClick={() => { setModalUser(user); setReason(''); }}>Suspend</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Suspend Modal */}
      {modalUser && (
        <div className="modal-overlay" onClick={() => setModalUser(null)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <h3>Suspend User</h3>
            <p>Suspending <strong>{modalUser.full_name}</strong> ({modalUser.email})</p>
            <textarea
              className="modal-textarea"
              placeholder="Enter reason for suspension..."
              value={reason}
              onChange={e => setReason(e.target.value)}
              rows={3}
            />
            <div className="modal-actions">
              <button className="modal-btn cancel" onClick={() => setModalUser(null)}>Cancel</button>
              <button className="modal-btn danger" onClick={handleSuspend} disabled={actionLoading}>
                {actionLoading ? 'Suspending...' : 'Confirm Suspend'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
