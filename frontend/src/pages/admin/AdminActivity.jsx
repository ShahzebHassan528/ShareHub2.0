/**
 * Admin Activity Page
 * Recent platform activity feed aggregated from existing admin data
 * at /admin/activity
 */

import { useEffect, useState } from 'react';
import adminAPI from '../../api/admin.api';
import './AdminActivity.css';

/* ── helpers ──────────────────────────────── */
const timeAgo = (dateStr) => {
  if (!dateStr) return '';
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
  if (diff < 60)   return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return new Date(dateStr).toLocaleDateString('en-PK', { month: 'short', day: 'numeric' });
};

const fmtDate = (dateStr) => {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleString('en-PK', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
};

/* ── activity builder ─────────────────────── */
const buildActivities = (users, sellers, products, ngos) => {
  const events = [];

  // User registrations
  (users || []).forEach(u => {
    events.push({
      id:   `user-${u.id}`,
      type: 'user_register',
      icon: 'bi-person-plus',
      color: '#3b82f6',
      bg:   '#eff6ff',
      title: `New ${u.role || 'user'} registered`,
      desc:  u.full_name || u.email,
      meta:  u.role,
      date:  u.created_at,
    });
  });

  // Seller applications / approvals
  (sellers || []).forEach(s => {
    const status = s.approval_status;
    const map = {
      approved: { icon: 'bi-shop-window', color: '#16a34a', bg: '#dcfce7', title: 'Seller approved' },
      rejected: { icon: 'bi-x-circle',    color: '#dc2626', bg: '#fee2e2', title: 'Seller rejected' },
      pending:  { icon: 'bi-hourglass',   color: '#d97706', bg: '#fff8e1', title: 'Seller application received' },
    };
    const style = map[status] || map.pending;
    events.push({
      id:    `seller-${s.id}`,
      type:  `seller_${status}`,
      icon:  style.icon,
      color: style.color,
      bg:    style.bg,
      title: style.title,
      desc:  s.business_name || s.user?.full_name || `Seller #${s.id}`,
      meta:  status,
      date:  s.approved_at || s.created_at,
    });
  });

  // Products blocked
  (products || []).forEach(p => {
    if (p.product_status === 'blocked' && p.blocked_at) {
      events.push({
        id:    `product-blocked-${p.id}`,
        type:  'product_blocked',
        icon:  'bi-slash-circle',
        color: '#dc2626',
        bg:    '#fee2e2',
        title: 'Product blocked',
        desc:  p.title,
        meta:  p.block_reason || '',
        date:  p.blocked_at,
      });
    } else if (p.created_at) {
      events.push({
        id:    `product-${p.id}`,
        type:  'product_listed',
        icon:  'bi-box-seam',
        color: '#7c3aed',
        bg:    '#ede9fe',
        title: 'New product listed',
        desc:  p.title,
        meta:  p.seller?.business_name || '',
        date:  p.created_at,
      });
    }
  });

  // NGO applications
  (ngos || []).forEach(n => {
    events.push({
      id:    `ngo-${n.id}`,
      type:  'ngo_apply',
      icon:  'bi-heart-pulse',
      color: '#db2777',
      bg:    '#fdf2f8',
      title: 'NGO application received',
      desc:  n.ngo_name || n.user?.full_name || `NGO #${n.id}`,
      meta:  n.verification_status,
      date:  n.created_at,
    });
  });

  // Sort newest first
  events.sort((a, b) => new Date(b.date) - new Date(a.date));
  return events;
};

/* ── filter options ───────────────────────── */
const FILTERS = [
  { key: 'all',            label: 'All Activity' },
  { key: 'user_register',  label: 'User Registrations' },
  { key: 'seller',         label: 'Sellers' },
  { key: 'product',        label: 'Products' },
  { key: 'ngo',            label: 'NGOs' },
];

/* ── component ────────────────────────────── */
const AdminActivity = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');
  const [filter, setFilter]         = useState('all');
  const [search, setSearch]         = useState('');

  const fetchAll = async () => {
    setLoading(true);
    setError('');
    try {
      const [usersRes, sellersRes, productsRes, ngosRes] = await Promise.allSettled([
        adminAPI.getAllUsers(),
        adminAPI.getAllSellers(),
        adminAPI.getAllProducts(),
        adminAPI.getPendingNGOs(),
      ]);

      const users    = usersRes.status    === 'fulfilled' ? (usersRes.value?.data    || usersRes.value    || []) : [];
      const sellers  = sellersRes.status  === 'fulfilled' ? (sellersRes.value?.data  || sellersRes.value  || []) : [];
      const products = productsRes.status === 'fulfilled' ? (productsRes.value?.data || productsRes.value || []) : [];
      const ngos     = ngosRes.status     === 'fulfilled' ? (ngosRes.value?.data     || ngosRes.value     || []) : [];

      setActivities(buildActivities(users, sellers, products, ngos));
    } catch (err) {
      setError(err.message || 'Failed to load activity.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const filtered = activities.filter(a => {
    const matchFilter =
      filter === 'all' ||
      (filter === 'seller'  && a.type.startsWith('seller')) ||
      (filter === 'product' && a.type.startsWith('product')) ||
      (filter === 'ngo'     && a.type.startsWith('ngo')) ||
      a.type === filter;

    const q = search.toLowerCase();
    const matchSearch = !q ||
      a.title.toLowerCase().includes(q) ||
      a.desc?.toLowerCase().includes(q) ||
      a.meta?.toLowerCase().includes(q);

    return matchFilter && matchSearch;
  });

  const countFor = (key) => {
    if (key === 'all') return activities.length;
    return activities.filter(a =>
      key === 'seller'  ? a.type.startsWith('seller')  :
      key === 'product' ? a.type.startsWith('product') :
      key === 'ngo'     ? a.type.startsWith('ngo')     :
      a.type === key
    ).length;
  };

  return (
    <div className="admin-activity-page">

      {/* Header */}
      <div className="activity-header">
        <div>
          <h1 className="activity-title">
            <i className="bi bi-activity me-2"></i>
            Recent Activity
          </h1>
          <p className="activity-subtitle">
            {loading ? 'Loading…' : `${activities.length} events across the platform`}
          </p>
        </div>
        <button className="btn btn-outline-primary btn-sm" onClick={fetchAll} disabled={loading}>
          <i className={`bi bi-arrow-clockwise me-1 ${loading ? 'spin' : ''}`}></i>
          Refresh
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="alert alert-danger">
          <i className="bi bi-exclamation-triangle me-2"></i>{error}
        </div>
      )}

      {/* Controls */}
      <div className="activity-controls">
        {/* Search */}
        <div className="activity-search">
          <i className="bi bi-search"></i>
          <input
            type="text"
            placeholder="Search activity…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && (
            <button className="clear-search" onClick={() => setSearch('')}>
              <i className="bi bi-x"></i>
            </button>
          )}
        </div>

        {/* Filter Tabs */}
        <div className="activity-tabs">
          {FILTERS.map(f => (
            <button
              key={f.key}
              className={`activity-tab ${filter === f.key ? 'active' : ''}`}
              onClick={() => setFilter(f.key)}
            >
              {f.label}
              <span className="tab-count">{countFor(f.key)}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Skeleton */}
      {loading && (
        <div className="activity-timeline">
          {[1,2,3,4,5].map(i => (
            <div key={i} className="activity-item skeleton-item">
              <div className="skeleton activity-icon-skeleton" />
              <div className="activity-item-body">
                <div className="skeleton skeleton-title" />
                <div className="skeleton skeleton-line" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty */}
      {!loading && filtered.length === 0 && (
        <div className="activity-empty">
          <i className="bi bi-inbox"></i>
          <p>{search ? `No results for "${search}"` : 'No activity found.'}</p>
        </div>
      )}

      {/* Timeline */}
      {!loading && filtered.length > 0 && (
        <div className="activity-timeline">
          {filtered.map((event, idx) => (
            <div key={event.id} className="activity-item">
              {/* Icon */}
              <div
                className="activity-icon"
                style={{ backgroundColor: event.bg, color: event.color }}
              >
                <i className={`bi ${event.icon}`}></i>
              </div>

              {/* Connector line */}
              {idx < filtered.length - 1 && <div className="activity-connector" />}

              {/* Body */}
              <div className="activity-item-body">
                <div className="activity-item-header">
                  <span className="activity-item-title">{event.title}</span>
                  <span className="activity-item-time" title={fmtDate(event.date)}>
                    {timeAgo(event.date)}
                  </span>
                </div>
                <p className="activity-item-desc">{event.desc}</p>
                {event.meta && (
                  <span
                    className="activity-item-meta"
                    style={{ backgroundColor: event.bg, color: event.color }}
                  >
                    {event.meta}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};

export default AdminActivity;
