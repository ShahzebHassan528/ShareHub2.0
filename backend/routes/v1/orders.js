/**
 * Order Routes (MVC Pattern)
 * Uses OrderController for all order endpoints
 */

const express = require('express');
const router = express.Router();
const OrderController = require('../../controllers/order.controller');
const { authenticate } = require('../../middleware/auth');
const { requireRole } = require('../../middleware/checkAbility');

console.log('🔧 Order routes initialized with MVC pattern (OrderController)');

// POST /api/v1/orders - Create new order
router.post('/', authenticate, OrderController.createOrder);

// GET /api/v1/orders - Get my orders
router.get('/', authenticate, OrderController.getMyOrders);

// GET /api/v1/orders/seller - Get seller orders
router.get('/seller', authenticate, requireRole('seller'), OrderController.getSellerOrders);

// GET /api/v1/orders/:id - Get order by ID
router.get('/:id', authenticate, OrderController.getOrderById);

// PUT /api/v1/orders/:id/status - Update order status
router.put('/:id/status', authenticate, OrderController.updateOrderStatus);

// PUT /api/v1/orders/:id/cancel - Cancel order
router.put('/:id/cancel', authenticate, OrderController.cancelOrder);

module.exports = router;
