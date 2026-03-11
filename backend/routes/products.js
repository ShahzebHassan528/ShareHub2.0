const express = require('express');
const router = express.Router();
const { cacheMiddleware, autoInvalidateCache } = require('../middleware/cache');
const { authenticate } = require('../middleware/auth');
const { checkAbility } = require('../middleware/checkAbility');
const AppError = require('../utils/AppError');

// Use Sequelize wrapper with fallback to raw SQL
const USE_SEQUELIZE = process.env.USE_SEQUELIZE !== 'false'; // Default to true
const Product = USE_SEQUELIZE 
  ? require('../models/Product.sequelize.wrapper')
  : require('../models/Product');

// Log which Product model is being used
console.log(`🔧 Product routes initialized with ${USE_SEQUELIZE ? 'Sequelize ORM' : 'Raw SQL'} Product model + CASL authorization`);

// Auto-invalidate product cache on POST/PUT/DELETE
router.use(autoInvalidateCache(['/api/products', '/api/dashboard']));

// Get all products with filters - CACHED
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

// Get nearby products (location-based search) - CACHED
router.get('/nearby', cacheMiddleware(), async (req, res) => {
  try {
    const { lat, lng, radius } = req.query;
    
    // Validate required parameters
    if (!lat || !lng) {
      return res.status(400).json({ 
        error: 'Missing required parameters: lat and lng are required' 
      });
    }
    
    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);
    const radiusKm = radius ? parseFloat(radius) : 5; // Default 5km
    
    // Validate coordinates
    if (isNaN(latitude) || isNaN(longitude) || latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      return res.status(400).json({ 
        error: 'Invalid coordinates. Latitude must be between -90 and 90, longitude between -180 and 180' 
      });
    }
    
    // Validate radius
    if (isNaN(radiusKm) || radiusKm <= 0 || radiusKm > 100) {
      return res.status(400).json({ 
        error: 'Invalid radius. Must be between 0 and 100 km' 
      });
    }
    
    console.log(`📍 Searching for products near (${latitude}, ${longitude}) within ${radiusKm}km`);
    
    const products = await Product.findNearby(latitude, longitude, radiusKm);
    
    res.json({
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
    res.status(500).json({ error: 'Failed to fetch nearby products' });
  }
});

// Get current user's products
router.get('/my', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    
    console.log(`📋 Fetching products for user ${userId}`);
    
    const products = await Product.findBySeller(userId);
    
    res.json({
      message: 'Your products retrieved successfully',
      count: products.length,
      products
    });
  } catch (error) {
    console.error('Error fetching user products:', error);
    res.status(500).json({ error: 'Failed to fetch your products' });
  }
});

// Get single product by ID - CACHED
router.get('/:id', cacheMiddleware(), async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    // Increment view count (async, don't wait)
    Product.incrementViews(req.params.id).catch(err => {
      console.error('Error incrementing views:', err);
    });
    
    res.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

module.exports = router;

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
    const product = await Product.findById(req.params.id);
    if (!product) {
      throw new AppError('Product not found', 404);
    }
    return product;
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
    const product = await Product.findById(req.params.id);
    if (!product) {
      throw new AppError('Product not found', 404);
    }
    return product;
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

// Toggle product status - SELLER (own products) or ADMIN
router.put('/:id/status',
  authenticate,
  checkAbility('update', 'Product', async (req) => {
    const product = await Product.findById(req.params.id);
    if (!product) {
      throw new AppError('Product not found', 404);
    }
    return product;
  }),
  async (req, res, next) => {
    try {
      const product = await Product.findById(req.params.id);
      const newStatus = product.status === 'active' ? 'inactive' : 'active';
      
      await Product.update(req.params.id, { status: newStatus });

      res.json({
        success: true,
        message: `Product ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully`,
        status: newStatus
      });
    } catch (error) {
      next(error);
    }
  }
);
