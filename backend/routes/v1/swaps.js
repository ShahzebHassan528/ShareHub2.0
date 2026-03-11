/**
 * Swap Routes (MVC Pattern)
 * Uses SwapController for all swap endpoints
 */

const express = require('express');
const router = express.Router();
const SwapController = require('../../controllers/swap.controller');
const { authenticate } = require('../../middleware/auth');
const { checkAbility } = require('../../middleware/checkAbility');

console.log('🔧 Swap routes initialized with MVC pattern (SwapController)');

// POST /api/v1/swaps - Create swap request
router.post('/', authenticate, SwapController.createSwapRequest);

// GET /api/v1/swaps/received - Get received swap requests
router.get('/received', authenticate, SwapController.getReceivedRequests);

// GET /api/v1/swaps/sent - Get sent swap requests
router.get('/sent', authenticate, SwapController.getSentRequests);

// GET /api/v1/swaps/:id - Get swap by ID
router.get('/:id', authenticate, SwapController.getSwapById);

// PUT /api/v1/swaps/:id/accept - Accept swap
router.put('/:id/accept',
  authenticate,
  checkAbility('update', 'Swap'),
  SwapController.acceptSwap
);

// PUT /api/v1/swaps/:id/reject - Reject swap
router.put('/:id/reject',
  authenticate,
  checkAbility('update', 'Swap'),
  SwapController.rejectSwap
);

// PUT /api/v1/swaps/:id/complete - Complete swap
router.put('/:id/complete',
  authenticate,
  checkAbility('update', 'Swap'),
  SwapController.completeSwap
);

// PUT /api/v1/swaps/:id/cancel - Cancel swap
router.put('/:id/cancel',
  authenticate,
  checkAbility('cancel', 'Swap'),
  SwapController.cancelSwap
);

module.exports = router;
