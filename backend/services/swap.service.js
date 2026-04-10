/**
 * Swap Service
 * Business logic for product swap management
 */

const Swap = require('../models/Swap.sequelize.wrapper');
const Product = require('../models/Product.sequelize.wrapper');
const NotificationService = require('./notificationService');
const AppError = require('../utils/AppError');

class SwapService {
  /**
   * Create a new swap request
   * @param {Object} swapData - Swap request data
   * @returns {Promise<number>} Created swap ID
   */
  static async createSwapRequest(swapData) {
    const { requester_id, owner_id, requester_product_id, owner_product_id } = swapData;

    console.log('🔄 Creating swap request with data:', {
      requester_id,
      owner_id,
      requester_product_id,
      owner_product_id
    });

    // Validate requester product
    const requesterProduct = await Product.findById(requester_product_id);
    console.log('📦 Requester product:', requesterProduct ? {
      id: requesterProduct.id,
      title: requesterProduct.title,
      is_available: requesterProduct.is_available
    } : 'NOT FOUND');
    
    if (!requesterProduct) {
      throw new AppError('Requester product not found', 404);
    }

    if (!requesterProduct.is_available) {
      console.log('❌ Requester product is not available');
      throw new AppError('Your product is not available for swap', 400);
    }

    // Validate owner product
    const ownerProduct = await Product.findById(owner_product_id);
    console.log('📦 Owner product:', ownerProduct ? {
      id: ownerProduct.id,
      title: ownerProduct.title,
      is_available: ownerProduct.is_available
    } : 'NOT FOUND');
    
    if (!ownerProduct) {
      throw new AppError('Owner product not found', 404);
    }

    if (!ownerProduct.is_available) {
      console.log('❌ Owner product is not available');
      throw new AppError('Requested product is not available for swap', 400);
    }

    console.log('✓ Both products are available, creating swap...');

    // Create swap request
    const swapId = await Swap.create({
      requester_id,
      owner_id,
      requester_product_id,
      owner_product_id,
      swap_status: 'pending'
    });

    console.log('✓ Swap created with ID:', swapId);

    // Notify the product owner about the swap request
    try {
      await NotificationService.notifySwapRequest(
        owner_id,
        ownerProduct.title,
        requesterProduct.title
      );
      console.log('✓ Notification sent to owner');
    } catch (error) {
      console.error('Failed to send swap notification:', error.message);
    }

    return swapId;
  }

  /**
   * Get swap by ID
   * @param {number} swapId - Swap ID
   * @returns {Promise<Object>} Swap data
   */
  static async getSwapById(swapId) {
    const swap = await Swap.findById(swapId);
    if (!swap) {
      throw new AppError('Swap not found', 404);
    }
    return swap;
  }

  /**
   * Get swap requests received by user
   * @param {number} userId - User ID
   * @returns {Promise<Array>} List of swap requests
   */
  static async getReceivedRequests(userId) {
    return await Swap.findByOwner(userId);
  }

  /**
   * Get swap requests sent by user
   * @param {number} userId - User ID
   * @returns {Promise<Array>} List of swap requests
   */
  static async getSentRequests(userId) {
    return await Swap.findByRequester(userId);
  }

  /**
   * Accept swap request (owner action)
   * @param {number} swapId - Swap ID
   * @param {number} ownerId - Owner user ID
   * @returns {Promise<Object>} Updated swap
   */
  static async acceptSwap(swapId, ownerId) {
    const swap = await Swap.findById(swapId);
    if (!swap) {
      throw new AppError('Swap not found', 404);
    }

    if (swap.owner_id !== ownerId) {
      throw new AppError('Only the owner can accept this swap', 403);
    }

    if (swap.status !== 'pending') {
      throw new AppError('Can only accept pending swaps', 400);
    }

    // Use wrapper method which handles transaction
    const updatedSwap = await Swap.accept(swapId, ownerId);

    // Notify requester
    try {
      await NotificationService.notifySwapAccepted(
        swap.requester_id,
        'Product' // You can pass product title if available
      );
    } catch (error) {
      console.error('Failed to send notification:', error.message);
    }

    return updatedSwap;
  }

  /**
   * Reject swap request (owner action)
   * @param {number} swapId - Swap ID
   * @param {number} ownerId - Owner user ID
   * @returns {Promise<Object>} Updated swap
   */
  static async rejectSwap(swapId, ownerId) {
    const swap = await Swap.findById(swapId);
    if (!swap) {
      throw new AppError('Swap not found', 404);
    }

    if (swap.owner_id !== ownerId) {
      throw new AppError('Only the owner can reject this swap', 403);
    }

    if (swap.status !== 'pending') {
      throw new AppError('Can only reject pending swaps', 400);
    }

    return await Swap.reject(swapId, ownerId);
  }

  /**
   * Complete swap (either party can mark as complete)
   * @param {number} swapId - Swap ID
   * @param {number} userId - User ID (requester or owner)
   * @returns {Promise<Object>} Updated swap
   */
  static async completeSwap(swapId, userId) {
    const swap = await Swap.findById(swapId);
    if (!swap) {
      throw new AppError('Swap not found', 404);
    }

    if (swap.requester_id !== userId && swap.owner_id !== userId) {
      throw new AppError('Only swap participants can complete the swap', 403);
    }

    if (swap.status !== 'accepted') {
      throw new AppError('Can only complete accepted swaps', 400);
    }

    return await Swap.complete(swapId, userId);
  }

  /**
   * Cancel swap (requester can cancel)
   * @param {number} swapId - Swap ID
   * @param {number} requesterId - Requester user ID
   * @returns {Promise<Object>} Updated swap
   */
  static async cancelSwap(swapId, requesterId) {
    const swap = await Swap.findById(swapId);
    if (!swap) {
      throw new AppError('Swap not found', 404);
    }

    if (swap.requester_id !== requesterId) {
      throw new AppError('Only the requester can cancel this swap', 403);
    }

    if (swap.status === 'completed') {
      throw new AppError('Cannot cancel completed swap', 400);
    }

    // Use wrapper method which handles transaction - pass both swapId and requesterId
    return await Swap.cancel(swapId, requesterId);
  }
}

module.exports = SwapService;
