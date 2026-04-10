/**
 * Product Controller (MVC Pattern)
 * Handles product-related HTTP requests
 */

const ProductService = require('../services/product.service');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

class ProductController {
  /**
   * Get all products with filters
   * GET /api/v1/products
   */
  static getAllProducts = catchAsync(async (req, res, next) => {
    const filters = {
      category: req.query.category,
      condition: req.query.condition,
      minPrice: req.query.minPrice,
      maxPrice: req.query.maxPrice,
      search: req.query.search
    };
    
    const products = await ProductService.getAllProducts(filters);
    
    res.status(200).json({
      success: true,
      count: products.length,
      data: products
    });
  });

  /**
   * Get nearby products (location-based)
   * GET /api/v1/products/nearby
   */
  static getNearbyProducts = catchAsync(async (req, res, next) => {
    const { lat, lng, radius } = req.query;
    
    if (!lat || !lng) {
      return next(new AppError('Latitude and longitude are required', 400));
    }
    
    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);
    const radiusKm = radius ? parseFloat(radius) : 5;
    
    // Validate coordinates
    if (isNaN(latitude) || isNaN(longitude) || 
        latitude < -90 || latitude > 90 || 
        longitude < -180 || longitude > 180) {
      return next(new AppError('Invalid coordinates', 400));
    }
    
    const products = await ProductService.getNearbyProducts(latitude, longitude, radiusKm);
    
    res.status(200).json({
      success: true,
      count: products.length,
      search_params: { latitude, longitude, radius_km: radiusKm },
      data: products
    });
  });

  /**
   * Get single product by ID
   * GET /api/v1/products/:id
   */
  static getProductById = catchAsync(async (req, res, next) => {
    const product = await ProductService.getProductById(req.params.id);
    
    if (!product) {
      return next(new AppError('Product not found', 404));
    }
    
    res.status(200).json({
      success: true,
      data: product
    });
  });

  /**
   * Create new product
   * POST /api/v1/products
   */
  static createProduct = catchAsync(async (req, res, next) => {
    const { Seller } = require('../database/models');
    
    // Check if user has seller profile
    let seller = await Seller.findOne({ where: { user_id: req.user.id } });

    // If no seller profile, create one automatically
    if (!seller) {
      console.log(`📝 User ${req.user.id} doesn't have seller profile, creating one...`);
      
      seller = await Seller.create({
        user_id: req.user.id,
        business_name: req.user.full_name || 'Individual Seller',
        business_address: req.body.location || 'Not specified',
        approval_status: 'approved' // Auto-approve for all users
      });
      
      console.log(`✅ Seller profile created with ID: ${seller.id}`);
    }

    const productData = {
      ...req.body,
      seller_id: seller.id
    };

    const product = await ProductService.createProduct(productData);

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: product
    });
  });

  /**
   * Update product
   * PUT /api/v1/products/:id
   */
  static updateProduct = catchAsync(async (req, res, next) => {
    const product = await ProductService.updateProduct(req.params.id, req.body);
    
    if (!product) {
      return next(new AppError('Product not found', 404));
    }
    
    res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      data: product
    });
  });

  /**
   * Delete product
   * DELETE /api/v1/products/:id
   */
  static deleteProduct = catchAsync(async (req, res, next) => {
    const deleted = await ProductService.deleteProduct(req.params.id);
    
    if (!deleted) {
      return next(new AppError('Product not found', 404));
    }
    
    res.status(200).json({
      success: true,
      message: 'Product deleted successfully'
    });
  });

  /**
   * Get current seller's products
   * GET /api/v1/products/my
   */
  static getMyProducts = catchAsync(async (req, res, next) => {
    const userId = req.user.id;
    console.log('🔍 getMyProducts called for user_id:', userId);
    
    const { Seller } = require('../database/models');

    // Look up seller record by user_id
    const seller = await Seller.findOne({ where: { user_id: userId } });
    console.log('🔍 Found seller:', seller ? `ID ${seller.id}` : 'NOT FOUND');
    
    if (!seller) {
      // User has no seller profile yet - return empty array
      console.log('ℹ️  User has no seller profile, returning empty products array');
      return res.status(200).json({
        success: true,
        count: 0,
        products: []
      });
    }

    const Product = require('../models/Product.sequelize.wrapper');
    const products = await Product.findBySeller(seller.id);
    console.log(`✅ Found ${products.length} products for seller ${seller.id}`);

    res.status(200).json({
      success: true,
      count: products.length,
      products
    });
  });

  /**
   * Toggle product status (available/unavailable)
   * PUT /api/v1/products/:id/status
   */
  static toggleProductStatus = catchAsync(async (req, res, next) => {
    const Product = require('../models/Product.sequelize.wrapper');
    const product = await Product.findById(req.params.id);

    if (!product) {
      return next(new AppError('Product not found', 404));
    }

    const newAvailability = !product.is_available;
    await Product.updateAvailability(req.params.id, newAvailability);

    res.status(200).json({
      success: true,
      message: `Product ${newAvailability ? 'activated' : 'deactivated'} successfully`,
      is_available: newAvailability
    });
  });

  /**
   * Get products by seller
   * GET /api/v1/products/seller/:sellerId
   */
  static getProductsBySeller = catchAsync(async (req, res, next) => {
    const products = await ProductService.getProductsBySeller(req.params.sellerId);

    res.status(200).json({
      success: true,
      count: products.length,
      data: products
    });
  });
}

module.exports = ProductController;
