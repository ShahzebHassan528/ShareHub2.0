import { useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import apiClient from '../api/client';
import './Auth.css';

const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');
  const email = searchParams.get('email');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirm) { setError('Passwords do not match'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters'); return; }
    setError('');
    setLoading(true);
    try {
      await apiClient.post('/v1/auth/reset-password', { token, email, password });
      setDone(true);
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  if (!token || !email) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <div className="auth-icon error"><i className="bi bi-exclamation-circle"></i></div>
          <h2>Invalid Link</h2>
          <p className="text-muted">This password reset link is invalid or has expired.</p>
          <Link to="/forgot-password" className="btn-auth-primary w-100 mt-3">Request New Link</Link>
        </div>
      </div>
    );
  }

  if (done) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <div className="auth-icon success"><i className="bi bi-check-circle"></i></div>
          <h2>Password Reset!</h2>
          <p className="text-muted">Your password has been updated. Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-icon"><i className="bi bi-shield-lock"></i></div>
        <h2>Set New Password</h2>
        <p className="text-muted mb-4">Choose a strong password for your account.</p>
        {error && <div className="auth-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group mb-3">
            <label>New Password</label>
            <input type="password" className="form-control" value={password} onChange={e => setPassword(e.target.value)} required placeholder="Min 6 characters" />
          </div>
          <div className="form-group mb-3">
            <label>Confirm Password</label>
            <input type="password" className="form-control" value={confirm} onChange={e => setConfirm(e.target.value)} required placeholder="Repeat password" />
          </div>
          <button type="submit" className="btn-auth-primary w-100" disabled={loading}>
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
