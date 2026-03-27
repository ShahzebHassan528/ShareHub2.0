/**
 * Settings Page
 * Admin/user settings and preferences
 */

import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';

const Settings = () => {
  const { user } = useAuth();
  const toast = useToast();

  const [notifications, setNotifications] = useState({
    emailOrders: true,
    emailProducts: true,
    emailSystem: false,
  });

  const handleToggle = (key) => {
    setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = () => {
    toast.success('Settings saved successfully!');
  };

  return (
    <div className="container py-4" style={{ maxWidth: '700px' }}>
      <h2 className="mb-4">
        <i className="bi bi-gear me-2"></i>
        Settings
      </h2>

      {/* Account Info */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body">
          <h5 className="card-title mb-3">Account Information</h5>
          <div className="mb-2">
            <span className="text-muted">Name:</span>
            <span className="ms-2 fw-semibold">{user?.full_name || '—'}</span>
          </div>
          <div className="mb-2">
            <span className="text-muted">Email:</span>
            <span className="ms-2 fw-semibold">{user?.email || '—'}</span>
          </div>
          <div className="mb-2">
            <span className="text-muted">Role:</span>
            <span className="ms-2 badge bg-primary text-capitalize">{user?.role || '—'}</span>
          </div>
          <a href="/profile" className="btn btn-sm btn-outline-primary mt-2">
            Edit Profile
          </a>
        </div>
      </div>

      {/* Notification Preferences */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body">
          <h5 className="card-title mb-3">Notification Preferences</h5>

          {[
            { key: 'emailOrders', label: 'Email notifications for new orders' },
            { key: 'emailProducts', label: 'Email notifications for product updates' },
            { key: 'emailSystem', label: 'System & maintenance alerts' },
          ].map(({ key, label }) => (
            <div key={key} className="d-flex justify-content-between align-items-center py-2 border-bottom">
              <span>{label}</span>
              <div className="form-check form-switch mb-0">
                <input
                  className="form-check-input"
                  type="checkbox"
                  checked={notifications[key]}
                  onChange={() => handleToggle(key)}
                  style={{ cursor: 'pointer' }}
                />
              </div>
            </div>
          ))}

          <button className="btn btn-primary mt-3" onClick={handleSave}>
            Save Preferences
          </button>
        </div>
      </div>

      {/* System Info (admin only) */}
      {user?.role === 'admin' && (
        <div className="card border-0 shadow-sm">
          <div className="card-body">
            <h5 className="card-title mb-3">System</h5>
            <div className="mb-2">
              <span className="text-muted">Environment:</span>
              <span className="ms-2">Development</span>
            </div>
            <div className="mb-2">
              <span className="text-muted">API Base:</span>
              <span className="ms-2 font-monospace">http://localhost:5000/api/v1</span>
            </div>
            <div className="mb-2">
              <span className="text-muted">Frontend:</span>
              <span className="ms-2 font-monospace">http://localhost:3000</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
