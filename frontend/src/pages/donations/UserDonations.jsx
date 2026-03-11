import { useState, useEffect } from 'react';
import { getMyDonations } from '../../api/donation.api';
import { useToast } from '../../contexts/ToastContext';
import StatusBadge from '../../components/common/StatusBadge';
import './UserDonations.css';

const UserDonations = () => {
  const { showToast } = useToast();
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDonations();
  }, []);

  const fetchDonations = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getMyDonations();
      setDonations(data.donations || []);
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Failed to load donations';
      setError(errorMsg);
      showToast(errorMsg, 'error');
    } finally {
      setLoading(false);
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
      <div className="user-donations-page">
        <div className="container">
          <h1>My Donations</h1>
          <div className="donations-loading">
            <div className="spinner"></div>
            <p>Loading your donations...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error && donations.length === 0) {
    return (
      <div className="user-donations-page">
        <div className="container">
          <h1>My Donations</h1>
          <div className="donations-error">
            <div className="error-icon">⚠️</div>
            <h2>Failed to Load Donations</h2>
            <p>{error}</p>
            <button onClick={fetchDonations} className="btn-retry">
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (donations.length === 0) {
    return (
      <div className="user-donations-page">
        <div className="container">
          <h1>My Donations</h1>
          <div className="donations-empty">
            <div className="empty-icon">❤️</div>
            <h2>No Donations Made Yet</h2>
            <p>You haven't donated any items to NGOs.</p>
            <p className="empty-hint">
              Browse products and click "Donate Item" to make your first donation.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="user-donations-page">
      <div className="container">
        <div className="page-header">
          <h1>My Donations</h1>
          <p className="page-subtitle">
            {donations.length} {donations.length === 1 ? 'donation' : 'donations'} made
          </p>
        </div>

        <div className="donations-list">
          {donations.map((donation) => (
            <div key={donation.id} className="donation-card">
              <div className="donation-card-header">
                <div className="donation-product">
                  {donation.product_image && (
                    <img 
                      src={donation.product_image} 
                      alt={donation.product_title}
                      className="product-thumbnail"
                    />
                  )}
                  <div className="product-info">
                    <h3>{donation.product_title || 'Product'}</h3>
                    {donation.product_price && (
                      <p className="product-value">
                        Value: Rs. {donation.product_price.toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>
                <StatusBadge status={donation.status} />
              </div>

              <div className="donation-card-body">
                <div className="donation-detail">
                  <span className="detail-label">NGO:</span>
                  <span className="detail-value">{donation.ngo_name || 'N/A'}</span>
                </div>

                {donation.message && (
                  <div className="donation-detail">
                    <span className="detail-label">Message:</span>
                    <span className="detail-value message-text">{donation.message}</span>
                  </div>
                )}

                <div className="donation-detail">
                  <span className="detail-label">Date:</span>
                  <span className="detail-value">{formatDate(donation.created_at)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default UserDonations;
