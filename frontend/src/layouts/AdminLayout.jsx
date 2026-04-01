/**
 * AdminLayout
 * Admin panel layout with enhanced sidebar
 */

import { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Sidebar from '../components/layout/Sidebar';
import { useNotifications } from '../hooks/useNotifications';
import './AdminLayout.css';

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const navigate = useNavigate();
  const { unreadCount } = useNotifications();

  return (
    <div className="admin-layout">
      <Navbar />
      <div className="admin-wrapper">
        <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
        <div className={`admin-main ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
          {/* Admin Header */}
          <div className="admin-header">
            <div className="admin-header-content">
              <h1 className="admin-title">
                <i className="bi bi-shield-check"></i>
                Admin Panel
              </h1>
              <div className="admin-actions">
                <button className="admin-btn" onClick={() => navigate('/notifications')} style={{ position: 'relative' }}>
                  <i className="bi bi-bell"></i>
                  {unreadCount > 0 && (
                    <span className="admin-badge">{unreadCount}</span>
                  )}
                </button>
                <button className="admin-btn" onClick={() => navigate('/settings')}>
                  <i className="bi bi-gear"></i>
                </button>
              </div>
            </div>
          </div>

          {/* Admin Content */}
          <div className="admin-content">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
