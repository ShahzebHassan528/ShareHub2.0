/**
 * Product Grid Component
 * Displays products in a responsive grid
 */

import ProductCard from './ProductCard';
import ProductSkeleton from './ProductSkeleton';
import './ProductGrid.css';

const ProductGrid = ({ products, loading, error, emptyMessage = 'No products found' }) => {
  if (loading) {
    return (
      <div className="product-grid">
        {[...Array(8)].map((_, index) => (
          <ProductSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="product-grid-error">
        <i className="bi bi-exclamation-circle"></i>
        <p>{error}</p>
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <div className="product-grid-empty">
        <i className="bi bi-inbox"></i>
        <p>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="product-grid">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
};

export default ProductGrid;
