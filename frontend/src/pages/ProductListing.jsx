/**
 * Product Listing Page
 * Advanced marketplace search and filtering with debounced search
 */

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import productAPI from '../api/product.api';
import ProductCard from '../components/products/ProductCard';
import './ProductListing.css';

// Debounce hook
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

const ProductListing = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Filter state
  const [searchInput, setSearchInput] = useState(searchParams.get('search') || '');
  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    priceMin: searchParams.get('priceMin') || '',
    priceMax: searchParams.get('priceMax') || '',
    condition: searchParams.get('condition') || '',
    location: searchParams.get('location') || '',
    sortBy: searchParams.get('sortBy') || 'newest',
  });

  // Debounced search
  const debouncedSearch = useDebounce(searchInput, 500);

  // Products state
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch products
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        search: debouncedSearch,
        category: filters.category,
        minPrice: filters.priceMin,
        maxPrice: filters.priceMax,
        condition: filters.condition,
        location: filters.location,
        sortBy: filters.sortBy,
      };

      // Remove empty params
      Object.keys(params).forEach(key => {
        if (!params[key]) delete params[key];
      });

      const data = await productAPI.getAllProducts(params);
      // Backend returns { success, count, data: [...] }
      setProducts(data.data || data.products || []);
    } catch (err) {
      console.error('Failed to fetch products:', err);
      setError('Failed to load products');
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, filters]);

  // Fetch on mount and when filters change
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Update URL params
  useEffect(() => {
    const params = {};
    if (debouncedSearch) params.search = debouncedSearch;
    if (filters.category) params.category = filters.category;
    if (filters.priceMin) params.priceMin = filters.priceMin;
    if (filters.priceMax) params.priceMax = filters.priceMax;
    if (filters.condition) params.condition = filters.condition;
    if (filters.location) params.location = filters.location;
    if (filters.sortBy && filters.sortBy !== 'newest') params.sortBy = filters.sortBy;
    
    setSearchParams(params);
  }, [debouncedSearch, filters, setSearchParams]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleClearFilters = () => {
    setSearchInput('');
    setFilters({
      category: '',
      priceMin: '',
      priceMax: '',
      condition: '',
      location: '',
      sortBy: 'newest',
    });
  };

  const hasActiveFilters = searchInput || filters.category || filters.priceMin || 
                          filters.priceMax || filters.condition || filters.location;

  const categories = [
    'Electronics',
    'Furniture',
    'Clothing',
    'Books',
    'Sports',
    'Toys',
    'Home & Garden',
    'Automotive',
    'Other'
  ];

  const conditions = [
    { value: 'new', label: 'New' },
    { value: 'like-new', label: 'Like New' },
    { value: 'good', label: 'Good' },
    { value: 'fair', label: 'Fair' },
  ];

  return (
    <div className="product-listing-page">
      <div className="listing-container">
        <div className="listing-layout">
          {/* Filters Sidebar */}
          <aside className="filters-sidebar">
            <div className="filters-header">
              <h3>Filters</h3>
              {hasActiveFilters && (
                <button 
                  className="btn-clear-filters"
                  onClick={handleClearFilters}
                >
                  Clear All
                </button>
              )}
            </div>

            <div className="filters-content">
              {/* Search Filter */}
              <div className="filter-group">
                <label className="filter-label">
                  <span className="label-icon">🔍</span>
                  Search
                </label>
                <input
                  type="text"
                  className="filter-input"
                  placeholder="Search products..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                />
                {searchInput && (
                  <span className="input-hint">Searching...</span>
                )}
              </div>

              {/* Category Filter */}
              <div className="filter-group">
                <label className="filter-label">
                  <span className="label-icon">📂</span>
                  Category
                </label>
                <select
                  className="filter-select"
                  value={filters.category}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                >
                  <option value="">All Categories</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Price Range */}
              <div className="filter-group">
                <label className="filter-label">
                  <span className="label-icon">💰</span>
                  Price Range
                </label>
                <div className="price-inputs">
                  <input
                    type="number"
                    className="filter-input"
                    placeholder="Min"
                    value={filters.priceMin}
                    onChange={(e) => handleFilterChange('priceMin', e.target.value)}
                  />
                  <span className="price-separator">-</span>
                  <input
                    type="number"
                    className="filter-input"
                    placeholder="Max"
                    value={filters.priceMax}
                    onChange={(e) => handleFilterChange('priceMax', e.target.value)}
                  />
                </div>
              </div>

              {/* Condition Filter */}
              <div className="filter-group">
                <label className="filter-label">
                  <span className="label-icon">⭐</span>
                  Condition
                </label>
                <select
                  className="filter-select"
                  value={filters.condition}
                  onChange={(e) => handleFilterChange('condition', e.target.value)}
                >
                  <option value="">Any Condition</option>
                  {conditions.map(cond => (
                    <option key={cond.value} value={cond.value}>
                      {cond.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Location Filter */}
              <div className="filter-group">
                <label className="filter-label">
                  <span className="label-icon">📍</span>
                  Location
                </label>
                <input
                  type="text"
                  className="filter-input"
                  placeholder="Enter location..."
                  value={filters.location}
                  onChange={(e) => handleFilterChange('location', e.target.value)}
                />
              </div>
            </div>
          </aside>

          {/* Products Section */}
          <main className="products-section">
            {/* Toolbar */}
            <div className="products-toolbar">
              <div className="toolbar-left">
                <h2 className="results-count">
                  {loading ? (
                    'Loading...'
                  ) : (
                    <>
                      {products.length} {products.length === 1 ? 'Product' : 'Products'}
                      {hasActiveFilters && ' found'}
                    </>
                  )}
                </h2>
                {hasActiveFilters && (
                  <div className="active-filters">
                    {searchInput && (
                      <span className="filter-tag">
                        Search: "{searchInput}"
                        <button onClick={() => setSearchInput('')}>×</button>
                      </span>
                    )}
                    {filters.category && (
                      <span className="filter-tag">
                        {filters.category}
                        <button onClick={() => handleFilterChange('category', '')}>×</button>
                      </span>
                    )}
                    {(filters.priceMin || filters.priceMax) && (
                      <span className="filter-tag">
                        Rs. {filters.priceMin || '0'} - {filters.priceMax || '∞'}
                        <button onClick={() => {
                          handleFilterChange('priceMin', '');
                          handleFilterChange('priceMax', '');
                        }}>×</button>
                      </span>
                    )}
                  </div>
                )}
              </div>

              <div className="toolbar-right">
                <label className="sort-label">Sort by:</label>
                <select
                  className="sort-select"
                  value={filters.sortBy}
                  onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                >
                  <option value="newest">Newest</option>
                  <option value="price_low">Price: Low to High</option>
                  <option value="price_high">Price: High to Low</option>
                </select>
              </div>
            </div>

            {/* Products Grid */}
            {loading ? (
              <div className="loading-state">
                <div className="spinner"></div>
                <p>Loading products...</p>
              </div>
            ) : error ? (
              <div className="error-state">
                <div className="error-icon">⚠️</div>
                <h3>Failed to Load Products</h3>
                <p>{error}</p>
                <button onClick={fetchProducts} className="btn-retry">
                  Try Again
                </button>
              </div>
            ) : products.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">🔍</div>
                <h3>No Products Found</h3>
                <p>
                  {hasActiveFilters 
                    ? 'Try adjusting your filters to see more results'
                    : 'No products available at the moment'}
                </p>
                {hasActiveFilters && (
                  <button onClick={handleClearFilters} className="btn-clear">
                    Clear All Filters
                  </button>
                )}
              </div>
            ) : (
              <div className="products-grid">
                {products.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default ProductListing;
