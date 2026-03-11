/**
 * Orders Routes with CASL Authorization
 * Role-based and ownership-based access control for orders
 */

const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { checkAbility, requireRole } = require('../middleware/checkAbility');
const OrderService = require('../services/order.service');
const Order = require('../models/Order.sequelize.wrapper');
const AppError = require('../utils/AppError');

console.log('🔧 Order routes initialized with CASL authorization');

// Create order - BUYER ONLY
router.post('/',
  authenticate,
  checkAbility('create', 'Order'),
  async (req, res, next) => {
    try {
      const { items, ...orderData } = req.body;

      if (!items || items.length === 0) {
        throw new AppError('Order must contain at least one item', 400);
      }

      const order = await OrderService.createOrder(req.user.id, items, orderData);

      res.status(201).json({
        success: true,
        message: 'Order created successfully',
        order
      });
    } catch (error) {
      next(error);
    }
  }
);

// Get user's orders - BUYER (own orders) or SELLER (orders for their products)
router.get('/my-orders',
  authenticate,
  async (req, res, next) => {
    try {
      let orders;

      if (req.user.role === 'buyer') {
        orders = await OrderService.getOrdersByBuyer(req.user.id);
      } else if (req.user.role === 'seller') {
        orders = await OrderService.getOrdersBySeller(req.user.seller_id);
      } else {
        throw new AppError('Invalid role for viewing orders', 403);
      }

      res.json({
        success: true,
        count: orders.length,
        orders
      });
    } catch (error) {
      next(error);
    }
  }
);

// Get single order - BUYER (own order) or SELLER (order for their product) or ADMIN
router.get('/:id',
  authenticate,
  checkAbility('read', 'Order', async (req) => {
    // Get order to check ownership
    const order = await Order.findById(req.params.id);
    if (!order) {
      throw new AppError('Order not found', 404);
    }
    return order; // CASL will check if user can read this order
  }),
  async (req, res, next) => {
    try {
      const order = await OrderService.getOrderById(req.params.id);

      res.json({
        success: true,
        order
      });
    } catch (error) {
      next(error);
    }
  }
);

// Update order status - SELLER (for their products) or ADMIN
router.patch('/:id/status',
  authenticate,
  requireRole(['seller', 'admin']),
  async (req, res, next) => {
    try {
      const { status } = req.body;

      if (!status) {
        throw new AppError('Status is required', 400);
      }

      const order = await OrderService.updateOrderStatus(
        req.params.id,
        status,
        req.user.id
      );

      res.json({
        success: true,
        message: 'Order status updated successfully',
        order
      });
    } catch (error) {
      next(error);
    }
  }
);

// Cancel order - BUYER (own order) or ADMIN
router.patch('/:id/cancel',
  authenticate,
  checkAbility('update', 'Order', async (req) => {
    // Get order to check ownership
    const order = await Order.findById(req.params.id);
    if (!order) {
      throw new AppError('Order not found', 404);
    }
    return order; // CASL will check if user can update this order
  }),
  async (req, res, next) => {
    try {
      const order = await OrderService.cancelOrder(req.params.id, req.user.id);

      res.json({
        success: true,
        message: 'Order cancelled successfully',
        order
      });
    } catch (error) {
      next(error);
    }
  }
);

// Get order statistics - BUYER or SELLER (own stats)
router.get('/stats/summary',
  authenticate,
  requireRole(['buyer', 'seller']),
  async (req, res, next) => {
    try {
      const stats = await OrderService.getOrderStatistics(req.user.id, req.user.role);

      res.json({
        success: true,
        stats
      });
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
