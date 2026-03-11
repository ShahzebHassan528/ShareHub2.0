import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Card, Form, Button, Badge, Spinner } from 'react-bootstrap';
import { FaFilter, FaExchangeAlt, FaShoppingBag } from 'react-icons/fa';
import NavigationBar from '../components/Navbar';
import Footer from '../components/Footer';

function SwapMarketplace() {
  const [filters, setFilters] = useState({
    category: '',
    condition: '',
    sortBy: 'latest'
  });
  const [swapItems, setSwapItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSwapItems();
  }, []);

  const fetchSwapItems = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      if (filters.category) queryParams.append('category', filters.category);
      if (filters.condition) queryParams.append('condition', filters.condition);

      const response = await fetch(`http://localhost:5000/api/swaps?${queryParams}`);
      const data = await response.json();
      setSwapItems(data);
    } catch (error) {
      console.error('Error fetching swap items:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const applyFilters = () => {
    fetchSwapItems();
  };

  const clearFilters = () => {
    setFilters({
      category: '',
      condition: '',
      sortBy: 'latest'
    });
    setTimeout(() => fetchSwapItems(), 100);
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
          <div>
            <h1>Swap Marketplace</h1>
            <p className="text-muted mb-0">Exchange items with other users</p>
          </div>
          <Button as={Link} to="/browse" variant="outline-primary">
            <FaShoppingBag className="me-2" />
            View Products for Sale
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
                    <option value="Sports">Sports</option>
                    <option value="Music">Music</option>
                    <option value="Books">Books</option>
                    <option value="Furniture">Furniture</option>
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
                  </Form.Select>
                </Form.Group>

                <Button variant="primary" className="w-100 mb-2" onClick={applyFilters}>
                  Apply Filters
                </Button>
                <Button variant="outline-secondary" className="w-100" onClick={clearFilters}>
                  Clear Filters
                </Button>

                <hr className="my-4" />

                <div className="text-center">
                  <p className="text-muted small mb-2">Want to swap your item?</p>
                  <Button variant="success" className="w-100">
                    <FaExchangeAlt className="me-2" />
                    List Item for Swap
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>

          {/* Swap Items Grid */}
          <Col lg={9}>
            <div className="d-flex justify-content-between align-items-center mb-4">
              <p className="text-muted mb-0">
                Showing <strong>{swapItems.length}</strong> items available for swap
              </p>
              <Form.Select 
                style={{ width: 'auto' }}
                name="sortBy"
                value={filters.sortBy}
                onChange={handleFilterChange}
              >
                <option value="latest">Sort by: Latest</option>
                <option value="popular">Most Popular</option>
                <option value="condition">Best Condition</option>
              </Form.Select>
            </div>

            {loading ? (
              <div className="text-center py-5">
                <Spinner animation="border" variant="warning" />
                <p className="mt-3 text-muted">Loading swap items...</p>
              </div>
            ) : (
              <Row>
                {swapItems.map((item) => (
                  <Col md={6} lg={4} key={item.id} className="mb-4">
                    <Card className="h-100 border-0 shadow-sm hover-card">
                      <Link to={`/swap/${item.id}`} className="text-decoration-none">
                        <div 
                          className="d-flex align-items-center justify-content-center position-relative"
                          style={{ height: '200px', fontSize: item.primary_image?.startsWith('http') ? '0' : '80px', background: '#f8f9fa' }}
                        >
                          {item.primary_image?.startsWith('http') ? (
                            <img src={item.primary_image} alt={item.item_title} style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }} />
                          ) : (
                            item.primary_image || '🔄'
                          )}
                          <Badge 
                            bg="warning" 
                            className="position-absolute top-0 start-0 m-2"
                          >
                            <FaExchangeAlt className="me-1" />
                            Swap
                          </Badge>
                        </div>
                      </Link>
                      <Card.Body>
                        <Link to={`/swap/${item.id}`} className="text-decoration-none text-dark">
                          <div className="d-flex justify-content-between align-items-start mb-2">
                            <h5 className="mb-0">{item.item_title}</h5>
                            <Badge bg={getConditionBadge(item.product_condition)}>
                              {item.product_condition.replace('_', ' ')}
                            </Badge>
                          </div>
                        </Link>
                        <p className="text-muted small mb-2">
                          <strong>Owner:</strong> {item.owner_name || 'Anonymous'}
                        </p>
                        <p className="text-muted small mb-2">
                          <strong>Category:</strong> {item.category_name || 'Uncategorized'}
                        </p>
                        <div className="bg-light p-2 rounded mb-3">
                          <p className="text-muted small mb-0">
                            <strong>Looking for:</strong> {item.message || 'Open to offers'}
                          </p>
                        </div>
                        <Button 
                          as={Link} 
                          to={`/swap/${item.id}`}
                          variant="primary" 
                          className="w-100"
                        >
                          <FaExchangeAlt className="me-2" />
                          View Details
                        </Button>
                      </Card.Body>
                    </Card>
                  </Col>
                ))}
              </Row>
            )}

            {!loading && swapItems.length === 0 && (
              <div className="text-center py-5">
                <div className="mb-3">
                  <span style={{ fontSize: '80px' }}>🔄</span>
                </div>
                <h4>No swap items found</h4>
                <p className="text-muted">Try adjusting your filters or check back later.</p>
              </div>
            )}
          </Col>
        </Row>
      </Container>

      <Footer />
    </div>
  );
}

export default SwapMarketplace;
