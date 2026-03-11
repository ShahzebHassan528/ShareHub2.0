/**
 * Category Controller (MVC Pattern)
 * Handles category-related HTTP requests
 */

const { Category } = require('../database/models');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

class CategoryController {
  /**
   * Get all categories
   * GET /api/v1/categories
   */
  static getAllCategories = catchAsync(async (req, res, next) => {
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

    res.status(200).json({
      success: true,
      count: categories.length,
      data: categories
    });
  });

  /**
   * Get category by ID
   * GET /api/v1/categories/:id
   */
  static getCategoryById = catchAsync(async (req, res, next) => {
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
      return next(new AppError('Category not found', 404));
    }

    res.status(200).json({
      success: true,
      data: category
    });
  });

  /**
   * Create new category
   * POST /api/v1/categories
   */
  static createCategory = catchAsync(async (req, res, next) => {
    const { name, description, parent_id } = req.body;

    if (!name) {
      return next(new AppError('Category name is required', 400));
    }

    const category = await Category.create({
      name,
      description,
      parent_id: parent_id || null
    });

    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data: category
    });
  });

  /**
   * Update category
   * PUT /api/v1/categories/:id
   */
  static updateCategory = catchAsync(async (req, res, next) => {
    const { name, description, parent_id } = req.body;

    const category = await Category.findByPk(req.params.id);
    if (!category) {
      return next(new AppError('Category not found', 404));
    }

    await category.update({
      name: name || category.name,
      description: description !== undefined ? description : category.description,
      parent_id: parent_id !== undefined ? parent_id : category.parent_id
    });

    res.status(200).json({
      success: true,
      message: 'Category updated successfully',
      data: category
    });
  });

  /**
   * Delete category
   * DELETE /api/v1/categories/:id
   */
  static deleteCategory = catchAsync(async (req, res, next) => {
    const category = await Category.findByPk(req.params.id);
    if (!category) {
      return next(new AppError('Category not found', 404));
    }

    const subcategories = await Category.count({
      where: { parent_id: req.params.id }
    });

    if (subcategories > 0) {
      return next(new AppError('Cannot delete category with subcategories', 400));
    }

    await category.destroy();

    res.status(200).json({
      success: true,
      message: 'Category deleted successfully'
    });
  });
}

module.exports = CategoryController;
