/**
 * User Validation Schemas
 * Joi schemas for user-related requests
 */

const Joi = require('joi');

/**
 * Update Profile Validation Schema
 */
const updateProfileSchema = Joi.object({
  body: Joi.object({
    full_name: Joi.string()
      .min(2)
      .max(255)
      .optional()
      .messages({
        'string.min': 'Full name must be at least 2 characters long',
        'string.max': 'Full name must not exceed 255 characters'
      }),
    
    phone: Joi.string()
      .pattern(/^[\d\s\-\+\(\)]+$/)
      .max(20)
      .optional()
      .allow('', null)
      .messages({
        'string.pattern.base': 'Phone number contains invalid characters',
        'string.max': 'Phone number must not exceed 20 characters'
      }),
    
    address: Joi.string()
      .max(1000)
      .optional()
      .allow('', null)
      .messages({
        'string.max': 'Address must not exceed 1000 characters'
      }),
    
    profile_image: Joi.string()
      .uri()
      .max(500)
      .optional()
      .allow('', null)
      .messages({
        'string.uri': 'Profile image must be a valid URL',
        'string.max': 'Profile image URL must not exceed 500 characters'
      })
  }).min(1) // At least one field must be provided
});

/**
 * Get User by ID Validation Schema
 */
const getUserByIdSchema = Joi.object({
  params: Joi.object({
    id: Joi.number()
      .integer()
      .positive()
      .required()
      .messages({
        'number.base': 'User ID must be a number',
        'number.integer': 'User ID must be an integer',
        'number.positive': 'User ID must be positive',
        'any.required': 'User ID is required'
      })
  })
});

/**
 * Suspend User Validation Schema (Admin)
 */
const suspendUserSchema = Joi.object({
  params: Joi.object({
    id: Joi.number()
      .integer()
      .positive()
      .required()
  }),
  
  body: Joi.object({
    reason: Joi.string()
      .min(10)
      .max(500)
      .required()
      .messages({
        'string.min': 'Suspension reason must be at least 10 characters long',
        'string.max': 'Suspension reason must not exceed 500 characters',
        'any.required': 'Suspension reason is required'
      })
  })
});

module.exports = {
  updateProfileSchema,
  getUserByIdSchema,
  suspendUserSchema
};
