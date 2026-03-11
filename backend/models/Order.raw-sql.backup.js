const db = require('../config/database');

class Order {
  static async create(orderData) {
    const orderNumber = 'ORD' + Date.now();
    const [result] = await db.query(
      `INSERT INTO orders (buyer_id, order_number, total_amount, shipping_address, notes) 
       VALUES (?, ?, ?, ?, ?)`,
      [
        orderData.buyer_id,
        orderNumber,
        orderData.total_amount,
        orderData.shipping_address,
        orderData.notes
      ]
    );
    return { orderId: result.insertId, orderNumber };
  }

  static async addItem(orderItem) {
    await db.query(
      `INSERT INTO order_items (order_id, product_id, seller_id, quantity, price, product_condition) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        orderItem.order_id,
        orderItem.product_id,
        orderItem.seller_id,
        orderItem.quantity,
        orderItem.price,
        orderItem.product_condition
      ]
    );
  }

  static async findByBuyer(buyerId) {
    const [rows] = await db.query(
      `SELECT * FROM orders WHERE buyer_id = ? ORDER BY created_at DESC`,
      [buyerId]
    );
    return rows;
  }

  static async findById(orderId) {
    const [orders] = await db.query('SELECT * FROM orders WHERE id = ?', [orderId]);
    if (orders.length === 0) return null;

    const [items] = await db.query(
      `SELECT oi.*, p.title, s.business_name 
       FROM order_items oi
       JOIN products p ON oi.product_id = p.id
       JOIN sellers s ON oi.seller_id = s.id
       WHERE oi.order_id = ?`,
      [orderId]
    );

    return { ...orders[0], items };
  }

  static async updateStatus(orderId, status) {
    await db.query('UPDATE orders SET status = ? WHERE id = ?', [status, orderId]);
  }
}

module.exports = Order;
