/**
 * User Controller (MVC Pattern)
 * Handles user-related HTTP requests
 */

const UserService = require('../services/user.service');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const { Seller, NGO } = require('../database/models');

class UserController {
  /**
   * Get user profile
   * GET /api/v1/users/profile
   */
  static getProfile = catchAsync(async (req, res, next) => {
    const user = await UserService.getUserById(req.user.id);

    if (!user) {
      return next(new AppError('User not found', 404));
    }

    let profileExtra = {};
    if (user.role === 'seller') {
      const seller = await Seller.findOne({ where: { user_id: req.user.id } });
      if (seller) profileExtra.approval_status = seller.approval_status;
    }
    if (user.role === 'ngo') {
      const ngo = await NGO.findOne({ where: { user_id: req.user.id } });
      if (ngo) profileExtra.verification_status = ngo.verification_status;
    }

    res.status(200).json({
      success: true,
      data: { ...user, ...profileExtra }
    });
  });

  /**
   * Update user profile
   * PUT /api/v1/users/profile
   */
  static updateProfile = catchAsync(async (req, res, next) => {
    const updatedUser = await UserService.updateUser(req.user.id, req.body);
    
    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: updatedUser
    });
  });

  /**
   * Get all users (Admin only)
   * GET /api/v1/users
   */
  static getAllUsers = catchAsync(async (req, res, next) => {
    const filters = {
      role: req.query.role,
      is_suspended: req.query.is_suspended
    };
    
    const users = await UserService.getAllUsers(filters);
    
    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  });

  /**
   * Get user by ID (Admin only)
   * GET /api/v1/users/:id
   */
  static getUserById = catchAsync(async (req, res, next) => {
    const user = await UserService.getUserById(req.params.id);
    
    if (!user) {
      return next(new AppError('User not found', 404));
    }
    
    res.status(200).json({
      success: true,
      data: user
    });
  });

  /**
   * Suspend user (Admin only)
   * PUT /api/v1/users/:id/suspend
   */
  static suspendUser = catchAsync(async (req, res, next) => {
    const { reason } = req.body;
    
    if (!reason) {
      return next(new AppError('Suspension reason is required', 400));
    }
    
    const user = await UserService.suspendUser(req.params.id, req.user.id, reason);
    
    res.status(200).json({
      success: true,
      message: 'User suspended successfully',
      data: user
    });
  });

  /**
   * Reactivate user (Admin only)
   * PUT /api/v1/users/:id/reactivate
   */
  static reactivateUser = catchAsync(async (req, res, next) => {
    const user = await UserService.reactivateUser(req.params.id);
    
    res.status(200).json({
      success: true,
      message: 'User reactivated successfully',
      data: user
    });
  });

  /**
   * Delete user account
   * DELETE /api/v1/users/profile
   */
  static deleteAccount = catchAsync(async (req, res, next) => {
    await UserService.deleteUser(req.user.id);
    
    res.status(200).json({
      success: true,
      message: 'Account deleted successfully'
    });
  });
}

module.exports = UserController;
