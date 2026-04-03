import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Card, Form, Button, Badge, Spinner } from 'react-bootstrap';
import { FaFilter, FaShoppingCart, FaHeart, FaExchangeAlt } from 'react-icons/fa';
import NavigationBar from '../components/Navbar';
import Footer from '../components/Footer';
import productAPI from '../api/product.api';
import apiClient from '../api/client';
import { useCart } from '../contexts/CartContext';

function Browse() {
  const { addToCart } = useCart();
  const [filters, setFilters] = useState({
    category: '',
    condition: '',
    minPrice: '',
    maxPrice: '',
    sortBy: 'latest'
  });
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await apiClient.get('/v1/categories');
      setCategories(res.data || res.categories || []);
    } catch (err) {
      console.error('Failed to load categories:', err);
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filters.category) params.category = filters.category;
      if (filters.condition) params.condition = filters.condition;
      if (filters.minPrice) params.minPrice = filters.minPrice;
      if (filters.maxPrice) params.maxPrice = filters.maxPrice;
      if (filters.sortBy) params.sortBy = filters.sortBy;

      const response = await productAPI.getAllProducts(params);
      setProducts(response.data || response.products || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const applyFilters = () => {
    fetchProducts();
  };

  const clearFilters = () => {
    setFilters({
      category: '',
      condition: '',
      minPrice: '',
      maxPrice: '',
      sortBy: 'latest'
    });
    setTimeout(() => fetchProducts(), 100);
  };

  const getConditionBadge = (condition) => {
    const badges = {
      new: 'success',
      like_new: 'info',
      good: 'primary',
      fair: 'warning',
      poor: 'secondary'
    };
    return badges[condition] || 'secondary';
  };

  return (
    <div className="d-flex flex-column min-vh-100">
      <NavigationBar />

      <Container className="py-5 flex-grow-1">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h1>Browse Products for Sale</h1>
          <Button as={Link} to="/swap-marketplace" variant="outline-primary">
            <FaExchangeAlt className="me-2" />
            View Swap Marketplace
          </Button>
        </div>

        <Row>
          {/* Filters Sidebar */}
          <Col lg={3} className="mb-4">
            <Card className="border-0 shadow-sm sticky-top" style={{ top: '80px' }}>
              <Card.Body>
                <h5 className="mb-3">
                  <FaFilter className="me-2" />
                  Filters
                </h5>

                <Form.Group className="mb-3">
                  <Form.Label>Category</Form.Label>
                  <Form.Select name="category" value={filters.category} onChange={handleFilterChange}>
                    <option value="">All Categories</option>
                    {categories.map(cat => (
                      <option key={cat.id || cat.name} value={cat.name}>{cat.name}</option>
                    ))}
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Condition</Form.Label>
                  <Form.Select name="condition" value={filters.condition} onChange={handleFilterChange}>
                    <option value="">All Conditions</option>
                    <option value="new">New</option>
                    <option value="like_new">Like New</option>
                    <option value="good">Good</option>
                    <option value="fair">Fair</option>
                    <option value="poor">Poor</option>
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Price Range</Form.Label>
                  <Row>
                    <Col>
                      <Form.Control 
                        type="number" 
                        placeholder="Min" 
                        name="minPrice"
                        value={filters.minPrice}
                        onChange={handleFilterChange}
                      />
                    </Col>
                    <Col>
                      <Form.Control 
                        type="number" 
                        placeholder="Max"
                        name="maxPrice"
                        value={filters.maxPrice}
                        onChange={handleFilterChange}
                      />
                    </Col>
                  </Row>
                </Form.Group>

                <Button variant="primary" className="w-100 mb-2" onClick={applyFilters}>
                  Apply Filters
                </Button>
                <Button variant="outline-secondary" className="w-100" onClick={clearFilters}>
                  Clear Filters
                </Button>
              </Card.Body>
            </Card>
          </Col>

          {/* Products Grid */}
          <Col lg={9}>
            <div className="d-flex justify-content-between align-items-center mb-4">
              <p className="text-muted mb-0">
                Showing <strong>{products.length}</strong> products from verified sellers
              </p>
              <Form.Select 
                style={{ width: 'auto' }}
                name="sortBy"
                value={filters.sortBy}
                onChange={handleFilterChange}
              >
                <option value="latest">Sort by: Latest</option>
                <option value="price_low">Price: Low to High</option>
                <option value="price_high">Price: High to Low</option>
                <option value="popular">Most Popular</option>
              </Form.Select>
            </div>

            {loading ? (
              <div className="text-center py-5">
                <Spinner animation="border" variant="primary" />
                <p className="mt-3 text-muted">Loading products...</p>
              </div>
            ) : (
              <Row>
                {products.map((product) => (
                  <Col md={6} lg={4} key={product.id} className="mb-4">
                    <Card className="h-100 border-0 shadow-sm hover-card">
                      <Link to={`/product/${product.id}`} className="text-decoration-none">
                        <div 
                          className="d-flex align-items-center justify-content-center position-relative"
                          style={{ height: '200px', fontSize: (product.image_url || product.primary_image)?.startsWith('http') ? '0' : '80px', background: '#f8f9fa' }}
                        >
                          {(product.image_url || product.primary_image)?.startsWith('http') ? (
                            <img src={product.image_url || product.primary_image} alt={product.title} style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }} />
                          ) : (
                            product.image_url || product.primary_image || '📦'
                          )}
                          <Button 
                            variant="light" 
                            className="position-absolute top-0 end-0 m-2 rounded-circle"
                            style={{ width: '40px', height: '40px' }}
                            onClick={(e) => e.preventDefault()}
                          >
                            <FaHeart className="text-danger" />
                          </Button>
                        </div>
                      </Link>
                      <Card.Body>
                        <Link to={`/product/${product.id}`} className="text-decoration-none text-dark">
                          <div className="d-flex justify-content-between align-items-start mb-2">
                            <h5 className="mb-0">{product.title}</h5>
                            <Badge bg={getConditionBadge(product.product_condition)}>
                              {(product.product_condition || product.condition || 'N/A').replace('_', ' ')}
                            </Badge>
                          </div>
                        </Link>
                        <p className="text-muted small mb-2">
                          <strong>Seller:</strong> {product.seller_name || 'Unknown'}
                        </p>
                        <p className="text-muted small mb-3">
                          <strong>Category:</strong> {product.category_name || 'Uncategorized'}
                        </p>
                        <div className="d-flex justify-content-between align-items-center">
                          <h4 className="text-primary mb-0">PKR {parseFloat(product.price).toLocaleString()}</h4>
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={(e) => { e.preventDefault(); addToCart(product); }}
                          >
                            <FaShoppingCart className="me-1" />
                            Add to Cart
                          </Button>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                ))}
              </Row>
            )}

            {!loading && products.length === 0 && (
              <div className="text-center py-5">
                <div className="mb-3">
                  <span style={{ fontSize: '80px' }}>🔍</span>
                </div>
                <h4>No products found</h4>
                <p className="text-muted">Try adjusting your filters to see more results.</p>
              </div>
            )}
          </Col>
        </Row>
      </Container>

      <Footer />
    </div>
  );
}

export default Browse;
