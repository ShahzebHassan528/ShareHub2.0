const express = require('express');
const router = express.Router();
const DashboardController = require('../../controllers/dashboard.controller');
const { authenticate } = require('../../middleware/auth');
const { requireAdmin, requireRole } = require('../../middleware/checkAbility');

console.log('🔧 Dashboard routes initialized');

router.get('/stats', authenticate, requireAdmin(), DashboardController.getAdminStats);
router.get('/seller-stats', authenticate, requireRole('seller'), DashboardController.getSellerStats);
router.get('/buyer-stats', authenticate, DashboardController.getBuyerStats);
router.get('/ngo-stats', authenticate, requireRole('ngo'), DashboardController.getNGOStats);

module.exports = router;