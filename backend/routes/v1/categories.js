/**
 * Category Routes (MVC Pattern)
 * Uses CategoryController for all category endpoints
 */

const express = require('express');
const router = express.Router();
const CategoryController = require('../../controllers/category.controller');
const { cacheMiddleware, autoInvalidateCache } = require('../../middleware/cache');
const { authenticate } = require('../../middleware/auth');
const { requireAdmin } = require('../../middleware/checkAbility');

console.log('🔧 Category routes initialized with MVC pattern (CategoryController)');

// Auto-invalidate cache on POST/PUT/DELETE
router.use(autoInvalidateCache(['/api/categories', '/api/products', '/api/dashboard']));

// GET /api/v1/categories - Get all categories (CACHED)
router.get('/', cacheMiddleware(), CategoryController.getAllCategories);

// GET /api/v1/categories/:id - Get category by ID (CACHED)
router.get('/:id', cacheMiddleware(), CategoryController.getCategoryById);

// POST /api/v1/categories - Create category (Admin only)
router.post('/', authenticate, requireAdmin(), CategoryController.createCategory);

// PUT /api/v1/categories/:id - Update category (Admin only)
router.put('/:id', authenticate, requireAdmin(), CategoryController.updateCategory);

// DELETE /api/v1/categories/:id - Delete category (Admin only)
router.delete('/:id', authenticate, requireAdmin(), CategoryController.deleteCategory);

module.exports = router;
