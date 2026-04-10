import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import productAPI from '../../api/product.api';
import { useToast } from '../../contexts/ToastContext';
import './SellerProducts.css';

const SellerProducts = () => {
  console.log('🎯 SellerProducts component mounted!');
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState({});
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, product: null });

  useEffect(() => {
    console.log('🎯 SellerProducts useEffect triggered');
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      console.log('🔍 SellerProducts: fetchProducts called');
      setLoading(true);
      setError(null);
      
      console.log('📤 Calling productAPI.getMyProducts()...');
      const data = await productAPI.getMyProducts();
      console.log('✅ Response received:', data);
      console.log('   Count:', data.count);
      console.log('   Products:', data.products);
      
      setProducts(data.products || []);
      console.log('✅ State updated with', data.products?.length || 0, 'products');
    } catch (err) {
      // client.js converts errors to plain Error objects — use err.message
      const errorMsg = err.message || 'Failed to load products';
      console.error('❌ Error in fetchProducts:', errorMsg);
      console.error('❌ Full error:', err);
      setError(errorMsg);
      showToast(errorMsg, 'error');
    } finally {
      setLoading(false);
      console.log('✅ fetchProducts completed');
    }
  };

  const handleDelete = (product) => {
    setDeleteModal({ isOpen: true, product });
  };

  const confirmDelete = async () => {
    const { product } = deleteModal;
    try {
      setActionLoading(prev => ({ ...prev, [`delete-${product.id}`]: true }));
      await productAPI.deleteProduct(product.id);
      setProducts(prev => prev.filter(p => p.id !== product.id));
      showToast('Product deleted successfully', 'success');
      setDeleteModal({ isOpen: false, product: null });
    } catch (err) {
      showToast(err.message || 'Failed to delete product', 'error');
    } finally {
      setActionLoading(prev => ({ ...prev, [`delete-${product.id}`]: false }));
    }
  };

  const handleToggleStatus = async (product) => {
    try {
      setActionLoading(prev => ({ ...prev, [`status-${product.id}`]: true }));
      await productAPI.toggleProductStatus(product.id);
      // FIX: backend toggles is_available, not status
      setProducts(prev => prev.map(p =>
        p.id === product.id
          ? { ...p, is_available: !p.is_available }
          : p
      ));
      showToast(`Product ${product.is_available ? 'deactivated' : 'activated'}`, 'success');
    } catch (err) {
      showToast(err.message || 'Failed to update status', 'error');
    } finally {
      setActionLoading(prev => ({ ...prev, [`status-${product.id}`]: false }));
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
      <div className="seller-products-page">
        <div className="container">
          <h1>My Products</h1>
          <div className="products-loading">
            <div className="spinner"></div>
            <p>Loading your products...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error && products.length === 0) {
    return (
      <div className="seller-products-page">
        <div className="container">
          <h1>My Products</h1>
          <div className="products-error">
            <div className="error-icon">⚠️</div>
            <h2>Failed to Load Products</h2>
            <p>{error}</p>
            <button onClick={fetchProducts} className="btn-retry">Try Again</button>
          </div>
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="seller-products-page">
        <div className="container">
          <div className="page-header">
            <h1>My Products</h1>
            <button onClick={() => navigate('/products/add')} className="btn-add-product">
              + Add Product
            </button>
          </div>
          <div className="products-empty">
            <div className="empty-icon">📦</div>
            <h2>No Products Listed</h2>
            <p>You haven't listed any products yet.</p>
            <button onClick={() => navigate('/products/add')} className="btn-empty-action">
              List Your First Product
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="seller-products-page">
      <div className="container">
        <div className="page-header">
          <div>
            <h1>My Products</h1>
            <p className="page-subtitle">{products.length} products listed</p>
          </div>
          <button onClick={() => navigate('/products/add')} className="btn-add-product">
            + Add Product
          </button>
        </div>

        <div className="products-table">
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>Price</th>
                <th>Condition</th>
                <th>Status</th>
                <th>Listed</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id}>
                  <td className="product-cell">
                    <div className="product-info">
                      {product.image_url && (
                        <img
                          src={product.image_url}
                          alt={product.title}
                          className="product-thumb"
                        />
                      )}
                      <div>
                        <h3>{product.title}</h3>
                        <p className="product-category">{product.category || 'Uncategorized'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="price-cell">
                    Rs. {product.price?.toLocaleString() || '0'}
                  </td>
                  {/* FIX: DB column is product_condition, not condition */}
                  <td className="condition-cell">
                    <span className={`condition-badge ${product.product_condition}`}>
                      {product.product_condition || 'N/A'}
                    </span>
                  </td>
                  {/* FIX: use is_available for seller status, not product_status */}
                  <td className="status-cell">
                    <span className={`status-badge ${product.is_available ? 'active' : 'inactive'}`}>
                      {product.is_available ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="date-cell">
                    {formatDate(product.created_at)}
                  </td>
                  <td className="actions-cell">
                    <div className="action-buttons">
                      <button
                        onClick={() => navigate(`/products/edit/${product.id}`)}
                        className="btn-action btn-edit"
                        title="Edit"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleToggleStatus(product)}
                        className="btn-action btn-toggle"
                        disabled={actionLoading[`status-${product.id}`]}
                        title={product.is_available ? 'Deactivate' : 'Activate'}
                      >
                        {product.is_available ? '👁️' : '🚫'}
                      </button>
                      <button
                        onClick={() => handleDelete(product)}
                        className="btn-action btn-delete"
                        disabled={actionLoading[`delete-${product.id}`]}
                        title="Delete"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {deleteModal.isOpen && (
        <div className="modal-overlay" onClick={() => setDeleteModal({ isOpen: false, product: null })}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Delete Product</h3>
            <p>
              Are you sure you want to delete <strong>{deleteModal.product?.title}</strong>?
              This action cannot be undone.
            </p>
            <div className="modal-actions">
              <button
                onClick={() => setDeleteModal({ isOpen: false, product: null })}
                className="btn-cancel"
              >
                Cancel
              </button>
              <button onClick={confirmDelete} className="btn-confirm-delete">
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SellerProducts;
