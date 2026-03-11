/**
 * API Version 1 Routes
 * Centralized registration for all v1 endpoints
 * All routes use MVC pattern with controllers
 */

const express = require('express');
const router = express.Router();

// Import v1 route modules
const authRoutes = require('./auth');
const productRoutes = require('./products');
const orderRoutes = require('./orders');
const donationRoutes = require('./donations');
const swapRoutes = require('./swaps');
const messageRoutes = require('./messages');
const adminRoutes = require('./admin');
const notificationRoutes = require('./notifications');
const userRoutes = require('./users');
const categoriesRoutes = require('./categories');
const dashboardRoutes = require('./dashboard');
const uploadRoutes = require('./upload');

// Security configuration
const { authLimiter } = require('../../config/security');

console.log('📦 Registering API v1 routes (MVC Pattern)...');

// Register v1 routes
router.use('/auth', authLimiter, authRoutes);
router.use('/products', productRoutes);
router.use('/orders', orderRoutes);
router.use('/donations', donationRoutes);
router.use('/swaps', swapRoutes);
router.use('/messages', messageRoutes);
router.use('/admin', adminRoutes);
router.use('/notifications', notificationRoutes);
router.use('/users', userRoutes);
router.use('/categories', categoriesRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/upload', uploadRoutes);

// v1 API info endpoint
router.get('/', (req, res) => {
  res.json({
    version: '1.0.0',
    message: 'Marketplace API v1 - MVC Architecture',
    architecture: 'Model-View-Controller (MVC)',
    endpoints: {
      auth: '/api/v1/auth',
      products: '/api/v1/products',
      orders: '/api/v1/orders',
      donations: '/api/v1/donations',
      swaps: '/api/v1/swaps',
      messages: '/api/v1/messages',
      admin: '/api/v1/admin',
      notifications: '/api/v1/notifications',
      users: '/api/v1/users',
      categories: '/api/v1/categories',
      dashboard: '/api/v1/dashboard',
      upload: '/api/v1/upload'
    },
    documentation: 'See API_VERSIONING_GUIDE.md and MVC_CONVERSION_COMPLETE.md for details'
  });
});

console.log('✅ API v1 routes registered successfully (MVC Pattern)');

module.exports = router;
