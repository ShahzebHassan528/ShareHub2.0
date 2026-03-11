import { Link } from 'react-router-dom';
import { Container, Button } from 'react-bootstrap';
import { FaHome, FaSignInAlt } from 'react-icons/fa';
import NavigationBar from '../components/Navbar';
import Footer from '../components/Footer';

function Unauthorized() {
  return (
    <div className="d-flex flex-column min-vh-100">
      <NavigationBar />

      <Container className="flex-grow-1 d-flex align-items-center justify-content-center py-5">
        <div className="text-center">
          <div className="mb-4">
            <span style={{ fontSize: '120px' }}>🔒</span>
          </div>
          <h1 className="display-1 fw-bold text-warning mb-3">403</h1>
          <h2 className="mb-4">Access Denied</h2>
          <p className="lead text-muted mb-4">
            You don't have permission to access this page.
          </p>
          <div className="d-flex gap-3 justify-content-center">
            <Button as={Link} to="/signin" variant="primary" size="lg">
              <FaSignInAlt className="me-2" />
              Sign In
            </Button>
            <Button as={Link} to="/" variant="outline-primary" size="lg">
              <FaHome className="me-2" />
              Go Home
            </Button>
          </div>
        </div>
      </Container>

      <Footer />
    </div>
  );
}

export default Unauthorized;
