/**
 * NGO Listing Page
 * Route: /ngos
 * Browse verified NGOs for donations
 */

import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import donationAPI from '../../api/donation.api';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import './NgoListing.css';

const NgoListing = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const toast = useToast();

  // State
  const [ngos, setNgos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalNgos, setTotalNgos] = useState(0);
  const ngosPerPage = 9;

  useEffect(() => {
    fetchNgos();
    window.scrollTo(0, 0);
  }, [currentPage]);

  const fetchNgos = async () => {
    try {
      setLoading(true);
      
      const response = await donationAPI.getVerifiedNGOs();
      const allNgos = response.ngos || [];
      
      // Pagination logic
      const startIndex = (currentPage - 1) * ngosPerPage;
      const endIndex = startIndex + ngosPerPage;
      const paginatedNgos = allNgos.slice(startIndex, endIndex);
      
      setNgos(paginatedNgos);
      setTotalNgos(allNgos.length);
      setTotalPages(Math.ceil(allNgos.length / ngosPerPage));
    } catch (err) {
      console.error('Failed to fetch NGOs:', err);
      toast.error('Failed to load NGOs');
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleDonate = (ngo) => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/ngos' } });
      return;
    }
    // Navigate to products page to select item for donation
    navigate('/products', { state: { donateToNgo: ngo } });
  };

  return (
    <div className="ngo-listing-page">
      <div className="container">
        {/* Hero Header */}
        <div className="ngo-hero">
          <div className="ngo-hero-content">
            <div className="ngo-hero-icon">
              <i className="bi bi-heart-fill"></i>
            </div>
            <h1 className="ngo-hero-title">Verified NGOs</h1>
            <p className="ngo-hero-subtitle">
              Make a difference by donating to trusted organizations • {totalNgos} verified NGOs
            </p>
          </div>
          <div className="ngo-hero-stats">
            <div className="hero-stat">
              <div className="stat-icon">
                <i className="bi bi-building"></i>
              </div>
              <div className="stat-content">
                <div className="stat-number">{totalNgos}+</div>
                <div className="stat-label">NGOs</div>
              </div>
            </div>
            <div className="hero-stat">
              <div className="stat-icon">
                <i className="bi bi-box-seam"></i>
              </div>
              <div className="stat-content">
                <div className="stat-number">2,000+</div>
                <div className="stat-label">Donations</div>
              </div>
            </div>
            <div className="hero-stat">
              <div className="stat-icon">
                <i className="bi bi-people"></i>
              </div>
              <div className="stat-content">
                <div className="stat-number">5,000+</div>
                <div className="stat-label">Lives Helped</div>
              </div>
            </div>
          </div>
        </div>

        {/* Info Banner */}
        <div className="ngo-info-banner">
          <div className="info-icon">
            <i className="bi bi-shield-check"></i>
          </div>
          <div className="info-content">
            <h3>All NGOs are Verified</h3>
            <p>Every organization listed here has been thoroughly verified to ensure your donations reach those in need.</p>
          </div>
        </div>

        {/* NGO Grid */}
        {loading ? (
          <div className="ngo-grid">
            {[...Array(9)].map((_, i) => (
              <div key={i} className="ngo-skeleton">
                <div className="skeleton-header">
                  <div className="skeleton-logo"></div>
                  <div className="skeleton-badge"></div>
                </div>
                <div className="skeleton-content">
                  <div className="skeleton-line"></div>
                  <div className="skeleton-line"></div>
                  <div className="skeleton-line short"></div>
                </div>
              </div>
            ))}
          </div>
        ) : ngos.length === 0 ? (
          <div className="empty-state">
            <i className="bi bi-building"></i>
            <h3>No NGOs Found</h3>
            <p>No verified NGOs available at the moment. Please check back later.</p>
          </div>
        ) : (
          <>
            <div className="ngo-grid">
              {ngos.map(ngo => (
                <div key={ngo.id} className="ngo-card">
                  <div className="ngo-header">
                    <div className="ngo-logo">
                      {ngo.logo ? (
                        <img src={ngo.logo} alt={ngo.name} />
                      ) : (
                        <i className="bi bi-building"></i>
                      )}
                    </div>
                    <div className="ngo-verified-badge">
                      <i className="bi bi-check-circle-fill"></i>
                      Verified
                    </div>
                  </div>

                  <div className="ngo-body">
                    <h3 className="ngo-name">{ngo.name}</h3>
                    
                    {ngo.description && (
                      <p className="ngo-description">{ngo.description}</p>
                    )}

                    {ngo.address && (
                      <div className="ngo-address">
                        <i className="bi bi-geo-alt-fill"></i>
                        <span>{ngo.address}</span>
                      </div>
                    )}

                    {ngo.phone && (
                      <div className="ngo-contact">
                        <i className="bi bi-telephone-fill"></i>
                        <span>{ngo.phone}</span>
                      </div>
                    )}

                    {ngo.email && (
                      <div className="ngo-contact">
                        <i className="bi bi-envelope-fill"></i>
                        <span>{ngo.email}</span>
                      </div>
                    )}

                    <div className="ngo-stats">
                      <div className="ngo-stat-item">
                        <i className="bi bi-box-seam"></i>
                        <span>{ngo.donations_received || 0} Donations</span>
                      </div>
                      <div className="ngo-stat-item">
                        <i className="bi bi-calendar-check"></i>
                        <span>Since {new Date(ngo.created_at || Date.now()).getFullYear()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="ngo-actions">
                    <button 
                      className="btn-donate"
                      onClick={() => handleDonate(ngo)}
                    >
                      <i className="bi bi-heart-fill me-2"></i>
                      Donate Items
                    </button>
                    <Link 
                      to={`/ngos/${ngo.id}`}
                      className="btn-view-profile"
                    >
                      <i className="bi bi-eye me-2"></i>
                      View Profile
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="pagination">
                <button
                  className="pagination-btn"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <i className="bi bi-chevron-left"></i>
                  Previous
                </button>

                <div className="pagination-pages">
                  {[...Array(totalPages)].map((_, i) => {
                    const page = i + 1;
                    if (
                      page === 1 ||
                      page === totalPages ||
                      (page >= currentPage - 1 && page <= currentPage + 1)
                    ) {
                      return (
                        <button
                          key={page}
                          className={`pagination-page ${page === currentPage ? 'active' : ''}`}
                          onClick={() => handlePageChange(page)}
                        >
                          {page}
                        </button>
                      );
                    } else if (page === currentPage - 2 || page === currentPage + 2) {
                      return <span key={page} className="pagination-ellipsis">...</span>;
                    }
                    return null;
                  })}
                </div>

                <button
                  className="pagination-btn"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Next
                  <i className="bi bi-chevron-right"></i>
                </button>
              </div>
            )}
          </>
        )}

        {/* Impact Section */}
        <div className="impact-section">
          <h2 className="impact-title">
            <i className="bi bi-heart-fill me-2"></i>
            Your Impact Matters
          </h2>
          <p className="impact-subtitle">
            Every donation helps create positive change in our community
          </p>
          <div className="impact-grid">
            <div className="impact-card">
              <div className="impact-icon">
                <i className="bi bi-people-fill"></i>
              </div>
              <h4>Help Families</h4>
              <p>Your donations provide essential items to families in need</p>
            </div>
            <div className="impact-card">
              <div className="impact-icon">
                <i className="bi bi-heart-pulse-fill"></i>
              </div>
              <h4>Save Lives</h4>
              <p>Medical supplies and equipment reach those who need them most</p>
            </div>
            <div className="impact-card">
              <div className="impact-icon">
                <i className="bi bi-book-fill"></i>
              </div>
              <h4>Educate Children</h4>
              <p>Books and educational materials support learning opportunities</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NgoListing;
