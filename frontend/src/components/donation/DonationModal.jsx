import { useState, useEffect } from 'react';
import { getVerifiedNGOs, createDonationRequest } from '../../api/donation.api';
import { useToast } from '../../contexts/ToastContext';
import './DonationModal.css';

const DonationModal = ({ isOpen, onClose, product }) => {
  const { showToast } = useToast();
  const [ngos, setNgos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedNgoId, setSelectedNgoId] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      fetchNGOs();
    }
  }, [isOpen]);

  const fetchNGOs = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getVerifiedNGOs();
      setNgos(data.ngos || []);
    } catch (err) {
      setError(err.message || 'Failed to load NGOs');
      showToast('Failed to load NGOs', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedNgoId) {
      showToast('Please select an NGO', 'error');
      return;
    }
    
    try {
      setSubmitting(true);
      await createDonationRequest({
        product_id: product.id,
        ngo_id: parseInt(selectedNgoId),
        message: message.trim() || undefined
      });
      
      showToast('Donation request sent successfully!', 'success');
      onClose();
      
      // Reset form
      setSelectedNgoId('');
      setMessage('');
    } catch (err) {
      const errorMsg = err.message || 'Failed to send donation request';
      showToast(errorMsg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!submitting) {
      setSelectedNgoId('');
      setMessage('');
      setError(null);
      onClose();
    }
  };

  if (!isOpen) return null;

  const selectedNgo = ngos.find(ngo => ngo.id === parseInt(selectedNgoId));

  return (
    <div className="donation-modal-overlay" onClick={handleClose}>
      <div className="donation-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="donation-modal-header">
          <h2>Donate Item to NGO</h2>
          <button 
            className="donation-modal-close" 
            onClick={handleClose}
            disabled={submitting}
          >
            ×
          </button>
        </div>

        <div className="donation-modal-body">
          {/* Product Summary */}
          <div className="donation-product-summary">
            <h3>Item to donate:</h3>
            <div className="donation-product-card">
              {product.image_url && (
                <img 
                  src={product.image_url} 
                  alt={product.title}
                  className="donation-product-image"
                />
              )}
              <div className="donation-product-info">
                <h4>{product.title}</h4>
                {product.price && (
                  <p className="donation-product-value">
                    Value: Rs. {product.price?.toLocaleString()}
                  </p>
                )}
                {product.condition && (
                  <p className="donation-product-condition">
                    Condition: {product.condition}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="donation-divider">
            <span className="donation-icon">❤️</span>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="ngo-select">
                Select NGO: *
              </label>
              
              {loading ? (
                <div className="donation-loading">
                  <div className="spinner-small"></div>
                  <span>Loading NGOs...</span>
                </div>
              ) : error ? (
                <div className="donation-error">
                  <p>{error}</p>
                  <button 
                    type="button" 
                    onClick={fetchNGOs}
                    className="btn-retry-small"
                  >
                    Retry
                  </button>
                </div>
              ) : ngos.length === 0 ? (
                <div className="donation-empty">
                  <p>No verified NGOs available at the moment.</p>
                  <p className="donation-empty-hint">
                    Please check back later.
                  </p>
                </div>
              ) : (
                <select
                  id="ngo-select"
                  value={selectedNgoId}
                  onChange={(e) => setSelectedNgoId(e.target.value)}
                  className="donation-select"
                  required
                  disabled={submitting}
                >
                  <option value="">-- Select an NGO --</option>
                  {ngos.map((ngo) => (
                    <option key={ngo.id} value={ngo.id}>
                      {ngo.ngo_name}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Selected NGO Preview */}
            {selectedNgo && (
              <div className="donation-selected-preview">
                <h4>Donating to:</h4>
                <div className="donation-ngo-card">
                  <div className="donation-ngo-icon">🏢</div>
                  <div className="donation-ngo-info">
                    <h4>{selectedNgo.ngo_name}</h4>
                    {selectedNgo.description && (
                      <p className="donation-ngo-description">
                        {selectedNgo.description}
                      </p>
                    )}
                    {selectedNgo.address && (
                      <p className="donation-ngo-address">
                        📍 {selectedNgo.address}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div className="form-group">
              <label htmlFor="donation-message">
                Message (optional)
              </label>
              <textarea
                id="donation-message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="donation-textarea"
                placeholder="Add a message for the NGO..."
                rows="4"
                disabled={submitting}
                maxLength="500"
              />
              <small className="char-count">
                {message.length}/500 characters
              </small>
            </div>

            <div className="donation-modal-actions">
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
                className="btn-submit btn-donate"
                disabled={submitting || !selectedNgoId || ngos.length === 0}
              >
                {submitting ? (
                  <>
                    <span className="btn-spinner"></span>
                    Sending...
                  </>
                ) : (
                  <>
                    <span>❤️</span>
                    Send Donation Request
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default DonationModal;
