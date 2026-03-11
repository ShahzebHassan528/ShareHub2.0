/**
 * Footer Component
 * Global footer
 */

import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-dark text-light py-4 mt-5">
      <div className="container">
        <div className="row">
          <div className="col-md-4 mb-3">
            <h5 className="fw-bold">
              <i className="bi bi-shop me-2"></i>
              Marketplace
            </h5>
            <p className="text-muted">
              Your trusted platform for buying and selling products online.
            </p>
          </div>

          <div className="col-md-4 mb-3">
            <h6 className="fw-bold">Quick Links</h6>
            <ul className="list-unstyled">
              <li><Link to="/about" className="text-muted text-decoration-none">About Us</Link></li>
              <li><Link to="/contact" className="text-muted text-decoration-none">Contact</Link></li>
              <li><Link to="/terms" className="text-muted text-decoration-none">Terms of Service</Link></li>
              <li><Link to="/privacy" className="text-muted text-decoration-none">Privacy Policy</Link></li>
            </ul>
          </div>

          <div className="col-md-4 mb-3">
            <h6 className="fw-bold">Connect With Us</h6>
            <div className="d-flex gap-3">
              <a href="#" className="text-muted">
                <i className="bi bi-facebook fs-4"></i>
              </a>
              <a href="#" className="text-muted">
                <i className="bi bi-twitter fs-4"></i>
              </a>
              <a href="#" className="text-muted">
                <i className="bi bi-instagram fs-4"></i>
              </a>
              <a href="#" className="text-muted">
                <i className="bi bi-linkedin fs-4"></i>
              </a>
            </div>
          </div>
        </div>

        <hr className="border-secondary" />

        <div className="text-center text-muted">
          <p className="mb-0">
            &copy; {new Date().getFullYear()} Marketplace. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
