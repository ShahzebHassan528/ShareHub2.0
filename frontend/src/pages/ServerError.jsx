import { Link } from 'react-router-dom';

function ServerError() {
  return (
    <div
      className="d-flex flex-column align-items-center justify-content-center min-vh-100 bg-light px-3"
      style={{ textAlign: 'center' }}
    >
      {/* Faded number */}
      <div style={{ lineHeight: 1 }}>
        <span
          className="fw-black text-danger"
          style={{ fontSize: 'clamp(6rem, 20vw, 10rem)', letterSpacing: '-0.05em', opacity: 0.15 }}
        >
          500
        </span>
      </div>

      {/* Icon */}
      <div
        className="rounded-circle bg-danger bg-opacity-10 d-flex align-items-center justify-content-center mb-4"
        style={{ width: 80, height: 80, marginTop: '-2rem' }}
      >
        <i className="bi bi-exclamation-triangle text-danger" style={{ fontSize: 36 }}></i>
      </div>

      <h1 className="fw-bold mb-2" style={{ fontSize: '1.75rem' }}>Server Error</h1>
      <p className="text-muted mb-4" style={{ maxWidth: 400 }}>
        Something went wrong on our end. Our team has been notified. Please try again in a moment.
      </p>

      <div className="d-flex flex-wrap gap-3 justify-content-center">
        <button onClick={() => window.location.reload()} className="btn btn-danger">
          <i className="bi bi-arrow-clockwise me-2"></i>Try Again
        </button>
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

export default ServerError;
