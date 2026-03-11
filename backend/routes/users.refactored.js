/**
 * User Routes (Refactored with Service Layer)
 * This is an example of how to refactor routes to use the service layer
 * 
 * MIGRATION GUIDE:
 * 1. Keep the original users.js file as-is (backward compatibility)
 * 2. Test this refactored version thoroughly
 * 3. Once tested, rename users.js to users.old.js
 * 4. Rename this file to users.js
 */

const express = require('express');
const { auth } = require('../middleware/auth');
const { UserService } = require('../services');

const router = express.Router();

console.log('🔧 User profile routes initialized with Service Layer');

/**
 * GET /api/users/profile
 * Get current user's profile
 */
router.get('/profile', auth, async (req, res) => {
  try {
    const profile = await UserService.getProfile(req.user.id);
    
    res.json({
      message: 'Profile retrieved successfully',
      profile
    });
  } catch (error) {
    console.error('❌ Error fetching profile:', error.message);
    
    if (error.message === 'Profile not found') {
      return res.status(404).json({ error: error.message });
    }
    
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

/**
 * PUT /api/users/profile
 * Update current user's profile
 */
router.put('/profile', auth, async (req, res) => {
  try {
    const profile = await UserService.updateProfile(req.user.id, req.body);
    
    console.log(`✅ Profile updated for user ${req.user.id}`);
    
    res.json({
      message: 'Profile updated successfully',
      profile
    });
  } catch (error) {
    console.error('❌ Error updating profile:', error.message);
    
    if (error.message === 'Validation failed') {
      return res.status(400).json({
        error: error.message,
        details: error.details
      });
    }
    
    if (error.message.includes('No valid fields')) {
      return res.status(400).json({ error: error.message });
    }
    
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

/**
 * GET /api/users/:id/public
 * Get public profile of any user
 */
router.get('/:id/public', async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    
    if (isNaN(userId)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }
    
    const profile = await UserService.getPublicProfile(userId);
    
    res.json({
      message: 'Public profile retrieved successfully',
      profile
    });
  } catch (error) {
    console.error('❌ Error fetching public profile:', error.message);
    
    if (error.message === 'User not found') {
      return res.status(404).json({ error: error.message });
    }
    
    res.status(500).json({ error: 'Failed to fetch public profile' });
  }
});

module.exports = router;
