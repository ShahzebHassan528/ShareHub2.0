/**
 * Product Model - Sequelize Wrapper
 * 
 * This wrapper provides a complete API for product operations using Sequelize ORM.
 * Note: The original Product.js was empty, so this is a new implementation.
 * 
 * Original: models/Product.js (empty)
 */

const { Product: ProductModel, Seller, Category, User, ProductImage } = require('../database/models');
const { Op } = require('sequelize');

class Product {
  /**
   * Find all products with optional filters
   * @param {Object} filters - Filter options (category, condition, minPrice, maxPrice)
   * @returns {Promise<Array>} - Array of products
   */
  static async findAll(filters = {}) {
    console.log('🔷 Product.findAll() called with Sequelize, filters:', filters);
    try {
      const whereClause = { is_available: true, is_approved: true };
      const includeClause = [
        {
          model: Category,
          as: 'category',
          attributes: ['name'],
          where: filters.category ? { name: filters.category } : undefined
        },
        {
          model: Seller,
          as: 'seller',
          attributes: ['business_name'],
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['full_name']
            }
          ]
        }
      ];

      // Add price filters
      if (filters.minPrice) {
        whereClause.price = { [Op.gte]: filters.minPrice };
      }
      if (filters.maxPrice) {
        whereClause.price = { 
          ...whereClause.price,
          [Op.lte]: filters.maxPrice 
        };
      }

      // Add condition filter
      if (filters.condition) {
        whereClause.product_condition = filters.condition;
      }

      const products = await ProductModel.findAll({
        where: whereClause,
        include: includeClause,
        order: [['created_at', 'DESC']],
        raw: false
      });

      // Flatten structure and add primary image
      const result = await Promise.all(products.map(async (product) => {
        const plain = product.get({ plain: true });
        
        // Get primary image
        const primaryImage = await ProductImage.findOne({
          where: { 
            product_id: plain.id,
            is_primary: true
          },
          attributes: ['image_url'],
          raw: true
        });

        return {
          ...plain,
          category_name: plain.category?.name || null,
          business_name: plain.seller?.business_name || null,
          seller_name: plain.seller?.user?.full_name || null,
          primary_image: primaryImage?.image_url || null,
          category: undefined, // Remove nested objects
          seller: undefined
        };
      }));

      console.log('✅ Product.findAll() successful, found:', result.length);
      return result;
    } catch (error) {
      console.error('❌ Product.findAll() failed:', error.message);
      throw error;
    }
  }

  /**
   * Find product by ID
   * @param {number} id - Product ID
   * @returns {Promise<Object|null>} - Product object with details or null
   */
  static async findById(id) {
    console.log('🔷 Product.findById() called with Sequelize for ID:', id);
    try {
      const product = await ProductModel.findByPk(id, {
        include: [
          {
            model: Category,
            as: 'category',
            attributes: ['name']
          },
          {
            model: Seller,
            as: 'seller',
            attributes: ['business_name', 'business_address'],
            include: [
              {
                model: User,
                as: 'user',
                attributes: ['full_name', 'email', 'phone']
              }
            ]
          }
        ],
        raw: false
      });

      if (!product) {
        console.log('✅ Product.findById() - not found');
        return null;
      }

      const plain = product.get({ plain: true });

      // Get all images for the product
      const images = await ProductImage.findAll({
        where: { product_id: plain.id },
        attributes: ['image_url', 'is_primary'],
        order: [['display_order', 'ASC']],
        raw: true
      });

      const result = {
        ...plain,
        category_name: plain.category?.name || null,
        business_name: plain.seller?.business_name || null,
        business_address: plain.seller?.business_address || null,
        seller_name: plain.seller?.user?.full_name || null,
        seller_email: plain.seller?.user?.email || null,
        seller_phone: plain.seller?.user?.phone || null,
        images: images,
        category: undefined, // Remove nested objects
        seller: undefined
      };

      console.log('✅ Product.findById() successful');
      return result;
    } catch (error) {
      console.error('❌ Product.findById() failed:', error.message);
      throw error;
    }
  }

  /**
   * Create a new product
   * @param {Object} productData - Product data
   * @returns {Promise<number>} - Product ID
   */
  static async create(productData) {
    console.log('🔷 Product.create() called with Sequelize');
    try {
      const product = await ProductModel.create({
        seller_id: productData.seller_id,
        category_id: productData.category_id,
        title: productData.title,
        description: productData.description,
        price: productData.price,
        product_condition: productData.product_condition,
        quantity: productData.quantity || 1,
        is_available: productData.is_available !== undefined ? productData.is_available : true,
        is_approved: productData.is_approved || false,
        latitude: productData.latitude || null,
        longitude: productData.longitude || null,
        address: productData.address || null
      });

      console.log('✅ Product.create() successful, ID:', product.id);
      return product.id; // Return number, not object
    } catch (error) {
      console.error('❌ Product.create() failed:', error.message);
      throw error;
    }
  }

  /**
   * Update product
   * @param {number} productId - Product ID
   * @param {Object} updateData - Data to update
   * @returns {Promise<void>}
   */
  static async update(productId, updateData) {
    console.log('🔷 Product.update() called with Sequelize for ID:', productId);
    try {
      await ProductModel.update(updateData, {
        where: { id: productId }
      });
      
      console.log('✅ Product.update() successful');
    } catch (error) {
      console.error('❌ Product.update() failed:', error.message);
      throw error;
    }
  }

  /**
   * Increment product views
   * @param {number} productId - Product ID
   * @returns {Promise<void>}
   */
  static async incrementViews(productId) {
    console.log('🔷 Product.incrementViews() called with Sequelize for ID:', productId);
    try {
      await ProductModel.increment('views', {
        where: { id: productId }
      });
      
      console.log('✅ Product.incrementViews() successful');
    } catch (error) {
      console.error('❌ Product.incrementViews() failed:', error.message);
      throw error;
    }
  }

  /**
   * Find products by seller
   * @param {number} sellerId - Seller ID
   * @returns {Promise<Array>} - Array of products
   */
  static async findBySeller(sellerId) {
    console.log('🔷 Product.findBySeller() called with Sequelize for seller:', sellerId);
    try {
      const products = await ProductModel.findAll({
        where: { seller_id: sellerId },
        include: [
          {
            model: Category,
            as: 'category',
            attributes: ['name']
          }
        ],
        order: [['created_at', 'DESC']],
        raw: false
      });

      const result = products.map(p => {
        const plain = p.get({ plain: true });
        return {
          ...plain,
          category_name: plain.category?.name || null,
          category: undefined
        };
      });

      console.log('✅ Product.findBySeller() successful, found:', result.length);
      return result;
    } catch (error) {
      console.error('❌ Product.findBySeller() failed:', error.message);
      throw error;
    }
  }

  /**
   * Approve product
   * @param {number} productId - Product ID
   * @param {number} adminId - Admin user ID
   * @returns {Promise<void>}
   */
  static async approve(productId, adminId) {
    console.log('🔷 Product.approve() called with Sequelize for ID:', productId);
    try {
      await ProductModel.update(
        { 
          is_approved: true,
          approved_by: adminId
        },
        { where: { id: productId } }
      );
      
      console.log('✅ Product.approve() successful');
    } catch (error) {
      console.error('❌ Product.approve() failed:', error.message);
      throw error;
    }
  }

  /**
   * Update product availability
   * @param {number} productId - Product ID
   * @param {boolean} isAvailable - Availability status
   * @returns {Promise<void>}
   */
  static async updateAvailability(productId, isAvailable) {
    console.log('🔷 Product.updateAvailability() called with Sequelize for ID:', productId);
    try {
      await ProductModel.update(
        { is_available: isAvailable },
        { where: { id: productId } }
      );
      
      console.log('✅ Product.updateAvailability() successful');
    } catch (error) {
      console.error('❌ Product.updateAvailability() failed:', error.message);
      throw error;
    }
  }

  /**
   * Search products by title or description
   * @param {string} searchTerm - Search term
   * @returns {Promise<Array>} - Array of products
   */
  static async search(searchTerm) {
    console.log('🔷 Product.search() called with Sequelize, term:', searchTerm);
    try {
      const products = await ProductModel.findAll({
        where: {
          is_available: true,
          is_approved: true,
          [Op.or]: [
            { title: { [Op.like]: `%${searchTerm}%` } },
            { description: { [Op.like]: `%${searchTerm}%` } }
          ]
        },
        include: [
          {
            model: Category,
            as: 'category',
            attributes: ['name']
          }
        ],
        order: [['created_at', 'DESC']],
        raw: false
      });

      const result = products.map(p => {
        const plain = p.get({ plain: true });
        return {
          ...plain,
          category_name: plain.category?.name || null,
          category: undefined
        };
      });

      console.log('✅ Product.search() successful, found:', result.length);
      return result;
    } catch (error) {
      console.error('❌ Product.search() failed:', error.message);
      throw error;
    }
  }

  /**
   * Find nearby products using Haversine formula
   * @param {number} latitude - User's latitude
   * @param {number} longitude - User's longitude
   * @param {number} radiusKm - Search radius in kilometers (default: 5)
   * @returns {Promise<Array>} - Array of products with distance
   */
  static async findNearby(latitude, longitude, radiusKm = 5) {
    console.log(`🔷 Product.findNearby() called with lat: ${latitude}, lng: ${longitude}, radius: ${radiusKm}km`);
    try {
      const { sequelize } = require('../database/models');
      
      // Haversine formula to calculate distance
      // Distance in kilometers
      const haversineFormula = `
        (6371 * acos(
          cos(radians(${latitude})) * 
          cos(radians(latitude)) * 
          cos(radians(longitude) - radians(${longitude})) + 
          sin(radians(${latitude})) * 
          sin(radians(latitude))
        ))
      `;

      const products = await ProductModel.findAll({
        attributes: {
          include: [
            [sequelize.literal(haversineFormula), 'distance']
          ]
        },
        where: {
          is_available: true,
          is_approved: true,
          product_status: 'active',
          latitude: { [Op.ne]: null },
          longitude: { [Op.ne]: null },
          [Op.and]: [
            sequelize.where(
              sequelize.literal(haversineFormula),
              '<=',
              radiusKm
            )
          ]
        },
        include: [
          {
            model: Category,
            as: 'category',
            attributes: ['name']
          },
          {
            model: Seller,
            as: 'seller',
            attributes: ['business_name']
          }
        ],
        order: [[sequelize.literal('distance'), 'ASC']],
        raw: false
      });

      // Get primary images for each product
      const result = await Promise.all(products.map(async (product) => {
        const plain = product.get({ plain: true });
        
        // Get primary image
        const primaryImage = await ProductImage.findOne({
          where: { 
            product_id: plain.id,
            is_primary: true
          },
          attributes: ['image_url'],
          raw: true
        });

        return {
          ...plain,
          distance: parseFloat(plain.distance).toFixed(2), // Round to 2 decimal places
          category_name: plain.category?.name || null,
          business_name: plain.seller?.business_name || null,
          primary_image: primaryImage?.image_url || null,
          category: undefined,
          seller: undefined
        };
      }));

      console.log(`✅ Product.findNearby() successful, found ${result.length} products within ${radiusKm}km`);
      return result;
    } catch (error) {
      console.error('❌ Product.findNearby() failed:', error.message);
      throw error;
    }
  }

  /**
   * Block product (admin moderation)
   * @param {number} productId - Product ID
   * @param {number} adminId - Admin ID
   * @param {string} reason - Block reason
   * @returns {Promise<void>}
   */
  static async block(productId, adminId, reason) {
    console.log('🔷 Product.block() called for product:', productId);
    try {
      await ProductModel.update(
        {
          product_status: 'blocked',
          is_available: false,
          blocked_at: new Date(),
          blocked_by: adminId,
          block_reason: reason
        },
        { where: { id: productId } }
      );
      
      console.log('✅ Product.block() successful');
    } catch (error) {
      console.error('❌ Product.block() failed:', error.message);
      throw error;
    }
  }

  /**
   * Unblock product
   * @param {number} productId - Product ID
   * @returns {Promise<void>}
   */
  static async unblock(productId) {
    console.log('🔷 Product.unblock() called for product:', productId);
    try {
      await ProductModel.update(
        {
          product_status: 'active',
          is_available: true,
          blocked_at: null,
          blocked_by: null,
          block_reason: null
        },
        { where: { id: productId } }
      );
      
      console.log('✅ Product.unblock() successful');
    } catch (error) {
      console.error('❌ Product.unblock() failed:', error.message);
      throw error;
    }
  }
}

module.exports = Product;
