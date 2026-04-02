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

class DonationService {
  /**
   * Create a new donation
   * @param {Object} donationData - Donation data from controller
   * @returns {Promise<number>} Created donation ID
   */
  static async createDonation(donationData) {
    const { donor_id, ngo_id, product_id, message } = donationData;

    // Validate NGO exists and is approved
    const ngo = await NGO.findById(ngo_id);
    if (!ngo) {
      throw new AppError('NGO not found', 404);
    }

    if (ngo.verification_status !== 'approved') {
      throw new AppError('Can only donate to approved NGOs', 400);
    }

    // Validate product exists and is available
    if (product_id) {
      const product = await Product.findById(product_id);
      if (!product) {
        throw new AppError('Product not found', 404);
      }

      if (!product.is_available) {
        throw new AppError('Product is not available for donation', 400);
      }

      // Mark product as unavailable (donated)
      await Product.updateAvailability(product_id, false);
    }

    // Create donation — wrapper accepts { donor_id, ngo_id, product_id, message, pickup_address }
    const donationId = await Donation.create({
      donor_id,
      ngo_id,
      product_id: product_id || null,
      message: message || null
    });

    // Get donor and NGO info for notification email (async, non-blocking)
    try {
      const donor   = await User.findById(donor_id);
      const ngoUser = await User.findById(ngo.user_id);

      if (donor && ngoUser) {
        JobService.enqueueDonationEmail({
          ngoEmail:  ngoUser.email,
          ngoName:   ngo.ngo_name,
          donorName: donor.full_name,
          amount:    0
        }).catch(err => {
          console.error('Failed to enqueue donation email:', err.message);
        });
      }
    } catch (err) {
      // Non-critical — don't fail the donation if email lookup fails
      console.error('Failed to fetch donor/ngo for email:', err.message);
    }

    return donationId;
  }

  /**
   * Get donation by ID
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
   */
  static async getDonationsByDonor(donorId) {
    return await Donation.findByDonor(donorId);
  }

  /**
   * Get donations by NGO
   */
  static async getDonationsByNGO(ngoId) {
    return await Donation.findByNGO(ngoId);
  }

  /**
   * Accept donation (NGO action)
   */
  static async acceptDonation(donationId, ngoUserId) {
    const donation = await Donation.findById(donationId);
    if (!donation) {
      throw new AppError('Donation not found', 404);
    }

    // wrapper returns status as 'status' field
    const currentStatus = donation.status || donation.donation_status;
    if (currentStatus !== 'pending') {
      throw new AppError('Can only accept pending donations', 400);
    }

    await Donation.updateStatus(donationId, 'accepted');

    // Notify donor
    try {
      await NotificationService.notifyDonationAccepted(
        donation.donor_id,
        'NGO',
        0
      );
    } catch (error) {
      console.error('Failed to send notification:', error.message);
    }

    return await Donation.findById(donationId);
  }

  /**
   * Reject donation (NGO action)
   */
  static async rejectDonation(donationId) {
    const donation = await Donation.findById(donationId);
    if (!donation) {
      throw new AppError('Donation not found', 404);
    }

    const currentStatus = donation.status || donation.donation_status;
    if (currentStatus !== 'pending') {
      throw new AppError('Can only reject pending donations', 400);
    }

    await Donation.updateStatus(donationId, 'rejected');
    return await Donation.findById(donationId);
  }

  /**
   * Complete donation
   */
  static async completeDonation(donationId) {
    const donation = await Donation.findById(donationId);
    if (!donation) {
      throw new AppError('Donation not found', 404);
    }

    const currentStatus = donation.status || donation.donation_status;
    if (currentStatus !== 'accepted') {
      throw new AppError('Can only complete accepted donations', 400);
    }

    await Donation.updateStatus(donationId, 'completed');
    return await Donation.findById(donationId);
  }
}

module.exports = DonationService;
