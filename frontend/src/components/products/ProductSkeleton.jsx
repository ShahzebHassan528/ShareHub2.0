/**
 * Product Skeleton Component
 * Loading placeholder for product cards
 */

import './ProductSkeleton.css';

const ProductSkeleton = () => {
  return (
    <div className="product-skeleton">
      <div className="product-skeleton-image"></div>
      <div className="product-skeleton-body">
        <div className="product-skeleton-line price"></div>
        <div className="product-skeleton-line title"></div>
        <div className="product-skeleton-line title short"></div>
        <div className="product-skeleton-line meta"></div>
      </div>
    </div>
  );
};

export default ProductSkeleton;
