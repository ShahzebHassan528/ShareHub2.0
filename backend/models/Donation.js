const db = require('../config/database');

class Donation {
  static async create(donationData) {
    const donationNumber = 'DON' + Date.now();
    const [result] = await db.query(
      `INSERT INTO donations (donor_id, ngo_id, product_id, donation_number, message, pickup_address) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        donationData.donor_id,
        donationData.ngo_id,
        donationData.product_id,
        donationNumber,
        donationData.message,
        donationData.pickup_address
      ]
    );
    return result.insertId;
  }

  static async findByDonor(donorId) {
    const [rows] = await db.query(
      `SELECT d.*, n.ngo_name, p.title as product_title, p.product_condition
       FROM donations d
       JOIN ngos n ON d.ngo_id = n.id
       JOIN products p ON d.product_id = p.id
       WHERE d.donor_id = ?
       ORDER BY d.created_at DESC`,
      [donorId]
    );
    return rows;
  }

  static async findByNGO(ngoId) {
    const [rows] = await db.query(
      `SELECT d.*, u.full_name as donor_name, u.phone as donor_phone, 
              p.title as product_title, p.product_condition
       FROM donations d
       JOIN users u ON d.donor_id = u.id
       JOIN products p ON d.product_id = p.id
       WHERE d.ngo_id = ?
       ORDER BY d.created_at DESC`,
      [ngoId]
    );
    return rows;
  }

  static async updateStatus(donationId, status) {
    await db.query('UPDATE donations SET status = ? WHERE id = ?', [status, donationId]);
  }
}

module.exports = Donation;
