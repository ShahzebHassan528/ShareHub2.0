/**
 * Products Routes with Redis Caching
 * Enhanced version with cache middleware
 */

const express = require('express');
const router = express.Router();
const { cacheMiddleware, invalidateCacheMiddleware } = require('../middleware/cache');
const { CACHE_KEYS, CACHE_TTL } = require('../config/redis');
const { authenticate } = require('../middleware/auth');

// Use Sequelize wrapper
const Product = require('../models/Product.sequelize.wrapper');

console.log('🔧 Product routes initialized with Redis caching');

/**
 * GET /api/products
 * Get all products with filters and caching
 * Cache TTL: 5 minutes
 */
router.get('/', 
  cacheMiddleware(CACHE_KEYS.PRODUCTS, CACHE_TTL.MEDIUM),
  async (req, res) => {
    try {
      const filters = {
        category: req.query.category,
        condition: req.query.condition,
        minPrice: req.query.minPrice,
        maxPrice: req.query.maxPrice
      };
      
      const products = await Product.findAll(filters);
      
      res.json({
        success: true,
        count: products.length,
        filters,
        products
      });
    } catch (error) {
      console.error('Error fetching products:', error);
      res.status(500).json({ 
        success: false,
        error: 'Failed to fetch products' 
      });
    }
  }
);

/**
 * GET /api/products/nearby
 * Get nearby products (location-based search)
 * Cache TTL: 1 minute (location-specific, shorter cache)
 */
router.get('/nearby',
  cacheMiddleware(CACHE_KEYS.PRODUCTS, CACHE_TTL.SHORT),
  async (req, res) => {
    try {
      const { lat, lng, radius } = req.query;
      
      // Validate required parameters
      if (!lat || !lng) {
        return res.status(400).json({ 
          success: false,
          error: 'Missing required parameters: lat and lng are required' 
        });
      }
      
      const latitude = parseFloat(lat);
      const longitude = parseFloat(lng);
      const radiusKm = radius ? parseFloat(radius) : 5; // Default 5km
      
      // Validate coordinates
      if (isNaN(latitude) || isNaN(longitude) || latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
        return res.status(400).json({ 
          success: false,
          error: 'Invalid coordinates. Latitude must be between -90 and 90, longitude between -180 and 180' 
        });
      }
      
      // Validate radius
      if (isNaN(radiusKm) || radiusKm <= 0 || radiusKm > 100) {
        return res.status(400).json({ 
          success: false,
          error: 'Invalid radius. Must be between 0 and 100 km' 
        });
      }
      
      console.log(`📍 Searching for products near (${latitude}, ${longitude}) within ${radiusKm}km`);
      
      const products = await Product.findNearby(latitude, longitude, radiusKm);
      
      res.json({
        success: true,
        message: 'Nearby products retrieved successfully',
        count: products.length,
        search_params: {
          latitude,
          longitude,
          radius_km: radiusKm
        },
        products
      });
    } catch (error) {
      console.error('Error fetching nearby products:', error);
      res.status(500).json({ 
        success: false,
        error: 'Failed to fetch nearby products' 
      });
    }
  }
);

/**
 * GET /api/products/:id
 * Get single product by ID with caching
 * Cache TTL: 5 minutes
 */
router.get('/:id',
  cacheMiddleware(CACHE_KEYS.PRODUCT_DETAIL, CACHE_TTL.MEDIUM),
  async (req, res) => {
    try {
      const product = await Product.findById(req.params.id);
      
      if (!product) {
        return res.status(404).json({ 
          success: false,
          error: 'Product not found' 
        });
      }
      
      // Increment view count (don't wait for it)
      Product.incrementViews(req.params.id).catch(err => {
        console.error('Error incrementing views:', err);
      });
      
      res.json({
        success: true,
        product
      });
    } catch (error) {
      console.error('Error fetching product:', error);
      res.status(500).json({ 
        success: false,
        error: 'Failed to fetch product' 
      });
    }
  }
);

/**
 * POST /api/products
 * Create new product (authenticated users only)
 * Invalidates product cache
 */
router.post('/',
  authenticate,
  invalidateCacheMiddleware([`${CACHE_KEYS.PRODUCTS}:*`, `${CACHE_KEYS.DASHBOARD_STATS}:*`]),
  async (req, res) => {
    try {
      const productData = {
        ...req.body,
        seller_id: req.user.seller_id || req.user.id
      };

      const productId = await Product.create(productData);

      res.status(201).json({
        success: true,
        message: 'Product created successfully',
        product_id: productId
      });
    } catch (error) {
      console.error('Error creating product:', error);
      res.status(500).json({ 
        success: false,
        error: 'Failed to create product' 
      });
    }
  }
);

/**
 * PUT /api/products/:id
 * Update product (authenticated users only)
 * Invalidates product cache
 */
router.put('/:id',
  authenticate,
  invalidateCacheMiddleware([
    `${CACHE_KEYS.PRODUCTS}:*`, 
    `${CACHE_KEYS.PRODUCT_DETAIL}:*`,
    `${CACHE_KEYS.DASHBOARD_STATS}:*`
  ]),
  async (req, res) => {
    try {
      const product = await Product.findById(req.params.id);
      
      if (!product) {
        return res.status(404).json({ 
          success: false,
          error: 'Product not found' 
        });
      }

      // Authorization check (seller can only update their own products)
      if (product.seller_id !== req.user.seller_id && req.user.role !== 'admin') {
        return res.status(403).json({ 
          success: false,
          error: 'Not authorized to update this product' 
        });
      }

      await Product.update(req.params.id, req.body);

      res.json({
        success: true,
        message: 'Product updated successfully'
      });
    } catch (error) {
      console.error('Error updating product:', error);
      res.status(500).json({ 
        success: false,
        error: 'Failed to update product' 
      });
    }
  }
);

/**
 * DELETE /api/products/:id
 * Delete product (authenticated users only)
 * Invalidates product cache
 */
router.delete('/:id',
  authenticate,
  invalidateCacheMiddleware([
    `${CACHE_KEYS.PRODUCTS}:*`, 
    `${CACHE_KEYS.PRODUCT_DETAIL}:*`,
    `${CACHE_KEYS.DASHBOARD_STATS}:*`
  ]),
  async (req, res) => {
    try {
      const product = await Product.findById(req.params.id);
      
      if (!product) {
        return res.status(404).json({ 
          success: false,
          error: 'Product not found' 
        });
      }

      // Authorization check
      if (product.seller_id !== req.user.seller_id && req.user.role !== 'admin') {
        return res.status(403).json({ 
          success: false,
          error: 'Not authorized to delete this product' 
        });
      }

      await Product.delete(req.params.id);

      res.json({
        success: true,
        message: 'Product deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting product:', error);
      res.status(500).json({ 
        success: false,
        error: 'Failed to delete product' 
      });
    }
  }
);

module.exports = router;
