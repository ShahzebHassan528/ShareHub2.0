/**
 * NGO Pending Verification Page
 * Shown when an NGO account is awaiting admin verification
 */

import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const NgoPendingPage = () => {
  const { user } = useAuth();

  return (
    <div className="container py-5" style={{ maxWidth: '600px' }}>
      <div className="card border-0 shadow-sm text-center p-5">
        <div className="mb-4">
          <div
            className="rounded-circle d-inline-flex align-items-center justify-content-center bg-info bg-opacity-10 mb-3"
            style={{ width: 80, height: 80 }}
          >
            <i className="bi bi-building-check text-info" style={{ fontSize: 36 }}></i>
          </div>
          <h3 className="fw-bold">Verification Pending</h3>
          <p className="text-muted mb-0">
            Hi <strong>{user?.full_name}</strong>, your NGO account is awaiting verification.
          </p>
        </div>

        <div className="alert alert-info text-start">
          <i className="bi bi-info-circle me-2"></i>
          Our team verifies NGO credentials to ensure trust and transparency on the platform.
          Verification typically takes <strong>2–3 business days</strong>.
        </div>

        <div className="row g-3 mt-2 text-start">
          <div className="col-12">
            <div className="d-flex align-items-start gap-3">
              <div className="rounded-circle bg-primary bg-opacity-10 d-flex align-items-center justify-content-center flex-shrink-0" style={{ width: 40, height: 40 }}>
                <i className="bi bi-1-circle text-primary"></i>
              </div>
              <div>
                <h6 className="mb-0">Registration Submitted</h6>
                <small className="text-muted">Your NGO registration has been received.</small>
              </div>
            </div>
          </div>
          <div className="col-12">
            <div className="d-flex align-items-start gap-3">
              <div className="rounded-circle bg-info bg-opacity-10 d-flex align-items-center justify-content-center flex-shrink-0" style={{ width: 40, height: 40 }}>
                <i className="bi bi-2-circle text-info"></i>
              </div>
              <div>
                <h6 className="mb-0">Credentials Under Review</h6>
                <small className="text-muted">Admin is verifying your NGO credentials.</small>
              </div>
            </div>
          </div>
          <div className="col-12">
            <div className="d-flex align-items-start gap-3">
              <div className="rounded-circle bg-success bg-opacity-10 d-flex align-items-center justify-content-center flex-shrink-0" style={{ width: 40, height: 40 }}>
                <i className="bi bi-3-circle text-success"></i>
              </div>
              <div>
                <h6 className="mb-0 text-muted">Verified &amp; Active</h6>
                <small className="text-muted">You can receive and manage donations.</small>
              </div>
            </div>
          </div>
        </div>

        <div className="d-flex gap-2 justify-content-center mt-4">
          <Link to="/ngos" className="btn btn-outline-info">
            <i className="bi bi-building me-2"></i>Browse NGOs
          </Link>
          <Link to="/profile" className="btn btn-outline-secondary">
            <i className="bi bi-person me-2"></i>View Profile
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NgoPendingPage;
