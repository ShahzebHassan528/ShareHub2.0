import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../../api/client';
import { useToast } from '../../contexts/ToastContext';
import './SellerSwaps.css';

const SellerSwaps = () => {
  const { showToast } = useToast();
  const [tab, setTab] = useState('received');
  const [received, setReceived] = useState([]);
  const [sent, setSent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState({});

  useEffect(() => { fetchSwaps(); }, []);

  const fetchSwaps = async () => {
    setLoading(true);
    try {
      const [recv, snt] = await Promise.all([
        apiClient.get('/v1/swaps/received'),
        apiClient.get('/v1/swaps/sent'),
      ]);
      setReceived(recv.data || []);
      setSent(snt.data || []);
    } catch (err) {
      showToast('Failed to load swap requests', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (swapId, action) => {
    setUpdating(prev => ({ ...prev, [swapId]: true }));
    try {
      await apiClient.put(`/v1/swaps/${swapId}/${action}`);
      showToast(`Swap ${action}ed successfully`, 'success');
      fetchSwaps();
    } catch (err) {
      showToast(err.message || `Failed to ${action} swap`, 'error');
    } finally {
      setUpdating(prev => ({ ...prev, [swapId]: false }));
    }
  };

  const statusBadge = (status) => {
    const colors = { pending: '#f59e0b', accepted: '#10b981', rejected: '#ef4444', completed: '#6366f1', cancelled: '#6b7280' };
    return <span className="swap-badge" style={{ background: colors[status] || '#6b7280' }}>{status}</span>;
  };

  const SwapCard = ({ swap, showActions }) => (
    <div className="swap-card">
      <div className="swap-card-header">
        <div>
          <h4>{swap.requester_product?.title || swap.requested_product?.title || 'Product'}</h4>
          <p className="swap-meta">With: <strong>{swap.requester?.full_name || swap.owner?.full_name || 'User'}</strong></p>
          {swap.message && <p className="swap-message">"{swap.message}"</p>}
        </div>
        {statusBadge(swap.status)}
      </div>
      {showActions && swap.status === 'pending' && (
        <div className="swap-actions">
          <button className="btn-swap-accept" disabled={updating[swap.id]} onClick={() => handleAction(swap.id, 'accept')}>
            {updating[swap.id] ? 'Processing...' : 'Accept'}
          </button>
          <button className="btn-swap-reject" disabled={updating[swap.id]} onClick={() => handleAction(swap.id, 'reject')}>
            Reject
          </button>
        </div>
      )}
      {swap.status === 'accepted' && (
        <div className="swap-actions">
          <button className="btn-swap-complete" disabled={updating[swap.id]} onClick={() => handleAction(swap.id, 'complete')}>
            {updating[swap.id] ? 'Processing...' : 'Mark Complete'}
          </button>
          <button className="btn-swap-reject" disabled={updating[swap.id]} onClick={() => handleAction(swap.id, 'cancel')}>
            Cancel
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div className="seller-swaps-page">
      <div className="container">
        <h1 className="page-title">Swap Requests</h1>
        <div className="swap-tabs">
          <button className={`swap-tab ${tab === 'received' ? 'active' : ''}`} onClick={() => setTab('received')}>
            Received ({received.length})
          </button>
          <button className={`swap-tab ${tab === 'sent' ? 'active' : ''}`} onClick={() => setTab('sent')}>
            Sent ({sent.length})
          </button>
        </div>
        {loading ? (
          <div className="text-center py-5"><div className="spinner-border text-primary" /></div>
        ) : tab === 'received' ? (
          received.length === 0 ? <p className="empty-state">No received swap requests.</p> :
          received.map(s => <SwapCard key={s.id} swap={s} showActions={true} />)
        ) : (
          sent.length === 0 ? <p className="empty-state">No sent swap requests.</p> :
          sent.map(s => <SwapCard key={s.id} swap={s} showActions={false} />)
        )}
      </div>
    </div>
  );
};

export default SellerSwaps;
