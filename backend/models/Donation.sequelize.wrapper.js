/**
 * Donation Model - Sequelize Wrapper
 * 
 * This wrapper provides 100% API compatibility with the raw SQL version
 * while using Sequelize ORM under the hood.
 * 
 * Original: models/Donation.js (raw SQL)
 * Backup: models/Donation.raw-sql.backup.js
 */

const { Donation: DonationModel, NGO, Product, User } = require('../database/models');

class Donation {
  /**
   * Create a new donation
   * @param {Object} donationData - Donation data
   * @returns {Promise<number>} - Donation ID
   */
  static async create(donationData) {
    console.log('🔷 Donation.create() called with Sequelize');
    try {
      // Check if NGO is approved before allowing donation
      const ngo = await NGO.findByPk(donationData.ngo_id, { raw: true });
      
      if (!ngo) {
        console.error('❌ NGO not found with ID:', donationData.ngo_id);
        throw new Error('NGO not found');
      }
      
      if (ngo.verification_status !== 'approved') {
        console.error(`❌ Donation rejected: NGO ${ngo.ngo_name} is not approved (status: ${ngo.verification_status})`);
        throw new Error('Donations can only be made to approved NGOs');
      }
      
      console.log(`✅ NGO ${ngo.ngo_name} is approved, proceeding with donation`);
      
      const donationNumber = 'DON' + Date.now();
      
      const donation = await DonationModel.create({
        donor_id: donationData.donor_id,
        ngo_id: donationData.ngo_id,
        product_id: donationData.product_id,
        donation_number: donationNumber,
        message: donationData.message,
        pickup_address: donationData.pickup_address
      });
      
      console.log('✅ Donation.create() successful, ID:', donation.id);
      return donation.id; // Return number, not object
    } catch (error) {
      console.error('❌ Donation.create() failed:', error.message);
      throw error;
    }
  }

  /**
   * Find all donations by donor
   * @param {number} donorId - Donor user ID
   * @returns {Promise<Array>} - Array of donations with NGO and product details
   */
  static async findByDonor(donorId) {
    console.log('🔷 Donation.findByDonor() called with Sequelize for donor:', donorId);
    try {
      const donations = await DonationModel.findAll({
        where: { donor_id: donorId },
        include: [
          {
            model: NGO,
            as: 'ngo',
            attributes: ['ngo_name']
          },
          {
            model: Product,
            as: 'product',
            attributes: ['title', 'product_condition']
          }
        ],
        order: [['created_at', 'DESC']],
        raw: false // Need nested objects for associations
      });

      // Flatten structure to match raw SQL format
      const result = donations.map(d => {
        const plain = d.get({ plain: true });
        return {
          ...plain,
          ngo_name: plain.ngo?.ngo_name || null,
          product_title: plain.product?.title || null,
          product_condition: plain.product?.product_condition || null,
          ngo: undefined, // Remove nested objects
          product: undefined
        };
      });

      console.log('✅ Donation.findByDonor() successful, found:', result.length);
      return result;
    } catch (error) {
      console.error('❌ Donation.findByDonor() failed:', error.message);
      throw error;
    }
  }

  /**
   * Find all donations by NGO
   * @param {number} ngoId - NGO ID
   * @returns {Promise<Array>} - Array of donations with donor and product details
   */
  static async findByNGO(ngoId) {
    console.log('🔷 Donation.findByNGO() called with Sequelize for NGO:', ngoId);
    try {
      const donations = await DonationModel.findAll({
        where: { ngo_id: ngoId },
        include: [
          {
            model: User,
            as: 'donor',
            attributes: ['full_name', 'phone']
          },
          {
            model: Product,
            as: 'product',
            attributes: ['title', 'product_condition']
          }
        ],
        order: [['created_at', 'DESC']],
        raw: false
      });

      // Flatten structure to match raw SQL format
      const result = donations.map(d => {
        const plain = d.get({ plain: true });
        return {
          ...plain,
          donor_name: plain.donor?.full_name || null,
          donor_phone: plain.donor?.phone || null,
          product_title: plain.product?.title || null,
          product_condition: plain.product?.product_condition || null,
          donor: undefined, // Remove nested objects
          product: undefined
        };
      });

      console.log('✅ Donation.findByNGO() successful, found:', result.length);
      return result;
    } catch (error) {
      console.error('❌ Donation.findByNGO() failed:', error.message);
      throw error;
    }
  }

  /**
   * Update donation status
   * @param {number} donationId - Donation ID
   * @param {string} status - New status
   * @returns {Promise<void>}
   */
  static async updateStatus(donationId, status) {
    console.log('🔷 Donation.updateStatus() called with Sequelize for ID:', donationId);
    try {
      await DonationModel.update(
        { status },
        { where: { id: donationId } }
      );
      
      console.log('✅ Donation.updateStatus() successful');
    } catch (error) {
      console.error('❌ Donation.updateStatus() failed:', error.message);
      throw error;
    }
  }

  // ========== Additional Sequelize-Specific Methods ==========

  /**
   * Find donation by ID
   * @param {number} id - Donation ID
   * @returns {Promise<Object|null>} - Donation object or null
   */
  static async findById(id) {
    console.log('🔷 Donation.findById() called with Sequelize for ID:', id);
    try {
      const donation = await DonationModel.findByPk(id, {
        include: [
          { model: User, as: 'donor', attributes: ['full_name', 'email', 'phone'] },
          { model: NGO, as: 'ngo', attributes: ['ngo_name', 'address'] },
          { model: Product, as: 'product', attributes: ['title', 'product_condition'] }
        ],
        raw: false
      });

      if (!donation) {
        console.log('✅ Donation.findById() - not found');
        return null;
      }

      const plain = donation.get({ plain: true });
      const result = {
        ...plain,
        donor_name: plain.donor?.full_name || null,
        donor_email: plain.donor?.email || null,
        donor_phone: plain.donor?.phone || null,
        ngo_name: plain.ngo?.ngo_name || null,
        ngo_address: plain.ngo?.address || null,
        product_title: plain.product?.title || null,
        product_condition: plain.product?.product_condition || null,
        donor: undefined,
        ngo: undefined,
        product: undefined
      };

      console.log('✅ Donation.findById() successful');
      return result;
    } catch (error) {
      console.error('❌ Donation.findById() failed:', error.message);
      throw error;
    }
  }

  /**
   * Count donations by status
   * @param {string} status - Status to count
   * @returns {Promise<number>} - Count
   */
  static async countByStatus(status) {
    console.log('🔷 Donation.countByStatus() called with Sequelize');
    try {
      const count = await DonationModel.count({ where: { status } });
      console.log('✅ Donation.countByStatus() successful, count:', count);
      return count;
    } catch (error) {
      console.error('❌ Donation.countByStatus() failed:', error.message);
      throw error;
    }
  }
}

module.exports = Donation;
