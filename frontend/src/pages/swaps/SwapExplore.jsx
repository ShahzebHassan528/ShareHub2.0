/**
 * Swap Marketplace Page
 * Route: /swaps/explore
 * Browse products available for swapping
 */

import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import productAPI from '../../api/product.api';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import SwapRequestButton from '../../components/swap/SwapRequestButton';
import './SwapExplore.css';

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, delay: i * 0.07, ease: 'easeOut' },
  }),
};

const SwapExplore = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
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
  });

  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchSwapProducts();
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

  const fetchSwapProducts = async () => {
    try {
      setLoading(true);
      
      const params = {
        ...filters,
        availability_status: 'available', // Only available products
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
      console.error('Failed to fetch swap products:', err);
      toast.error('Failed to load swap products');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setFilters({
      search: '',
      category: '',
      condition: '',
      minPrice: '',
      maxPrice: '',
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

  return (
    <motion.div className="swap-explore-page" initial="hidden" animate="visible" variants={fadeUp}>
      <div className="container">
        {/* Hero Header */}
        <div className="swap-hero">
          <div className="swap-hero-content">
            <div className="swap-hero-icon">
              <i className="bi bi-arrow-left-right"></i>
            </div>
            <h1 className="swap-hero-title">Swap Marketplace</h1>
            <p className="swap-hero-subtitle">
              Exchange items without spending money • {totalProducts} items available for swap
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

        <div className="swap-layout">
          {/* Filters Sidebar */}
          <aside className={`swap-filters ${showFilters ? 'show' : ''}`}>
            <div className="filters-header">
              <h3>
                <i className="bi bi-sliders"></i>
                Filters
              </h3>
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
                  Search Items
                </label>
                <input
                  type="text"
                  className="filter-input"
                  placeholder="Search swap items..."
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

              {/* Value Range */}
              <div className="filter-group">
                <label className="filter-label">
                  <i className="bi bi-currency-dollar"></i>
                  Item Value Range
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

              {/* Info Box */}
              <div className="swap-info-box">
                <i className="bi bi-info-circle"></i>
                <div>
                  <h4>How Swapping Works</h4>
                  <p>Browse items, request a swap with your item, and exchange without money!</p>
                </div>
              </div>
            </div>
          </aside>

          {/* Swap Products Content */}
          <main className="swap-content">
            {/* Toolbar */}
            <div className="swap-toolbar">
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
                  </div>
                )}
              </div>
            </div>

            {/* Swap Products Grid */}
            {loading ? (
              <div className="swap-grid">
                {[...Array(12)].map((_, i) => (
                  <div key={i} className="swap-skeleton">
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
                <i className="bi bi-arrow-left-right"></i>
                <h3>No Swap Items Found</h3>
                <p>
                  {hasActiveFilters 
                    ? 'Try adjusting your filters to see more swap items'
                    : 'No items available for swapping at the moment'}
                </p>
                {hasActiveFilters && (
                  <button className="btn btn-primary" onClick={handleClearFilters}>
                    Clear Filters
                  </button>
                )}
              </div>
            ) : (
              <>
                <div className="swap-grid">
                  {products.map(product => (
                    <div key={product.id} className="swap-card">
                      <Link to={`/products/${product.id}`} className="swap-card-link">
                        <div className="swap-image">
                          {product.image_url || product.images?.[0] ? (
                            <img 
                              src={product.image_url || product.images[0]} 
                              alt={product.title}
                            />
                          ) : (
                            <div className="swap-no-image">
                              <i className="bi bi-image"></i>
                            </div>
                          )}
                          <div className="swap-badge">
                            <i className="bi bi-arrow-left-right"></i>
                            SWAP
                          </div>
                          {product.condition && (
                            <span className="condition-badge">{product.condition}</span>
                          )}
                        </div>
                        <div className="swap-info">
                          <h3 className="swap-title">{product.title}</h3>
                          <div className="swap-value">
                            <span className="value-label">Estimated Value:</span>
                            <span className="value-amount">{formatPrice(product.price)}</span>
                          </div>
                          <div className="swap-meta">
                            {product.location && (
                              <span className="swap-location">
                                <i className="bi bi-geo-alt"></i>
                                {product.location}
                              </span>
                            )}
                            {product.seller && (
                              <span className="swap-seller">
                                <i className="bi bi-person"></i>
                                {product.seller.name || 'Seller'}
                              </span>
                            )}
                          </div>
                        </div>
                      </Link>
                      <div className="swap-actions">
                        {isAuthenticated ? (
                          <SwapRequestButton product={product} />
                        ) : (
                          <button 
                            className="btn-swap-request"
                            onClick={() => navigate('/login', { state: { from: `/swaps/explore` } })}
                          >
                            <i className="bi bi-arrow-left-right me-2"></i>
                            Login to Swap
                          </button>
                        )}
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
          </main>
        </div>
      </div>
    </motion.div>
  );
};

export default SwapExplore;
