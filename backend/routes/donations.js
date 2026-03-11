const express = require('express');
const { authenticate } = require('../middleware/auth');
const NotificationService = require('../services/notificationService');
const router = express.Router();

// Use Sequelize wrapper
const USE_SEQUELIZE = process.env.USE_SEQUELIZE !== 'false';
const Donation = USE_SEQUELIZE 
  ? require('../models/Donation.sequelize.wrapper')
  : require('../models/Donation');

const NGO = require('../models/NGO.sequelize.wrapper');

console.log(`🔧 Donation routes initialized with ${USE_SEQUELIZE ? 'Sequelize ORM' : 'Raw SQL'} Donation model`);

/**
 * GET /api/donations/ngos
 * Get list of verified NGOs
 */
router.get('/ngos', async (req, res, next) => {
  try {
    console.log('📋 Fetching verified NGOs');
    
    const ngos = await NGO.findAll({ is_verified: true });
    
    res.json({
      message: 'NGOs retrieved successfully',
      count: ngos.length,
      ngos
    });
    
  } catch (error) {
    console.error('❌ Error fetching NGOs:', error);
    next(error);
  }
});

/**
 * POST /api/donations
 * Create a new donation request
 */
router.post('/', authenticate, async (req, res, next) => {
  try {
    const { product_id, ngo_id, message } = req.body;
    const donorId = req.user.id;
    
    // Validation
    if (!product_id || !ngo_id) {
      return res.status(400).json({ 
        error: 'Both product_id and ngo_id are required' 
      });
    }
    
    console.log(`💝 User ${donorId} donating product ${product_id} to NGO ${ngo_id}`);
    
    const donationId = await Donation.create({
      donor_id: donorId,
      product_id: parseInt(product_id),
      ngo_id: parseInt(ngo_id),
      message: message || null
    });
    
    // Create notification for NGO
    try {
      const Product = require('../models/Product.sequelize.wrapper');
      const product = await Product.findById(product_id);
      
      if (product) {
        await NotificationService.notifyDonationRequest(
          ngo_id,
          product.title || 'an item'
        );
      }
    } catch (notifError) {
      console.error('⚠️  Failed to create notification:', notifError.message);
    }
    
    res.status(201).json({
      message: 'Donation request created successfully',
      donation_id: donationId
    });
    
  } catch (error) {
    console.error('❌ Error creating donation request:', error);
    next(error);
  }
});

/**
 * GET /api/donations/my
 * Get donations made by current user
 */
router.get('/my', authenticate, async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    console.log(`📋 Fetching donations for user ${userId}`);
    
    const donations = await Donation.findByDonor(userId);
    
    res.json({
      message: 'Your donations retrieved successfully',
      count: donations.length,
      donations
    });
    
  } catch (error) {
    console.error('❌ Error fetching donations:', error);
    next(error);
  }
});

/**
 * GET /api/donations/ngo
 * Get donations for NGO (NGO role only)
 */
router.get('/ngo', authenticate, async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    // Get NGO profile for this user
    const ngo = await NGO.findByUserId(userId);
    
    if (!ngo) {
      return res.status(403).json({ 
        error: 'NGO profile not found. Only NGOs can access this endpoint.' 
      });
    }
    
    console.log(`📋 Fetching donations for NGO ${ngo.id}`);
    
    const donations = await Donation.findByNGO(ngo.id);
    
    res.json({
      message: 'NGO donations retrieved successfully',
      count: donations.length,
      donations
    });
    
  } catch (error) {
    console.error('❌ Error fetching NGO donations:', error);
    next(error);
  }
});

/**
 * PUT /api/donations/accept/:id
 * Accept a donation request (NGO only)
 */
router.put('/accept/:id', authenticate, async (req, res, next) => {
  try {
    const donationId = parseInt(req.params.id);
    const userId = req.user.id;
    
    // Get NGO profile
    const ngo = await NGO.findByUserId(userId);
    
    if (!ngo) {
      return res.status(403).json({ 
        error: 'Only NGOs can accept donations' 
      });
    }
    
    console.log(`✅ NGO ${ngo.id} accepting donation ${donationId}`);
    
    await Donation.accept(donationId, ngo.id);
    
    // Get updated donation
    const donation = await Donation.findById(donationId);
    
    // Notify donor
    try {
      await NotificationService.notifyDonationAccepted(
        donation.donor_id,
        ngo.ngo_name
      );
    } catch (notifError) {
      console.error('⚠️  Failed to create notification:', notifError.message);
    }
    
    res.json({
      message: 'Donation accepted successfully',
      donation
    });
    
  } catch (error) {
    console.error('❌ Error accepting donation:', error);
    next(error);
  }
});

/**
 * PUT /api/donations/reject/:id
 * Reject a donation request (NGO only)
 */
router.put('/reject/:id', authenticate, async (req, res, next) => {
  try {
    const donationId = parseInt(req.params.id);
    const userId = req.user.id;
    
    // Get NGO profile
    const ngo = await NGO.findByUserId(userId);
    
    if (!ngo) {
      return res.status(403).json({ 
        error: 'Only NGOs can reject donations' 
      });
    }
    
    console.log(`❌ NGO ${ngo.id} rejecting donation ${donationId}`);
    
    await Donation.reject(donationId, ngo.id);
    
    // Get updated donation
    const donation = await Donation.findById(donationId);
    
    res.json({
      message: 'Donation rejected',
      donation
    });
    
  } catch (error) {
    console.error('❌ Error rejecting donation:', error);
    next(error);
  }
});

module.exports = router;
