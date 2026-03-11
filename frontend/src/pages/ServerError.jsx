import { Link } from 'react-router-dom';
import { Container, Button } from 'react-bootstrap';
import { FaHome, FaRedo } from 'react-icons/fa';
import NavigationBar from '../components/Navbar';
import Footer from '../components/Footer';

function ServerError() {
  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="d-flex flex-column min-vh-100">
      <NavigationBar />

      <Container className="flex-grow-1 d-flex align-items-center justify-content-center py-5">
        <div className="text-center">
          <div className="mb-4">
            <span style={{ fontSize: '120px' }}>⚠️</span>
          </div>
          <h1 className="display-1 fw-bold text-danger mb-3">500</h1>
          <h2 className="mb-4">Internal Server Error</h2>
          <p className="lead text-muted mb-4">
            Something went wrong on our end. We're working to fix it!
          </p>
          <div className="d-flex gap-3 justify-content-center">
            <Button onClick={handleRefresh} variant="primary" size="lg">
              <FaRedo className="me-2" />
              Try Again
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

export default ServerError;
