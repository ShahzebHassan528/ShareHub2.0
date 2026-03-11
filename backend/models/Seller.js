const db = require('../config/database');

class Seller {
  static async create(sellerData) {
    const [result] = await db.query(
      `INSERT INTO sellers (user_id, business_name, business_address, business_license, tax_id) 
       VALUES (?, ?, ?, ?, ?)`,
      [
        sellerData.user_id,
        sellerData.business_name,
        sellerData.business_address,
        sellerData.business_license,
        sellerData.tax_id
      ]
    );
    return result.insertId;
  }

  static async findByUserId(userId) {
    const [rows] = await db.query('SELECT * FROM sellers WHERE user_id = ?', [userId]);
    return rows[0];
  }

  static async findPending() {
    const [rows] = await db.query(
      `SELECT s.*, u.email, u.full_name, u.phone 
       FROM sellers s
       JOIN users u ON s.user_id = u.id
       WHERE s.approval_status = 'pending'
       ORDER BY s.created_at DESC`
    );
    return rows;
  }

  static async approve(sellerId, adminId) {
    await db.query(
      `UPDATE sellers SET approval_status = 'approved', approved_by = ?, approved_at = NOW() 
       WHERE id = ?`,
      [adminId, sellerId]
    );
  }

  static async reject(sellerId, adminId, reason) {
    await db.query(
      `UPDATE sellers SET approval_status = 'rejected', approved_by = ?, rejection_reason = ? 
       WHERE id = ?`,
      [adminId, reason, sellerId]
    );
  }
}

module.exports = Seller;
