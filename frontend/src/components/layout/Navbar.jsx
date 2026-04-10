/**
 * Enhanced Navbar Component
 * Professional marketplace navigation with search, cart, and user menu
 */

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import { useNotifications } from '../../hooks/useNotifications';
import { useMessageCount } from '../../hooks/useMessageCount';
import './Navbar.css';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { unreadCount } = useNotifications();
  const { unreadCount: unreadMessages } = useMessageCount();
  const { getItemCount } = useCart();
  const navigate = useNavigate();
  const cartCount = getItemCount();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <nav className="navbar-layout">
      <div className="navbar-container">
        {/* Logo */}
        <Link to="/" className="navbar-logo">
          <i className="bi bi-shop"></i>
          <span>Share<span className="logo-highlight">Hub</span></span>
        </Link>

        {/* Mobile Menu Toggle */}
        <button 
          className="mobile-menu-toggle"
          onClick={() => setShowMobileMenu(!showMobileMenu)}
        >
          <i className={`bi ${showMobileMenu ? 'bi-x' : 'bi-list'}`}></i>
        </button>

        {/* Navigation Links */}
        <div className={`navbar-links ${showMobileMenu ? 'mobile-open' : ''}`}>
          {/* Admin-specific nav */}
          {user?.role === 'admin' ? (
            <Link to="/admin/dashboard" className="nav-link">
              <i className="bi bi-shield-check"></i>
              <span>Admin Panel</span>
            </Link>
          ) : (
            <>
              <Link to="/" className="nav-link">
                <i className="bi bi-house"></i>
                <span>Home</span>
              </Link>

              <Link to="/products" className="nav-link">
                <i className="bi bi-grid"></i>
                <span>Products</span>
              </Link>

              <Link to="/swaps/explore" className="nav-link">
                <i className="bi bi-arrow-left-right"></i>
                <span>Swap</span>
              </Link>

              <Link to="/ngos" className="nav-link">
                <i className="bi bi-heart"></i>
                <span>NGOs</span>
              </Link>

              {isAuthenticated && (
                <Link to="/products/add" className="nav-link nav-link-highlight">
                  <i className="bi bi-plus-circle"></i>
                  <span>Sell Item</span>
                </Link>
              )}
            </>
          )}
        </div>

        {/* Right Section - Login or User Menu */}
        {isAuthenticated ? (
          <div className="navbar-right">
            <Link to="/dashboard" className="nav-link">
              <i className="bi bi-speedometer2"></i>
              <span>Dashboard</span>
            </Link>

            {user?.role !== 'admin' && (
              <Link to="/cart" className="nav-link" style={{ position: 'relative' }}>
                <i className="bi bi-bag"></i>
                {cartCount > 0 && (
                  <span className="notification-badge">{cartCount}</span>
                )}
              </Link>
            )}

            <Link to="/messages" className="nav-link" style={{ position: 'relative' }}>
              <i className="bi bi-chat-dots"></i>
              {unreadMessages > 0 && (
                <span className="notification-badge">{unreadMessages}</span>
              )}
            </Link>

            <Link to="/notifications" className="nav-link" style={{ position: 'relative' }}>
              <i className="bi bi-bell"></i>
              {unreadCount > 0 && (
                <span className="notification-badge">{unreadCount}</span>
              )}
            </Link>

            {/* User Menu */}
            <div className="user-menu-wrapper">
              <button 
                className="user-menu-trigger"
                onClick={() => setShowUserMenu(!showUserMenu)}
              >
                <img 
                  src={user?.avatar || '/default-avatar.png'} 
                  alt={user?.name}
                  className="user-avatar"
                />
                <span className="user-name">{user?.name}</span>
                <i className="bi bi-chevron-down"></i>
              </button>

              {showUserMenu && (
                <div className="user-dropdown">
                  <div className="dropdown-header">
                    <p className="user-email">{user?.email}</p>
                    <span className="user-role">{user?.role}</span>
                  </div>
                  
                  <div className="dropdown-divider"></div>
                  
                  <Link to="/dashboard" className="dropdown-item">
                    <i className="bi bi-speedometer2"></i>
                    Dashboard
                  </Link>
                  
                  <Link to="/profile" className="dropdown-item">
                    <i className="bi bi-person"></i>
                    Profile
                  </Link>
                  
                  <Link to="/messages" className="dropdown-item">
                    <i className="bi bi-chat-dots"></i>
                    Messages
                    {unreadMessages > 0 && (
                      <span className="notification-badge" style={{ position: 'static', marginLeft: 'auto' }}>{unreadMessages}</span>
                    )}
                  </Link>

                  <Link to="/notifications" className="dropdown-item">
                    <i className="bi bi-bell"></i>
                    Notifications
                  </Link>

                  <div className="dropdown-divider"></div>
                  
                  <button onClick={handleLogout} className="dropdown-item logout">
                    <i className="bi bi-box-arrow-right"></i>
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <Link to="/login" className="nav-link btn-login">
            <i className="bi bi-box-arrow-in-right"></i>
            <span>Login</span>
          </Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
