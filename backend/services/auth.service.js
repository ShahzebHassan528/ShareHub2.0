/**
 * Authentication Service
 * Business logic for user authentication and registration
 */

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User.sequelize.wrapper');
const Seller = require('../models/Seller.sequelize.wrapper');
const NGO = require('../models/NGO.sequelize.wrapper');
const AppError = require('../utils/AppError');
const { sequelize } = require('../config/sequelize');
const JobService = require('./job.service');

class AuthService {
  /**
   * Register a new user with role-specific profile
   * Uses transaction to ensure atomic operation
   * @param {Object} userData - User registration data
   * @returns {Promise<Object>} Created user with token
   */
  static async register(userData) {
    const { email, password, full_name, phone, role, ...additionalData } = userData;

    // Validate role
    if (!['buyer', 'seller', 'ngo'].includes(role)) {
      throw new AppError('Invalid role. Must be buyer, seller, or ngo', 400);
    }

    // Check if user already exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      throw new AppError('Email already registered', 400);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Buyers are auto-verified, sellers and NGOs need approval
    const isVerified = role === 'buyer';

    // Use transaction for atomic user + profile creation
    const transaction = await sequelize.transaction();
    
    try {
      // Create user
      const userId = await User.create({
        email,
        password: hashedPassword,
        full_name,
        phone,
        role,
        is_verified: isVerified
      }, { transaction });

      // Create role-specific profile
      if (role === 'seller') {
        await Seller.create({
          user_id: userId,
          business_name: additionalData.business_name,
          business_address: additionalData.business_address,
          business_license: additionalData.business_license,
          tax_id: additionalData.tax_id
        }, { transaction });
      } else if (role === 'ngo') {
        await NGO.create({
          user_id: userId,
          ngo_name: additionalData.ngo_name,
          registration_number: additionalData.registration_number,
          address: additionalData.address,
          website: additionalData.website,
          description: additionalData.description,
          certificate_document: additionalData.certificate_document
        }, { transaction });
      }

      // Commit transaction
      await transaction.commit();

      // Enqueue welcome email (async, don't wait)
      JobService.enqueueWelcomeEmail({
        email,
        full_name
      }).catch(err => {
        console.error('Failed to enqueue welcome email:', err.message);
      });

      // Generate JWT token
      const token = this.generateToken(userId, role);

      // Generate role-specific message
      let message = 'Account created successfully';
      if (role === 'buyer') {
        message = 'Account created successfully! You can start shopping now.';
      } else if (role === 'seller') {
        message = 'Seller account created! Waiting for admin approval.';
      } else if (role === 'ngo') {
        message = 'NGO account created! Waiting for admin verification.';
      }

      return {
        message,
        token,
        user: { id: userId, email, full_name, role, is_verified: isVerified }
      };
    } catch (error) {
      // Rollback transaction on error
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * Authenticate user and generate token
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise<Object>} User data with token
   */
  static async login(email, password) {
    // Find user by email
    const user = await User.findByEmail(email);
    if (!user) {
      throw new AppError('Invalid credentials', 401);
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new AppError('Invalid credentials', 401);
    }

    // Check if account is active
    if (!user.is_active) {
      throw new AppError('Account is deactivated', 403);
    }

    // Check if account is suspended
    if (user.is_suspended) {
      throw new AppError(
        `Account suspended: ${user.suspension_reason || 'Please contact support'}`,
        403
      );
    }

    // Generate JWT token
    const token = this.generateToken(user.id, user.role);

    return {
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
        is_verified: user.is_verified
      }
    };
  }

  /**
   * Generate JWT token
   * @param {number} userId - User ID
   * @param {string} role - User role
   * @returns {string} JWT token
   */
  static generateToken(userId, role) {
    return jwt.sign(
      { id: userId, role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
  }

  /**
   * Verify JWT token
   * @param {string} token - JWT token
   * @returns {Object} Decoded token payload
   */
  static verifyToken(token) {
    try {
      return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      // JWT errors will be caught by global error handler
      throw error;
    }
  }

  /**
   * Refresh JWT token
   * @param {string} oldToken - Old JWT token
   * @returns {string} New JWT token
   */
  static refreshToken(oldToken) {
    const decoded = this.verifyToken(oldToken);
    return this.generateToken(decoded.id, decoded.role);
  }
}

module.exports = AuthService;
