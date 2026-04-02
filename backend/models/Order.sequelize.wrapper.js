/**
 * Order Model - Sequelize Implementation
 * 
 * Migration Status: ✅ Ready to use
 * Original: models/Order.js (raw SQL)
 * New: models/Order.sequelize.wrapper.js (Sequelize)
 */

const { Order: OrderModel, OrderItem: OrderItemModel, Product: ProductModel, Seller: SellerModel, User: UserModel } = require('../database/models');

class Order {
  /**
   * Create a new order
   * @param {Object} orderData - Order data
   * @returns {Promise<Object>} - { orderId, orderNumber }
   */
  static async create(orderData) {
    const orderNumber = 'ORD' + Date.now();
    console.log('🔷 [Sequelize] Order.create() called with order_number:', orderNumber);
    
    try {
      const order = await OrderModel.create({
        buyer_id: orderData.buyer_id,
        order_number: orderNumber,
        total_amount: orderData.total_amount,
        shipping_address: orderData.shipping_address,
        notes: orderData.notes
      });
      
      console.log('✅ [Sequelize] Order created successfully with ID:', order.id);
      return { orderId: order.id, orderNumber };
    } catch (error) {
      console.error('❌ [Sequelize] Order.create() failed:', error.message);
      throw error;
    }
  }

  /**
   * Add item to order
   * @param {Object} orderItem - Order item data
   * @returns {Promise<void>}
   */
  static async addItem(orderItem) {
    console.log('🔷 [Sequelize] Order.addItem() called for order_id:', orderItem.order_id);
    
    try {
      await OrderItemModel.create({
        order_id: orderItem.order_id,
        product_id: orderItem.product_id,
        seller_id: orderItem.seller_id,
        quantity: orderItem.quantity,
        price: orderItem.price,
        product_condition: orderItem.product_condition
      });
      
      console.log('✅ [Sequelize] Order item added successfully');
    } catch (error) {
      console.error('❌ [Sequelize] Order.addItem() failed:', error.message);
      throw error;
    }
  }

  /**
   * Find orders by buyer
   * @param {number} buyerId - Buyer ID
   * @returns {Promise<Array>} - Array of orders
   */
  static async findByBuyer(buyerId) {
    console.log('🔷 [Sequelize] Order.findByBuyer() called for buyer_id:', buyerId);

    const orders = await OrderModel.findAll({
      where: { buyer_id: buyerId },
      order: [['created_at', 'DESC']],
      raw: true
    });

    console.log(`✅ [Sequelize] Found ${orders.length} orders`);
    // Alias DB column 'status' as 'order_status' for service layer compatibility
    return orders.map(o => ({ ...o, order_status: o.status }));
  }

  /**
   * Find order by ID with items
   * @param {number} orderId - Order ID
   * @returns {Promise<Object|null>} - Order with items or null
   */
  static async findById(orderId) {
    console.log('🔷 [Sequelize] Order.findById() called with order_id:', orderId);
    
    const order = await OrderModel.findByPk(orderId, {
      include: [{
        model: OrderItemModel,
        as: 'items',
        include: [
          { model: ProductModel, as: 'product', attributes: ['title'] },
          { model: SellerModel, as: 'seller', attributes: ['business_name'] }
        ]
      }]
    });
    
    if (!order) {
      console.log('ℹ️  [Sequelize] Order not found');
      return null;
    }
    
    // Flatten structure to match raw SQL format
    const orderData = order.toJSON();
    const items = orderData.items?.map(item => ({
      ...item,
      title: item.product?.title,
      business_name: item.seller?.business_name,
      product: undefined,
      seller: undefined
    })) || [];
    
    console.log('✅ [Sequelize] Order found with', items.length, 'items');
    // Alias DB column 'status' as 'order_status' for service layer compatibility
    return {
      ...orderData,
      order_status: orderData.status,
      items
    };
  }

  /**
   * Update order status
   * @param {number} orderId - Order ID
   * @param {string} status - New status
   * @returns {Promise<void>}
   */
  static async updateStatus(orderId, status) {
    console.log('🔷 [Sequelize] Order.updateStatus() called for order_id:', orderId, 'status:', status);

    await OrderModel.update(
      { status },
      { where: { id: orderId } }
    );

    console.log('✅ [Sequelize] Order status updated successfully');
  }

  /**
   * Update order fields (order_status, payment_status, etc.)
   * @param {number} orderId - Order ID
   * @param {Object} fields - Fields to update
   * @returns {Promise<Object>} Updated order
   */
  static async update(orderId, fields) {
    console.log('🔷 [Sequelize] Order.update() called for order_id:', orderId);

    const allowed = {};
    // Service uses 'order_status' but DB column is 'status'
    if (fields.order_status !== undefined) allowed.status = fields.order_status;
    if (fields.payment_status !== undefined) allowed.payment_status = fields.payment_status;
    if (fields.shipping_address !== undefined) allowed.shipping_address = fields.shipping_address;
    if (fields.notes !== undefined) allowed.notes = fields.notes;

    await OrderModel.update(allowed, { where: { id: orderId } });

    console.log('✅ [Sequelize] Order updated successfully');
    return await Order.findById(orderId);
  }

  /**
   * Find orders that contain items sold by a given seller
   * @param {number} sellerId - Seller ID
   * @returns {Promise<Array>} - Array of orders
   */
  static async findBySeller(sellerId) {
    console.log('🔷 [Sequelize] Order.findBySeller() called for seller_id:', sellerId);

    const items = await OrderItemModel.findAll({
      where: { seller_id: sellerId },
      attributes: ['order_id'],
      raw: true
    });

    const orderIds = [...new Set(items.map(i => i.order_id))];

    if (orderIds.length === 0) {
      console.log('ℹ️  [Sequelize] No orders found for seller');
      return [];
    }

    const { Op } = require('sequelize');
    const orders = await OrderModel.findAll({
      where: { id: { [Op.in]: orderIds } },
      order: [['created_at', 'DESC']],
      raw: true
    });

    console.log(`✅ [Sequelize] Found ${orders.length} orders for seller`);
    // Alias DB column 'status' as 'order_status' for service layer compatibility
    return orders.map(o => ({ ...o, order_status: o.status }));
  }
}

module.exports = Order;
