/**
 * User Routes with Centralized Error Handling
 * Example showing how to use catchAsync and AppError
 */

const express = require('express');
const { auth } = require('../middleware/auth');
const { UserService } = require('../services');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

const router = express.Router();

console.log('🔧 User profile routes initialized with centralized error handling');

/**
 * GET /api/users/profile
 * Get current user's profile
 */
router.get('/profile', auth, catchAsync(async (req, res, next) => {
  const profile = await UserService.getProfile(req.user.id);
  
  res.json({
    message: 'Profile retrieved successfully',
    profile
  });
}));

/**
 * PUT /api/users/profile
 * Update current user's profile
 */
router.put('/profile', auth, catchAsync(async (req, res, next) => {
  const profile = await UserService.updateProfile(req.user.id, req.body);
  
  console.log(`✅ Profile updated for user ${req.user.id}`);
  
  res.json({
    message: 'Profile updated successfully',
    profile
  });
}));

/**
 * GET /api/users/:id/public
 * Get public profile of any user
 */
router.get('/:id/public', catchAsync(async (req, res, next) => {
  const userId = parseInt(req.params.id);
  
  if (isNaN(userId)) {
    throw new AppError('Invalid user ID', 400);
  }
  
  const profile = await UserService.getPublicProfile(userId);
  
  res.json({
    message: 'Public profile retrieved successfully',
    profile
  });
}));

module.exports = router;
