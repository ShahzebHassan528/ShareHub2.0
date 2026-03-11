const db = require('../config/database');

class Swap {
  static async findAll(filters = {}) {
    let query = `
      SELECT ps.*, 
             p.title as item_title, p.description, p.product_condition,
             c.name as category_name,
             u.full_name as owner_name,
             (SELECT image_url FROM product_images WHERE product_id = p.id AND is_primary = TRUE LIMIT 1) as primary_image,
             (SELECT COUNT(*) FROM product_swaps WHERE owner_id = ps.owner_id AND status = 'completed') as successful_swaps
      FROM product_swaps ps
      LEFT JOIN products p ON ps.owner_product_id = p.id
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN users u ON ps.owner_id = u.id
      WHERE ps.status = 'pending'
    `;
    
    const params = [];
    
    if (filters.category) {
      query += ' AND c.name = ?';
      params.push(filters.category);
    }
    
    if (filters.condition) {
      query += ' AND p.product_condition = ?';
      params.push(filters.condition);
    }
    
    query += ' ORDER BY ps.created_at DESC';
    
    const [rows] = await db.query(query, params);
    return rows;
  }

  static async findById(id) {
    const [rows] = await db.query(`
      SELECT ps.*, 
             p.title as item_title, p.description, p.product_condition,
             c.name as category_name,
             u.full_name as owner_name, u.email as owner_email,
             (SELECT COUNT(*) FROM product_swaps WHERE owner_id = ps.owner_id AND status = 'completed') as successful_swaps
      FROM product_swaps ps
      LEFT JOIN products p ON ps.owner_product_id = p.id
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN users u ON ps.owner_id = u.id
      WHERE ps.id = ?
    `, [id]);
    
    if (rows.length === 0) return null;
    
    const swap = rows[0];
    
    // Get all images for the swap item
    const [images] = await db.query(
      'SELECT image_url, is_primary FROM product_images WHERE product_id = ? ORDER BY display_order',
      [swap.owner_product_id]
    );
    swap.images = images;
    
    return swap;
  }

  static async create(swapData) {
    const [result] = await db.query(
      `INSERT INTO product_swaps (requester_id, requester_product_id, owner_id, owner_product_id, swap_number, message)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        swapData.requester_id,
        swapData.requester_product_id,
        swapData.owner_id,
        swapData.owner_product_id,
        swapData.swap_number,
        swapData.message
      ]
    );
    return result.insertId;
  }
}

module.exports = Swap;
