/**
 * Sidebar Component
 * Dashboard navigation sidebar with role-based menu items
 */

import { NavLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './Sidebar.css';

const Sidebar = ({ isOpen, onToggle }) => {
  const { user } = useAuth();

  // Menu items based on user role
  const getMenuItems = () => {
    const commonItems = [
      { path: '/dashboard', icon: 'bi-speedometer2', label: 'Dashboard', roles: ['buyer', 'seller', 'admin'] },
      { path: '/profile', icon: 'bi-person', label: 'Profile', roles: ['buyer', 'seller', 'admin'] },
    ];

    const buyerItems = [
      { path: '/my-orders', icon: 'bi-bag-check', label: 'My Orders', roles: ['buyer'] },
      { path: '/favorites', icon: 'bi-heart', label: 'Favorites', roles: ['buyer'] },
    ];

    const sellerItems = [
      { path: '/my-products', icon: 'bi-box-seam', label: 'My Products', roles: ['seller'] },
      { path: '/add-product', icon: 'bi-plus-circle', label: 'Add Product', roles: ['seller'] },
      { path: '/sales', icon: 'bi-graph-up', label: 'Sales', roles: ['seller'] },
    ];

    const adminItems = [
      { path: '/admin/dashboard', icon: 'bi-speedometer2', label: 'Overview', roles: ['admin'] },
      { path: '/admin/users', icon: 'bi-people', label: 'Manage Users', roles: ['admin'] },
      { path: '/admin/sellers', icon: 'bi-shop', label: 'Sellers', roles: ['admin'] },
      { path: '/admin/ngos', icon: 'bi-building', label: 'NGOs', roles: ['admin'] },
      { path: '/admin/products', icon: 'bi-box-seam', label: 'Products', roles: ['admin'] },
    ];

    const allItems = [...commonItems, ...buyerItems, ...sellerItems, ...adminItems];
    
    // Filter based on user role
    return allItems.filter(item => item.roles.includes(user?.role));
  };

  const menuItems = getMenuItems();

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div className="sidebar-overlay" onClick={onToggle}></div>
      )}

      <aside className={`sidebar ${isOpen ? 'open' : 'closed'}`}>
        {/* Sidebar Header */}
        <div className="sidebar-header">
          <div className="sidebar-brand">
            <i className="bi bi-shop"></i>
            {isOpen && <span>Dashboard</span>}
          </div>
          <button onClick={onToggle} className="sidebar-toggle-btn">
            <i className={`bi ${isOpen ? 'bi-chevron-left' : 'bi-chevron-right'}`}></i>
          </button>
        </div>

        {/* User Info */}
        {isOpen && (
          <div className="sidebar-user-info">
            <img 
              src={user?.avatar || '/default-avatar.png'} 
              alt={user?.name}
              className="sidebar-user-avatar"
            />
            <div className="sidebar-user-details">
              <p className="sidebar-user-name">{user?.name}</p>
              <span className="sidebar-user-role">{user?.role}</span>
            </div>
          </div>
        )}

        {/* Navigation Menu */}
        <nav className="sidebar-nav">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => 
                `sidebar-link ${isActive ? 'active' : ''}`
              }
              title={!isOpen ? item.label : ''}
            >
              <i className={`bi ${item.icon}`}></i>
              {isOpen && <span>{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* Sidebar Footer */}
        <div className="sidebar-footer">
          <NavLink to="/settings" className="sidebar-link">
            <i className="bi bi-gear"></i>
            {isOpen && <span>Settings</span>}
          </NavLink>
          
          <NavLink to="/help" className="sidebar-link">
            <i className="bi bi-question-circle"></i>
            {isOpen && <span>Help</span>}
          </NavLink>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
