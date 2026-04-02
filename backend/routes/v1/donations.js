/**
 * Donation Routes (MVC Pattern)
 * Uses DonationController for all donation endpoints
 */

const express = require('express');
const router = express.Router();
const DonationController = require('../../controllers/donation.controller');
const { authenticate } = require('../../middleware/auth');
const { requireRole } = require('../../middleware/checkAbility');

console.log('🔧 Donation routes initialized with MVC pattern (DonationController)');

// GET /api/v1/donations/ngos - Get all verified NGOs (public, for donation modal)
router.get('/ngos', DonationController.getVerifiedNGOs);

// POST /api/v1/donations - Create donation
router.post('/', authenticate, DonationController.createDonation);

// GET /api/v1/donations/my - Get my donations
router.get('/my', authenticate, DonationController.getMyDonations);

// GET /api/v1/donations/ngo - Get NGO donations
router.get('/ngo', authenticate, requireRole('ngo'), DonationController.getNGODonations);

// GET /api/v1/donations/:id - Get donation by ID
router.get('/:id', authenticate, DonationController.getDonationById);

// PUT /api/v1/donations/:id/accept - Accept donation (NGO)
router.put('/:id/accept', authenticate, requireRole('ngo'), DonationController.acceptDonation);

// PUT /api/v1/donations/:id/reject - Reject donation (NGO)
router.put('/:id/reject', authenticate, requireRole('ngo'), DonationController.rejectDonation);

// PUT /api/v1/donations/:id/complete - Complete donation
router.put('/:id/complete', authenticate, DonationController.completeDonation);

module.exports = router;
