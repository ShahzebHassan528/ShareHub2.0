/**
 * Product Routes with Validation
 * Example showing how to use Joi validation middleware
 */

const express = require('express');
const { auth } = require('../middleware/auth');
const { ProductService } = require('../services');
const catchAsync = require('../utils/catchAsync');
const validate = require('../middleware/validate');
const { product: productValidators } = require('../validators');

const router = express.Router();

console.log('🔧 Product routes initialized with validation middleware');

/**
 * GET /api/products
 * Get all products with optional filters
 * 
 * Validation:
 * - Category ID (positive integer)
 * - Condition enum
 * - Price range (positive numbers)
 */
router.get(
  '/',
  validate(productValidators.getProductsSchema),
  catchAsync(async (req, res) => {
    const products = await ProductService.getAllProducts(req.query);
    res.json({ success: true, products });
  })
);

/**
 * GET /api/products/nearby
 * Get nearby products using location
 * 
 * Validation:
 * - Latitude (-90 to 90) REQUIRED
 * - Longitude (-180 to 180) REQUIRED
 * - Radius (0 to 100 km) OPTIONAL
 */
router.get(
  '/nearby',
  validate(productValidators.getNearbyProductsSchema),
  catchAsync(async (req, res) => {
    const { lat, lng, radius } = req.query;
    
    const products = await ProductService.findNearbyProducts(
      parseFloat(lat),
      parseFloat(lng),
      radius ? parseFloat(radius) : 5
    );
    
    res.json({
      success: true,
      count: products.length,
      search_params: {
        latitude: parseFloat(lat),
        longitude: parseFloat(lng),
        radius_km: radius ? parseFloat(radius) : 5
      },
      products
    });
  })
);

/**
 * GET /api/products/:id
 * Get single product by ID
 * 
 * Validation:
 * - Product ID (positive integer) REQUIRED
 */
router.get(
  '/:id',
  validate(productValidators.getProductByIdSchema),
  catchAsync(async (req, res) => {
    const product = await ProductService.getProductById(req.params.id, true);
    res.json({ success: true, product });
  })
);

/**
 * POST /api/products
 * Create a new product
 * 
 * Validation:
 * - Title (3-255 chars) REQUIRED
 * - Price (positive number) REQUIRED
 * - Description (max 2000 chars) OPTIONAL
 * - Condition enum OPTIONAL
 * - Location coordinates OPTIONAL
 */
router.post(
  '/',
  auth,
  validate(productValidators.createProductSchema),
  catchAsync(async (req, res) => {
    const productId = await ProductService.createProduct(req.body);
    const product = await ProductService.getProductById(productId);
    
    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      product
    });
  })
);

/**
 * PUT /api/products/:id
 * Update product
 * 
 * Validation:
 * - Product ID (positive integer) REQUIRED
 * - At least one field to update REQUIRED
 * - All fields follow same rules as create
 */
router.put(
  '/:id',
  auth,
  validate(productValidators.updateProductSchema),
  catchAsync(async (req, res) => {
    const product = await ProductService.updateProduct(req.params.id, req.body);
    
    res.json({
      success: true,
      message: 'Product updated successfully',
      product
    });
  })
);

module.exports = router;
