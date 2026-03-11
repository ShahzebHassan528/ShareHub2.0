const db = require('../config/database');

class User {
  static async create(userData) {
    const [result] = await db.query(
      'INSERT INTO users (email, password, full_name, phone, role, is_verified) VALUES (?, ?, ?, ?, ?, ?)',
      [
        userData.email, 
        userData.password, 
        userData.full_name, 
        userData.phone, 
        userData.role,
        userData.is_verified || false
      ]
    );
    return result.insertId;
  }

  static async findByEmail(email) {
    const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    return rows[0];
  }

  static async findById(id) {
    const [rows] = await db.query('SELECT * FROM users WHERE id = ?', [id]);
    return rows[0];
  }

  static async updateVerification(id, isVerified) {
    await db.query('UPDATE users SET is_verified = ? WHERE id = ?', [isVerified, id]);
  }
}

module.exports = User;
