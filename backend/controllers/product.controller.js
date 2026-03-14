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
    const seller = await Seller.findOne({ where: { user_id: req.user.id } });

    if (!seller) {
      return next(new AppError('Seller profile required to create products', 400));
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
    const { Seller } = require('../database/models');

    // Look up seller record by user_id
    const seller = await Seller.findOne({ where: { user_id: userId } });
    if (!seller) {
      return next(new AppError('Seller profile not found', 400));
    }

    const Product = require('../models/Product.sequelize.wrapper');
    const products = await Product.findBySeller(seller.id);

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
