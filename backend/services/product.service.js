/**
 * Product Service
 * Business logic for product management
 */

const Product = require('../models/Product.sequelize.wrapper');
const { AdminLog } = require('../database/models');
const AppError = require('../utils/AppError');

class ProductService {
  /**
   * Get all products with filters
   * @param {Object} filters - Filter options
   * @returns {Promise<Array>} List of products
   */
  static async getAllProducts(filters = {}) {
    return await Product.findAll(filters);
  }

  /**
   * Get product by ID
   * @param {number} productId - Product ID
   * @param {boolean} incrementViews - Whether to increment view count
   * @returns {Promise<Object>} Product data
   */
  static async getProductById(productId, incrementViews = false) {
    const product = await Product.findById(productId);
    if (!product) {
      throw new AppError('Product not found', 404);
    }

    if (incrementViews) {
      await Product.incrementViews(productId);
    }

    return product;
  }

  /**
   * Find nearby products using location
   * @param {number} latitude - User latitude
   * @param {number} longitude - User longitude
   * @param {number} radiusKm - Search radius in kilometers
   * @returns {Promise<Array>} List of nearby products with distance
   */
  static async findNearbyProducts(latitude, longitude, radiusKm = 5) {
    // Validate coordinates
    if (isNaN(latitude) || isNaN(longitude)) {
      throw new AppError('Invalid coordinates', 400);
    }

    if (latitude < -90 || latitude > 90) {
      throw new AppError('Latitude must be between -90 and 90', 400);
    }

    if (longitude < -180 || longitude > 180) {
      throw new AppError('Longitude must be between -180 and 180', 400);
    }

    // Validate radius
    if (isNaN(radiusKm) || radiusKm <= 0 || radiusKm > 100) {
      throw new AppError('Radius must be between 0 and 100 km', 400);
    }

    return await Product.findNearby(latitude, longitude, radiusKm);
  }

  /**
   * Create a new product
   * @param {Object} productData - Product data
   * @returns {Promise<number>} Created product ID
   */
  static async createProduct(productData) {
    // Validate required fields
    this.validateProductData(productData);

    return await Product.create(productData);
  }

  /**
   * Update product
   * @param {number} productId - Product ID
   * @param {Object} productData - Product data to update
   * @returns {Promise<Object>} Updated product
   */
  static async updateProduct(productId, productData) {
    const product = await Product.findById(productId);
    if (!product) {
      throw new AppError('Product not found', 404);
    }

    // Validate data if provided
    if (Object.keys(productData).length > 0) {
      this.validateProductData(productData, true);
    }

    return await Product.update(productId, productData);
  }

  /**
   * Delete product
   * @param {number} productId - Product ID
   * @returns {Promise<boolean>} Success status
   */
  static async deleteProduct(productId) {
    const product = await Product.findById(productId);
    if (!product) {
      throw new AppError('Product not found', 404);
    }

    return await Product.delete(productId);
  }

  /**
   * Block product (admin only)
   * @param {number} productId - Product ID
   * @param {number} adminId - Admin user ID
   * @param {string} reason - Block reason
   * @returns {Promise<Object>} Updated product
   */
  static async blockProduct(productId, adminId, reason) {
    const product = await Product.findById(productId);
    if (!product) {
      throw new AppError('Product not found', 404);
    }

    if (product.product_status === 'blocked') {
      throw new AppError('Product is already blocked', 400);
    }

    const updatedProduct = await Product.update(productId, {
      product_status: 'blocked',
      blocked_at: new Date(),
      blocked_by: adminId,
      block_reason: reason
    });

    // Log admin action
    await AdminLog.create({
      admin_id: adminId,
      action: 'block_product',
      target_type: 'product',
      target_id: productId,
      details: JSON.stringify({ reason })
    });

    return updatedProduct;
  }

  /**
   * Unblock product (admin only)
   * @param {number} productId - Product ID
   * @param {number} adminId - Admin user ID
   * @returns {Promise<Object>} Updated product
   */
  static async unblockProduct(productId, adminId) {
    const product = await Product.findById(productId);
    if (!product) {
      throw new AppError('Product not found', 404);
    }

    if (product.product_status !== 'blocked') {
      throw new AppError('Product is not blocked', 400);
    }

    const updatedProduct = await Product.update(productId, {
      product_status: 'active',
      blocked_at: null,
      blocked_by: null,
      block_reason: null
    });

    // Log admin action
    await AdminLog.create({
      admin_id: adminId,
      action: 'unblock_product',
      target_type: 'product',
      target_id: productId,
      details: null
    });

    return updatedProduct;
  }

  /**
   * Get products by seller
   * @param {number} sellerId - Seller ID
   * @returns {Promise<Array>} List of products
   */
  static async getProductsBySeller(sellerId) {
    return await Product.findAll({ seller_id: sellerId });
  }

  /**
   * Validate product data
   * @param {Object} data - Product data
   * @param {boolean} isUpdate - Whether this is an update operation
   * @throws {Error} Validation error
   */
  static validateProductData(data, isUpdate = false) {
    const errors = [];

    if (!isUpdate) {
      // Required fields for creation
      if (!data.title || data.title.trim().length === 0) {
        errors.push('Title is required');
      }
      if (!data.price || data.price <= 0) {
        errors.push('Price must be greater than 0');
      }
      if (!data.seller_id) {
        errors.push('Seller ID is required');
      }
    }

    // Optional validations
    if (data.title && data.title.length > 255) {
      errors.push('Title is too long (max 255 characters)');
    }

    if (data.price !== undefined && (isNaN(data.price) || data.price < 0)) {
      errors.push('Price must be a positive number');
    }

    if (data.condition && !['new', 'like_new', 'good', 'fair', 'poor'].includes(data.condition)) {
      errors.push('Invalid condition value');
    }

    if (data.latitude !== undefined && (isNaN(data.latitude) || data.latitude < -90 || data.latitude > 90)) {
      errors.push('Invalid latitude');
    }

    if (data.longitude !== undefined && (isNaN(data.longitude) || data.longitude < -180 || data.longitude > 180)) {
      errors.push('Invalid longitude');
    }

    if (errors.length > 0) {
      const error = new AppError('Validation failed', 400);
      error.details = errors;
      throw error;
    }
  }
}

module.exports = ProductService;
