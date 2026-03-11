/**
 * Admin Controller (MVC Pattern)
 * Handles admin-related HTTP requests
 */

const NGO = require('../models/NGO.sequelize.wrapper');
const User = require('../models/User.sequelize.wrapper');
const Product = require('../models/Product.sequelize.wrapper');
const Seller = require('../models/Seller.sequelize.wrapper');
const { AdminLog: AdminLogModel, Product: ProductModel, Seller: SellerModel, User: UserModel } = require('../database/models');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

class AdminController {
  /**
   * Get pending NGOs for verification
   * GET /api/v1/admin/ngos/pending
   */
  static getPendingNGOs = catchAsync(async (req, res, next) => {
    const pendingNGOs = await NGO.findPending();
    
    res.status(200).json({
      success: true,
      count: pendingNGOs.length,
      data: pendingNGOs
    });
  });

  /**
   * Get approved NGOs
   * GET /api/v1/admin/ngos/approved
   */
  static getApprovedNGOs = catchAsync(async (req, res, next) => {
    const approvedNGOs = await NGO.findApproved();
    
    res.status(200).json({
      success: true,
      count: approvedNGOs.length,
      data: approvedNGOs
    });
  });

  /**
   * Approve NGO
   * PUT /api/v1/admin/ngo/approve/:id
   */
  static approveNGO = catchAsync(async (req, res, next) => {
    const ngoId = parseInt(req.params.id);
    const adminId = req.user.id;
    
    // Check if NGO exists
    const ngo = await NGO.findById(ngoId);
    if (!ngo) {
      return next(new AppError('NGO not found', 404));
    }
    
    // Check if already approved
    if (ngo.verification_status === 'approved') {
      return next(new AppError('NGO is already approved', 400));
    }
    
    // Approve NGO
    await NGO.approve(ngoId, adminId);
    
    // Log admin action
    await AdminLogModel.create({
      admin_id: adminId,
      action: 'approve_ngo',
      target_type: 'ngo',
      target_id: ngoId,
      details: JSON.stringify({
        ngo_name: ngo.ngo_name,
        registration_number: ngo.registration_number,
        previous_status: ngo.verification_status
      })
    });
    
    res.status(200).json({
      success: true,
      message: 'NGO approved successfully',
      ngo_id: ngoId,
      status: 'approved'
    });
  });

  /**
   * Reject NGO
   * PUT /api/v1/admin/ngo/reject/:id
   */
  static rejectNGO = catchAsync(async (req, res, next) => {
    const ngoId = parseInt(req.params.id);
    const adminId = req.user.id;
    const { reason } = req.body;
    
    // Validate rejection reason
    if (!reason || reason.trim().length === 0) {
      return next(new AppError('Rejection reason is required', 400));
    }
    
    // Check if NGO exists
    const ngo = await NGO.findById(ngoId);
    if (!ngo) {
      return next(new AppError('NGO not found', 404));
    }
    
    // Check if already rejected
    if (ngo.verification_status === 'rejected') {
      return next(new AppError('NGO is already rejected', 400));
    }
    
    // Reject NGO
    await NGO.reject(ngoId, adminId, reason);
    
    // Log admin action
    await AdminLogModel.create({
      admin_id: adminId,
      action: 'reject_ngo',
      target_type: 'ngo',
      target_id: ngoId,
      details: JSON.stringify({
        ngo_name: ngo.ngo_name,
        registration_number: ngo.registration_number,
        previous_status: ngo.verification_status,
        rejection_reason: reason
      })
    });
    
    res.status(200).json({
      success: true,
      message: 'NGO rejected successfully',
      ngo_id: ngoId,
      status: 'rejected',
      reason: reason
    });
  });

  /**
   * Get all users with filters
   * GET /api/v1/admin/users
   */
  static getAllUsers = catchAsync(async (req, res, next) => {
    const filters = {
      role: req.query.role,
      is_suspended: req.query.is_suspended === 'true' ? true : req.query.is_suspended === 'false' ? false : undefined
    };
    
    const users = await User.findAllUsers(filters);
    
    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  });

  /**
   * Suspend user
   * PUT /api/v1/admin/users/suspend/:id
   */
  static suspendUser = catchAsync(async (req, res, next) => {
    const userId = parseInt(req.params.id);
    const adminId = req.user.id;
    const { reason } = req.body;
    
    // Validate reason
    if (!reason || reason.trim().length === 0) {
      return next(new AppError('Suspension reason is required', 400));
    }
    
    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return next(new AppError('User not found', 404));
    }
    
    // Prevent suspending admin users
    if (user.role === 'admin') {
      return next(new AppError('Cannot suspend admin users', 403));
    }
    
    // Check if already suspended
    if (user.is_suspended) {
      return next(new AppError('User is already suspended', 400));
    }
    
    // Suspend user
    await User.suspend(userId, adminId, reason);
    
    // Log admin action
    await AdminLogModel.create({
      admin_id: adminId,
      action: 'suspend_user',
      target_type: 'user',
      target_id: userId,
      details: JSON.stringify({
        user_email: user.email,
        user_role: user.role,
        suspension_reason: reason
      })
    });
    
    res.status(200).json({
      success: true,
      message: 'User suspended successfully',
      user_id: userId,
      suspended: true
    });
  });

  /**
   * Reactivate suspended user
   * PUT /api/v1/admin/users/reactivate/:id
   */
  static reactivateUser = catchAsync(async (req, res, next) => {
    const userId = parseInt(req.params.id);
    const adminId = req.user.id;
    
    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return next(new AppError('User not found', 404));
    }
    
    // Check if user is suspended
    if (!user.is_suspended) {
      return next(new AppError('User is not suspended', 400));
    }
    
    // Reactivate user
    await User.reactivate(userId);
    
    // Log admin action
    await AdminLogModel.create({
      admin_id: adminId,
      action: 'reactivate_user',
      target_type: 'user',
      target_id: userId,
      details: JSON.stringify({
        user_email: user.email,
        user_role: user.role
      })
    });
    
    res.status(200).json({
      success: true,
      message: 'User reactivated successfully',
      user_id: userId,
      suspended: false
    });
  });

  /**
   * Block product
   * PUT /api/v1/admin/products/remove/:id
   */
  static blockProduct = catchAsync(async (req, res, next) => {
    const productId = parseInt(req.params.id);
    const adminId = req.user.id;
    const { reason } = req.body;
    
    // Validate reason
    if (!reason || reason.trim().length === 0) {
      return next(new AppError('Block reason is required', 400));
    }
    
    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return next(new AppError('Product not found', 404));
    }
    
    // Check if already blocked
    if (product.product_status === 'blocked') {
      return next(new AppError('Product is already blocked', 400));
    }
    
    // Block product
    await Product.block(productId, adminId, reason);
    
    // Log admin action
    await AdminLogModel.create({
      admin_id: adminId,
      action: 'block_product',
      target_type: 'product',
      target_id: productId,
      details: JSON.stringify({
        product_title: product.title,
        seller_id: product.seller_id,
        block_reason: reason
      })
    });
    
    res.status(200).json({
      success: true,
      message: 'Product blocked successfully',
      product_id: productId,
      status: 'blocked'
    });
  });

  /**
   * Unblock product
   * PUT /api/v1/admin/products/unblock/:id
   */
  static unblockProduct = catchAsync(async (req, res, next) => {
    const productId = parseInt(req.params.id);
    const adminId = req.user.id;
    
    const product = await Product.findById(productId);
    if (!product) return next(new AppError('Product not found', 404));
    if (product.product_status !== 'blocked') return next(new AppError('Product is not blocked', 400));
    
    await Product.unblock(productId);
    await AdminLogModel.create({
      admin_id: adminId, action: 'unblock_product', target_type: 'product', target_id: productId,
      details: JSON.stringify({ product_title: product.title })
    });
    
    res.status(200).json({ success: true, message: 'Product unblocked successfully', product_id: productId, status: 'active' });
  });

  /**
   * Get all products for admin
   * GET /api/v1/admin/products
   */
  static getAllProducts = catchAsync(async (req, res, next) => {
    const products = await ProductModel.findAll({
      include: [{ model: SellerModel, as: 'seller', include: [{ model: UserModel, as: 'user', attributes: ['full_name', 'email'] }] }],
      order: [['created_at', 'DESC']],
    });
    res.status(200).json({ success: true, count: products.length, data: products });
  });

  /**
   * Get pending sellers
   * GET /api/v1/admin/sellers/pending
   */
  static getPendingSellers = catchAsync(async (req, res, next) => {
    const sellers = await Seller.findPending();
    res.status(200).json({ success: true, count: sellers.length, data: sellers });
  });

  /**
   * Get all sellers
   * GET /api/v1/admin/sellers/all
   */
  static getAllSellers = catchAsync(async (req, res, next) => {
    const sellers = await SellerModel.findAll({
      include: [{ model: UserModel, as: 'user', attributes: ['email', 'full_name', 'phone', 'is_suspended'] }],
      order: [['created_at', 'DESC']],
    });
    const result = sellers.map(s => {
      const d = s.toJSON();
      return { ...d, email: d.user?.email, full_name: d.user?.full_name, phone: d.user?.phone, is_suspended: d.user?.is_suspended, user: undefined };
    });
    res.status(200).json({ success: true, count: result.length, data: result });
  });

  /**
   * Approve seller
   * PUT /api/v1/admin/seller/approve/:id
   */
  static approveSeller = catchAsync(async (req, res, next) => {
    const sellerId = parseInt(req.params.id);
    const adminId = req.user.id;
    const seller = await SellerModel.findByPk(sellerId);
    if (!seller) return next(new AppError('Seller not found', 404));
    if (seller.approval_status === 'approved') return next(new AppError('Seller already approved', 400));
    await Seller.approve(sellerId, adminId);
    await AdminLogModel.create({
      admin_id: adminId, action: 'approve_seller', target_type: 'seller', target_id: sellerId,
      details: JSON.stringify({ business_name: seller.business_name })
    });
    res.status(200).json({ success: true, message: 'Seller approved successfully', seller_id: sellerId, status: 'approved' });
  });

  /**
   * Reject seller
   * PUT /api/v1/admin/seller/reject/:id
   */
  static rejectSeller = catchAsync(async (req, res, next) => {
    const sellerId = parseInt(req.params.id);
    const adminId = req.user.id;
    const { reason } = req.body;
    if (!reason || reason.trim().length === 0) return next(new AppError('Rejection reason is required', 400));
    const seller = await SellerModel.findByPk(sellerId);
    if (!seller) return next(new AppError('Seller not found', 404));
    if (seller.approval_status === 'rejected') return next(new AppError('Seller already rejected', 400));
    await Seller.reject(sellerId, adminId, reason);
    await AdminLogModel.create({
      admin_id: adminId, action: 'reject_seller', target_type: 'seller', target_id: sellerId,
      details: JSON.stringify({ business_name: seller.business_name, reason })
    });
    res.status(200).json({ success: true, message: 'Seller rejected successfully', seller_id: sellerId, status: 'rejected' });
  });
}

module.exports = AdminController;