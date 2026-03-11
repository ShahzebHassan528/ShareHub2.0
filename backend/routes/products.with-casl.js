/**
 * Products Routes with CASL Authorization
 * Enhanced version with role-based and ownership-based access control
 */

const express = require('express');
const router = express.Router();
const { cacheMiddleware, autoInvalidateCache } = require('../middleware/cache');
const { authenticate } = require('../middleware/auth');
const { checkAbility, authorize } = require('../middleware/checkAbility');
const Product = require('../models/Product.sequelize.wrapper');
const AppError = require('../utils/AppError');

console.log('🔧 Product routes initialized with CASL authorization');

// Auto-invalidate product cache on POST/PUT/DELETE
router.use(autoInvalidateCache(['/api/products', '/api/dashboard']));

// Get all products - PUBLIC (no auth required)
router.get('/', cacheMiddleware(), async (req, res) => {
  try {
    const filters = {
      category: req.query.category,
      condition: req.query.condition,
      minPrice: req.query.minPrice,
      maxPrice: req.query.maxPrice
    };
    
    const products = await Product.findAll(filters);
    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// Get nearby products - PUBLIC
router.get('/nearby', cacheMiddleware(), async (req, res) => {
  try {
    const { lat, lng, radius } = req.query;
    
    if (!lat || !lng) {
      return res.status(400).json({ 
        error: 'Missing required parameters: lat and lng are required' 
      });
    }
    
    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);
    const radiusKm = radius ? parseFloat(radius) : 5;
    
    if (isNaN(latitude) || isNaN(longitude) || latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      return res.status(400).json({ 
        error: 'Invalid coordinates. Latitude must be between -90 and 90, longitude between -180 and 180' 
      });
    }
    
    if (isNaN(radiusKm) || radiusKm <= 0 || radiusKm > 100) {
      return res.status(400).json({ 
        error: 'Invalid radius. Must be between 0 and 100 km' 
      });
    }
    
    const products = await Product.findNearby(latitude, longitude, radiusKm);
    
    res.json({
      message: 'Nearby products retrieved successfully',
      count: products.length,
      search_params: { latitude, longitude, radius_km: radiusKm },
      products
    });
  } catch (error) {
    console.error('Error fetching nearby products:', error);
    res.status(500).json({ error: 'Failed to fetch nearby products' });
  }
});

// Get single product - PUBLIC
router.get('/:id', cacheMiddleware(), async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    // Increment view count (async)
    Product.incrementViews(req.params.id).catch(err => {
      console.error('Error incrementing views:', err);
    });
    
    res.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

// Create product - SELLER ONLY
router.post('/',
  authenticate,
  checkAbility('create', 'Product'),
  async (req, res, next) => {
    try {
      const productData = {
        ...req.body,
        seller_id: req.user.seller_id
      };

      if (!productData.seller_id) {
        throw new AppError('Seller profile required to create products', 400);
      }

      const productId = await Product.create(productData);

      res.status(201).json({
        success: true,
        message: 'Product created successfully',
        product_id: productId
      });
    } catch (error) {
      next(error);
    }
  }
);

// Update product - SELLER (own products) or ADMIN
router.put('/:id',
  authenticate,
  checkAbility('update', 'Product', async (req) => {
    // Get product to check ownership
    const product = await Product.findById(req.params.id);
    if (!product) {
      throw new AppError('Product not found', 404);
    }
    return product; // CASL will check if user can update this product
  }),
  async (req, res, next) => {
    try {
      await Product.update(req.params.id, req.body);

      res.json({
        success: true,
        message: 'Product updated successfully'
      });
    } catch (error) {
      next(error);
    }
  }
);

// Delete product - SELLER (own products) or ADMIN
router.delete('/:id',
  authenticate,
  checkAbility('delete', 'Product', async (req) => {
    // Get product to check ownership
    const product = await Product.findById(req.params.id);
    if (!product) {
      throw new AppError('Product not found', 404);
    }
    return product; // CASL will check if user can delete this product
  }),
  async (req, res, next) => {
    try {
      await Product.delete(req.params.id);

      res.json({
        success: true,
        message: 'Product deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
