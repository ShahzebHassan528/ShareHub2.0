/**
 * Product Card Component
 * Reusable product card for listings
 */

import { Link } from 'react-router-dom';
import './ProductCard.css';

const ProductCard = ({ product }) => {
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
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  return (
    <Link to={`/products/${product.id}`} className="product-card">
      <div className="product-card-image">
        {product.image_url || product.images?.[0] ? (
          <img 
            src={product.image_url || product.images[0]} 
            alt={product.title}
            loading="lazy"
          />
        ) : (
          <div className="product-card-no-image">
            <i className="bi bi-image"></i>
          </div>
        )}
        
        {product.condition && (
          <span className="product-card-badge condition-badge">
            {product.condition}
          </span>
        )}
        
        {product.is_featured && (
          <span className="product-card-badge featured-badge">
            <i className="bi bi-star-fill"></i> Featured
          </span>
        )}
      </div>

      <div className="product-card-body">
        <div className="product-card-price">
          {formatPrice(product.price)}
        </div>
        
        <h3 className="product-card-title">
          {product.title}
        </h3>
        
        <div className="product-card-meta">
          {product.location && (
            <span className="product-card-location">
              <i className="bi bi-geo-alt"></i>
              {product.location}
            </span>
          )}
          
          {product.created_at && (
            <span className="product-card-time">
              {getTimeAgo(product.created_at)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
