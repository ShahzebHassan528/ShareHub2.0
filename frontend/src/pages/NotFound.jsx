import { Link } from 'react-router-dom';
import { Container, Button } from 'react-bootstrap';
import { FaHome, FaSearch } from 'react-icons/fa';
import NavigationBar from '../components/Navbar';
import Footer from '../components/Footer';

function NotFound() {
  return (
    <div className="d-flex flex-column min-vh-100">
      <NavigationBar />

      <Container className="flex-grow-1 d-flex align-items-center justify-content-center py-5">
        <div className="text-center">
          <div className="mb-4">
            <span style={{ fontSize: '120px' }}>🔍</span>
          </div>
          <h1 className="display-1 fw-bold text-primary mb-3">404</h1>
          <h2 className="mb-4">Page Not Found</h2>
          <p className="lead text-muted mb-4">
            Oops! The page you're looking for doesn't exist or has been moved.
          </p>
          <div className="d-flex gap-3 justify-content-center">
            <Button as={Link} to="/" variant="primary" size="lg">
              <FaHome className="me-2" />
              Go Home
            </Button>
            <Button as={Link} to="/browse" variant="outline-primary" size="lg">
              <FaSearch className="me-2" />
              Browse Products
            </Button>
          </div>
        </div>
      </Container>

      <Footer />
    </div>
  );
}

export default NotFound;
