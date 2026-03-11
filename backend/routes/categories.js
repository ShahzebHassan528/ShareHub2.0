/**
 * Categories Routes with Redis Caching
 */

const express = require('express');
const router = express.Router();
const { Category } = require('../database/models');
const { cacheMiddleware, autoInvalidateCache } = require('../middleware/cache');
const { authenticate, authorize } = require('../middleware/auth');

// Auto-invalidate cache on POST/PUT/DELETE
router.use(autoInvalidateCache(['/api/categories', '/api/products', '/api/dashboard']));

/**
 * GET /api/categories - CACHED
 */
router.get('/', 
  cacheMiddleware(),
  async (req, res) => {
    try {
      const categories = await Category.findAll({
        attributes: ['id', 'name', 'description', 'parent_id'],
        include: [
          {
            model: Category,
            as: 'subcategories',
            attributes: ['id', 'name', 'description']
          }
        ],
        where: { parent_id: null },
        order: [['name', 'ASC']]
      });

      res.json({
        success: true,
        count: categories.length,
        categories
      });
    } catch (error) {
      console.error('Error fetching categories:', error);
      res.status(500).json({ 
        success: false,
        error: 'Failed to fetch categories' 
      });
    }
  }
);

/**
 * GET /api/categories/:id - CACHED
 */
router.get('/:id',
  cacheMiddleware(),
  async (req, res) => {
    try {
      const category = await Category.findByPk(req.params.id, {
        include: [
          {
            model: Category,
            as: 'subcategories',
            attributes: ['id', 'name', 'description']
          },
          {
            model: Category,
            as: 'parent',
            attributes: ['id', 'name']
          }
        ]
      });

      if (!category) {
        return res.status(404).json({ 
          success: false,
          error: 'Category not found' 
        });
      }

      res.json({
        success: true,
        category
      });
    } catch (error) {
      console.error('Error fetching category:', error);
      res.status(500).json({ 
        success: false,
        error: 'Failed to fetch category' 
      });
    }
  }
);

/**
 * POST /api/categories - Invalidates cache
 */
router.post('/',
  authenticate,
  authorize('admin'),
  async (req, res) => {
    try {
      const { name, description, parent_id } = req.body;

      if (!name) {
        return res.status(400).json({ 
          success: false,
          error: 'Category name is required' 
        });
      }

      const category = await Category.create({
        name,
        description,
        parent_id: parent_id || null
      });

      res.status(201).json({
        success: true,
        message: 'Category created successfully',
        category
      });
    } catch (error) {
      console.error('Error creating category:', error);
      res.status(500).json({ 
        success: false,
        error: 'Failed to create category' 
      });
    }
  }
);

/**
 * PUT /api/categories/:id - Invalidates cache
 */
router.put('/:id',
  authenticate,
  authorize('admin'),
  async (req, res) => {
    try {
      const { name, description, parent_id } = req.body;

      const category = await Category.findByPk(req.params.id);
      if (!category) {
        return res.status(404).json({ 
          success: false,
          error: 'Category not found' 
        });
      }

      await category.update({
        name: name || category.name,
        description: description !== undefined ? description : category.description,
        parent_id: parent_id !== undefined ? parent_id : category.parent_id
      });

      res.json({
        success: true,
        message: 'Category updated successfully',
        category
      });
    } catch (error) {
      console.error('Error updating category:', error);
      res.status(500).json({ 
        success: false,
        error: 'Failed to update category' 
      });
    }
  }
);

/**
 * DELETE /api/categories/:id - Invalidates cache
 */
router.delete('/:id',
  authenticate,
  authorize('admin'),
  async (req, res) => {
    try {
      const category = await Category.findByPk(req.params.id);
      if (!category) {
        return res.status(404).json({ 
          success: false,
          error: 'Category not found' 
        });
      }

      const subcategories = await Category.count({
        where: { parent_id: req.params.id }
      });

      if (subcategories > 0) {
        return res.status(400).json({ 
          success: false,
          error: 'Cannot delete category with subcategories' 
        });
      }

      await category.destroy();

      res.json({
        success: true,
        message: 'Category deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting category:', error);
      res.status(500).json({ 
        success: false,
        error: 'Failed to delete category' 
      });
    }
  }
);

module.exports = router;
