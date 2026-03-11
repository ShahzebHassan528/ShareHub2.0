const express = require('express');
const router = express.Router();
const DashboardController = require('../../controllers/dashboard.controller');
const { authenticate } = require('../../middleware/auth');
const { requireAdmin, requireRole } = require('../../middleware/checkAbility');

console.log('🔧 Dashboard routes initialized with MVC pattern (DashboardController)');

// GET /api/v1/dashboard/stats - Admin dashboard
router.get('/stats', authenticate, requireAdmin(), DashboardController.getAdminStats);

// GET /api/v1/dashboard/seller-stats - Seller dashboard
router.get('/seller-stats', authenticate, requireRole('seller'), DashboardController.getSellerStats);

// GET /api/v1/dashboard/buyer-stats - Buyer dashboard
router.get('/buyer-stats', authenticate, DashboardController.getBuyerStats);

// GET /api/v1/dashboard/ngo-stats - NGO dashboard
router.get('/ngo-stats', authenticate, requireRole('ngo'), DashboardController.getNGOStats);

module.exports = router;