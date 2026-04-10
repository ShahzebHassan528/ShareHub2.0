/**
 * Swap Model - Sequelize Wrapper
 * 
 * This wrapper provides 100% API compatibility with the raw SQL version
 * while using Sequelize ORM under the hood.
 * 
 * Original: models/Swap.js (raw SQL)
 * Backup: models/Swap.raw-sql.backup.js
 */

const { ProductSwap, Product, Category, User, ProductImage, sequelize } = require('../database/models');
const { Op } = require('sequelize');

class Swap {
  /**
   * Find all swap items with optional filters
   * @param {Object} filters - Filter options (category, condition)
   * @returns {Promise<Array>} - Array of swap items
   */
  static async findAll(filters = {}) {
    console.log('🔷 Swap.findAll() called with Sequelize, filters:', filters);
    try {
      const whereClause = { status: 'pending' };
      const includeClause = [
        {
          model: Product,
          as: 'ownerProduct',
          attributes: ['title', 'description', 'product_condition'],
          include: [
            {
              model: Category,
              as: 'category',
              attributes: ['name'],
              where: filters.category ? { name: filters.category } : undefined
            }
          ],
          where: filters.condition ? { product_condition: filters.condition } : undefined
        },
        {
          model: User,
          as: 'owner',
          attributes: ['full_name']
        }
      ];

      const swaps = await ProductSwap.findAll({
        where: whereClause,
        include: includeClause,
        order: [['created_at', 'DESC']],
        raw: false
      });

      // Flatten structure and add additional data
      const result = await Promise.all(swaps.map(async (swap) => {
        const plain = swap.get({ plain: true });
        
        // Get primary image
        const primaryImage = await ProductImage.findOne({
          where: { 
            product_id: plain.owner_product_id,
            is_primary: true
          },
          attributes: ['image_url'],
          raw: true
        });

        // Count successful swaps
        const successfulSwaps = await ProductSwap.count({
          where: {
            owner_id: plain.owner_id,
            status: 'completed'
          }
        });

        return {
          ...plain,
          item_title: plain.ownerProduct?.title || null,
          description: plain.ownerProduct?.description || null,
          product_condition: plain.ownerProduct?.product_condition || null,
          category_name: plain.ownerProduct?.category?.name || null,
          owner_name: plain.owner?.full_name || null,
          primary_image: primaryImage?.image_url || null,
          successful_swaps: successfulSwaps,
          ownerProduct: undefined, // Remove nested objects
          owner: undefined
        };
      }));

      console.log('✅ Swap.findAll() successful, found:', result.length);
      return result;
    } catch (error) {
      console.error('❌ Swap.findAll() failed:', error.message);
      throw error;
    }
  }

  /**
   * Find swap item by ID
   * @param {number} id - Swap ID
   * @returns {Promise<Object|null>} - Swap object with details or null
   */
  static async findById(id) {
    console.log('🔷 Swap.findById() called with Sequelize for ID:', id);
    try {
      const swap = await ProductSwap.findByPk(id, {
        include: [
          {
            model: Product,
            as: 'ownerProduct',
            attributes: ['title', 'description', 'product_condition'],
            include: [
              {
                model: Category,
                as: 'category',
                attributes: ['name']
              }
            ]
          },
          {
            model: User,
            as: 'owner',
            attributes: ['full_name', 'email']
          }
        ],
        raw: false
      });

      if (!swap) {
        console.log('✅ Swap.findById() - not found');
        return null;
      }

      const plain = swap.get({ plain: true });

      // Get all images for the swap item
      const images = await ProductImage.findAll({
        where: { product_id: plain.owner_product_id },
        attributes: ['image_url', 'is_primary'],
        order: [['display_order', 'ASC']],
        raw: true
      });

      // Count successful swaps
      const successfulSwaps = await ProductSwap.count({
        where: {
          owner_id: plain.owner_id,
          status: 'completed'
        }
      });

      const result = {
        ...plain,
        item_title: plain.ownerProduct?.title || null,
        description: plain.ownerProduct?.description || null,
        product_condition: plain.ownerProduct?.product_condition || null,
        category_name: plain.ownerProduct?.category?.name || null,
        owner_name: plain.owner?.full_name || null,
        owner_email: plain.owner?.email || null,
        successful_swaps: successfulSwaps,
        images: images,
        ownerProduct: undefined, // Remove nested objects
        owner: undefined
      };

      console.log('✅ Swap.findById() successful');
      return result;
    } catch (error) {
      console.error('❌ Swap.findById() failed:', error.message);
      throw error;
    }
  }

  /**
   * Create a new swap request
   * @param {Object} swapData - Swap data
   * @returns {Promise<number>} - Swap ID
   */
  static async create(swapData) {
    console.log('🔷 Swap.create() called with Sequelize');
    try {
      // Generate swap_number if not provided
      const swapNumber = swapData.swap_number || `SWP-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
      
      const swap = await ProductSwap.create({
        requester_id: swapData.requester_id,
        requester_product_id: swapData.requester_product_id,
        owner_id: swapData.owner_id,
        owner_product_id: swapData.owner_product_id,
        swap_number: swapNumber,
        message: swapData.message
      });

      console.log('✅ Swap.create() successful, ID:', swap.id, 'swap_number:', swapNumber);
      return swap.id; // Return number, not object
    } catch (error) {
      console.error('❌ Swap.create() failed:', error.message);
      throw error;
    }
  }

  // ========== Additional Sequelize-Specific Methods ==========

  /**
   * Update swap status
   * @param {number} swapId - Swap ID
   * @param {string} status - New status
   * @returns {Promise<void>}
   */
  static async updateStatus(swapId, status) {
    console.log('🔷 Swap.updateStatus() called with Sequelize for ID:', swapId);
    try {
      await ProductSwap.update(
        { status },
        { where: { id: swapId } }
      );
      
      console.log('✅ Swap.updateStatus() successful');
    } catch (error) {
      console.error('❌ Swap.updateStatus() failed:', error.message);
      throw error;
    }
  }

  /**
   * Find swaps by requester
   * @param {number} requesterId - Requester user ID
   * @returns {Promise<Array>} - Array of swaps
   */
  static async findByRequester(requesterId) {
    console.log('🔷 Swap.findByRequester() called with Sequelize for requester:', requesterId);
    try {
      const swaps = await ProductSwap.findAll({
        where: { 
          requester_id: requesterId,
          status: { [Op.ne]: 'rejected' } // Exclude rejected/cancelled swaps
        },
        include: [
          {
            model: Product,
            as: 'ownerProduct',
            attributes: ['id', 'title', 'price', 'product_condition'],
            include: [
              {
                model: ProductImage,
                as: 'images',
                attributes: ['image_url'],
                where: { is_primary: true },
                required: false
              }
            ]
          },
          {
            model: Product,
            as: 'requesterProduct',
            attributes: ['id', 'title', 'price', 'product_condition'],
            include: [
              {
                model: ProductImage,
                as: 'images',
                attributes: ['image_url'],
                where: { is_primary: true },
                required: false
              }
            ]
          },
          {
            model: User,
            as: 'owner',
            attributes: ['full_name']
          }
        ],
        order: [['created_at', 'DESC']],
        raw: false
      });

      const result = swaps.map(s => {
        const plain = s.get({ plain: true });
        return {
          ...plain,
          // Owner product (what they want)
          requested_item_title: plain.ownerProduct?.title || null,
          requested_item_price: plain.ownerProduct?.price || null,
          requested_item_condition: plain.ownerProduct?.product_condition || null,
          requested_item_image: plain.ownerProduct?.images?.[0]?.image_url ? 
            `http://localhost:5000${plain.ownerProduct.images[0].image_url}` : null,
          
          // Requester product (what they offer)
          offered_item_title: plain.requesterProduct?.title || null,
          offered_item_price: plain.requesterProduct?.price || null,
          offered_item_condition: plain.requesterProduct?.product_condition || null,
          offered_item_image: plain.requesterProduct?.images?.[0]?.image_url ? 
            `http://localhost:5000${plain.requesterProduct.images[0].image_url}` : null,
          
          owner_name: plain.owner?.full_name || null,
          
          // Clean up nested objects
          ownerProduct: undefined,
          requesterProduct: undefined,
          owner: undefined
        };
      });

      console.log('✅ Swap.findByRequester() successful, found:', result.length);
      return result;
    } catch (error) {
      console.error('❌ Swap.findByRequester() failed:', error.message);
      throw error;
    }
  }

  /**
   * Find swaps by owner
   * @param {number} ownerId - Owner user ID
   * @returns {Promise<Array>} - Array of swaps
   */
  static async findByOwner(ownerId) {
    console.log('🔷 Swap.findByOwner() called with Sequelize for owner:', ownerId);
    try {
      const swaps = await ProductSwap.findAll({
        where: { 
          owner_id: ownerId,
          status: { [Op.ne]: 'rejected' } // Exclude rejected/cancelled swaps
        },
        include: [
          {
            model: Product,
            as: 'requesterProduct',
            attributes: ['title', 'product_condition']
          },
          {
            model: User,
            as: 'requester',
            attributes: ['full_name']
          }
        ],
        order: [['created_at', 'DESC']],
        raw: false
      });

      const result = swaps.map(s => {
        const plain = s.get({ plain: true });
        return {
          ...plain,
          requester_item_title: plain.requesterProduct?.title || null,
          requester_product_condition: plain.requesterProduct?.product_condition || null,
          requester_name: plain.requester?.full_name || null,
          requesterProduct: undefined,
          requester: undefined
        };
      });

      console.log('✅ Swap.findByOwner() successful, found:', result.length);
      return result;
    } catch (error) {
      console.error('❌ Swap.findByOwner() failed:', error.message);
      throw error;
    }
  }

  /**
   * Accept a swap request
   * Uses transaction to ensure atomic updates
   * @param {number} swapId - Swap ID
   * @param {number} ownerId - Owner user ID (for authorization)
   * @returns {Promise<Object>} - Updated swap
   */
  static async accept(swapId, ownerId) {
    console.log(`🔷 Swap.accept() called for swap ${swapId} by owner ${ownerId}`);
    
    const transaction = await sequelize.transaction();
    
    try {
      // Get swap details
      const swap = await ProductSwap.findByPk(swapId, { transaction });
      
      if (!swap) {
        throw new Error('Swap not found');
      }
      
      // Verify owner
      if (swap.owner_id !== ownerId) {
        throw new Error('Unauthorized: Only the owner can accept this swap');
      }
      
      // Check if already processed
      if (swap.status !== 'pending') {
        throw new Error(`Swap is already ${swap.status}`);
      }
      
      // Update swap status
      await swap.update({ status: 'accepted' }, { transaction });
      
      // Update both products to unavailable (reserved for swap)
      await Product.update(
        { is_available: false },
        { 
          where: { 
            id: { [Op.in]: [swap.requester_product_id, swap.owner_product_id] }
          },
          transaction 
        }
      );
      
      await transaction.commit();
      
      console.log('✅ Swap.accept() successful - both products marked unavailable');
      return swap.toJSON();
    } catch (error) {
      await transaction.rollback();
      console.error('❌ Swap.accept() failed:', error.message);
      throw error;
    }
  }

  /**
   * Reject a swap request
   * @param {number} swapId - Swap ID
   * @param {number} ownerId - Owner user ID (for authorization)
   * @returns {Promise<Object>} - Updated swap
   */
  static async reject(swapId, ownerId) {
    console.log(`🔷 Swap.reject() called for swap ${swapId} by owner ${ownerId}`);
    
    try {
      // Get swap details
      const swap = await ProductSwap.findByPk(swapId);
      
      if (!swap) {
        throw new Error('Swap not found');
      }
      
      // Verify owner
      if (swap.owner_id !== ownerId) {
        throw new Error('Unauthorized: Only the owner can reject this swap');
      }
      
      // Check if already processed
      if (swap.status !== 'pending') {
        throw new Error(`Swap is already ${swap.status}`);
      }
      
      // Update swap status
      await swap.update({ status: 'rejected' });
      
      console.log('✅ Swap.reject() successful');
      return swap.toJSON();
    } catch (error) {
      console.error('❌ Swap.reject() failed:', error.message);
      throw error;
    }
  }

  /**
   * Complete a swap (mark as completed)
   * Can be called by either party
   * @param {number} swapId - Swap ID
   * @param {number} userId - User ID (requester or owner)
   * @returns {Promise<Object>} - Updated swap
   */
  static async complete(swapId, userId) {
    console.log(`🔷 Swap.complete() called for swap ${swapId} by user ${userId}`);
    
    try {
      // Get swap details
      const swap = await ProductSwap.findByPk(swapId);
      
      if (!swap) {
        throw new Error('Swap not found');
      }
      
      // Verify user is part of the swap
      if (swap.requester_id !== userId && swap.owner_id !== userId) {
        throw new Error('Unauthorized: You are not part of this swap');
      }
      
      // Check if swap is accepted
      if (swap.status !== 'accepted') {
        throw new Error(`Cannot complete swap with status: ${swap.status}`);
      }
      
      // Update swap status
      await swap.update({ status: 'completed' });
      
      console.log('✅ Swap.complete() successful');
      return swap.toJSON();
    } catch (error) {
      console.error('❌ Swap.complete() failed:', error.message);
      throw error;
    }
  }

  /**
   * Cancel a swap (by requester only, only if pending)
   * @param {number} swapId - Swap ID
   * @param {number} requesterId - Requester user ID
   * @returns {Promise<Object>} - Updated swap
   */
  static async cancel(swapId, requesterId) {
    console.log(`🔷 Swap.cancel() called for swap ${swapId} by requester ${requesterId}`);
    
    const transaction = await sequelize.transaction();
    
    try {
      // Get swap details
      const swap = await ProductSwap.findByPk(swapId, { transaction });
      
      if (!swap) {
        throw new Error('Swap not found');
      }
      
      // Verify requester
      if (swap.requester_id !== requesterId) {
        throw new Error('Unauthorized: Only the requester can cancel this swap');
      }
      
      // Can only cancel if pending or accepted
      if (!['pending', 'accepted'].includes(swap.status)) {
        throw new Error(`Cannot cancel swap with status: ${swap.status}`);
      }
      
      // If accepted, restore product availability
      if (swap.status === 'accepted') {
        await Product.update(
          { is_available: true },
          { 
            where: { 
              id: { [Op.in]: [swap.requester_product_id, swap.owner_product_id] }
            },
            transaction 
          }
        );
      }
      
      // Update swap status to rejected (cancelled)
      await swap.update({ status: 'rejected' }, { transaction });
      
      await transaction.commit();
      
      console.log('✅ Swap.cancel() successful');
      return swap.toJSON();
    } catch (error) {
      await transaction.rollback();
      console.error('❌ Swap.cancel() failed:', error.message);
      throw error;
    }
  }
}

module.exports = Swap;
