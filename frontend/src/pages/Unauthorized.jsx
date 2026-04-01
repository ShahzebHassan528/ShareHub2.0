import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function Unauthorized() {
  const { isAuthenticated } = useAuth();

  return (
    <div
      className="d-flex flex-column align-items-center justify-content-center min-vh-100 bg-light px-3"
      style={{ textAlign: 'center' }}
    >
      {/* Faded number */}
      <div style={{ lineHeight: 1 }}>
        <span
          className="fw-black text-warning"
          style={{ fontSize: 'clamp(6rem, 20vw, 10rem)', letterSpacing: '-0.05em', opacity: 0.15 }}
        >
          403
        </span>
      </div>

      {/* Icon */}
      <div
        className="rounded-circle bg-warning bg-opacity-10 d-flex align-items-center justify-content-center mb-4"
        style={{ width: 80, height: 80, marginTop: '-2rem' }}
      >
        <i className="bi bi-shield-lock text-warning" style={{ fontSize: 36 }}></i>
      </div>

      <h1 className="fw-bold mb-2" style={{ fontSize: '1.75rem' }}>Access Denied</h1>
      <p className="text-muted mb-4" style={{ maxWidth: 400 }}>
        You don't have permission to view this page.
        {!isAuthenticated && ' Please sign in with an authorised account to continue.'}
      </p>

      <div className="d-flex flex-wrap gap-3 justify-content-center">
        {!isAuthenticated ? (
          <Link to="/login" className="btn btn-primary">
            <i className="bi bi-box-arrow-in-right me-2"></i>Sign In
          </Link>
        ) : (
          <Link to="/dashboard" className="btn btn-primary">
            <i className="bi bi-speedometer2 me-2"></i>My Dashboard
          </Link>
        )}
        <Link to="/" className="btn btn-outline-secondary">
          <i className="bi bi-house me-2"></i>Home
        </Link>
      </div>

      <p className="text-muted mt-5 small">
        <Link to="/" className="text-decoration-none text-muted fw-semibold">ShareHub</Link>
        {' '}— Marketplace for everyone
      </p>
    </div>
  );
}

export default Unauthorized;
