/**
 * Review Routes (MVC Pattern)
 * Handles product review endpoints
 */

const express = require('express');
const router = express.Router();
const ReviewController = require('../../controllers/review.controller');
const { authenticate } = require('../../middleware/auth');

/**
 * GET /api/v1/reviews/product/:productId
 * Get all reviews for a product (public)
 */
router.get('/product/:productId', ReviewController.getProductReviews);

/**
 * POST /api/v1/reviews/product/:productId
 * Create a review (authenticated buyers only)
 */
router.post('/product/:productId', authenticate, ReviewController.createReview);

/**
 * DELETE /api/v1/reviews/:id
 * Delete own review
 */
router.delete('/:id', authenticate, ReviewController.deleteReview);

module.exports = router;
