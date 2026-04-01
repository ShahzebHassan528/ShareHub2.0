import { Link, useNavigate } from 'react-router-dom';

function NotFound() {
  const navigate = useNavigate();

  return (
    <div
      className="d-flex flex-column align-items-center justify-content-center min-vh-100 bg-light px-3"
      style={{ textAlign: 'center' }}
    >
      {/* Animated number */}
      <div style={{ lineHeight: 1 }}>
        <span
          className="fw-black text-primary"
          style={{ fontSize: 'clamp(6rem, 20vw, 10rem)', letterSpacing: '-0.05em', opacity: 0.15 }}
        >
          404
        </span>
      </div>

      {/* Icon */}
      <div
        className="rounded-circle bg-primary bg-opacity-10 d-flex align-items-center justify-content-center mb-4"
        style={{ width: 80, height: 80, marginTop: '-2rem' }}
      >
        <i className="bi bi-compass text-primary" style={{ fontSize: 36 }}></i>
      </div>

      <h1 className="fw-bold mb-2" style={{ fontSize: '1.75rem' }}>Page Not Found</h1>
      <p className="text-muted mb-4" style={{ maxWidth: 400 }}>
        The page you're looking for doesn't exist or has been moved. Check the URL or head back.
      </p>

      <div className="d-flex flex-wrap gap-3 justify-content-center">
        <button onClick={() => navigate(-1)} className="btn btn-outline-secondary">
          <i className="bi bi-arrow-left me-2"></i>Go Back
        </button>
        <Link to="/" className="btn btn-primary">
          <i className="bi bi-house me-2"></i>Home
        </Link>
        <Link to="/products" className="btn btn-outline-primary">
          <i className="bi bi-grid me-2"></i>Browse Products
        </Link>
      </div>

      {/* Footer note */}
      <p className="text-muted mt-5 small">
        <Link to="/" className="text-decoration-none text-muted fw-semibold">ShareHub</Link>
        {' '}— Marketplace for everyone
      </p>
    </div>
  );
}

export default NotFound;
