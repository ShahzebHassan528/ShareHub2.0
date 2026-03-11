/**
 * NGO Model - Sequelize Implementation
 * 
 * This is a Sequelize-based implementation that maintains the same API
 * as the raw SQL version for backward compatibility.
 * 
 * Migration Status: ✅ Ready to use
 * Original: models/NGO.js (raw SQL)
 * New: models/NGO.sequelize.wrapper.js (Sequelize)
 */

const { NGO: NGOModel, User: UserModel } = require('../database/models');

class NGO {
  /**
   * Create a new NGO
   * @param {Object} ngoData - NGO data
   * @returns {Promise<number>} - NGO ID
   */
  static async create(ngoData) {
    console.log('🔷 [Sequelize] NGO.create() called for user_id:', ngoData.user_id);
    try {
      const ngo = await NGOModel.create({
        user_id: ngoData.user_id,
        ngo_name: ngoData.ngo_name,
        registration_number: ngoData.registration_number,
        address: ngoData.address,
        website: ngoData.website,
        description: ngoData.description,
        certificate_document: ngoData.certificate_document
      });
      
      console.log('✅ [Sequelize] NGO created successfully with ID:', ngo.id);
      return ngo.id;
    } catch (error) {
      console.error('❌ [Sequelize] NGO.create() failed:', error.message);
      throw error;
    }
  }

  /**
   * Find NGO by user ID
   * @param {number} userId - User ID
   * @returns {Promise<Object|undefined>} - NGO object or undefined
   */
  static async findByUserId(userId) {
    console.log('🔷 [Sequelize] NGO.findByUserId() called with user_id:', userId);
    const ngo = await NGOModel.findOne({
      where: { user_id: userId },
      raw: true
    });
    
    console.log(ngo ? '✅ [Sequelize] NGO found' : 'ℹ️  [Sequelize] NGO not found');
    return ngo || undefined;
  }

  /**
   * Find pending NGOs with user information
   * @returns {Promise<Array>} - Array of pending NGOs
   */
  static async findPending() {
    console.log('🔷 [Sequelize] NGO.findPending() called');
    const ngos = await NGOModel.findAll({
      where: { verification_status: 'pending' },
      include: [{
        model: UserModel,
        as: 'user',
        attributes: ['email', 'full_name', 'phone']
      }],
      order: [['created_at', 'DESC']]
    });
    
    // Flatten the structure to match raw SQL format
    const result = ngos.map(ngo => {
      const ngoData = ngo.toJSON();
      return {
        ...ngoData,
        email: ngoData.user?.email,
        full_name: ngoData.user?.full_name,
        phone: ngoData.user?.phone,
        user: undefined // Remove nested user object
      };
    });
    
    console.log(`✅ [Sequelize] Found ${result.length} pending NGOs`);
    return result;
  }

  /**
   * Approve NGO
   * @param {number} ngoId - NGO ID
   * @param {number} adminId - Admin ID
   * @returns {Promise<void>}
   */
  static async approve(ngoId, adminId) {
    console.log('🔷 [Sequelize] NGO.approve() called for ngo_id:', ngoId, 'by admin:', adminId);
    await NGOModel.update(
      {
        verification_status: 'approved',
        verified_by: adminId,
        verified_at: new Date()
      },
      { where: { id: ngoId } }
    );
    console.log('✅ [Sequelize] NGO approved successfully');
  }

  /**
   * Reject NGO
   * @param {number} ngoId - NGO ID
   * @param {number} adminId - Admin ID
   * @param {string} reason - Rejection reason
   * @returns {Promise<void>}
   */
  static async reject(ngoId, adminId, reason) {
    console.log('🔷 [Sequelize] NGO.reject() called for ngo_id:', ngoId);
    await NGOModel.update(
      {
        verification_status: 'rejected',
        verified_by: adminId,
        rejection_reason: reason
      },
      { where: { id: ngoId } }
    );
    console.log('✅ [Sequelize] NGO rejected successfully');
  }

  /**
   * Find approved NGOs with user information
   * @returns {Promise<Array>} - Array of approved NGOs
   */
  static async findApproved() {
    console.log('🔷 [Sequelize] NGO.findApproved() called');
    const ngos = await NGOModel.findAll({
      where: { verification_status: 'approved' },
      include: [{
        model: UserModel,
        as: 'user',
        attributes: ['full_name', 'email']
      }]
    });
    
    // Flatten the structure to match raw SQL format
    const result = ngos.map(ngo => {
      const ngoData = ngo.toJSON();
      return {
        ...ngoData,
        full_name: ngoData.user?.full_name,
        email: ngoData.user?.email,
        user: undefined // Remove nested user object
      };
    });
    
    console.log(`✅ [Sequelize] Found ${result.length} approved NGOs`);
    return result;
  }

  /**
   * Find NGO by ID
   * @param {number} ngoId - NGO ID
   * @returns {Promise<Object|undefined>} - NGO object or undefined
   */
  static async findById(ngoId) {
    console.log('🔷 [Sequelize] NGO.findById() called with id:', ngoId);
    const ngo = await NGOModel.findByPk(ngoId, { raw: true });
    console.log(ngo ? '✅ [Sequelize] NGO found' : 'ℹ️  [Sequelize] NGO not found');
    return ngo || undefined;
  }
}

module.exports = NGO;
