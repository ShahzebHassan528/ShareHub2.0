/**
 * Auth Controller (MVC Pattern)
 * Handles authentication-related HTTP requests
 */

const AuthService = require('../services/auth.service');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

class AuthController {
  /**
   * Register new user
   * POST /api/v1/auth/register
   */
  static register = catchAsync(async (req, res, next) => {
    const result = await AuthService.register(req.body);

    // Send welcome email (non-blocking)
    const EmailService = require('../services/email.service');
    EmailService.sendWelcome(result.user).catch(console.error);

    res.status(201).json({
      success: true,
      ...result
    });
  });

  /**
   * Login user
   * POST /api/v1/auth/login
   */
  static login = catchAsync(async (req, res, next) => {
    const { email, password } = req.body;
    
    // Validate input
    if (!email || !password) {
      return next(new AppError('Please provide email and password', 400));
    }
    
    const result = await AuthService.login(email, password);
    
    res.status(200).json({
      success: true,
      ...result
    });
  });

  /**
   * Get current user profile
   * GET /api/v1/auth/me
   */
  static getMe = catchAsync(async (req, res, next) => {
    res.status(200).json({
      success: true,
      user: req.user
    });
  });

  /**
   * Refresh token
   * POST /api/v1/auth/refresh
   */
  static refreshToken = catchAsync(async (req, res, next) => {
    const { token } = req.body;
    
    if (!token) {
      return next(new AppError('Token is required', 400));
    }
    
    const newToken = AuthService.refreshToken(token);
    
    res.status(200).json({
      success: true,
      token: newToken
    });
  });

  /**
   * Logout user
   * POST /api/v1/auth/logout
   */
  static logout = catchAsync(async (req, res, next) => {
    // For JWT, logout is handled client-side
    // Future: Add token blacklist here

    res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });
  });

  static forgotPassword = catchAsync(async (req, res, next) => {
    const { email } = req.body;
    if (!email) return next(new AppError('Email is required', 400));

    const { User } = require('../database/models');
    const user = await User.findOne({ where: { email } });
    if (!user) {
      // Don't reveal if email exists
      return res.status(200).json({ success: true, message: 'If that email exists, a reset link has been sent.' });
    }

    const crypto = require('crypto');
    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await user.update({ reset_password_token: token, reset_password_expires: expires });

    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${token}&email=${encodeURIComponent(email)}`;

    const EmailService = require('../services/email.service');
    await EmailService.sendPasswordReset(user, resetUrl);

    console.log(`🔑 Password reset link: ${resetUrl}`);

    res.status(200).json({ success: true, message: 'If that email exists, a reset link has been sent.' });
  });

  static resetPassword = catchAsync(async (req, res, next) => {
    const { token, email, password } = req.body;
    if (!token || !email || !password) return next(new AppError('Token, email and new password are required', 400));
    if (password.length < 6) return next(new AppError('Password must be at least 6 characters', 400));

    const { User } = require('../database/models');
    const { Op } = require('sequelize');
    const user = await User.findOne({
      where: {
        email,
        reset_password_token: token,
        reset_password_expires: { [Op.gt]: new Date() },
      },
    });

    if (!user) return next(new AppError('Invalid or expired reset token', 400));

    const bcrypt = require('bcryptjs');
    const hashed = await bcrypt.hash(password, 12);
    await user.update({ password: hashed, reset_password_token: null, reset_password_expires: null });

    res.status(200).json({ success: true, message: 'Password reset successfully. You can now log in.' });
  });
}

module.exports = AuthController;
