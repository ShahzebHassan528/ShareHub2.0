/**
 * Product Routes (MVC Pattern)
 * Uses ProductController for all product endpoints
 */

const express = require('express');
const router = express.Router();
const ProductController = require('../../controllers/product.controller');
const { cacheMiddleware, autoInvalidateCache } = require('../../middleware/cache');
const { authenticate } = require('../../middleware/auth');
const { checkAbility } = require('../../middleware/checkAbility');

console.log('🔧 Product routes initialized with MVC pattern (ProductController)');

// Auto-invalidate product cache on POST/PUT/DELETE
router.use(autoInvalidateCache(['/api/products', '/api/dashboard']));

// GET /api/v1/products - Get all products with filters (CACHED)
router.get('/', cacheMiddleware(), ProductController.getAllProducts);

// GET /api/v1/products/nearby - Location-based search (CACHED)
router.get('/nearby', cacheMiddleware(), ProductController.getNearbyProducts);

// GET /api/v1/products/my - Get current seller's products
router.get('/my', authenticate, (req, res, next) => {
  console.log('🎯 Route /my hit! User:', req.user?.id, req.user?.full_name);
  next();
}, ProductController.getMyProducts);

// GET /api/v1/products/:id - Get single product (CACHED)
router.get('/:id', cacheMiddleware(), ProductController.getProductById);

// POST /api/v1/products - Create product (SELLER ONLY)
router.post('/',
  authenticate,
  checkAbility('create', 'Product'),
  ProductController.createProduct
);

// PUT /api/v1/products/:id - Update product (SELLER own products or ADMIN)
router.put('/:id',
  authenticate,
  checkAbility('update', 'Product'),
  ProductController.updateProduct
);

// DELETE /api/v1/products/:id - Delete product (SELLER own products or ADMIN)
router.delete('/:id',
  authenticate,
  checkAbility('delete', 'Product', async (req) => {
    const Product = require('../../models/Product.sequelize.wrapper');
    const product = await Product.findById(req.params.id);
    if (!product) {
      const AppError = require('../../utils/AppError');
      throw new AppError('Product not found', 404);
    }
    return product;
  }),
  ProductController.deleteProduct
);

// PUT /api/v1/products/:id/status - Toggle product status
router.put('/:id/status',
  authenticate,
  ProductController.toggleProductStatus
);

// GET /api/v1/products/seller/:sellerId - Get products by seller
router.get('/seller/:sellerId', ProductController.getProductsBySeller);

module.exports = router;
