/**
 * Donation Controller (MVC Pattern)
 * Handles donation-related HTTP requests
 */

const DonationService = require('../services/donation.service');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const { NGO: NGOModel, User } = require('../database/models');

class DonationController {
  /**
   * Get all verified (approved) NGOs for the donation modal
   * GET /api/v1/donations/ngos  — public, no auth required
   */
  static getVerifiedNGOs = catchAsync(async (req, res, next) => {
    const ngos = await NGOModel.findAll({
      where: { verification_status: 'approved' },
      include: [{ model: User, as: 'user', attributes: ['id', 'full_name', 'email'] }],
      attributes: ['id', 'user_id', 'ngo_name', 'description', 'address', 'website'],
      order: [['ngo_name', 'ASC']]
    });

    res.status(200).json({
      success: true,
      count: ngos.length,
      ngos
    });
  });

  /**
   * Create new donation
   * POST /api/v1/donations
   */
  static createDonation = catchAsync(async (req, res, next) => {
    const donationData = {
      ...req.body,
      donor_id: req.user.id
    };

    const donationId = await DonationService.createDonation(donationData);

    res.status(201).json({
      success: true,
      message: 'Donation created successfully',
      data: { id: donationId }
    });
  });

  /**
   * Get donation by ID
   * GET /api/v1/donations/:id
   */
  static getDonationById = catchAsync(async (req, res, next) => {
    const donation = await DonationService.getDonationById(req.params.id);

    res.status(200).json({
      success: true,
      data: donation
    });
  });

  /**
   * Get my donations (as donor)
   * GET /api/v1/donations/my
   */
  static getMyDonations = catchAsync(async (req, res, next) => {
    const donations = await DonationService.getDonationsByDonor(req.user.id);

    res.status(200).json({
      success: true,
      count: donations.length,
      data: donations
    });
  });

  /**
   * Get donations for NGO
   * GET /api/v1/donations/ngo
   *
   * FIX: req.user.ngo_id is never set by auth middleware.
   * Look up the NGO record by user_id instead (same pattern as seller dashboard).
   */
  static getNGODonations = catchAsync(async (req, res, next) => {
    const { NGO } = require('../database/models');
    const ngo = await NGO.findOne({ where: { user_id: req.user.id } });

    if (!ngo) {
      return next(new AppError('NGO profile not found', 400));
    }

    const donations = await DonationService.getDonationsByNGO(ngo.id);

    res.status(200).json({
      success: true,
      count: donations.length,
      donations: donations   // key is 'donations' to match frontend expectation
    });
  });

  /**
   * Accept donation (NGO action)
   * PUT /api/v1/donations/:id/accept
   */
  static acceptDonation = catchAsync(async (req, res, next) => {
    const donation = await DonationService.acceptDonation(req.params.id, req.user.id);

    res.status(200).json({
      success: true,
      message: 'Donation accepted successfully',
      data: donation
    });
  });

  /**
   * Reject donation (NGO action)
   * PUT /api/v1/donations/:id/reject
   */
  static rejectDonation = catchAsync(async (req, res, next) => {
    const donation = await DonationService.rejectDonation(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Donation rejected',
      data: donation
    });
  });

  /**
   * Complete donation
   * PUT /api/v1/donations/:id/complete
   */
  static completeDonation = catchAsync(async (req, res, next) => {
    const donation = await DonationService.completeDonation(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Donation completed successfully',
      data: donation
    });
  });
}

module.exports = DonationController;
