/**
 * Products Listing Page - Professional OLX/Daraz Style
 * Route: /products
 */

import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import productAPI from '../api/product.api';
import { useToast } from '../contexts/ToastContext';
import './Products.css';

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const toast = useToast();

  // State
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const productsPerPage = 12;

  // Filters
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || '',
    condition: searchParams.get('condition') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    sortBy: searchParams.get('sortBy') || 'newest',
  });

  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchProducts();
    window.scrollTo(0, 0);
  }, [filters, currentPage]);

  useEffect(() => {
    // Update URL params
    const params = {};
    Object.keys(filters).forEach(key => {
      if (filters[key]) params[key] = filters[key];
    });
    setSearchParams(params);
  }, [filters]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      
      const params = {
        ...filters,
        page: currentPage,
        limit: productsPerPage,
      };

      // Remove empty params
      Object.keys(params).forEach(key => {
        if (!params[key]) delete params[key];
      });

      const response = await productAPI.getAllProducts(params);
      setProducts(response.products || []);
      setTotalProducts(response.total || response.products?.length || 0);
      setTotalPages(Math.ceil((response.total || response.products?.length || 0) / productsPerPage));
    } catch (err) {
      console.error('Failed to fetch products:', err);
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1); // Reset to first page
  };

  const handleClearFilters = () => {
    setFilters({
      search: '',
      category: '',
      condition: '',
      minPrice: '',
      maxPrice: '',
      sortBy: 'newest',
    });
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const hasActiveFilters = filters.search || filters.category || filters.condition || 
                          filters.minPrice || filters.maxPrice;

  const categories = [
    'Electronics',
    'Clothing',
    'Furniture',
    'Books',
    'Sports',
    'Toys',
    'Home & Garden',
    'Automotive',
    'Others'
  ];

  const conditions = ['New', 'Like New', 'Good', 'Fair'];

  const sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'price_low', label: 'Price: Low to High' },
    { value: 'price_high', label: 'Price: High to Low' },
  ];

  return (
    <div className="products-page">
      <div className="container">
        {/* Header */}
        <div className="products-header">
          <div className="header-content">
            <h1 className="page-title">Browse Products</h1>
            <p className="page-subtitle">
              {totalProducts} {totalProducts === 1 ? 'product' : 'products'} available
            </p>
          </div>
          <button 
            className="btn-toggle-filters"
            onClick={() => setShowFilters(!showFilters)}
          >
            <i className="bi bi-funnel"></i>
            Filters
            {hasActiveFilters && <span className="filter-count">{
              [filters.search, filters.category, filters.condition, 
               filters.minPrice || filters.maxPrice].filter(Boolean).length
            }</span>}
          </button>
        </div>

        <div className="products-layout">
          {/* Filters Sidebar */}
          <aside className={`filters-sidebar ${showFilters ? 'show' : ''}`}>
            <div className="filters-header">
              <h3>Filters</h3>
              {hasActiveFilters && (
                <button className="btn-clear-all" onClick={handleClearFilters}>
                  Clear All
                </button>
              )}
            </div>

            <div className="filters-body">
              {/* Search */}
              <div className="filter-group">
                <label className="filter-label">
                  <i className="bi bi-search"></i>
                  Search
                </label>
                <input
                  type="text"
                  className="filter-input"
                  placeholder="Search products..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                />
              </div>

              {/* Category */}
              <div className="filter-group">
                <label className="filter-label">
                  <i className="bi bi-grid"></i>
                  Category
                </label>
                <select
                  className="filter-select"
                  value={filters.category}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                >
                  <option value="">All Categories</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat.toLowerCase()}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Price Range */}
              <div className="filter-group">
                <label className="filter-label">
                  <i className="bi bi-currency-dollar"></i>
                  Price Range
                </label>
                <div className="price-range">
                  <input
                    type="number"
                    className="filter-input"
                    placeholder="Min"
                    value={filters.minPrice}
                    onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                  />
                  <span className="range-separator">to</span>
                  <input
                    type="number"
                    className="filter-input"
                    placeholder="Max"
                    value={filters.maxPrice}
                    onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                  />
                </div>
              </div>

              {/* Condition */}
              <div className="filter-group">
                <label className="filter-label">
                  <i className="bi bi-star"></i>
                  Condition
                </label>
                <select
                  className="filter-select"
                  value={filters.condition}
                  onChange={(e) => handleFilterChange('condition', e.target.value)}
                >
                  <option value="">Any Condition</option>
                  {conditions.map(cond => (
                    <option key={cond} value={cond.toLowerCase().replace(' ', '-')}>
                      {cond}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </aside>

          {/* Products Content */}
          <main className="products-content">
            {/* Toolbar */}
            <div className="products-toolbar">
              <div className="toolbar-left">
                {hasActiveFilters && (
                  <div className="active-filters">
                    {filters.search && (
                      <span className="filter-tag">
                        <i className="bi bi-search"></i>
                        "{filters.search}"
                        <button onClick={() => handleFilterChange('search', '')}>
                          <i className="bi bi-x"></i>
                        </button>
                      </span>
                    )}
                    {filters.category && (
                      <span className="filter-tag">
                        <i className="bi bi-tag"></i>
                        {filters.category}
                        <button onClick={() => handleFilterChange('category', '')}>
                          <i className="bi bi-x"></i>
                        </button>
                      </span>
                    )}
                    {filters.condition && (
                      <span className="filter-tag">
                        <i className="bi bi-star"></i>
                        {filters.condition}
                        <button onClick={() => handleFilterChange('condition', '')}>
                          <i className="bi bi-x"></i>
                        </button>
                      </span>
                    )}
                    {(filters.minPrice || filters.maxPrice) && (
                      <span className="filter-tag">
                        <i className="bi bi-currency-dollar"></i>
                        {filters.minPrice || '0'} - {filters.maxPrice || '∞'}
                        <button onClick={() => {
                          handleFilterChange('minPrice', '');
                          handleFilterChange('maxPrice', '');
                        }}>
                          <i className="bi bi-x"></i>
                        </button>
                      </span>
                    )}
                  </div>
                )}
              </div>

              <div className="toolbar-right">
                <label>Sort:</label>
                <select
                  className="sort-select"
                  value={filters.sortBy}
                  onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                >
                  {sortOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Products Grid */}
            {loading ? (
              <div className="products-grid">
                {[...Array(12)].map((_, i) => (
                  <div key={i} className="product-skeleton">
                    <div className="skeleton-image"></div>
                    <div className="skeleton-content">
                      <div className="skeleton-line"></div>
                      <div className="skeleton-line short"></div>
                      <div className="skeleton-line"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="empty-state">
                <i className="bi bi-inbox"></i>
                <h3>No Products Found</h3>
                <p>
                  {hasActiveFilters 
                    ? 'Try adjusting your filters to see more results'
                    : 'No products available at the moment'}
                </p>
                {hasActiveFilters && (
                  <button className="btn btn-primary" onClick={handleClearFilters}>
                    Clear Filters
                  </button>
                )}
              </div>
            ) : (
              <>
                <div className="products-grid">
                  {products.map(product => (
                    <Link
                      key={product.id}
                      to={`/products/${product.id}`}
                      className="product-card"
                    >
                      <div className="product-image">
                        {product.image_url || product.images?.[0] ? (
                          <img 
                            src={product.image_url || product.images[0]} 
                            alt={product.title}
                          />
                        ) : (
                          <div className="product-no-image">
                            <i className="bi bi-image"></i>
                          </div>
                        )}
                        {product.condition && (
                          <span className="product-badge">{product.condition}</span>
                        )}
                      </div>
                      <div className="product-info">
                        <h3 className="product-title">{product.title}</h3>
                        <p className="product-price">{formatPrice(product.price)}</p>
                        <div className="product-meta">
                          {product.location && (
                            <span className="product-location">
                              <i className="bi bi-geo-alt"></i>
                              {product.location}
                            </span>
                          )}
                          {product.seller && (
                            <span className="product-seller">
                              <i className="bi bi-person"></i>
                              {product.seller.name || 'Seller'}
                            </span>
                          )}
                        </div>
                      </div>
                    </Link>
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
                        // Show first, last, current, and adjacent pages
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
          </main>
        </div>
      </div>
    </div>
  );
};

export default Products;
