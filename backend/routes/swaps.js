const express = require('express');
const { authenticate } = require('../middleware/auth');
const { checkAbility, authorize } = require('../middleware/checkAbility');
const NotificationService = require('../services/notificationService');
const AppError = require('../utils/AppError');
const router = express.Router();

// Use Sequelize wrapper with fallback to raw SQL
const USE_SEQUELIZE = process.env.USE_SEQUELIZE !== 'false'; // Default to true
const Swap = USE_SEQUELIZE 
  ? require('../models/Swap.sequelize.wrapper')
  : require('../models/Swap');

// Log which Swap model is being used
console.log(`🔧 Swap routes initialized with ${USE_SEQUELIZE ? 'Sequelize ORM' : 'Raw SQL'} Swap model + CASL authorization`);

// Get all swap items with filters
router.get('/', async (req, res) => {
  try {
    const filters = {
      category: req.query.category,
      condition: req.query.condition
    };
    
    const swaps = await Swap.findAll(filters);
    res.json(swaps);
  } catch (error) {
    console.error('Error fetching swaps:', error);
    res.status(500).json({ error: 'Failed to fetch swap items' });
  }
});

/**
 * GET /api/swaps/my/requests
 * Get swaps requested by current user
 */
router.get('/my/requests', authenticate, async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    // Check permission
    authorize(req, 'read', 'Swap', { requester_id: userId });
    
    console.log(`📋 Fetching swap requests for user ${userId}`);
    
    const swaps = await Swap.findByRequester(userId);
    
    res.json({
      message: 'Swap requests retrieved successfully',
      count: swaps.length,
      swaps
    });
    
  } catch (error) {
    console.error('❌ Error fetching swap requests:', error);
    next(error);
  }
});

/**
 * GET /api/swaps/my/offers
 * Get swaps where current user is the owner
 */
router.get('/my/offers', authenticate, async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    // Check permission
    authorize(req, 'read', 'Swap', { owner_id: userId });
    
    console.log(`📋 Fetching swap offers for user ${userId}`);
    
    const swaps = await Swap.findByOwner(userId);
    
    res.json({
      message: 'Swap offers retrieved successfully',
      count: swaps.length,
      swaps
    });
    
  } catch (error) {
    console.error('❌ Error fetching swap offers:', error);
    next(error);
  }
});

// Get single swap item by ID
router.get('/:id', async (req, res) => {
  try {
    const swap = await Swap.findById(req.params.id);
    
    if (!swap) {
      return res.status(404).json({ error: 'Swap item not found' });
    }
    
    res.json(swap);
  } catch (error) {
    console.error('Error fetching swap:', error);
    res.status(500).json({ error: 'Failed to fetch swap item' });
  }
});

/**
 * POST /api/swaps
 * Create a new swap request
 */
router.post('/', authenticate, async (req, res, next) => {
  try {
    const { requested_item_id, offered_item_id, message } = req.body;
    const requesterId = req.user.id;
    
    // Validation
    if (!requested_item_id || !offered_item_id) {
      return res.status(400).json({ 
        error: 'Both requested_item_id and offered_item_id are required' 
      });
    }
    
    console.log(`🔄 User ${requesterId} requesting swap: offering ${offered_item_id} for ${requested_item_id}`);
    
    const swapId = await Swap.create({
      requester_id: requesterId,
      requested_item_id: parseInt(requested_item_id),
      offered_item_id: parseInt(offered_item_id),
      message: message || null
    });
    
    // Create notification for product owner
    try {
      const Product = require('../models/Product.sequelize.wrapper');
      const requestedProduct = await Product.findById(requested_item_id);
      
      if (requestedProduct && requestedProduct.seller_id) {
        await NotificationService.notifySwapRequest(
          requestedProduct.seller_id,
          requestedProduct.title || 'your item'
        );
      }
    } catch (notifError) {
      console.error('⚠️  Failed to create notification:', notifError.message);
    }
    
    res.status(201).json({
      message: 'Swap request created successfully',
      swap_id: swapId
    });
    
  } catch (error) {
    console.error('❌ Error creating swap request:', error);
    next(error);
  }
});

/**
 * PUT /api/swaps/accept/:id
 * Accept a swap request
 * Only the owner can accept
 */
router.put('/accept/:id',
  authenticate,
  checkAbility('update', 'Swap', async (req) => {
    const swap = await Swap.findById(req.params.id);
    if (!swap) {
      throw new AppError('Swap not found', 404);
    }
    return swap;
  }),
  async (req, res, next) => {
    try {
      const swapId = parseInt(req.params.id);
      const ownerId = req.user.id;
      
      console.log(`✅ Owner ${ownerId} accepting swap ${swapId}`);
      
      const swap = await Swap.accept(swapId, ownerId);
      
      // Create notification for requester
      try {
        const swapDetails = await Swap.findById(swapId);
        await NotificationService.notifySwapAccepted(
          swap.requester_id,
          swapDetails.item_title || 'your item'
        );
      } catch (notifError) {
        console.error('⚠️  Failed to create notification:', notifError.message);
      }
      
      res.json({
        message: 'Swap accepted successfully',
        swap
      });
      
    } catch (error) {
      console.error('❌ Error accepting swap:', error);
      next(error);
    }
  }
);

/**
 * PUT /api/swaps/reject/:id
 * Reject a swap request
 * Only the owner can reject
 */
router.put('/reject/:id',
  authenticate,
  checkAbility('update', 'Swap', async (req) => {
    const swap = await Swap.findById(req.params.id);
    if (!swap) {
      throw new AppError('Swap not found', 404);
    }
    return swap;
  }),
  async (req, res, next) => {
    try {
      const swapId = parseInt(req.params.id);
      const ownerId = req.user.id;
      
      console.log(`❌ Owner ${ownerId} rejecting swap ${swapId}`);
      
      const swap = await Swap.reject(swapId, ownerId);
      
      res.json({
        message: 'Swap rejected successfully',
        swap
      });
      
    } catch (error) {
      console.error('❌ Error rejecting swap:', error);
      next(error);
    }
  }
);

/**
 * PUT /api/swaps/complete/:id
 * Mark swap as completed
 * Can be called by either requester or owner
 */
router.put('/complete/:id',
  authenticate,
  checkAbility('update', 'Swap', async (req) => {
    const swap = await Swap.findById(req.params.id);
    if (!swap) {
      throw new AppError('Swap not found', 404);
    }
    // Check if user is either requester or owner
    if (swap.requester_id !== req.user.id && swap.owner_id !== req.user.id) {
      throw new AppError('You do not have permission to complete this swap', 403);
    }
    return swap;
  }),
  async (req, res, next) => {
    try {
      const swapId = parseInt(req.params.id);
      const userId = req.user.id;
      
      console.log(`✅ User ${userId} completing swap ${swapId}`);
      
      const swap = await Swap.complete(swapId, userId);
      
      res.json({
        message: 'Swap marked as completed',
        swap
      });
      
    } catch (error) {
      console.error('❌ Error completing swap:', error);
      next(error);
    }
  }
);

/**
 * PUT /api/swaps/cancel/:id
 * Cancel a swap request
 * Only the requester can cancel
 */
router.put('/cancel/:id',
  authenticate,
  checkAbility('cancel', 'Swap', async (req) => {
    const swap = await Swap.findById(req.params.id);
    if (!swap) {
      throw new AppError('Swap not found', 404);
    }
    return swap;
  }),
  async (req, res, next) => {
    try {
      const swapId = parseInt(req.params.id);
      const requesterId = req.user.id;
      
      console.log(`🚫 Requester ${requesterId} cancelling swap ${swapId}`);
      
      const swap = await Swap.cancel(swapId, requesterId);
      
      res.json({
        message: 'Swap cancelled successfully',
        swap
      });
      
    } catch (error) {
      console.error('❌ Error cancelling swap:', error);
      next(error);
    }
  }
);

module.exports = router;
