/**
 * Donation Controller (MVC Pattern)
 * Handles donation-related HTTP requests
 */

const DonationService = require('../services/donation.service');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

class DonationController {
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
   */
  static getNGODonations = catchAsync(async (req, res, next) => {
    if (!req.user.ngo_id) {
      return next(new AppError('NGO profile required', 400));
    }
    
    const donations = await DonationService.getDonationsByNGO(req.user.ngo_id);
    
    res.status(200).json({
      success: true,
      count: donations.length,
      data: donations
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
