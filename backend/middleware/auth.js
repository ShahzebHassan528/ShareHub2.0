const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user || !user.is_active) {
      return res.status(401).json({ error: 'Invalid authentication' });
    }

    // Check if user is suspended
    if (user.is_suspended) {
      return res.status(403).json({ 
        error: 'Account suspended', 
        message: 'Your account has been suspended. Please contact support.',
        suspension_reason: user.suspension_reason
      });
    }

    req.user = user;
    req.token = token;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid authentication' });
  }
};

const checkRole = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Access denied' });
    }
    next();
  };
};

/**
 * Role-based authorization middleware
 * @param {Array<string>} roles - Allowed roles
 * @returns {Function} Middleware function
 */
const authorize = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    if (!roles.includes(req.user.role)) {
      console.log(`⚠️  Access denied: User role '${req.user.role}' not in allowed roles [${roles.join(', ')}]`);
      return res.status(403).json({ error: 'Access denied. Admin privileges required.' });
    }
    
    console.log(`✅ Authorization passed: User role '${req.user.role}' is authorized`);
    next();
  };
};

module.exports = { 
  auth, 
  authenticate: auth, // Alias for CASL compatibility
  checkRole, 
  authorize 
};
