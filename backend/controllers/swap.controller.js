/**
 * Swap Controller (MVC Pattern)
 * Handles product swap-related HTTP requests
 */

const SwapService = require('../services/swap.service');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

class SwapController {
  /**
   * Create new swap request
   * POST /api/v1/swaps
   */
  static createSwapRequest = catchAsync(async (req, res, next) => {
    const swapData = {
      ...req.body,
      requester_id: req.user.id
    };
    
    const swapId = await SwapService.createSwapRequest(swapData);
    
    res.status(201).json({
      success: true,
      message: 'Swap request created successfully',
      data: { id: swapId }
    });
  });

  /**
   * Get swap by ID
   * GET /api/v1/swaps/:id
   */
  static getSwapById = catchAsync(async (req, res, next) => {
    const swap = await SwapService.getSwapById(req.params.id);
    
    // Check ownership
    if (swap.requester_id !== req.user.id && swap.owner_id !== req.user.id && req.user.role !== 'admin') {
      return next(new AppError('You do not have permission to view this swap', 403));
    }
    
    res.status(200).json({
      success: true,
      data: swap
    });
  });

  /**
   * Get received swap requests
   * GET /api/v1/swaps/received
   */
  static getReceivedRequests = catchAsync(async (req, res, next) => {
    const swaps = await SwapService.getReceivedRequests(req.user.id);
    
    res.status(200).json({
      success: true,
      count: swaps.length,
      data: swaps
    });
  });

  /**
   * Get sent swap requests
   * GET /api/v1/swaps/sent
   */
  static getSentRequests = catchAsync(async (req, res, next) => {
    const swaps = await SwapService.getSentRequests(req.user.id);
    
    res.status(200).json({
      success: true,
      count: swaps.length,
      data: swaps
    });
  });

  /**
   * Accept swap request
   * PUT /api/v1/swaps/:id/accept
   */
  static acceptSwap = catchAsync(async (req, res, next) => {
    const swap = await SwapService.acceptSwap(req.params.id, req.user.id);
    
    res.status(200).json({
      success: true,
      message: 'Swap accepted successfully',
      data: swap
    });
  });

  /**
   * Reject swap request
   * PUT /api/v1/swaps/:id/reject
   */
  static rejectSwap = catchAsync(async (req, res, next) => {
    const swap = await SwapService.rejectSwap(req.params.id, req.user.id);
    
    res.status(200).json({
      success: true,
      message: 'Swap rejected',
      data: swap
    });
  });

  /**
   * Complete swap
   * PUT /api/v1/swaps/:id/complete
   */
  static completeSwap = catchAsync(async (req, res, next) => {
    const swap = await SwapService.completeSwap(req.params.id, req.user.id);
    
    res.status(200).json({
      success: true,
      message: 'Swap completed successfully',
      data: swap
    });
  });

  /**
   * Cancel swap request
   * PUT /api/v1/swaps/:id/cancel
   */
  static cancelSwap = catchAsync(async (req, res, next) => {
    const swap = await SwapService.cancelSwap(req.params.id, req.user.id);
    
    res.status(200).json({
      success: true,
      message: 'Swap cancelled successfully',
      data: swap
    });
  });
}

module.exports = SwapController;
