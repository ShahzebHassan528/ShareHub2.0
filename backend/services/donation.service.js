/**
 * Donation Service
 * Business logic for donation management
 */

const Donation = require('../models/Donation.sequelize.wrapper');
const NGO = require('../models/NGO.sequelize.wrapper');
const Product = require('../models/Product.sequelize.wrapper');
const User = require('../models/User.sequelize.wrapper');
const NotificationService = require('./notificationService');
const JobService = require('./job.service');
const AppError = require('../utils/AppError');
const { sequelize } = require('../config/sequelize');

class DonationService {
  /**
   * Create a new donation
   * Uses transaction to ensure atomic operation
   * @param {Object} donationData - Donation data
   * @returns {Promise<number>} Created donation ID
   */
  static async createDonation(donationData) {
    const { donor_id, ngo_id, product_id, amount } = donationData;

    // Validate NGO exists and is approved
    const ngo = await NGO.findById(ngo_id);
    if (!ngo) {
      throw new AppError('NGO not found', 404);
    }

    if (ngo.verification_status !== 'approved') {
      throw new AppError('Can only donate to approved NGOs', 400);
    }

    // Use transaction for atomic donation creation
    const transaction = await sequelize.transaction();
    
    try {
      // If product donation, validate and update product
      if (product_id) {
        const product = await Product.findById(product_id);
        if (!product) {
          throw new AppError('Product not found', 404);
        }

        if (product.availability_status !== 'available') {
          throw new AppError('Product is not available for donation', 400);
        }

        // Mark product as unavailable (donated)
        await Product.update(product_id, {
          availability_status: 'unavailable'
        }, { transaction });
      }

      // Create donation
      const donationId = await Donation.create({
        donor_id,
        ngo_id,
        product_id: product_id || null,
        amount: amount || 0,
        donation_status: 'pending'
      }, { transaction });

      // Commit transaction
      await transaction.commit();

      // Get donor and NGO info for email
      const donor = await User.findById(donor_id);
      const ngoUser = await User.findById(ngo.user_id);

      // Enqueue donation email to NGO (async, don't wait)
      if (donor && ngoUser) {
        JobService.enqueueDonationEmail({
          ngoEmail: ngoUser.email,
          ngoName: ngo.ngo_name,
          donorName: donor.full_name,
          amount: amount || 0
        }).catch(err => {
          console.error('Failed to enqueue donation email:', err.message);
        });
      }

      return donationId;
    } catch (error) {
      // Rollback transaction on error
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * Get donation by ID
   * @param {number} donationId - Donation ID
   * @returns {Promise<Object>} Donation data
   */
  static async getDonationById(donationId) {
    const donation = await Donation.findById(donationId);
    if (!donation) {
      throw new AppError('Donation not found', 404);
    }
    return donation;
  }

  /**
   * Get donations by donor
   * @param {number} donorId - Donor user ID
   * @returns {Promise<Array>} List of donations
   */
  static async getDonationsByDonor(donorId) {
    return await Donation.findByDonor(donorId);
  }

  /**
   * Get donations by NGO
   * @param {number} ngoId - NGO ID
   * @returns {Promise<Array>} List of donations
   */
  static async getDonationsByNGO(ngoId) {
    return await Donation.findByNGO(ngoId);
  }

  /**
   * Accept donation (NGO action)
   * @param {number} donationId - Donation ID
   * @param {number} ngoUserId - NGO user ID
   * @returns {Promise<Object>} Updated donation
   */
  static async acceptDonation(donationId, ngoUserId) {
    const donation = await Donation.findById(donationId);
    if (!donation) {
      throw new AppError('Donation not found', 404);
    }

    if (donation.donation_status !== 'pending') {
      throw new AppError('Can only accept pending donations', 400);
    }

    const updatedDonation = await Donation.update(donationId, {
      donation_status: 'accepted'
    });

    // Notify donor
    try {
      await NotificationService.notifyDonationAccepted(
        donation.donor_id,
        'NGO',
        donation.amount
      );
    } catch (error) {
      console.error('Failed to send notification:', error.message);
    }

    return updatedDonation;
  }

  /**
   * Reject donation (NGO action)
   * @param {number} donationId - Donation ID
   * @returns {Promise<Object>} Updated donation
   */
  static async rejectDonation(donationId) {
    const donation = await Donation.findById(donationId);
    if (!donation) {
      throw new AppError('Donation not found', 404);
    }

    if (donation.donation_status !== 'pending') {
      throw new AppError('Can only reject pending donations', 400);
    }

    return await Donation.update(donationId, {
      donation_status: 'rejected'
    });
  }

  /**
   * Complete donation
   * @param {number} donationId - Donation ID
   * @returns {Promise<Object>} Updated donation
   */
  static async completeDonation(donationId) {
    const donation = await Donation.findById(donationId);
    if (!donation) {
      throw new AppError('Donation not found', 404);
    }

    if (donation.donation_status !== 'accepted') {
      throw new AppError('Can only complete accepted donations', 400);
    }

    return await Donation.update(donationId, {
      donation_status: 'completed'
    });
  }
}

module.exports = DonationService;
