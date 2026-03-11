/**
 * Legacy API Routes (Backward Compatibility)
 * Maps /api/* to existing route handlers
 * 
 * DEPRECATED: Use /api/v1/* instead
 * These routes are maintained for backward compatibility only
 */

const express = require('express');
const router = express.Router();

// Import existing route modules
const authRoutes = require('./auth');
const productRoutes = require('./products');
const swapRoutes = require('./swaps');
const messageRoutes = require('./messages');
const adminRoutes = require('./admin');
const notificationRoutes = require('./notifications');
const userRoutes = require('./users');
const categoriesRoutes = require('./categories');
const dashboardRoutes = require('./dashboard');

// Security configuration
const { authLimiter } = require('../config/security');

console.log('📦 Registering legacy API routes (backward compatibility)...');

// Register legacy routes (same as before)
router.use('/auth', authLimiter, authRoutes);
router.use('/products', productRoutes);
router.use('/swaps', swapRoutes);
router.use('/messages', messageRoutes);
router.use('/admin', adminRoutes);
router.use('/notifications', notificationRoutes);
router.use('/users', userRoutes);
router.use('/categories', categoriesRoutes);
router.use('/dashboard', dashboardRoutes);

// Legacy API info endpoint
router.get('/', (req, res) => {
  res.json({ 
    message: 'Backend API is running!',
    notice: 'This is the legacy API endpoint. Please migrate to /api/v1/*',
    current_version: 'v1',
    versioned_endpoint: '/api/v1',
    migration_guide: 'See API_VERSIONING_GUIDE.md'
  });
});

console.log('✅ Legacy API routes registered successfully');

module.exports = router;
