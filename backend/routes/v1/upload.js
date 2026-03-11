/**
 * Upload Routes (MVC Pattern)
 * Handles file upload endpoints
 */

const express = require('express');
const router = express.Router();
const UploadController = require('../../controllers/upload.controller');
const { authenticate } = require('../../middleware/auth');
const { 
  uploadProductImages, 
  uploadNGOCertificate, 
  uploadSellerLicense 
} = require('../../config/multer');

console.log('🔧 Upload routes initialized with Multer (Local File System)');

/**
 * POST /api/v1/upload/product-images
 * Upload product images (max 5)
 * Requires authentication
 */
router.post(
  '/product-images',
  authenticate,
  uploadProductImages,
  UploadController.uploadProductImages
);

/**
 * POST /api/v1/upload/ngo-certificate
 * Upload NGO certificate document
 * Requires authentication
 */
router.post(
  '/ngo-certificate',
  authenticate,
  uploadNGOCertificate,
  UploadController.uploadNGOCertificate
);

/**
 * POST /api/v1/upload/seller-license
 * Upload seller business license
 * Requires authentication
 */
router.post(
  '/seller-license',
  authenticate,
  uploadSellerLicense,
  UploadController.uploadSellerLicense
);

/**
 * DELETE /api/v1/upload/file
 * Delete uploaded file
 * Requires authentication
 */
router.delete(
  '/file',
  authenticate,
  UploadController.deleteFile
);

/**
 * GET /api/v1/upload/file-info
 * Get file information
 * Requires authentication
 */
router.get(
  '/file-info',
  authenticate,
  UploadController.getFileInfo
);

/**
 * GET /api/v1/upload/stats
 * Get upload statistics (admin only)
 * Requires authentication
 */
router.get(
  '/stats',
  authenticate,
  UploadController.getUploadStats
);

module.exports = router;
