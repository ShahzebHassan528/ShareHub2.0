const express = require('express');
const { auth } = require('../middleware/auth');
const User = require('../models/User.sequelize.wrapper');

const router = express.Router();

console.log('🔧 User profile routes initialized');

/**
 * GET /api/users/profile
 * Get current user's profile
 */
router.get('/profile', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    
    console.log(`📋 Fetching profile for user ${userId}`);
    
    const profile = await User.getProfile(userId);
    
    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }
    
    res.json({
      message: 'Profile retrieved successfully',
      profile
    });
    
  } catch (error) {
    console.error('❌ Error fetching profile:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

/**
 * PUT /api/users/profile
 * Update current user's profile
 * Allowed fields: full_name, phone, address, profile_image
 */
router.put('/profile', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { full_name, phone, address, profile_image } = req.body;
    
    console.log(`✏️  Updating profile for user ${userId}`);
    
    // Validation
    const errors = [];
    
    // Validate full_name
    if (full_name !== undefined) {
      if (typeof full_name !== 'string' || full_name.trim().length === 0) {
        errors.push('Full name cannot be empty');
      } else if (full_name.length > 255) {
        errors.push('Full name is too long (max 255 characters)');
      }
    }
    
    // Validate phone
    if (phone !== undefined && phone !== null && phone !== '') {
      if (typeof phone !== 'string') {
        errors.push('Phone must be a string');
      } else if (phone.length > 20) {
        errors.push('Phone number is too long (max 20 characters)');
      } else if (!/^[\d\s\-\+\(\)]+$/.test(phone)) {
        errors.push('Phone number contains invalid characters');
      }
    }
    
    // Validate address
    if (address !== undefined && address !== null && address !== '') {
      if (typeof address !== 'string') {
        errors.push('Address must be a string');
      } else if (address.length > 1000) {
        errors.push('Address is too long (max 1000 characters)');
      }
    }
    
    // Validate profile_image
    if (profile_image !== undefined && profile_image !== null && profile_image !== '') {
      if (typeof profile_image !== 'string') {
        errors.push('Profile image must be a string (URL)');
      } else if (profile_image.length > 500) {
        errors.push('Profile image URL is too long (max 500 characters)');
      } else if (!/^https?:\/\/.+/.test(profile_image)) {
        errors.push('Profile image must be a valid URL');
      }
    }
    
    if (errors.length > 0) {
      return res.status(400).json({ 
        error: 'Validation failed',
        details: errors
      });
    }
    
    // Update profile
    const profileData = {};
    if (full_name !== undefined) profileData.full_name = full_name.trim();
    if (phone !== undefined) profileData.phone = phone === '' ? null : phone.trim();
    if (address !== undefined) profileData.address = address === '' ? null : address.trim();
    if (profile_image !== undefined) profileData.profile_image = profile_image === '' ? null : profile_image.trim();
    
    const updatedProfile = await User.updateProfile(userId, profileData);
    
    console.log(`✅ Profile updated successfully for user ${userId}`);
    
    res.json({
      message: 'Profile updated successfully',
      profile: updatedProfile
    });
    
  } catch (error) {
    console.error('❌ Error updating profile:', error);
    
    if (error.message.includes('No valid fields')) {
      return res.status(400).json({ error: error.message });
    }
    
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

/**
 * GET /api/users/:id/public
 * Get public profile of any user (limited info)
 */
router.get('/:id/public', async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    
    if (isNaN(userId)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }
    
    console.log(`📋 Fetching public profile for user ${userId}`);
    
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Return only public information
    const publicProfile = {
      id: user.id,
      full_name: user.full_name,
      profile_image: user.profile_image,
      role: user.role,
      is_verified: user.is_verified,
      created_at: user.created_at
    };
    
    res.json({
      message: 'Public profile retrieved successfully',
      profile: publicProfile
    });
    
  } catch (error) {
    console.error('❌ Error fetching public profile:', error);
    res.status(500).json({ error: 'Failed to fetch public profile' });
  }
});

module.exports = router;
