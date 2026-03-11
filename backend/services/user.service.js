/**
 * User Service
 * Business logic for user management and profiles
 */

const User = require('../models/User.sequelize.wrapper');
const { AdminLog } = require('../database/models');
const AppError = require('../utils/AppError');

class UserService {
  /**
   * Get user profile by ID
   * @param {number} userId - User ID
   * @returns {Promise<Object>} User profile (without password)
   */
  static async getProfile(userId) {
    const profile = await User.getProfile(userId);
    if (!profile) {
      throw new AppError('Profile not found', 404);
    }
    return profile;
  }

  /**
   * Update user profile
   * @param {number} userId - User ID
   * @param {Object} profileData - Profile data to update
   * @returns {Promise<Object>} Updated profile
   */
  static async updateProfile(userId, profileData) {
    // Validate allowed fields
    const allowedFields = ['full_name', 'phone', 'address', 'profile_image'];
    const updateData = {};

    for (const field of allowedFields) {
      if (profileData[field] !== undefined) {
        updateData[field] = profileData[field];
      }
    }

    // Validate data
    this.validateProfileData(updateData);

    // Clean data
    if (updateData.full_name) updateData.full_name = updateData.full_name.trim();
    if (updateData.phone) updateData.phone = updateData.phone === '' ? null : updateData.phone.trim();
    if (updateData.address) updateData.address = updateData.address === '' ? null : updateData.address.trim();
    if (updateData.profile_image) updateData.profile_image = updateData.profile_image === '' ? null : updateData.profile_image.trim();

    return await User.updateProfile(userId, updateData);
  }

  /**
   * Get public profile (limited information)
   * @param {number} userId - User ID
   * @returns {Promise<Object>} Public profile
   */
  static async getPublicProfile(userId) {
    const user = await User.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    return {
      id: user.id,
      full_name: user.full_name,
      profile_image: user.profile_image,
      role: user.role,
      is_verified: user.is_verified,
      created_at: user.created_at
    };
  }

  /**
   * Get user by ID
   * @param {number} userId - User ID
   * @returns {Promise<Object>} User data
   */
  static async getUserById(userId) {
    const user = await User.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }
    return user;
  }

  /**
   * Get user by email
   * @param {string} email - User email
   * @returns {Promise<Object>} User data
   */
  static async getUserByEmail(email) {
    const user = await User.findByEmail(email);
    if (!user) {
      throw new AppError('User not found', 404);
    }
    return user;
  }

  /**
   * List users with filters
   * @param {Object} filters - Filter options
   * @returns {Promise<Array>} List of users
   */
  static async listUsers(filters = {}) {
    return await User.findAll(filters);
  }

  /**
   * Suspend user account (admin only)
   * @param {number} userId - User ID to suspend
   * @param {number} adminId - Admin user ID
   * @param {string} reason - Suspension reason
   * @returns {Promise<Object>} Updated user
   */
  static async suspendUser(userId, adminId, reason) {
    const user = await User.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    if (user.role === 'admin') {
      throw new AppError('Cannot suspend admin users', 403);
    }

    if (user.is_suspended) {
      throw new AppError('User is already suspended', 400);
    }

    const updatedUser = await User.update(userId, {
      is_suspended: true,
      suspended_at: new Date(),
      suspended_by: adminId,
      suspension_reason: reason
    });

    // Log admin action
    await AdminLog.create({
      admin_id: adminId,
      action: 'suspend_user',
      target_type: 'user',
      target_id: userId,
      details: JSON.stringify({ reason })
    });

    return updatedUser;
  }

  /**
   * Reactivate suspended user (admin only)
   * @param {number} userId - User ID to reactivate
   * @param {number} adminId - Admin user ID
   * @returns {Promise<Object>} Updated user
   */
  static async reactivateUser(userId, adminId) {
    const user = await User.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    if (!user.is_suspended) {
      throw new AppError('User is not suspended', 400);
    }

    const updatedUser = await User.update(userId, {
      is_suspended: false,
      suspended_at: null,
      suspended_by: null,
      suspension_reason: null
    });

    // Log admin action
    await AdminLog.create({
      admin_id: adminId,
      action: 'reactivate_user',
      target_type: 'user',
      target_id: userId,
      details: null
    });

    return updatedUser;
  }

  /**
   * Validate profile data
   * @param {Object} data - Profile data
   * @throws {Error} Validation error
   */
  static validateProfileData(data) {
    const errors = [];

    if (data.full_name !== undefined) {
      if (typeof data.full_name !== 'string' || data.full_name.trim().length === 0) {
        errors.push('Full name cannot be empty');
      } else if (data.full_name.length > 255) {
        errors.push('Full name is too long (max 255 characters)');
      }
    }

    if (data.phone !== undefined && data.phone !== null && data.phone !== '') {
      if (typeof data.phone !== 'string') {
        errors.push('Phone must be a string');
      } else if (data.phone.length > 20) {
        errors.push('Phone number is too long (max 20 characters)');
      } else if (!/^[\d\s\-\+\(\)]+$/.test(data.phone)) {
        errors.push('Phone number contains invalid characters');
      }
    }

    if (data.address !== undefined && data.address !== null && data.address !== '') {
      if (typeof data.address !== 'string') {
        errors.push('Address must be a string');
      } else if (data.address.length > 1000) {
        errors.push('Address is too long (max 1000 characters)');
      }
    }

    if (data.profile_image !== undefined && data.profile_image !== null && data.profile_image !== '') {
      if (typeof data.profile_image !== 'string') {
        errors.push('Profile image must be a string (URL)');
      } else if (data.profile_image.length > 500) {
        errors.push('Profile image URL is too long (max 500 characters)');
      } else if (!/^https?:\/\/.+/.test(data.profile_image)) {
        errors.push('Profile image must be a valid URL');
      }
    }

    if (errors.length > 0) {
      const error = new AppError('Validation failed', 400);
      error.details = errors;
      throw error;
    }
  }
}

module.exports = UserService;
