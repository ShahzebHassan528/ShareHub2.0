/**
 * Order Service
 * Business logic for order management
 */

const Order = require('../models/Order.sequelize.wrapper');
const Product = require('../models/Product.sequelize.wrapper');
const User = require('../models/User.sequelize.wrapper');
const NotificationService = require('./notificationService');
const JobService = require('./job.service');
const AppError = require('../utils/AppError');
const { sequelize } = require('../config/sequelize');

class OrderService {
  /**
   * Create a new order
   * Uses transaction to ensure atomic operation
   * @param {number} buyerId - Buyer user ID
   * @param {Array} items - Order items [{product_id, quantity}]
   * @param {Object} orderData - Additional order data
   * @returns {Promise<Object>} Created order with items
   */
  static async createOrder(buyerId, items, orderData = {}) {
    // Validate items
    if (!items || items.length === 0) {
      throw new AppError('Order must contain at least one item', 400);
    }

    // Use transaction for atomic order creation
    const transaction = await sequelize.transaction();
    
    try {
      // Validate each item and calculate total
      let totalAmount = 0;
      const validatedItems = [];

      for (const item of items) {
        const product = await Product.findById(item.product_id);
        if (!product) {
          throw new AppError(`Product ${item.product_id} not found`, 404);
        }

        if (product.availability_status !== 'available') {
          throw new AppError(`Product "${product.title}" is not available`, 400);
        }

        if (product.product_status === 'blocked') {
          throw new AppError(`Product "${product.title}" is blocked`, 400);
        }

        const itemTotal = product.price * item.quantity;
        totalAmount += itemTotal;

        validatedItems.push({
          product_id: product.id,
          seller_id: product.seller_id,
          quantity: item.quantity,
          price: product.price,
          product_title: product.title
        });
      }

      // Create order
      const orderId = await Order.create({
        buyer_id: buyerId,
        total_amount: totalAmount,
        order_status: 'pending',
        payment_status: 'pending',
        ...orderData
      }, { transaction });

      // Add order items
      for (const item of validatedItems) {
        await Order.addItem(orderId, item, { transaction });
      }

      // Commit transaction
      await transaction.commit();

      // Get buyer info for email
      const buyer = await User.findById(buyerId);

      // Enqueue order confirmation email (async, don't wait)
      if (buyer) {
        JobService.enqueueOrderEmail({
          buyerEmail: buyer.email,
          buyerName: buyer.full_name,
          orderId,
          totalAmount
        }).catch(err => {
          console.error('Failed to enqueue order email:', err.message);
        });
      }

      // Enqueue notifications for sellers (async, don't wait)
      for (const item of validatedItems) {
        JobService.enqueueOrderNotification({
          sellerId: item.seller_id,
          productTitle: item.product_title,
          orderId
        }).catch(err => {
          console.error('Failed to enqueue order notification:', err.message);
        });
      }

      return await this.getOrderById(orderId);
    } catch (error) {
      // Rollback transaction on error
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * Get order by ID
   * @param {number} orderId - Order ID
   * @returns {Promise<Object>} Order with items
   */
  static async getOrderById(orderId) {
    const order = await Order.findById(orderId);
    if (!order) {
      throw new AppError('Order not found', 404);
    }
    return order;
  }

  /**
   * Get orders by buyer
   * @param {number} buyerId - Buyer user ID
   * @returns {Promise<Array>} List of orders
   */
  static async getOrdersByBuyer(buyerId) {
    return await Order.findByBuyer(buyerId);
  }

  /**
   * Get orders by seller
   * @param {number} sellerId - Seller ID
   * @returns {Promise<Array>} List of orders
   */
  static async getOrdersBySeller(sellerId) {
    return await Order.findBySeller(sellerId);
  }

  /**
   * Update order status
   * @param {number} orderId - Order ID
   * @param {string} status - New order status
   * @param {number} userId - User ID (for authorization)
   * @returns {Promise<Object>} Updated order
   */
  static async updateOrderStatus(orderId, status, userId) {
    const order = await Order.findById(orderId);
    if (!order) {
      throw new AppError('Order not found', 404);
    }

    // Validate status
    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      throw new AppError('Invalid order status', 400);
    }

    const updatedOrder = await Order.update(orderId, { order_status: status });

    // Notify buyer about status change
    try {
      await NotificationService.notifyOrderStatusChanged(
        order.buyer_id,
        'Your order',
        status
      );
    } catch (error) {
      console.error('Failed to send notification:', error.message);
    }

    return updatedOrder;
  }

  /**
   * Update payment status
   * @param {number} orderId - Order ID
   * @param {string} status - New payment status
   * @returns {Promise<Object>} Updated order
   */
  static async updatePaymentStatus(orderId, status) {
    const order = await Order.findById(orderId);
    if (!order) {
      throw new AppError('Order not found', 404);
    }

    // Validate status
    const validStatuses = ['pending', 'paid', 'failed', 'refunded'];
    if (!validStatuses.includes(status)) {
      throw new AppError('Invalid payment status', 400);
    }

    return await Order.update(orderId, { payment_status: status });
  }

  /**
   * Cancel order
   * @param {number} orderId - Order ID
   * @param {number} userId - User ID (buyer or admin)
   * @returns {Promise<Object>} Updated order
   */
  static async cancelOrder(orderId, userId) {
    const order = await Order.findById(orderId);
    if (!order) {
      throw new AppError('Order not found', 404);
    }

    if (order.order_status === 'delivered') {
      throw new AppError('Cannot cancel delivered order', 400);
    }

    if (order.order_status === 'cancelled') {
      throw new AppError('Order is already cancelled', 400);
    }

    return await Order.update(orderId, { order_status: 'cancelled' });
  }

  /**
   * Get order statistics
   * @param {number} userId - User ID (buyer or seller)
   * @param {string} role - User role
   * @returns {Promise<Object>} Order statistics
   */
  static async getOrderStatistics(userId, role) {
    let orders;
    if (role === 'buyer') {
      orders = await Order.findByBuyer(userId);
    } else if (role === 'seller') {
      orders = await Order.findBySeller(userId);
    } else {
      throw new AppError('Invalid role for order statistics', 400);
    }

    const stats = {
      total: orders.length,
      pending: orders.filter(o => o.order_status === 'pending').length,
      processing: orders.filter(o => o.order_status === 'processing').length,
      shipped: orders.filter(o => o.order_status === 'shipped').length,
      delivered: orders.filter(o => o.order_status === 'delivered').length,
      cancelled: orders.filter(o => o.order_status === 'cancelled').length,
      total_amount: orders.reduce((sum, o) => sum + parseFloat(o.total_amount || 0), 0)
    };

    return stats;
  }
}

module.exports = OrderService;
