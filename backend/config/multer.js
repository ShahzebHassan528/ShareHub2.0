/**
 * Multer Configuration
 * Local File System Storage
 */

const multer = require('multer');
const path = require('path');
const fs = require('fs');
const AppError = require('../utils/AppError');

// Base upload directory
const UPLOAD_DIR = path.join(__dirname, '../uploads');

// Ensure upload directories exist
const createUploadDirs = () => {
  const dirs = [
    UPLOAD_DIR,
    path.join(UPLOAD_DIR, 'products'),
    path.join(UPLOAD_DIR, 'ngos'),
    path.join(UPLOAD_DIR, 'sellers')
  ];

  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`📁 Created directory: ${dir}`);
    }
  });
};

// Create directories on startup
createUploadDirs();

// Storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let uploadPath = UPLOAD_DIR;

    // Determine upload path based on field name
    if (file.fieldname === 'product_images') {
      uploadPath = path.join(UPLOAD_DIR, 'products');
    } else if (file.fieldname === 'certificate_document') {
      uploadPath = path.join(UPLOAD_DIR, 'ngos');
    } else if (file.fieldname === 'business_license') {
      uploadPath = path.join(UPLOAD_DIR, 'sellers');
    }

    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Generate unique filename: timestamp-randomstring-originalname
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const nameWithoutExt = path.basename(file.originalname, ext);
    const sanitizedName = nameWithoutExt.replace(/[^a-zA-Z0-9]/g, '_');
    
    cb(null, `${sanitizedName}-${uniqueSuffix}${ext}`);
  }
});

// File filter - only allow images
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp'
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new AppError('Only image files (jpg, jpeg, png, webp) are allowed', 400), false);
  }
};

// Multer configuration
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 5 // Max 5 files per request
  }
});

// Export upload middleware configurations
module.exports = {
  // Product images (max 5)
  uploadProductImages: upload.array('product_images', 5),
  
  // NGO certificate (single file)
  uploadNGOCertificate: upload.single('certificate_document'),
  
  // Seller license (single file)
  uploadSellerLicense: upload.single('business_license'),
  
  // Generic single file upload
  uploadSingle: (fieldName) => upload.single(fieldName),
  
  // Generic multiple files upload
  uploadMultiple: (fieldName, maxCount) => upload.array(fieldName, maxCount),
  
  // Upload directory path
  UPLOAD_DIR
};
