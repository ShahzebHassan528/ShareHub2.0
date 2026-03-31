/**
 * Seller Pending Approval Page
 * Shown when a seller account is awaiting admin approval
 */

import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const SellerPendingPage = () => {
  const { user } = useAuth();

  return (
    <div className="container py-5" style={{ maxWidth: '600px' }}>
      <div className="card border-0 shadow-sm text-center p-5">
        <div className="mb-4">
          <div
            className="rounded-circle d-inline-flex align-items-center justify-content-center bg-warning bg-opacity-10 mb-3"
            style={{ width: 80, height: 80 }}
          >
            <i className="bi bi-hourglass-split text-warning" style={{ fontSize: 36 }}></i>
          </div>
          <h3 className="fw-bold">Account Pending Approval</h3>
          <p className="text-muted mb-0">
            Hi <strong>{user?.full_name}</strong>, your seller account is under review.
          </p>
        </div>

        <div className="alert alert-warning text-start">
          <i className="bi bi-info-circle me-2"></i>
          Our team typically reviews applications within <strong>1–2 business days</strong>.
          You'll be able to list products and access the full seller dashboard once approved.
        </div>

        <div className="row g-3 mt-2 text-start">
          <div className="col-12">
            <div className="d-flex align-items-start gap-3">
              <div className="rounded-circle bg-primary bg-opacity-10 d-flex align-items-center justify-content-center flex-shrink-0" style={{ width: 40, height: 40 }}>
                <i className="bi bi-1-circle text-primary"></i>
              </div>
              <div>
                <h6 className="mb-0">Application Submitted</h6>
                <small className="text-muted">Your seller registration has been received.</small>
              </div>
            </div>
          </div>
          <div className="col-12">
            <div className="d-flex align-items-start gap-3">
              <div className="rounded-circle bg-warning bg-opacity-10 d-flex align-items-center justify-content-center flex-shrink-0" style={{ width: 40, height: 40 }}>
                <i className="bi bi-2-circle text-warning"></i>
              </div>
              <div>
                <h6 className="mb-0">Under Review</h6>
                <small className="text-muted">Admin is reviewing your application.</small>
              </div>
            </div>
          </div>
          <div className="col-12">
            <div className="d-flex align-items-start gap-3">
              <div className="rounded-circle bg-success bg-opacity-10 d-flex align-items-center justify-content-center flex-shrink-0" style={{ width: 40, height: 40 }}>
                <i className="bi bi-3-circle text-success"></i>
              </div>
              <div>
                <h6 className="mb-0 text-muted">Approved &amp; Active</h6>
                <small className="text-muted">You can list products and manage orders.</small>
              </div>
            </div>
          </div>
        </div>

        <div className="d-flex gap-2 justify-content-center mt-4">
          <Link to="/products" className="btn btn-outline-primary">
            <i className="bi bi-shop me-2"></i>Browse Marketplace
          </Link>
          <Link to="/profile" className="btn btn-outline-secondary">
            <i className="bi bi-person me-2"></i>View Profile
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SellerPendingPage;
