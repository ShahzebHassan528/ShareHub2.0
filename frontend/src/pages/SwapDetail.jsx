import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Badge, Form, ListGroup, Tab, Tabs, Alert, Spinner } from 'react-bootstrap';
import { FaExchangeAlt, FaUser, FaMapMarkerAlt, FaClock, FaCheckCircle, FaInfoCircle } from 'react-icons/fa';
import NavigationBar from '../components/Navbar';
import Footer from '../components/Footer';

function SwapDetail() {
  const { id } = useParams();
  const [selectedImage, setSelectedImage] = useState(0);
  const [showSwapForm, setShowSwapForm] = useState(false);
  const [swapMessage, setSwapMessage] = useState('');
  const [swapItem, setSwapItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [similarSwaps, setSimilarSwaps] = useState([]);

  useEffect(() => {
    fetchSwapItem();
  }, [id]);

  const fetchSwapItem = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:5000/api/swaps/${id}`);
      
      if (!response.ok) {
        throw new Error('Swap item not found');
      }
      
      const data = await response.json();
      setSwapItem(data);
      
      // Fetch similar swap items from same category
      if (data.category_name) {
        const similarResponse = await fetch(`http://localhost:5000/api/swaps?category=${data.category_name}`);
        const similarData = await similarResponse.json();
        setSimilarSwaps(similarData.filter(s => s.id !== parseInt(id)).slice(0, 3));
      }
      
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleProposeSwap = () => {
    setShowSwapForm(true);
  };

  const handleSubmitSwap = (e) => {
    e.preventDefault();
    // TODO: Submit swap proposal
    alert('Swap proposal sent! The owner will review your offer.');
    setShowSwapForm(false);
    setSwapMessage('');
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

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="d-flex flex-column min-vh-100">
        <NavigationBar />
        <Container className="py-5 flex-grow-1 d-flex justify-content-center align-items-center">
          <Spinner animation="border" variant="warning" />
        </Container>
        <Footer />
      </div>
    );
  }

  if (error || !swapItem) {
    return (
      <div className="d-flex flex-column min-vh-100">
        <NavigationBar />
        <Container className="py-5 flex-grow-1">
          <Alert variant="danger">
            <h4>Swap Item Not Found</h4>
            <p>{error || 'The swap item you are looking for does not exist.'}</p>
            <Button as={Link} to="/swap-marketplace" variant="warning">
              Back to Swap Marketplace
            </Button>
          </Alert>
        </Container>
        <Footer />
      </div>
    );
  }

  const images = swapItem.images && swapItem.images.length > 0 
    ? swapItem.images.map(img => img.image_url) 
    : ['🔄'];

  return (
    <div className="d-flex flex-column min-vh-100">
      <NavigationBar />

      <Container className="py-5 flex-grow-1">
        {/* Breadcrumb */}
        <nav aria-label="breadcrumb" className="mb-4">
          <ol className="breadcrumb">
            <li className="breadcrumb-item"><Link to="/">Home</Link></li>
            <li className="breadcrumb-item"><Link to="/swap-marketplace">Swap Marketplace</Link></li>
            <li className="breadcrumb-item active">{swapItem.item_title}</li>
          </ol>
        </nav>

        <Row>
          {/* Swap Item Images */}
          <Col lg={6} className="mb-4">
            <Badge bg="warning" className="mb-2">
              <FaExchangeAlt className="me-1" />
              Available for Swap
            </Badge>
            <Card className="border-0 shadow-sm mb-3">
              <div 
                className="d-flex align-items-center justify-content-center"
                style={{ height: '400px', fontSize: images[selectedImage].startsWith('http') ? '0' : '150px', background: '#f8f9fa' }}
              >
                {images[selectedImage].startsWith('http') ? (
                  <img src={images[selectedImage]} alt={swapItem.item_title} style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }} />
                ) : (
                  images[selectedImage]
                )}
              </div>
            </Card>
            {images.length > 1 && (
              <Row>
                {images.map((img, index) => (
                  <Col xs={3} key={index}>
                    <Card 
                      className={`border-2 cursor-pointer ${selectedImage === index ? 'border-warning' : ''}`}
                      onClick={() => setSelectedImage(index)}
                      style={{ cursor: 'pointer' }}
                    >
                      <div 
                        className="d-flex align-items-center justify-content-center"
                        style={{ height: '80px', fontSize: img.startsWith('http') ? '0' : '40px', background: '#f8f9fa' }}
                      >
                        {img.startsWith('http') ? (
                          <img src={img} alt="" style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }} />
                        ) : (
                          img
                        )}
                      </div>
                    </Card>
                  </Col>
                ))}
              </Row>
            )}
          </Col>

          {/* Swap Item Info */}
          <Col lg={6}>
            <div className="mb-3">
              <Badge bg={getConditionBadge(swapItem.product_condition)} className="mb-2">
                {swapItem.product_condition.replace('_', ' ').toUpperCase()}
              </Badge>
              <h1 className="mb-2">{swapItem.item_title}</h1>
              <div className="d-flex align-items-center gap-3 mb-3">
                <span className="text-muted">
                  <FaClock className="me-1" />
                  {formatDate(swapItem.created_at)}
                </span>
              </div>
            </div>

            <Card className="border-0 shadow-sm mb-3">
              <Card.Body>
                <Alert variant="info" className="mb-3">
                  <FaInfoCircle className="me-2" />
                  <strong>Looking for:</strong> {swapItem.message || 'Open to offers'}
                </Alert>

                <div className="mb-3">
                  <strong>Owner:</strong>
                  <div className="d-flex align-items-center mt-2">
                    <FaUser className="text-primary me-2" />
                    <div>
                      <div>{swapItem.owner_name || 'Anonymous'}</div>
                      <small className="text-muted">
                        <FaCheckCircle className="text-success me-1" />
                        {swapItem.successful_swaps || 0} successful swaps
                      </small>
                    </div>
                  </div>
                </div>

                <div className="mb-3">
                  <strong>Category:</strong> {swapItem.category_name || 'Uncategorized'}
                </div>

                {!showSwapForm ? (
                  <div className="d-grid gap-2">
                    <Button variant="warning" size="lg" onClick={handleProposeSwap}>
                      <FaExchangeAlt className="me-2" />
                      Propose a Swap
                    </Button>
                    <Button variant="outline-primary" size="lg">
                      <FaUser className="me-2" />
                      Contact Owner
                    </Button>
                  </div>
                ) : (
                  <Card className="border-warning">
                    <Card.Body>
                      <h5 className="mb-3">Propose Your Swap</h5>
                      <Form onSubmit={handleSubmitSwap}>
                        <Form.Group className="mb-3">
                          <Form.Label>What are you offering?</Form.Label>
                          <Form.Control
                            as="textarea"
                            rows={3}
                            placeholder="Describe what you want to swap..."
                            value={swapMessage}
                            onChange={(e) => setSwapMessage(e.target.value)}
                            required
                          />
                        </Form.Group>
                        <Form.Group className="mb-3">
                          <Form.Label>Your Item Condition</Form.Label>
                          <Form.Select required>
                            <option value="">Select condition</option>
                            <option value="new">New</option>
                            <option value="like_new">Like New</option>
                            <option value="good">Good</option>
                            <option value="fair">Fair</option>
                          </Form.Select>
                        </Form.Group>
                        <div className="d-flex gap-2">
                          <Button variant="warning" type="submit" className="flex-fill">
                            Send Proposal
                          </Button>
                          <Button 
                            variant="outline-secondary" 
                            onClick={() => setShowSwapForm(false)}
                            className="flex-fill"
                          >
                            Cancel
                          </Button>
                        </div>
                      </Form>
                    </Card.Body>
                  </Card>
                )}
              </Card.Body>
            </Card>

            {/* Swap Guidelines */}
            <Card className="border-0 bg-light">
              <Card.Body>
                <h6 className="mb-2">Swap Guidelines</h6>
                <ul className="small mb-0">
                  <li>Meet in a safe, public location</li>
                  <li>Inspect items before swapping</li>
                  <li>Be honest about item condition</li>
                  <li>Communicate clearly with the owner</li>
                </ul>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Swap Item Details Tabs */}
        <Row className="mt-5">
          <Col>
            <Card className="border-0 shadow-sm">
              <Card.Body>
                <Tabs defaultActiveKey="description" className="mb-3">
                  <Tab eventKey="description" title="Description">
                    <p className="text-muted">{swapItem.description || 'No description available.'}</p>
                  </Tab>
                  <Tab eventKey="specifications" title="Details">
                    <ListGroup variant="flush">
                      <ListGroup.Item className="d-flex justify-content-between">
                        <strong>Condition:</strong>
                        <span>{swapItem.product_condition.replace('_', ' ')}</span>
                      </ListGroup.Item>
                      <ListGroup.Item className="d-flex justify-content-between">
                        <strong>Category:</strong>
                        <span>{swapItem.category_name || 'Uncategorized'}</span>
                      </ListGroup.Item>
                      <ListGroup.Item className="d-flex justify-content-between">
                        <strong>Posted:</strong>
                        <span>{formatDate(swapItem.created_at)}</span>
                      </ListGroup.Item>
                    </ListGroup>
                  </Tab>
                  <Tab eventKey="owner" title="Owner Info">
                    <Card className="border-0 bg-light">
                      <Card.Body>
                        <h5>{swapItem.owner_name || 'Anonymous'}</h5>
                        <p className="mb-0">
                          <FaCheckCircle className="text-success me-2" />
                          {swapItem.successful_swaps || 0} successful swaps
                        </p>
                      </Card.Body>
                    </Card>
                  </Tab>
                </Tabs>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Similar Swap Items */}
        {similarSwaps.length > 0 && (
          <Row className="mt-5">
            <Col>
              <h3 className="mb-4">Similar Swap Items</h3>
              <Row>
                {similarSwaps.map((item) => (
                  <Col md={4} key={item.id}>
                    <Card className="border-0 shadow-sm hover-card mb-3">
                      <Link to={`/swap/${item.id}`} className="text-decoration-none">
                        <div 
                          className="d-flex align-items-center justify-content-center position-relative"
                          style={{ height: '150px', fontSize: item.primary_image?.startsWith('http') ? '0' : '60px', background: '#f8f9fa' }}
                        >
                          {item.primary_image?.startsWith('http') ? (
                            <img src={item.primary_image} alt={item.item_title} style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }} />
                          ) : (
                            '🔄'
                          )}
                          <Badge bg="warning" className="position-absolute top-0 start-0 m-2">
                            <FaExchangeAlt />
                          </Badge>
                        </div>
                      </Link>
                      <Card.Body>
                        <Link to={`/swap/${item.id}`} className="text-decoration-none text-dark">
                          <h6>{item.item_title}</h6>
                        </Link>
                        <p className="text-muted small mb-2">
                          Looking for: {item.message || 'Open to offers'}
                        </p>
                        <Button 
                          as={Link} 
                          to={`/swap/${item.id}`}
                          size="sm" 
                          variant="outline-warning" 
                          className="w-100"
                        >
                          View Details
                        </Button>
                      </Card.Body>
                    </Card>
                  </Col>
                ))}
              </Row>
            </Col>
          </Row>
        )}
      </Container>

      <Footer />
    </div>
  );
}

export default SwapDetail;
