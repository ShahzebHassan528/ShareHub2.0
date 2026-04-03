import { useState } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../api/client';
import './Auth.css';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await apiClient.post('/v1/auth/forgot-password', { email });
      setSent(true);
    } catch (err) {
      setError(err.message || 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <div className="auth-icon success"><i className="bi bi-envelope-check"></i></div>
          <h2>Check Your Email</h2>
          <p className="text-muted">If an account exists for <strong>{email}</strong>, a password reset link has been sent.</p>
          <Link to="/login" className="btn-auth-primary w-100 mt-3">Back to Login</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-icon"><i className="bi bi-lock"></i></div>
        <h2>Forgot Password</h2>
        <p className="text-muted mb-4">Enter your email and we'll send you a reset link.</p>
        {error && <div className="auth-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group mb-3">
            <label>Email Address</label>
            <input
              type="email"
              className="form-control"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
            />
          </div>
          <button type="submit" className="btn-auth-primary w-100" disabled={loading}>
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>
        <p className="mt-3 text-center text-muted">
          Remember your password? <Link to="/login">Sign In</Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
