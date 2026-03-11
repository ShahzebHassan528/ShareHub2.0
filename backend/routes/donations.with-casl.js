/**
 * Donations Routes with CASL Authorization
 * Role-based and ownership-based access control for donations
 */

const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { checkAbility, requireRole } = require('../middleware/checkAbility');
const DonationService = require('../services/donation.service');
const Donation = require('../models/Donation.sequelize.wrapper');
const AppError = require('../utils/AppError');

console.log('🔧 Donation routes initialized with CASL authorization');

// Create donation - BUYER ONLY
router.post('/',
  authenticate,
  checkAbility('create', 'Donation'),
  async (req, res, next) => {
    try {
      const donationData = {
        donor_id: req.user.id,
        ...req.body
      };

      const donationId = await DonationService.createDonation(donationData);

      res.status(201).json({
        success: true,
        message: 'Donation created successfully',
        donation_id: donationId
      });
    } catch (error) {
      next(error);
    }
  }
);

// Get user's donations - BUYER (own donations) or NGO (donations to them)
router.get('/my-donations',
  authenticate,
  requireRole(['buyer', 'ngo']),
  async (req, res, next) => {
    try {
      let donations;

      if (req.user.role === 'buyer') {
        donations = await DonationService.getDonationsByDonor(req.user.id);
      } else if (req.user.role === 'ngo') {
        if (!req.user.ngo_id) {
          throw new AppError('NGO profile not found', 400);
        }
        donations = await DonationService.getDonationsByNGO(req.user.ngo_id);
      }

      res.json({
        success: true,
        count: donations.length,
        donations
      });
    } catch (error) {
      next(error);
    }
  }
);

// Get single donation - DONOR (own donation) or NGO (donation to them) or ADMIN
router.get('/:id',
  authenticate,
  checkAbility('read', 'Donation', async (req) => {
    // Get donation to check ownership
    const donation = await Donation.findById(req.params.id);
    if (!donation) {
      throw new AppError('Donation not found', 404);
    }
    return donation; // CASL will check if user can read this donation
  }),
  async (req, res, next) => {
    try {
      const donation = await DonationService.getDonationById(req.params.id);

      res.json({
        success: true,
        donation
      });
    } catch (error) {
      next(error);
    }
  }
);

// Accept donation - NGO ONLY (for donations to them)
router.patch('/:id/accept',
  authenticate,
  requireRole('ngo'),
  checkAbility('update', 'Donation', async (req) => {
    // Get donation to check ownership
    const donation = await Donation.findById(req.params.id);
    if (!donation) {
      throw new AppError('Donation not found', 404);
    }
    return donation; // CASL will check if NGO can update this donation
  }),
  async (req, res, next) => {
    try {
      if (!req.user.ngo_id) {
        throw new AppError('NGO profile not found', 400);
      }

      const donation = await DonationService.acceptDonation(
        req.params.id,
        req.user.id
      );

      res.json({
        success: true,
        message: 'Donation accepted successfully',
        donation
      });
    } catch (error) {
      next(error);
    }
  }
);

// Reject donation - NGO ONLY (for donations to them)
router.patch('/:id/reject',
  authenticate,
  requireRole('ngo'),
  checkAbility('update', 'Donation', async (req) => {
    // Get donation to check ownership
    const donation = await Donation.findById(req.params.id);
    if (!donation) {
      throw new AppError('Donation not found', 404);
    }
    return donation; // CASL will check if NGO can update this donation
  }),
  async (req, res, next) => {
    try {
      const donation = await DonationService.rejectDonation(req.params.id);

      res.json({
        success: true,
        message: 'Donation rejected',
        donation
      });
    } catch (error) {
      next(error);
    }
  }
);

// Complete donation - NGO ONLY (for donations to them)
router.patch('/:id/complete',
  authenticate,
  requireRole('ngo'),
  checkAbility('update', 'Donation', async (req) => {
    // Get donation to check ownership
    const donation = await Donation.findById(req.params.id);
    if (!donation) {
      throw new AppError('Donation not found', 404);
    }
    return donation; // CASL will check if NGO can update this donation
  }),
  async (req, res, next) => {
    try {
      const donation = await DonationService.completeDonation(req.params.id);

      res.json({
        success: true,
        message: 'Donation completed successfully',
        donation
      });
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
