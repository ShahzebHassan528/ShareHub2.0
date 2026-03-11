/**
 * Seller Model - Sequelize Implementation
 * 
 * This is a Sequelize-based implementation that maintains the same API
 * as the raw SQL version for backward compatibility.
 * 
 * Migration Status: ✅ Ready to use
 * Original: models/Seller.js (raw SQL)
 * New: models/Seller.sequelize.wrapper.js (Sequelize)
 */

const { Seller: SellerModel, User: UserModel } = require('../database/models');

class Seller {
  /**
   * Create a new seller
   * @param {Object} sellerData - Seller data
   * @returns {Promise<number>} - Seller ID
   */
  static async create(sellerData) {
    console.log('🔷 [Sequelize] Seller.create() called for user_id:', sellerData.user_id);
    try {
      const seller = await SellerModel.create({
        user_id: sellerData.user_id,
        business_name: sellerData.business_name,
        business_address: sellerData.business_address,
        business_license: sellerData.business_license,
        tax_id: sellerData.tax_id
      });
      
      console.log('✅ [Sequelize] Seller created successfully with ID:', seller.id);
      return seller.id;
    } catch (error) {
      console.error('❌ [Sequelize] Seller.create() failed:', error.message);
      throw error;
    }
  }

  /**
   * Find seller by user ID
   * @param {number} userId - User ID
   * @returns {Promise<Object|undefined>} - Seller object or undefined
   */
  static async findByUserId(userId) {
    console.log('🔷 [Sequelize] Seller.findByUserId() called with user_id:', userId);
    const seller = await SellerModel.findOne({
      where: { user_id: userId },
      raw: true
    });
    
    console.log(seller ? '✅ [Sequelize] Seller found' : 'ℹ️  [Sequelize] Seller not found');
    return seller || undefined;
  }

  /**
   * Find pending sellers with user information
   * @returns {Promise<Array>} - Array of pending sellers
   */
  static async findPending() {
    console.log('🔷 [Sequelize] Seller.findPending() called');
    const sellers = await SellerModel.findAll({
      where: { approval_status: 'pending' },
      include: [{
        model: UserModel,
        as: 'user',
        attributes: ['email', 'full_name', 'phone']
      }],
      order: [['created_at', 'DESC']]
    });
    
    // Flatten the structure to match raw SQL format
    const result = sellers.map(seller => {
      const sellerData = seller.toJSON();
      return {
        ...sellerData,
        email: sellerData.user?.email,
        full_name: sellerData.user?.full_name,
        phone: sellerData.user?.phone,
        user: undefined // Remove nested user object
      };
    });
    
    console.log(`✅ [Sequelize] Found ${result.length} pending sellers`);
    return result;
  }

  /**
   * Approve seller
   * @param {number} sellerId - Seller ID
   * @param {number} adminId - Admin ID
   * @returns {Promise<void>}
   */
  static async approve(sellerId, adminId) {
    console.log('🔷 [Sequelize] Seller.approve() called for seller_id:', sellerId, 'by admin:', adminId);
    await SellerModel.update(
      {
        approval_status: 'approved',
        approved_by: adminId,
        approved_at: new Date()
      },
      { where: { id: sellerId } }
    );
    console.log('✅ [Sequelize] Seller approved successfully');
  }

  /**
   * Reject seller
   * @param {number} sellerId - Seller ID
   * @param {number} adminId - Admin ID
   * @param {string} reason - Rejection reason
   * @returns {Promise<void>}
   */
  static async reject(sellerId, adminId, reason) {
    console.log('🔷 [Sequelize] Seller.reject() called for seller_id:', sellerId);
    await SellerModel.update(
      {
        approval_status: 'rejected',
        approved_by: adminId,
        rejection_reason: reason
      },
      { where: { id: sellerId } }
    );
    console.log('✅ [Sequelize] Seller rejected successfully');
  }
}

module.exports = Seller;
