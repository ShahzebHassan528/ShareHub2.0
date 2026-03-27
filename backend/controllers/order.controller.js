/**
 * Order Controller (MVC Pattern)
 * Handles order-related HTTP requests
 */

const OrderService = require('../services/order.service');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const { Seller } = require('../database/models');

class OrderController {
  /**
   * Create new order
   * POST /api/v1/orders
   */
  static createOrder = catchAsync(async (req, res, next) => {
    const { items, ...orderData } = req.body;

    // OrderService.createOrder(buyerId, items, extraData)
    const order = await OrderService.createOrder(req.user.id, items, orderData);
    
    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: order
    });
  });

  /**
   * Get all orders for current user
   * GET /api/v1/orders
   */
  static getMyOrders = catchAsync(async (req, res, next) => {
    const orders = await OrderService.getOrdersByBuyer(req.user.id);
    
    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders
    });
  });

  /**
   * Get single order by ID
   * GET /api/v1/orders/:id
   */
  static getOrderById = catchAsync(async (req, res, next) => {
    const order = await OrderService.getOrderById(req.params.id);
    
    if (!order) {
      return next(new AppError('Order not found', 404));
    }
    
    // Check ownership
    if (order.buyer_id !== req.user.id && req.user.role !== 'admin') {
      return next(new AppError('You do not have permission to view this order', 403));
    }
    
    res.status(200).json({
      success: true,
      data: order
    });
  });

  /**
   * Update order status
   * PUT /api/v1/orders/:id/status
   */
  static updateOrderStatus = catchAsync(async (req, res, next) => {
    const { status } = req.body;
    
    if (!status) {
      return next(new AppError('Status is required', 400));
    }
    
    const order = await OrderService.updateOrderStatus(req.params.id, status);
    
    res.status(200).json({
      success: true,
      message: 'Order status updated successfully',
      data: order
    });
  });

  /**
   * Cancel order
   * PUT /api/v1/orders/:id/cancel
   */
  static cancelOrder = catchAsync(async (req, res, next) => {
    const order = await OrderService.cancelOrder(req.params.id, req.user.id);
    
    res.status(200).json({
      success: true,
      message: 'Order cancelled successfully',
      data: order
    });
  });

  /**
   * Get orders for seller
   * GET /api/v1/orders/seller
   */
  static getSellerOrders = catchAsync(async (req, res, next) => {
    const seller = await Seller.findOne({ where: { user_id: req.user.id } });
    if (!seller) {
      return next(new AppError('Seller profile required', 400));
    }

    const orders = await OrderService.getOrdersBySeller(seller.id);

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders
    });
  });
}

module.exports = OrderController;
