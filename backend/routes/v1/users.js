/**
 * User Routes (MVC Pattern)
 * Uses UserController for all user endpoints
 */

const express = require('express');
const router = express.Router();
const UserController = require('../../controllers/user.controller');
const { authenticate } = require('../../middleware/auth');
const { requireAdmin } = require('../../middleware/checkAbility');

console.log('🔧 User routes initialized with MVC pattern (UserController)');

// GET /api/v1/users/profile - Get current user profile
router.get('/profile', authenticate, UserController.getProfile);

// PUT /api/v1/users/profile - Update current user profile
router.put('/profile', authenticate, UserController.updateProfile);

// DELETE /api/v1/users/profile - Delete account
router.delete('/profile', authenticate, UserController.deleteAccount);

// GET /api/v1/users - Get all users (Admin only)
router.get('/', authenticate, requireAdmin(), UserController.getAllUsers);

// GET /api/v1/users/:id - Get user by ID (Admin only)
router.get('/:id', authenticate, requireAdmin(), UserController.getUserById);

// PUT /api/v1/users/:id/suspend - Suspend user (Admin only)
router.put('/:id/suspend', authenticate, requireAdmin(), UserController.suspendUser);

// PUT /api/v1/users/:id/reactivate - Reactivate user (Admin only)
router.put('/:id/reactivate', authenticate, requireAdmin(), UserController.reactivateUser);

module.exports = router;
