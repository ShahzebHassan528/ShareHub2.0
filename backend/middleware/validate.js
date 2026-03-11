/**
 * Validation Middleware
 * Validates request data against Joi schemas
 */

const AppError = require('../utils/AppError');

/**
 * Validate request data against a Joi schema
 * @param {Object} schema - Joi validation schema
 * @returns {Function} Express middleware function
 */
const validate = (schema) => {
  return (req, res, next) => {
    // Determine what to validate based on schema keys
    const dataToValidate = {};
    
    if (schema.body) {
      dataToValidate.body = req.body;
    }
    
    if (schema.params) {
      dataToValidate.params = req.params;
    }
    
    if (schema.query) {
      dataToValidate.query = req.query;
    }
    
    // Validate the data
    const { error, value } = schema.validate(dataToValidate, {
      abortEarly: false, // Return all errors, not just the first one
      stripUnknown: true // Remove unknown keys from validated data
    });
    
    if (error) {
      // Extract error messages
      const errors = error.details.map(detail => detail.message);
      
      // Create AppError with validation details
      const validationError = new AppError('Validation failed', 400);
      validationError.details = errors;
      
      return next(validationError);
    }
    
    // Replace request data with validated data (sanitized)
    if (value.body) req.body = value.body;
    if (value.params) req.params = value.params;
    if (value.query) req.query = value.query;
    
    next();
  };
};

module.exports = validate;
