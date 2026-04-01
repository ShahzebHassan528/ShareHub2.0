/**
 * Upload Controller (MVC Pattern)
 * Handles file upload HTTP requests
 */

const UploadService = require('../services/upload.service');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

class UploadController {
  /**
   * Upload product images
   * POST /api/v1/upload/product-images
   */
  static uploadProductImages = catchAsync(async (req, res, next) => {
    if (!req.files || req.files.length === 0) {
      return next(new AppError('No images uploaded', 400));
    }

    const imagePaths = UploadService.processProductImages(req.files);

    res.status(200).json({
      success: true,
      message: `${imagePaths.length} image(s) uploaded successfully`,
      data: {
        images: imagePaths,
        count: imagePaths.length
      }
    });
  });

  /**
   * Upload NGO certificate
   * POST /api/v1/upload/ngo-certificate
   */
  static uploadNGOCertificate = catchAsync(async (req, res, next) => {
    if (!req.file) {
      return next(new AppError('Certificate document is required', 400));
    }

    const certificatePath = UploadService.processNGOCertificate(req.file);

    res.status(200).json({
      success: true,
      message: 'Certificate uploaded successfully',
      data: {
        certificate_path: certificatePath
      }
    });
  });

  /**
   * Upload seller license
   * POST /api/v1/upload/seller-license
   */
  static uploadSellerLicense = catchAsync(async (req, res, next) => {
    if (!req.file) {
      return next(new AppError('Business license is required', 400));
    }

    const licensePath = UploadService.processSellerLicense(req.file);

    res.status(200).json({
      success: true,
      message: 'License uploaded successfully',
      data: {
        license_path: licensePath
      }
    });
  });

  /**
   * Upload profile avatar
   * POST /api/v1/upload/profile-avatar
   */
  static uploadProfileAvatar = catchAsync(async (req, res, next) => {
    if (!req.file) {
      return next(new AppError('Profile image is required', 400));
    }

    const avatarPath = UploadService.processProfileAvatar(req.file);

    res.status(200).json({
      success: true,
      message: 'Profile image uploaded successfully',
      data: {
        url: avatarPath
      }
    });
  });

  /**
   * Delete file
   * DELETE /api/v1/upload/file
   */
  static deleteFile = catchAsync(async (req, res, next) => {
    const { file_path } = req.body;

    if (!file_path) {
      return next(new AppError('File path is required', 400));
    }

    UploadService.deleteFile(file_path);

    res.status(200).json({
      success: true,
      message: 'File deleted successfully'
    });
  });

  /**
   * Get file info
   * GET /api/v1/upload/file-info
   */
  static getFileInfo = catchAsync(async (req, res, next) => {
    const { file_path } = req.query;

    if (!file_path) {
      return next(new AppError('File path is required', 400));
    }

    const fileInfo = UploadService.getFileInfo(file_path);

    res.status(200).json({
      success: true,
      data: fileInfo
    });
  });

  /**
   * Get upload statistics
   * GET /api/v1/upload/stats
   */
  static getUploadStats = catchAsync(async (req, res, next) => {
    const stats = UploadService.getUploadStats();

    res.status(200).json({
      success: true,
      data: stats
    });
  });
}

module.exports = UploadController;
