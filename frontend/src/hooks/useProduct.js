/**
 * Single Product Custom Hook
 * Manages single product data fetching
 */

import { useState, useEffect, useCallback } from 'react';
import productAPI from '../api/product.api';

export const useProduct = (productId) => {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch product
  const fetchProduct = useCallback(async () => {
    if (!productId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await productAPI.getProductById(productId);
      setProduct(response.data || response.product);
    } catch (err) {
      console.error('Product fetch error:', err);
      setError(err.message || 'Failed to fetch product');
    } finally {
      setLoading(false);
    }
  }, [productId]);

  // Fetch on mount and when productId changes
  useEffect(() => {
    fetchProduct();
  }, [fetchProduct]);

  // Refresh product
  const refresh = useCallback(() => {
    fetchProduct();
  }, [fetchProduct]);

  return {
    product,
    loading,
    error,
    refresh,
  };
};

export default useProduct;
