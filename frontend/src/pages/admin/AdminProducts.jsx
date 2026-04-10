import { useState, useEffect } from 'react';
import adminAPI from '../../api/admin.api';
import { useToast } from '../../contexts/ToastContext';
import './AdminPages.css';

const AdminProducts = () => {
  const toast = useToast();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalData, setModalData] = useState(null);
  const [reason, setReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => { fetchProducts(); }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await adminAPI.getAllProducts();
      setProducts(res.data || []);
    } catch (e) {
      toast.showToast('Failed to load products', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleBlock = async () => {
    if (!reason.trim()) return toast.showToast('Please enter a reason', 'error');
    try {
      setActionLoading(true);
      await adminAPI.blockProduct(modalData.product.id, reason);
      toast.showToast('Product blocked', 'success');
      setModalData(null);
      setReason('');
      fetchProducts();
    } catch (e) {
      const errorMsg = e.response?.data?.message || e.message || 'Failed to block product';
      toast.showToast(errorMsg, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUnblock = async (product) => {
    try {
      await adminAPI.unblockProduct(product.id);
      toast.showToast('Product unblocked', 'success');
      fetchProducts();
    } catch (e) {
      toast.showToast(e.message, 'error');
    }
  };

  const filtered = products.filter(p =>
    !search || p.title?.toLowerCase().includes(search.toLowerCase())
  );

  const statusColor = (s) => ({ active: 'active', blocked: 'rejected', inactive: 'inactive' }[s] || 'pending');

  const formatPrice = (price) =>
    new Intl.NumberFormat('en-PK', { style: 'currency', currency: 'PKR', minimumFractionDigits: 0 }).format(price || 0);

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1><i className="bi bi-box-seam me-2"></i>Product Moderation</h1>
          <p>{products.length} total products on platform</p>
        </div>
      </div>

      <div className="admin-filters">
        <input
          className="admin-search"
          placeholder="🔍 Search products..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="admin-loading"><div className="spinner-border text-primary"></div></div>
      ) : (
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Product</th>
                <th>Seller</th>
                <th>Price</th>
                <th>Condition</th>
                <th>Status</th>
                <th>Listed</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan="8" className="empty-row">No products found</td></tr>
              ) : filtered.map((product, i) => (
                <tr key={product.id} className={product.product_status === 'blocked' ? 'row-suspended' : ''}>
                  <td>{i + 1}</td>
                  <td>
                    <div className="product-cell">
                      {product.image_url
                        ? <img src={`http://localhost:5000${product.image_url}`} alt={product.title} className="product-thumb" onError={e => e.target.style.display = 'none'} />
                        : <div className="product-thumb-placeholder"><i className="bi bi-image"></i></div>
                      }
                      <div>
                        <div className="user-name">{product.title}</div>
                        <div className="user-email">{product.category || '—'}</div>
                      </div>
                    </div>
                  </td>
                  <td>{product.seller?.user?.full_name || `Seller #${product.seller_id}`}</td>
                  <td>{formatPrice(product.price)}</td>
                  <td><span className="condition-badge">{product.condition || '—'}</span></td>
                  <td><span className={`status-badge ${statusColor(product.product_status)}`}>{product.product_status || 'active'}</span></td>
                  <td>{product.created_at ? new Date(product.created_at).toLocaleDateString() : '—'}</td>
                  <td>
                    {product.product_status === 'blocked'
                      ? <button className="action-btn-sm success" onClick={() => handleUnblock(product)}>Unblock</button>
                      : <button className="action-btn-sm danger" onClick={() => { setModalData({ product }); setReason(''); }}>Block</button>
                    }
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modalData && (
        <div className="modal-overlay" onClick={() => setModalData(null)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <h3>Block Product</h3>
            <p>Blocking <strong>"{modalData.product.title}"</strong></p>
            <textarea
              className="modal-textarea"
              placeholder="Enter reason for blocking..."
              value={reason}
              onChange={e => setReason(e.target.value)}
              rows={3}
            />
            <div className="modal-actions">
              <button className="modal-btn cancel" onClick={() => setModalData(null)}>Cancel</button>
              <button className="modal-btn danger" onClick={handleBlock} disabled={actionLoading}>
                {actionLoading ? 'Blocking...' : 'Confirm Block'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProducts;
