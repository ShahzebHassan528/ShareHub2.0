import { Container } from 'react-bootstrap';
import { FaTools } from 'react-icons/fa';

function Maintenance() {
  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center" 
         style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      <Container>
        <div className="text-center text-white">
          <div className="mb-4">
            <FaTools size={100} />
          </div>
          <h1 className="display-3 fw-bold mb-4">Under Maintenance</h1>
          <p className="lead mb-4">
            We're currently performing scheduled maintenance to improve your experience.
          </p>
          <p className="mb-0">
            We'll be back shortly. Thank you for your patience!
          </p>
        </div>
      </Container>
    </div>
  );
}

export default Maintenance;
