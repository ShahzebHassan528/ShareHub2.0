/**
 * Product Detail Page
 * Professional product detail view with similar products
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, delay: i * 0.07, ease: 'easeOut' },
  }),
};
import { useProduct } from '../hooks/useProduct';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { useToast } from '../contexts/ToastContext';
import SwapRequestButton from '../components/swap/SwapRequestButton';
import DonateButton from '../components/donation/DonateButton';
import MapView from '../components/common/MapView';
import productAPI from '../api/product.api';
import reviewAPI from '../api/review.api';
import './ProductDetail.css';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { product, loading, error } = useProduct(id);
  const { addToCart, isInCart } = useCart();
  const toast = useToast();
  const [selectedImage, setSelectedImage] = useState(0);
  const [similarProducts, setSimilarProducts] = useState([]);
  const [loadingSimilar, setLoadingSimilar] = useState(false);

  // Reviews state
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewError, setReviewError] = useState('');

  // Fetch similar products and reviews when product loads
  useEffect(() => {
    if (product?.category) fetchSimilarProducts();
    if (product?.id) fetchReviews();
  }, [product]);

  const fetchSimilarProducts = async () => {
    try {
      setLoadingSimilar(true);
      const response = await productAPI.getAllProducts({
        category: product.category,
        limit: 4
      });
      // Filter out current product
      const filtered = response.products?.filter(p => p.id !== parseInt(id)) || [];
      setSimilarProducts(filtered.slice(0, 4));
    } catch (err) {
      console.error('Failed to fetch similar products:', err);
    } finally {
      setLoadingSimilar(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const getTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
    return `${Math.floor(seconds / 86400)} days ago`;
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const fetchReviews = async () => {
    try {
      const response = await reviewAPI.getProductReviews(product.id);
      setReviews(response.data || []);
    } catch (err) {
      console.error('Failed to fetch reviews:', err);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/products/${id}` } });
      return;
    }
    setReviewError('');
    setReviewLoading(true);
    try {
      await reviewAPI.createReview(product.id, reviewForm);
      toast.success('Review submitted!');
      setReviewForm({ rating: 5, comment: '' });
      fetchReviews();
    } catch (err) {
      setReviewError(err.message || 'Failed to submit review');
    } finally {
      setReviewLoading(false);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    try {
      await reviewAPI.deleteReview(reviewId);
      setReviews(prev => prev.filter(r => r.id !== reviewId));
      toast.success('Review deleted');
    } catch (err) {
      toast.error(err.message || 'Failed to delete review');
    }
  };

  const handleContact = () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/products/${id}` } });
      return;
    }
    if (product?.seller_user_id) {
      navigate(`/messages/${product.seller_user_id}`, {
        state: { userName: product.seller_name || product.business_name }
      });
    }
  };

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/products/${id}` } });
      return;
    }
    addToCart(product);
    toast.success('Added to cart!');
  };

  if (loading) {
    return (
      <div className="product-detail-page">
        <div className="container py-4">
          <div className="skeleton-breadcrumb"></div>
          <div className="row g-4 mt-2">
            <div className="col-lg-7">
              <div className="skeleton-gallery">
                <div className="skeleton-main-image"></div>
                <div className="skeleton-thumbnails">
                  <div className="skeleton-thumb"></div>
                  <div className="skeleton-thumb"></div>
                  <div className="skeleton-thumb"></div>
                </div>
              </div>
            </div>
            <div className="col-lg-5">
              <div className="skeleton-info">
                <div className="skeleton-title"></div>
                <div className="skeleton-meta"></div>
                <div className="skeleton-price"></div>
                <div className="skeleton-description"></div>
                <div className="skeleton-buttons">
                  <div className="skeleton-button"></div>
                  <div className="skeleton-button"></div>
                  <div className="skeleton-button"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="product-detail-page">
        <div className="container py-4">
          <div className="alert alert-danger">
            <i className="bi bi-exclamation-circle me-2"></i>
            {error || 'Product not found'}
          </div>
          <Link to="/products" className="btn btn-primary">
            <i className="bi bi-arrow-left me-2"></i>
            Back to Products
          </Link>
        </div>
      </div>
    );
  }

  // product.images is an array of { image_url, is_primary } objects from product_images table
  const images = product.images?.length
    ? product.images.map(img => (typeof img === 'string' ? img : img.image_url)).filter(Boolean)
    : product.image_url ? [product.image_url] : [];

  return (
    <motion.div className="product-detail-page" initial="hidden" animate="visible" variants={fadeUp}>
      <div className="container py-4">
        {/* Breadcrumb */}
        <nav aria-label="breadcrumb" className="mb-4">
          <ol className="breadcrumb">
            <li className="breadcrumb-item">
              <Link to="/">Home</Link>
            </li>
            <li className="breadcrumb-item">
              <Link to="/products">Products</Link>
            </li>
            <li className="breadcrumb-item active">{product.title}</li>
          </ol>
        </nav>

        <div className="row g-4">
          {/* Image Gallery */}
          <div className="col-lg-7">
            <div className="product-gallery">
              <div className="gallery-main">
                {images.length > 0 ? (
                  <img 
                    src={images[selectedImage]} 
                    alt={product.title}
                    className="gallery-main-image"
                  />
                ) : (
                  <div className="gallery-no-image">
                    <i className="bi bi-image"></i>
                    <p>No image available</p>
                  </div>
                )}
              </div>

              {images.length > 1 && (
                <div className="gallery-thumbnails">
                  {images.map((img, index) => (
                    <button
                      key={index}
                      className={`gallery-thumbnail ${selectedImage === index ? 'active' : ''}`}
                      onClick={() => setSelectedImage(index)}
                    >
                      <img src={img} alt={`${product.title} ${index + 1}`} />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Product Info */}
          <div className="col-lg-5">
            <div className="product-info-card">
              <div className="product-header">
                <h1 className="product-title">{product.title}</h1>
                <div className="product-meta">
                  <span className="product-time">
                    <i className="bi bi-clock"></i>
                    {getTimeAgo(product.created_at)}
                  </span>
                  {product.location && (
                    <span className="product-location">
                      <i className="bi bi-geo-alt"></i>
                      {product.location}
                    </span>
                  )}
                </div>
              </div>

              <div className="product-price-section">
                <div className="product-price">{formatPrice(product.price)}</div>
                {product.condition && (
                  <span className="product-condition-badge">
                    {product.condition}
                  </span>
                )}
              </div>

              {product.description && (
                <div className="product-description">
                  <h5>Description</h5>
                  <p>{product.description}</p>
                </div>
              )}

              <div className="product-details">
                <h5>Details</h5>
                <ul className="details-list">
                  {product.category && (
                    <li>
                      <span className="detail-label">Category:</span>
                      <span className="detail-value">{product.category}</span>
                    </li>
                  )}
                  {product.condition && (
                    <li>
                      <span className="detail-label">Condition:</span>
                      <span className="detail-value">{product.condition}</span>
                    </li>
                  )}
                  {product.availability_status && (
                    <li>
                      <span className="detail-label">Status:</span>
                      <span className="detail-value">{product.availability_status}</span>
                    </li>
                  )}
                  {product.created_at && (
                    <li>
                      <span className="detail-label">Posted:</span>
                      <span className="detail-value">{formatDate(product.created_at)}</span>
                    </li>
                  )}
                </ul>
              </div>

              {/* Location Map */}
              {product.latitude && product.longitude && (
                <div className="product-location-map mb-4">
                  <h5>Location</h5>
                  <MapView
                    latitude={product.latitude}
                    longitude={product.longitude}
                    title={product.title}
                    height="250px"
                  />
                  {product.address && (
                    <p className="text-muted small mt-2">
                      <i className="bi bi-geo-alt me-1"></i>
                      {product.address}
                    </p>
                  )}
                </div>
              )}

              <div className="product-actions">
                <button 
                  className="btn btn-primary btn-lg w-100 mb-2"
                  onClick={handleAddToCart}
                  disabled={isInCart(product.id)}
                >
                  {isInCart(product.id) ? (
                    <>
                      <i className="bi bi-check-circle me-2"></i>
                      In Cart
                    </>
                  ) : (
                    <>
                      <i className="bi bi-cart-plus me-2"></i>
                      Add to Cart
                    </>
                  )}
                </button>
                
                <SwapRequestButton product={product} />
                
                <DonateButton product={product} />
                
                <button 
                  className="btn btn-outline-primary btn-lg w-100"
                  onClick={handleContact}
                >
                  <i className="bi bi-chat-dots me-2"></i>
                  Contact Seller
                </button>
              </div>

              {/* Seller Info */}
              {product.seller && (
                <div className="seller-info">
                  <h5>Seller Information</h5>
                  <div className="seller-card">
                    <div className="seller-avatar">
                      {product.seller.profile_image ? (
                        <img src={product.seller.profile_image} alt={product.seller.name} />
                      ) : (
                        <i className="bi bi-person-circle"></i>
                      )}
                    </div>
                    <div className="seller-details">
                      <div className="seller-name">{product.seller.name || 'Seller'}</div>
                      <div className="seller-meta">
                        <span className="seller-member">
                          <i className="bi bi-calendar-check"></i>
                          Member since {new Date(product.seller.created_at || Date.now()).getFullYear()}
                        </span>
                      </div>
                      {product.seller.phone && (
                        <div className="seller-contact">
                          <i className="bi bi-telephone"></i>
                          {product.seller.phone}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mt-5">
          <h3 className="mb-4">Customer Reviews ({reviews.length})</h3>

          {/* Review Form */}
          {isAuthenticated && (
            <div className="card border-0 shadow-sm mb-4">
              <div className="card-body">
                <h5 className="mb-3">Write a Review</h5>
                {reviewError && <div className="alert alert-danger py-2">{reviewError}</div>}
                <form onSubmit={handleReviewSubmit}>
                  <div className="mb-3">
                    <label className="form-label">Rating</label>
                    <select
                      className="form-select"
                      value={reviewForm.rating}
                      onChange={e => setReviewForm(prev => ({ ...prev, rating: parseInt(e.target.value) }))}
                    >
                      {[5, 4, 3, 2, 1].map(r => (
                        <option key={r} value={r}>{'★'.repeat(r)}{'☆'.repeat(5 - r)} ({r}/5)</option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Comment (optional)</label>
                    <textarea
                      className="form-control"
                      rows="3"
                      value={reviewForm.comment}
                      onChange={e => setReviewForm(prev => ({ ...prev, comment: e.target.value }))}
                      placeholder="Share your experience with this product..."
                    />
                  </div>
                  <button type="submit" className="btn btn-primary" disabled={reviewLoading}>
                    {reviewLoading ? 'Submitting...' : 'Submit Review'}
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* Review List */}
          {reviews.length === 0 ? (
            <p className="text-muted">No reviews yet. Be the first to review this product!</p>
          ) : (
            reviews.map(review => (
              <div key={review.id} className="card border-0 shadow-sm mb-3">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <strong>{review.buyer?.full_name || 'Anonymous'}</strong>
                      <span className="ms-2 text-warning">{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</span>
                    </div>
                    <div className="d-flex align-items-center gap-2">
                      <small className="text-muted">
                        {new Date(review.created_at).toLocaleDateString()}
                      </small>
                      {user?.id === review.buyer_id && (
                        <button
                          className="btn btn-sm btn-outline-danger py-0"
                          onClick={() => handleDeleteReview(review.id)}
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                  {review.comment && <p className="mt-2 mb-0 text-muted">{review.comment}</p>}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Similar Products Section */}
        {similarProducts.length > 0 && (
          <div className="container py-5">
            <div className="similar-products-section">
              <h3 className="section-title">Similar Products</h3>
              <div className="similar-products-grid">
                {similarProducts.map((item) => (
                  <Link 
                    key={item.id} 
                    to={`/products/${item.id}`}
                    className="similar-product-card"
                  >
                    <div className="similar-product-image">
                      {item.image_url || item.images?.[0] ? (
                        <img 
                          src={item.image_url || item.images[0]} 
                          alt={item.title}
                        />
                      ) : (
                        <div className="similar-product-no-image">
                          <i className="bi bi-image"></i>
                        </div>
                      )}
                    </div>
                    <div className="similar-product-info">
                      <h4 className="similar-product-title">{item.title}</h4>
                      <div className="similar-product-price">{formatPrice(item.price)}</div>
                      <div className="similar-product-meta">
                        {item.location && (
                          <span>
                            <i className="bi bi-geo-alt"></i>
                            {item.location}
                          </span>
                        )}
                        {item.condition && (
                          <span className="similar-product-condition">{item.condition}</span>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
              {loadingSimilar && (
                <div className="text-center py-3">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default ProductDetail;
