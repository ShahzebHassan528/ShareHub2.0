/**
 * Favorites Page
 * Displays products saved by the user
 */

import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useFavorites } from '../contexts/FavoritesContext';
import { useCart } from '../contexts/CartContext';
import { useToast } from '../contexts/ToastContext';
import './FavoritesPage.css';

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, delay: i * 0.07, ease: 'easeOut' },
  }),
};

const FavoritesPage = () => {
  const { favorites, removeFromFavorites, clearFavorites } = useFavorites();
  const { addToCart, isInCart } = useCart();
  const toast = useToast();

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const handleAddToCart = (product) => {
    addToCart(product);
    toast.success(`"${product.title}" added to cart`);
  };

  const handleRemove = (product) => {
    removeFromFavorites(product.id);
    toast.info(`"${product.title}" removed from favorites`);
  };

  const handleClearAll = () => {
    clearFavorites();
    toast.info('Favorites cleared');
  };

  return (
    <motion.div className="favorites-page" initial="hidden" animate="visible" variants={fadeUp}>
      <div className="container py-4">

        {/* Header */}
        <div className="favorites-header">
          <div>
            <h1 className="favorites-title">
              <i className="bi bi-heart-fill me-2"></i>
              My Favorites
            </h1>
            <p className="favorites-subtitle">
              {favorites.length === 0
                ? 'No saved items yet'
                : `${favorites.length} saved item${favorites.length !== 1 ? 's' : ''}`}
            </p>
          </div>
          {favorites.length > 0 && (
            <button
              className="btn btn-outline-danger btn-sm"
              onClick={handleClearAll}
            >
              <i className="bi bi-trash me-1"></i>
              Clear All
            </button>
          )}
        </div>

        {/* Empty State */}
        {favorites.length === 0 && (
          <div className="favorites-empty">
            <i className="bi bi-heart"></i>
            <h3>No favorites yet</h3>
            <p>Save products you love by clicking the heart icon on any listing.</p>
            <Link to="/browse" className="btn btn-primary">
              <i className="bi bi-grid me-2"></i>
              Browse Products
            </Link>
          </div>
        )}

        {/* Favorites Grid */}
        {favorites.length > 0 && (
          <div className="favorites-grid">
            {favorites.map(product => (
              <div key={product.id} className="favorite-card">
                {/* Image */}
                <Link to={`/products/${product.id}`} className="favorite-card-image">
                  {product.image_url || product.images?.[0] ? (
                    <img
                      src={product.image_url || product.images[0]}
                      alt={product.title}
                      loading="lazy"
                    />
                  ) : (
                    <div className="favorite-card-no-image">
                      <i className="bi bi-image"></i>
                    </div>
                  )}
                </Link>

                {/* Remove button */}
                <button
                  className="favorite-remove-btn"
                  onClick={() => handleRemove(product)}
                  title="Remove from favorites"
                >
                  <i className="bi bi-heart-fill"></i>
                </button>

                {/* Details */}
                <div className="favorite-card-body">
                  <Link to={`/products/${product.id}`} className="favorite-card-title">
                    {product.title}
                  </Link>
                  <div className="favorite-card-price">
                    {formatPrice(product.price)}
                  </div>
                  {product.product_condition && (
                    <span className="favorite-card-condition">
                      {product.product_condition.replace('_', ' ')}
                    </span>
                  )}

                  <div className="favorite-card-actions">
                    <button
                      className={`btn btn-sm ${isInCart(product.id) ? 'btn-success' : 'btn-primary'} flex-fill`}
                      onClick={() => handleAddToCart(product)}
                    >
                      <i className={`bi ${isInCart(product.id) ? 'bi-check-circle' : 'bi-cart-plus'} me-1`}></i>
                      {isInCart(product.id) ? 'In Cart' : 'Add to Cart'}
                    </button>
                    <Link
                      to={`/products/${product.id}`}
                      className="btn btn-sm btn-outline-secondary"
                    >
                      <i className="bi bi-eye"></i>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </motion.div>
  );
};

export default FavoritesPage;
