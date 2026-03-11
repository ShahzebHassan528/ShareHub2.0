const db = require('../config/database');

class NGO {
  static async create(ngoData) {
    const [result] = await db.query(
      `INSERT INTO ngos (user_id, ngo_name, registration_number, address, website, description, certificate_document) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        ngoData.user_id,
        ngoData.ngo_name,
        ngoData.registration_number,
        ngoData.address,
        ngoData.website,
        ngoData.description,
        ngoData.certificate_document
      ]
    );
    return result.insertId;
  }

  static async findByUserId(userId) {
    const [rows] = await db.query('SELECT * FROM ngos WHERE user_id = ?', [userId]);
    return rows[0];
  }

  static async findPending() {
    const [rows] = await db.query(
      `SELECT n.*, u.email, u.full_name, u.phone 
       FROM ngos n
       JOIN users u ON n.user_id = u.id
       WHERE n.verification_status = 'pending'
       ORDER BY n.created_at DESC`
    );
    return rows;
  }

  static async verify(ngoId, adminId) {
    await db.query(
      `UPDATE ngos SET verification_status = 'verified', verified_by = ?, verified_at = NOW() 
       WHERE id = ?`,
      [adminId, ngoId]
    );
  }

  static async reject(ngoId, adminId, reason) {
    await db.query(
      `UPDATE ngos SET verification_status = 'rejected', verified_by = ?, rejection_reason = ? 
       WHERE id = ?`,
      [adminId, reason, ngoId]
    );
  }

  static async findVerified() {
    const [rows] = await db.query(
      `SELECT n.*, u.full_name, u.email 
       FROM ngos n
       JOIN users u ON n.user_id = u.id
       WHERE n.verification_status = 'verified'`
    );
    return rows;
  }
}

module.exports = NGO;
