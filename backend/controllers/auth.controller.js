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
}

module.exports = AuthController;
