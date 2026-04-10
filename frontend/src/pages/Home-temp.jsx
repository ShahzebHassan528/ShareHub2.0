import { useState, useEffect } from 'react';
import { Container, Row, Col, Button, Card, Badge, Nav, Navbar } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import './Home.css';

const HomePage = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="home-page">
      {/* Navbar */}
      <Navbar 
        fixed="top" 
        expand="lg" 
        className={`home-navbar ${scrolled ? 'scrolled' : ''}`}
      >
        <Container>
          <Navbar.Brand as={Link} to="/" className="brand-logo">
            ShareHub
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="navbar-nav" />
          <Navbar.Collapse id="navbar-nav">
            <Nav className="mx-auto">
              <Nav.Link href="#features">Features</Nav.Link>
              <Nav.Link href="#categories">Categories</Nav.Link>
              <Nav.Link href="#how-it-works">How It Works</Nav.Link>
              <Nav.Link href="#ngos">NGOs</Nav.Link>
            </Nav>
            <div className="d-flex gap-2">
              <Button variant="outline-primary" size="sm">Log In</Button>
              <Button variant="primary" size="sm">Get Started</Button>
            </div>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      {/* Hero Section */}
      <section className="hero-section">
        <Container>
          <Row className="align-items-center g-5">
            <Col lg={6} className="hero-content">
              <div className="animate-fade-in">
                <Badge bg="primary" className="hero-badge mb-3">
                  Community-Powered Sharing
                </Badge>
                <h1 className="hero-title">
                  Share More, <span className="text-primary">Waste Less</span>
                </h1>
                <p className="hero-description">
                  Sell, donate, or swap clothes, books, and rations with your community. 
                  Build connections while reducing waste and supporting those in need.
                </p>
                <div className="hero-buttons">
                  <Button variant="primary" size="lg">
                    Start Sharing
                  </Button>
                  <Button variant="outline-primary" size="lg">
                    Browse Items
                  </Button>
                </div>
                <Row className="hero-stats mt-5">
                  <Col xs={4} className="text-center">
                    <div className="stat-value">2K+</div>
                    <div className="stat-label">Active Users</div>
                  </Col>
                  <Col xs={4} className="text-center">
                    <div className="stat-value">10K+</div>
                    <div className="stat-label">Items Shared</div>
                  </Col>
                  <Col xs={4} className="text-center">
                    <div className="stat-value">50+</div>
                    <div className="stat-label">NGOs Partnered</div>
                  </Col>
                </Row>
              </div>
            </Col>
            <Col lg={6} className="hero-image-col">
              <div className="hero-image-wrapper animate-scale-in">
                <img 
                  src="https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=800" 
                  alt="Community sharing" 
                  className="hero-image"
                />
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Features Section */}
      <section id="features" className="features-section">
        <Container>
          <div className="section-header text-center mb-5">
            <h2 className="section-title">Everything You Need to Share</h2>
            <p className="section-description">
              A complete platform for selling, donating, and swapping items within your community.
            </p>
          </div>
          <Row className="g-4">
            {[
              {
                icon: 'bi-bag',
                title: 'Sell Items',
                description: 'List your unused items at fair prices and connect with local buyers easily.'
              },
              {
                icon: 'bi-heart',
                title: 'Donate Goods',
                description: 'Give to individuals or verified NGOs. Every donation creates a ripple of kindness.'
              },
              {
                icon: 'bi-arrow-left-right',
                title: 'Swap & Exchange',
                description: 'Trade items you no longer need for something you do. Zero cost, maximum value.'
              },
              {
                icon: 'bi-geo-alt',
                title: 'Location Search',
                description: 'Find items and people nearby using integrated map-based search.'
              },
              {
                icon: 'bi-shield-check',
                title: 'Verified NGOs',
                description: 'Partner organizations are verified to ensure your donations reach the right hands.'
              },
              {
                icon: 'bi-people',
                title: 'Community First',
                description: 'Build connections in your neighborhood while promoting sustainable living.'
              }
            ].map((feature, index) => (
              <Col key={index} md={6} lg={4}>
                <Card className="feature-card h-100 border-0 shadow-sm">
                  <Card.Body className="p-4">
                    <div className="feature-icon-wrapper mb-3">
                      <i className={`bi ${feature.icon} feature-icon`}></i>
                    </div>
                    <h3 className="feature-title">{feature.title}</h3>
                    <p className="feature-description">{feature.description}</p>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* Categories Section */}
      <section id="categories" className="categories-section">
        <Container>
          <div className="section-header text-center mb-5">
            <h2 className="section-title">What Can You Share?</h2>
            <p className="section-description">
              Three categories focused on maximum community impact.
            </p>
          </div>
          <Row className="g-4 justify-content-center">
            {[
              { emoji: '👕', name: 'Clothes', description: 'Shirts, pants, dresses, and more' },
              { emoji: '📚', name: 'Books', description: 'Textbooks, novels, and educational material' },
              { emoji: '🍚', name: 'Ration Items', description: 'Food packages and essential supplies' }
            ].map((category, index) => (
              <Col key={index} md={4}>
                <Card className="category-card text-center border-0 shadow-sm h-100">
                  <Card.Body className="p-5">
                    <div className="category-emoji mb-3">{category.emoji}</div>
                    <h3 className="category-title">{category.name}</h3>
                    <p className="category-description">{category.description}</p>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="how-it-works-section">
        <Container>
          <div className="section-header text-center mb-5">
            <h2 className="section-title">How It Works</h2>
            <p className="section-description">
              Four simple steps to start making a difference.
            </p>
          </div>
          <Row className="g-4">
            {[
              { step: '01', title: 'Create an Account', description: 'Sign up in seconds with your email' },
              { step: '02', title: 'List Your Items', description: 'Upload photos, set category and type' },
              { step: '03', title: 'Connect Locally', description: 'Find nearby buyers, donors, or swappers' },
              { step: '04', title: 'Share & Impact', description: 'Complete the exchange and make a difference' }
            ].map((step, index) => (
              <Col key={index} md={6} lg={3}>
                <div className="step-card text-center">
                  <div className="step-number">{step.step}</div>
                  <h3 className="step-title">{step.title}</h3>
                  <p className="step-description">{step.description}</p>
                </div>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* NGO Section */}
      <section id="ngos" className="ngo-section">
        <Container>
          <Card className="ngo-card border-0 shadow-lg text-center">
            <Card.Body className="p-5">
              <h2 className="ngo-title">Are You an NGO?</h2>
              <p className="ngo-description">
                Register your organization on ShareHub to receive direct donations from community members.
                Get verified and start receiving clothes, books, and rations for those who need them most.
              </p>
              <Button variant="light" size="lg" className="mt-3">
                Register Your NGO
              </Button>
            </Card.Body>
          </Card>
        </Container>
      </section>

      {/* Footer */}
      <footer className="home-footer">
        <Container>
          <Row className="g-4">
            <Col md={3}>
              <h3 className="footer-brand">ShareHub</h3>
              <p className="footer-description">
                A community-based platform promoting responsible sharing of household items.
              </p>
            </Col>
            <Col md={3}>
              <h4 className="footer-heading">Platform</h4>
              <ul className="footer-links">
                <li><a href="#">Browse Items</a></li>
                <li><a href="#">Sell</a></li>
                <li><a href="#">Donate</a></li>
                <li><a href="#">Swap</a></li>
              </ul>
            </Col>
            <Col md={3}>
              <h4 className="footer-heading">Community</h4>
              <ul className="footer-links">
                <li><a href="#">NGO Partners</a></li>
                <li><a href="#">About Us</a></li>
                <li><a href="#">Contact</a></li>
              </ul>
            </Col>
            <Col md={3}>
              <h4 className="footer-heading">Legal</h4>
              <ul className="footer-links">
                <li><a href="#">Privacy Policy</a></li>
                <li><a href="#">Terms of Service</a></li>
              </ul>
            </Col>
          </Row>
          <div className="footer-bottom text-center mt-5 pt-4">
            © 2026 ShareHub. Built for communities, by communities.
          </div>
        </Container>
      </footer>
    </div>
  );
};

export default HomePage;
