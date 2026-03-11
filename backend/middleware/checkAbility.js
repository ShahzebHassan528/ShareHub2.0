/**
 * CASL Authorization Middleware
 * Checks if user has permission to perform action on subject
 */

const { defineAbilitiesFor } = require('../permissions/ability');
const AppError = require('../utils/AppError');

/**
 * Middleware factory to check abilities
 * @param {string} action - Action to check (create, read, update, delete, manage)
 * @param {string} subject - Subject to check (Product, Order, Donation, etc.)
 * @param {Function} getResource - Optional function to get resource for ownership checks
 * @returns {Function} Express middleware
 */
function checkAbility(action, subject, getResource = null) {
  return async (req, res, next) => {
    try {
      // User must be authenticated (set by authenticate middleware)
      if (!req.user) {
        throw new AppError('Authentication required', 401);
      }

      // Define abilities for user
      const ability = defineAbilitiesFor(req.user);

      // If no resource getter provided, check basic permission
      if (!getResource) {
        if (ability.can(action, subject)) {
          return next();
        }
        throw new AppError('You do not have permission to perform this action', 403);
      }

      // Get resource for ownership check
      const resource = await getResource(req);

      // Check permission with resource
      if (ability.can(action, subject, resource)) {
        return next();
      }

      throw new AppError('You do not have permission to access this resource', 403);

    } catch (error) {
      if (error instanceof AppError) {
        return next(error);
      }
      console.error('Authorization error:', error);
      next(new AppError('Authorization check failed', 500));
    }
  };
}

/**
 * Check if user can perform action (for use in route handlers)
 * @param {Object} req - Express request object
 * @param {string} action - Action to check
 * @param {string} subject - Subject to check
 * @param {Object} resource - Optional resource object
 * @returns {boolean} True if allowed
 */
function can(req, action, subject, resource = {}) {
  if (!req.user) {
    return false;
  }

  const ability = defineAbilitiesFor(req.user);
  return ability.can(action, subject, resource);
}

/**
 * Throw error if user cannot perform action
 * @param {Object} req - Express request object
 * @param {string} action - Action to check
 * @param {string} subject - Subject to check
 * @param {Object} resource - Optional resource object
 * @throws {AppError} If not authorized
 */
function authorize(req, action, subject, resource = {}) {
  if (!can(req, action, subject, resource)) {
    throw new AppError('You do not have permission to perform this action', 403);
  }
}

/**
 * Middleware to check if user is admin
 * @returns {Function} Express middleware
 */
function requireAdmin() {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError('Authentication required', 401));
    }

    if (req.user.role !== 'admin') {
      return next(new AppError('Admin access required', 403));
    }

    next();
  };
}

/**
 * Middleware to check if user has specific role
 * @param {string|Array<string>} roles - Role(s) to check
 * @returns {Function} Express middleware
 */
function requireRole(roles) {
  const allowedRoles = Array.isArray(roles) ? roles : [roles];

  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError('Authentication required', 401));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(new AppError(`Access restricted to: ${allowedRoles.join(', ')}`, 403));
    }

    next();
  };
}

module.exports = {
  checkAbility,
  can,
  authorize,
  requireAdmin,
  requireRole
};
