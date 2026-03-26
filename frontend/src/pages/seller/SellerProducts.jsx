import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import productAPI from '../../api/product.api';
import { useToast } from '../../contexts/ToastContext';
import './SellerProducts.css';

const SellerProducts = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState({});
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, product: null });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await productAPI.getMyProducts();
      setProducts(data.products || data.data || []);
    } catch (err) {
      console.error('Failed to load products:', err);
      const errorMsg = err.message || 'Failed to load products';
      setError(errorMsg);
      showToast(errorMsg, 'error');
    } finally {
      setLoading(false);
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
      console.error('Failed to delete product:', err);
      const errorMsg = err.message || 'Failed to delete product';
      showToast(errorMsg, 'error');
    } finally {
      setActionLoading(prev => ({ ...prev, [`delete-${product.id}`]: false }));
    }
  };

  const handleToggleStatus = async (product) => {
    try {
      setActionLoading(prev => ({ ...prev, [`status-${product.id}`]: true }));
      await productAPI.toggleProductStatus(product.id);
      
      setProducts(prev => prev.map(p => 
        p.id === product.id 
          ? { ...p, status: p.status === 'active' ? 'inactive' : 'active' }
          : p
      ));
      
      showToast(`Product ${product.status === 'active' ? 'deactivated' : 'activated'}`, 'success');
    } catch (err) {
      console.error('Failed to update status:', err);
      const errorMsg = err.message || 'Failed to update status';
      showToast(errorMsg, 'error');
    } finally {
      setActionLoading(prev => ({ ...prev, [`status-${product.id}`]: false }));
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
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
            <button onClick={fetchProducts} className="btn-retry">
              Try Again
            </button>
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
            <button 
              onClick={() => navigate('/seller/products/add')}
              className="btn-add-product"
            >
              + Add Product
            </button>
          </div>
          <div className="products-empty">
            <div className="empty-icon">📦</div>
            <h2>No Products Listed</h2>
            <p>You haven't listed any products yet.</p>
            <button 
              onClick={() => navigate('/seller/products/add')}
              className="btn-empty-action"
            >
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
          <button 
            onClick={() => navigate('/seller/products/add')}
            className="btn-add-product"
          >
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
                  <td className="condition-cell">
                    <span className={`condition-badge ${product.condition}`}>
                      {product.condition || 'N/A'}
                    </span>
                  </td>
                  <td className="status-cell">
                    <span className={`status-badge ${product.status || 'active'}`}>
                      {product.status || 'active'}
                    </span>
                  </td>
                  <td className="date-cell">
                    {formatDate(product.created_at)}
                  </td>
                  <td className="actions-cell">
                    <div className="action-buttons">
                      <button
                        onClick={() => navigate(`/seller/products/edit/${product.id}`)}
                        className="btn-action btn-edit"
                        title="Edit"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleToggleStatus(product)}
                        className="btn-action btn-toggle"
                        disabled={actionLoading[`status-${product.id}`]}
                        title={product.status === 'active' ? 'Deactivate' : 'Activate'}
                      >
                        {product.status === 'active' ? '👁️' : '🚫'}
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

      {/* Delete Confirmation Modal */}
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
              <button
                onClick={confirmDelete}
                className="btn-confirm-delete"
              >
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
