import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Card, Form, Button, Badge, Spinner } from 'react-bootstrap';
import { FaFilter, FaShoppingCart, FaHeart, FaExchangeAlt } from 'react-icons/fa';
import NavigationBar from '../components/Navbar';
import Footer from '../components/Footer';

function Browse() {
  const [filters, setFilters] = useState({
    category: '',
    condition: '',
    minPrice: '',
    maxPrice: '',
    sortBy: 'latest'
  });
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      if (filters.category) queryParams.append('category', filters.category);
      if (filters.condition) queryParams.append('condition', filters.condition);
      if (filters.minPrice) queryParams.append('minPrice', filters.minPrice);
      if (filters.maxPrice) queryParams.append('maxPrice', filters.maxPrice);

      const response = await fetch(`http://localhost:5000/api/products?${queryParams}`);
      const data = await response.json();
      setProducts(data);
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
                    <option value="Electronics">Electronics</option>
                    <option value="Clothing">Clothing</option>
                    <option value="Books">Books</option>
                    <option value="Furniture">Furniture</option>
                    <option value="Toys">Toys</option>
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
                          style={{ height: '200px', fontSize: product.primary_image?.startsWith('http') ? '0' : '80px', background: '#f8f9fa' }}
                        >
                          {product.primary_image?.startsWith('http') ? (
                            <img src={product.primary_image} alt={product.title} style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }} />
                          ) : (
                            product.primary_image || '📦'
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
                              {product.product_condition.replace('_', ' ')}
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
                          <h4 className="text-primary mb-0">${parseFloat(product.price).toFixed(2)}</h4>
                          <Button variant="primary" size="sm">
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
