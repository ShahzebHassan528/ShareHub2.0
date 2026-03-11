/**
 * Products Custom Hook
 * Manages product data fetching and state
 */

import { useState, useEffect, useCallback } from 'react';
import productAPI from '../api/product.api';

export const useProducts = (initialParams = {}) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0,
  });

  // Fetch products
  const fetchProducts = useCallback(async (params = {}) => {
    try {
      setLoading(true);
      setError(null);

      const mergedParams = { ...initialParams, ...params };
      const response = await productAPI.getAllProducts(mergedParams);

      setProducts(response.data || response.products || []);
      
      if (response.pagination) {
        setPagination(response.pagination);
      }
    } catch (err) {
      console.error('Products fetch error:', err);
      setError(err.message || 'Failed to fetch products');
    } finally {
      setLoading(false);
    }
  }, [initialParams]);

  // Fetch on mount
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Refresh products
  const refresh = useCallback((params) => {
    fetchProducts(params);
  }, [fetchProducts]);

  return {
    products,
    loading,
    error,
    pagination,
    refresh,
  };
};

export default useProducts;
