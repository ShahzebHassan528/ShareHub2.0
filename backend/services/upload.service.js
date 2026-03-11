/**
 * Upload Service (MVC Pattern)
 * Business logic for file upload operations
 */

const fs = require('fs');
const path = require('path');
const AppError = require('../utils/AppError');
const { UPLOAD_DIR } = require('../config/multer');

class UploadService {
  /**
   * Process product images upload
   * @param {Array} files - Uploaded files from multer
   * @returns {Array} Array of file paths
   */
  static processProductImages(files) {
    if (!files || files.length === 0) {
      throw new AppError('No images uploaded', 400);
    }

    if (files.length > 5) {
      // Clean up uploaded files
      files.forEach(file => this.deleteFile(file.path));
      throw new AppError('Maximum 5 images allowed', 400);
    }

    // Validate each file
    files.forEach(file => {
      this.validateImageFile(file);
    });

    // Return relative paths for database storage
    return files.map(file => `/uploads/products/${file.filename}`);
  }

  /**
   * Process NGO certificate upload
   * @param {Object} file - Uploaded file from multer
   * @returns {String} File path
   */
  static processNGOCertificate(file) {
    if (!file) {
      throw new AppError('Certificate document is required', 400);
    }

    this.validateImageFile(file);

    return `/uploads/ngos/${file.filename}`;
  }

  /**
   * Process seller license upload
   * @param {Object} file - Uploaded file from multer
   * @returns {String} File path
   */
  static processSellerLicense(file) {
    if (!file) {
      throw new AppError('Business license is required', 400);
    }

    this.validateImageFile(file);

    return `/uploads/sellers/${file.filename}`;
  }

  /**
   * Validate image file
   * @param {Object} file - File object from multer
   */
  static validateImageFile(file) {
    const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    
    if (!allowedMimeTypes.includes(file.mimetype)) {
      this.deleteFile(file.path);
      throw new AppError('Invalid file type. Only jpg, jpeg, png, webp allowed', 400);
    }

    // Check file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      this.deleteFile(file.path);
      throw new AppError('File size exceeds 5MB limit', 400);
    }
  }

  /**
   * Delete file from disk
   * @param {String} filePath - Full path or relative path
   */
  static deleteFile(filePath) {
    try {
      let fullPath = filePath;
      
      // If relative path, convert to full path
      if (filePath.startsWith('/uploads/')) {
        fullPath = path.join(UPLOAD_DIR, filePath.replace('/uploads/', ''));
      }

      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
        console.log(`🗑️  Deleted file: ${fullPath}`);
      }
    } catch (error) {
      console.error('Error deleting file:', error.message);
    }
  }

  /**
   * Delete multiple files
   * @param {Array} filePaths - Array of file paths
   */
  static deleteMultipleFiles(filePaths) {
    if (!filePaths || filePaths.length === 0) return;

    filePaths.forEach(filePath => {
      this.deleteFile(filePath);
    });
  }

  /**
   * Get file info
   * @param {String} filePath - Relative file path
   * @returns {Object} File information
   */
  static getFileInfo(filePath) {
    const fullPath = path.join(UPLOAD_DIR, filePath.replace('/uploads/', ''));

    if (!fs.existsSync(fullPath)) {
      throw new AppError('File not found', 404);
    }

    const stats = fs.statSync(fullPath);

    return {
      path: filePath,
      size: stats.size,
      created: stats.birthtime,
      modified: stats.mtime
    };
  }

  /**
   * Check if file exists
   * @param {String} filePath - Relative file path
   * @returns {Boolean}
   */
  static fileExists(filePath) {
    const fullPath = path.join(UPLOAD_DIR, filePath.replace('/uploads/', ''));
    return fs.existsSync(fullPath);
  }

  /**
   * Get upload statistics
   * @returns {Object} Upload directory statistics
   */
  static getUploadStats() {
    const getDirectorySize = (dirPath) => {
      let totalSize = 0;
      let fileCount = 0;

      if (!fs.existsSync(dirPath)) return { size: 0, count: 0 };

      const files = fs.readdirSync(dirPath);
      files.forEach(file => {
        const filePath = path.join(dirPath, file);
        const stats = fs.statSync(filePath);
        if (stats.isFile()) {
          totalSize += stats.size;
          fileCount++;
        }
      });

      return { size: totalSize, count: fileCount };
    };

    const productsStats = getDirectorySize(path.join(UPLOAD_DIR, 'products'));
    const ngosStats = getDirectorySize(path.join(UPLOAD_DIR, 'ngos'));
    const sellersStats = getDirectorySize(path.join(UPLOAD_DIR, 'sellers'));

    return {
      products: {
        files: productsStats.count,
        size_mb: (productsStats.size / (1024 * 1024)).toFixed(2)
      },
      ngos: {
        files: ngosStats.count,
        size_mb: (ngosStats.size / (1024 * 1024)).toFixed(2)
      },
      sellers: {
        files: sellersStats.count,
        size_mb: (sellersStats.size / (1024 * 1024)).toFixed(2)
      },
      total: {
        files: productsStats.count + ngosStats.count + sellersStats.count,
        size_mb: ((productsStats.size + ngosStats.size + sellersStats.size) / (1024 * 1024)).toFixed(2)
      }
    };
  }
}

module.exports = UploadService;
