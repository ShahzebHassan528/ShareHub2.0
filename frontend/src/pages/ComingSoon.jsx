import { Link } from 'react-router-dom';
import { Container, Button } from 'react-bootstrap';
import { FaHome, FaRocket } from 'react-icons/fa';
import NavigationBar from '../components/Navbar';
import Footer from '../components/Footer';

function ComingSoon() {
  return (
    <div className="d-flex flex-column min-vh-100">
      <NavigationBar />

      <Container className="flex-grow-1 d-flex align-items-center justify-content-center py-5">
        <div className="text-center">
          <div className="mb-4">
            <FaRocket size={100} className="text-primary" />
          </div>
          <h1 className="display-3 fw-bold mb-4">Coming Soon!</h1>
          <p className="lead text-muted mb-4">
            This feature is currently under development. Stay tuned for updates!
          </p>
          <Button as={Link} to="/" variant="primary" size="lg">
            <FaHome className="me-2" />
            Back to Home
          </Button>
        </div>
      </Container>

      <Footer />
    </div>
  );
}

export default ComingSoon;
