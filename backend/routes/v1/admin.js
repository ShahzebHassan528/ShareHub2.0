/**
 * Admin Routes (MVC Pattern)
 * Uses AdminController for all admin endpoints
 */

const express = require('express');
const router = express.Router();
const AdminController = require('../../controllers/admin.controller');
const { authenticate } = require('../../middleware/auth');
const { requireAdmin } = require('../../middleware/checkAbility');

console.log('🔧 Admin routes initialized with MVC pattern (AdminController)');

// NGO Management
router.get('/ngos/pending', authenticate, requireAdmin(), AdminController.getPendingNGOs);
router.get('/ngos/approved', authenticate, requireAdmin(), AdminController.getApprovedNGOs);
router.put('/ngo/approve/:id', authenticate, requireAdmin(), AdminController.approveNGO);
router.put('/ngo/reject/:id', authenticate, requireAdmin(), AdminController.rejectNGO);

// Seller Management
router.get('/sellers/pending', authenticate, requireAdmin(), AdminController.getPendingSellers);
router.get('/sellers/all', authenticate, requireAdmin(), AdminController.getAllSellers);
router.put('/seller/approve/:id', authenticate, requireAdmin(), AdminController.approveSeller);
router.put('/seller/reject/:id', authenticate, requireAdmin(), AdminController.rejectSeller);

// User Management
router.get('/users', authenticate, requireAdmin(), AdminController.getAllUsers);
router.put('/users/suspend/:id', authenticate, requireAdmin(), AdminController.suspendUser);
router.put('/users/reactivate/:id', authenticate, requireAdmin(), AdminController.reactivateUser);

// Product Moderation
router.get('/products', authenticate, requireAdmin(), AdminController.getAllProducts);
router.put('/products/remove/:id', authenticate, requireAdmin(), AdminController.blockProduct);
router.put('/products/unblock/:id', authenticate, requireAdmin(), AdminController.unblockProduct);

module.exports = router;