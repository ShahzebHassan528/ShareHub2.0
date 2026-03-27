/**
 * Review Controller (MVC Pattern)
 * Handles product review HTTP requests
 */

const { Review, User, Seller, Product } = require('../database/models');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

class ReviewController {
  /**
   * Get all reviews for a product
   * GET /api/v1/reviews/product/:productId
   */
  static getProductReviews = catchAsync(async (req, res, next) => {
    const reviews = await Review.findAll({
      where: { product_id: req.params.productId },
      include: [
        { model: User, as: 'buyer', attributes: ['id', 'full_name'] }
      ],
      order: [['created_at', 'DESC']],
    });

    res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews,
    });
  });

  /**
   * Create a review for a product
   * POST /api/v1/reviews/product/:productId
   * Requires authentication (buyer)
   */
  static createReview = catchAsync(async (req, res, next) => {
    const { rating, comment } = req.body;
    const product_id = req.params.productId;

    if (!rating || rating < 1 || rating > 5) {
      return next(new AppError('Rating must be between 1 and 5', 400));
    }

    // Check product exists and get seller_id
    const product = await Product.findByPk(product_id);
    if (!product) {
      return next(new AppError('Product not found', 404));
    }

    // Prevent duplicate reviews
    const existing = await Review.findOne({
      where: { product_id, buyer_id: req.user.id },
    });
    if (existing) {
      return next(new AppError('You have already reviewed this product', 400));
    }

    const review = await Review.create({
      product_id,
      buyer_id: req.user.id,
      seller_id: product.seller_id,
      rating: parseInt(rating),
      comment: comment || null,
    });

    res.status(201).json({
      success: true,
      message: 'Review submitted successfully',
      data: review,
    });
  });

  /**
   * Delete own review
   * DELETE /api/v1/reviews/:id
   */
  static deleteReview = catchAsync(async (req, res, next) => {
    const review = await Review.findByPk(req.params.id);
    if (!review) {
      return next(new AppError('Review not found', 404));
    }

    if (review.buyer_id !== req.user.id && req.user.role !== 'admin') {
      return next(new AppError('Not authorized to delete this review', 403));
    }

    await review.destroy();

    res.status(200).json({
      success: true,
      message: 'Review deleted',
    });
  });
}

module.exports = ReviewController;
