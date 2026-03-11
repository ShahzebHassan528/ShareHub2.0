/**
 * Role Configuration
 * Defines user roles and their default dashboard routes
 */

export const ROLES = {
  USER: 'user',
  BUYER: 'buyer',
  SELLER: 'seller',
  NGO: 'ngo',
  ADMIN: 'admin',
};

// Default dashboard routes for each role
export const ROLE_DASHBOARDS = {
  [ROLES.USER]: '/user/dashboard',
  [ROLES.BUYER]: '/buyer/dashboard',
  [ROLES.SELLER]: '/seller/products',
  [ROLES.NGO]: '/ngo/donations',
  [ROLES.ADMIN]: '/admin/dashboard',
};

// Get dashboard route for a specific role
export const getDashboardRoute = (role) => {
  return ROLE_DASHBOARDS[role] || '/user/dashboard';
};

// Check if user has specific role
export const hasRole = (user, role) => {
  return user?.role === role;
};

// Check if user has any of the specified roles
export const hasAnyRole = (user, roles) => {
  return roles.includes(user?.role);
};

export default ROLES;
