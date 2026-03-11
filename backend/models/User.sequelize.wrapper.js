/**
 * User Model - Sequelize Implementation
 * 
 * This is a Sequelize-based implementation that maintains the same API
 * as the raw SQL version for backward compatibility.
 * 
 * Migration Status: ✅ Ready to use
 * Original: models/User.js (raw SQL)
 * New: models/User.sequelize.wrapper.js (Sequelize)
 */

const { User: UserModel } = require('../database/models');

class User {
  /**
   * Create a new user
   * @param {Object} userData - User data
   * @returns {Promise<number>} - User ID
   */
  static async create(userData) {
    console.log('🔷 [Sequelize] User.create() called with email:', userData.email);
    try {
      const user = await UserModel.create({
        email: userData.email,
        password: userData.password,
        full_name: userData.full_name,
        phone: userData.phone,
        role: userData.role,
        is_verified: userData.is_verified || false
      });
      
      console.log('✅ [Sequelize] User created successfully with ID:', user.id);
      // Return just the ID to match raw SQL behavior
      return user.id;
    } catch (error) {
      console.error('❌ [Sequelize] User.create() failed:', error.message);
      // Handle unique constraint violation
      if (error.name === 'SequelizeUniqueConstraintError') {
        throw new Error('Email already exists');
      }
      throw error;
    }
  }

  /**
   * Find user by email
   * @param {string} email - User email
   * @returns {Promise<Object|undefined>} - User object or undefined
   */
  static async findByEmail(email) {
    console.log('🔷 [Sequelize] User.findByEmail() called with email:', email);
    const user = await UserModel.findOne({
      where: { email },
      raw: true // Return plain object to match raw SQL behavior
    });
    
    console.log(user ? '✅ [Sequelize] User found' : 'ℹ️  [Sequelize] User not found');
    return user || undefined;
  }

  /**
   * Find user by ID
   * @param {number} id - User ID
   * @returns {Promise<Object|undefined>} - User object or undefined
   */
  static async findById(id) {
    console.log('🔷 [Sequelize] User.findById() called with ID:', id);
    const user = await UserModel.findByPk(id, {
      raw: true // Return plain object to match raw SQL behavior
    });
    
    console.log(user ? '✅ [Sequelize] User found' : 'ℹ️  [Sequelize] User not found');
    return user || undefined;
  }

  /**
   * Update user verification status
   * @param {number} id - User ID
   * @param {boolean} isVerified - Verification status
   * @returns {Promise<void>}
   */
  static async updateVerification(id, isVerified) {
    console.log('🔷 [Sequelize] User.updateVerification() called for ID:', id, 'isVerified:', isVerified);
    await UserModel.update(
      { is_verified: isVerified },
      { where: { id } }
    );
    console.log('✅ [Sequelize] User verification updated successfully');
  }

  /**
   * Find all users (additional method for admin features)
   * @param {Object} options - Query options
   * @returns {Promise<Array>} - Array of users
   */
  static async findAll(options = {}) {
    const users = await UserModel.findAll({
      where: options.where || {},
      limit: options.limit,
      offset: options.offset,
      order: options.order || [['created_at', 'DESC']],
      raw: true
    });
    
    return users;
  }

  /**
   * Count users
   * @param {Object} where - Where conditions
   * @returns {Promise<number>} - Count
   */
  static async count(where = {}) {
    return await UserModel.count({ where });
  }

  /**
   * Update user
   * @param {number} id - User ID
   * @param {Object} updates - Fields to update
   * @returns {Promise<boolean>} - True if updated
   */
  static async update(id, updates) {
    const [affectedRows] = await UserModel.update(updates, {
      where: { id }
    });
    
    return affectedRows > 0;
  }

  /**
   * Delete user (soft delete by setting is_active = false)
   * @param {number} id - User ID
   * @returns {Promise<boolean>} - True if deleted
   */
  static async delete(id) {
    const [affectedRows] = await UserModel.update(
      { is_active: false },
      { where: { id } }
    );
    
    return affectedRows > 0;
  }

  /**
   * Find user with related data (Sequelize-specific feature)
   * @param {number} id - User ID
   * @param {Object} options - Include options
   * @returns {Promise<Object|null>} - User with relations
   */
  static async findByIdWithRelations(id, options = {}) {
    const { Seller, NGO } = require('../database/models');
    
    const includes = [];
    
    if (options.includeSeller) {
      includes.push({
        model: Seller,
        as: 'sellerProfile',
        required: false
      });
    }
    
    if (options.includeNGO) {
      includes.push({
        model: NGO,
        as: 'ngoProfile',
        required: false
      });
    }
    
    const user = await UserModel.findByPk(id, {
      include: includes
    });
    
    return user ? user.toJSON() : null;
  }

  /**
   * Suspend user
   * @param {number} userId - User ID
   * @param {number} adminId - Admin ID
   * @param {string} reason - Suspension reason
   * @returns {Promise<void>}
   */
  static async suspend(userId, adminId, reason) {
    console.log('🔷 [Sequelize] User.suspend() called for user:', userId);
    await UserModel.update(
      {
        is_suspended: true,
        suspended_at: new Date(),
        suspended_by: adminId,
        suspension_reason: reason
      },
      { where: { id: userId } }
    );
    console.log('✅ [Sequelize] User suspended successfully');
  }

  /**
   * Reactivate suspended user
   * @param {number} userId - User ID
   * @returns {Promise<void>}
   */
  static async reactivate(userId) {
    console.log('🔷 [Sequelize] User.reactivate() called for user:', userId);
    await UserModel.update(
      {
        is_suspended: false,
        suspended_at: null,
        suspended_by: null,
        suspension_reason: null
      },
      { where: { id: userId } }
    );
    console.log('✅ [Sequelize] User reactivated successfully');
  }

  /**
   * Find all users with optional filters
   * @param {Object} filters - Filter options
   * @returns {Promise<Array>} - Array of users
   */
  static async findAllUsers(filters = {}) {
    console.log('🔷 [Sequelize] User.findAllUsers() called');
    const whereClause = {};
    
    if (filters.role) {
      whereClause.role = filters.role;
    }
    
    if (filters.is_suspended !== undefined) {
      whereClause.is_suspended = filters.is_suspended;
    }
    
    const users = await UserModel.findAll({
      where: whereClause,
      attributes: ['id', 'email', 'full_name', 'phone', 'role', 'is_active', 'is_verified', 'is_suspended', 'created_at'],
      order: [['created_at', 'DESC']],
      raw: true
    });
    
    console.log(`✅ [Sequelize] Found ${users.length} users`);
    return users;
  }

  /**
   * Get user profile (safe - excludes password)
   * @param {number} userId - User ID
   * @returns {Promise<Object|null>} - User profile
   */
  static async getProfile(userId) {
    console.log('🔷 [Sequelize] User.getProfile() called for ID:', userId);
    const user = await UserModel.findByPk(userId, {
      attributes: {
        exclude: ['password', 'suspended_by', 'suspension_reason']
      },
      raw: true
    });
    
    console.log(user ? '✅ [Sequelize] Profile found' : 'ℹ️  [Sequelize] Profile not found');
    return user || null;
  }

  /**
   * Update user profile
   * @param {number} userId - User ID
   * @param {Object} profileData - Profile data to update
   * @returns {Promise<Object>} - Updated user profile
   */
  static async updateProfile(userId, profileData) {
    console.log('🔷 [Sequelize] User.updateProfile() called for ID:', userId);
    
    // Only allow updating specific fields
    const allowedFields = ['full_name', 'phone', 'address', 'profile_image'];
    const updateData = {};
    
    allowedFields.forEach(field => {
      if (profileData[field] !== undefined) {
        updateData[field] = profileData[field];
      }
    });
    
    if (Object.keys(updateData).length === 0) {
      throw new Error('No valid fields to update');
    }
    
    await UserModel.update(updateData, {
      where: { id: userId }
    });
    
    // Return updated profile
    const updatedProfile = await this.getProfile(userId);
    
    console.log('✅ [Sequelize] Profile updated successfully');
    return updatedProfile;
  }
}

module.exports = User;
