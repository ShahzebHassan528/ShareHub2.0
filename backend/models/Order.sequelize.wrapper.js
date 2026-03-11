/**
 * Order Model - Sequelize Implementation
 * 
 * Migration Status: ✅ Ready to use
 * Original: models/Order.js (raw SQL)
 * New: models/Order.sequelize.wrapper.js (Sequelize)
 */

const { Order: OrderModel, OrderItem: OrderItemModel, Product: ProductModel, Seller: SellerModel } = require('../database/models');

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
    return orders;
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
    return {
      ...orderData,
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
}

module.exports = Order;
