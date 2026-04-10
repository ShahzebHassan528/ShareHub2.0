import { useState, useEffect } from 'react';
import { getMyProducts, createSwapRequest } from '../../api/swap.api';
import { useToast } from '../../contexts/ToastContext';
import './SwapModal.css';

const SwapModal = ({ isOpen, onClose, requestedProduct }) => {
  const { showToast } = useToast();
  const [myProducts, setMyProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      fetchMyProducts();
    }
  }, [isOpen]);

  const fetchMyProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getMyProducts();
      setMyProducts(data.products || []);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load your products');
      showToast('Failed to load your products', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedProductId) {
      showToast('Please select a product to offer', 'error');
      return;
    }
    
    try {
      setSubmitting(true);
      
      // Backend expects these field names
      const swapRequestData = {
        requester_product_id: parseInt(selectedProductId), // Your product
        owner_product_id: requestedProduct.id, // Their product
        owner_id: requestedProduct.seller_id, // Owner of the product you want
        message: message.trim() || undefined
      };
      
      await createSwapRequest(swapRequestData);
      
      showToast('✓ Swap request sent successfully!', 'success');
      onClose();
      
      // Reset form
      setSelectedProductId('');
      setMessage('');
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.response?.data?.error || 'Failed to send swap request';
      showToast(errorMsg, 'error');
      console.error('Swap request error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!submitting) {
      setSelectedProductId('');
      setMessage('');
      setError(null);
      onClose();
    }
  };

  if (!isOpen) return null;

  const selectedProduct = myProducts.find(p => p.id === parseInt(selectedProductId));

  return (
    <div className="swap-modal-overlay" onClick={handleClose}>
      <div className="swap-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="swap-modal-header">
          <h2>Request Item Swap</h2>
          <button 
            className="swap-modal-close" 
            onClick={handleClose}
            disabled={submitting}
          >
            ×
          </button>
        </div>

        <div className="swap-modal-body">
          {/* Requested Product Summary */}
          <div className="swap-product-summary">
            <h3>You want to get:</h3>
            <div className="swap-product-card">
              {requestedProduct.image_url && (
                <img 
                  src={requestedProduct.image_url} 
                  alt={requestedProduct.title}
                  className="swap-product-image"
                />
              )}
              <div className="swap-product-info">
                <h4>{requestedProduct.title}</h4>
                <p className="swap-product-price">
                  Rs. {requestedProduct.price?.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div className="swap-divider">
            <span className="swap-icon">⇄</span>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="offered-product">
                Select your item to offer: *
              </label>
              
              {loading ? (
                <div className="swap-loading">
                  <div className="spinner-small"></div>
                  <span>Loading your products...</span>
                </div>
              ) : error ? (
                <div className="swap-error">
                  <p>{error}</p>
                  <button 
                    type="button" 
                    onClick={fetchMyProducts}
                    className="btn-retry-small"
                  >
                    Retry
                  </button>
                </div>
              ) : myProducts.length === 0 ? (
                <div className="swap-empty">
                  <p>You don't have any products to offer.</p>
                  <p className="swap-empty-hint">
                    List a product first to request swaps.
                  </p>
                </div>
              ) : (
                <select
                  id="offered-product"
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(e.target.value)}
                  className="swap-select"
                  required
                  disabled={submitting}
                >
                  <option value="">-- Select a product --</option>
                  {myProducts.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.title} - Rs. {product.price?.toLocaleString()}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Selected Product Preview */}
            {selectedProduct && (
              <div className="swap-selected-preview">
                <h4>Your offer:</h4>
                <div className="swap-product-card">
                  {selectedProduct.image_url && (
                    <img 
                      src={selectedProduct.image_url} 
                      alt={selectedProduct.title}
                      className="swap-product-image"
                    />
                  )}
                  <div className="swap-product-info">
                    <h4>{selectedProduct.title}</h4>
                    <p className="swap-product-price">
                      Rs. {selectedProduct.price?.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="form-group">
              <label htmlFor="swap-message">
                Message (optional)
              </label>
              <textarea
                id="swap-message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="swap-textarea"
                placeholder="Add a message to the seller..."
                rows="4"
                disabled={submitting}
                maxLength="500"
              />
              <small className="char-count">
                {message.length}/500 characters
              </small>
            </div>

            <div className="swap-modal-actions">
              <button
                type="button"
                onClick={handleClose}
                className="btn-cancel"
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-submit"
                disabled={submitting || !selectedProductId || myProducts.length === 0}
              >
                {submitting ? (
                  <>
                    <span className="btn-spinner"></span>
                    Sending...
                  </>
                ) : (
                  'Send Swap Request'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SwapModal;
