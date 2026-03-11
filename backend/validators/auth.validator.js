/**
 * Authentication Validation Schemas
 * Joi schemas for auth-related requests
 */

const Joi = require('joi');

/**
 * Sign Up Validation Schema
 */
const signupSchema = Joi.object({
  body: Joi.object({
    email: Joi.string()
      .email()
      .required()
      .messages({
        'string.email': 'Please provide a valid email address',
        'any.required': 'Email is required'
      }),
    
    password: Joi.string()
      .min(8)
      .max(128)
      .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .required()
      .messages({
        'string.min': 'Password must be at least 8 characters long',
        'string.max': 'Password must not exceed 128 characters',
        'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, and one number',
        'any.required': 'Password is required'
      }),
    
    full_name: Joi.string()
      .min(2)
      .max(255)
      .required()
      .messages({
        'string.min': 'Full name must be at least 2 characters long',
        'string.max': 'Full name must not exceed 255 characters',
        'any.required': 'Full name is required'
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
    
    role: Joi.string()
      .valid('buyer', 'seller', 'ngo')
      .required()
      .messages({
        'any.only': 'Role must be one of: buyer, seller, ngo',
        'any.required': 'Role is required'
      }),
    
    // Seller-specific fields
    business_name: Joi.when('role', {
      is: 'seller',
      then: Joi.string().min(2).max(255).required(),
      otherwise: Joi.optional()
    }),
    
    business_address: Joi.when('role', {
      is: 'seller',
      then: Joi.string().max(500).optional(),
      otherwise: Joi.optional()
    }),
    
    business_license: Joi.when('role', {
      is: 'seller',
      then: Joi.string().max(100).optional(),
      otherwise: Joi.optional()
    }),
    
    tax_id: Joi.when('role', {
      is: 'seller',
      then: Joi.string().max(50).optional(),
      otherwise: Joi.optional()
    }),
    
    // NGO-specific fields
    ngo_name: Joi.when('role', {
      is: 'ngo',
      then: Joi.string().min(2).max(255).required(),
      otherwise: Joi.optional()
    }),
    
    registration_number: Joi.when('role', {
      is: 'ngo',
      then: Joi.string().max(100).required(),
      otherwise: Joi.optional()
    }),
    
    address: Joi.when('role', {
      is: 'ngo',
      then: Joi.string().max(500).optional(),
      otherwise: Joi.optional()
    }),
    
    website: Joi.when('role', {
      is: 'ngo',
      then: Joi.string().uri().max(255).optional().allow('', null),
      otherwise: Joi.optional()
    }),
    
    description: Joi.when('role', {
      is: 'ngo',
      then: Joi.string().max(1000).optional().allow('', null),
      otherwise: Joi.optional()
    }),
    
    certificate_document: Joi.when('role', {
      is: 'ngo',
      then: Joi.string().max(500).optional().allow('', null),
      otherwise: Joi.optional()
    })
  })
});

/**
 * Sign In Validation Schema
 */
const signinSchema = Joi.object({
  body: Joi.object({
    email: Joi.string()
      .email()
      .required()
      .messages({
        'string.email': 'Please provide a valid email address',
        'any.required': 'Email is required'
      }),
    
    password: Joi.string()
      .required()
      .messages({
        'any.required': 'Password is required'
      })
  })
});

/**
 * Refresh Token Validation Schema
 */
const refreshTokenSchema = Joi.object({
  body: Joi.object({
    token: Joi.string()
      .required()
      .messages({
        'any.required': 'Token is required'
      })
  })
});

module.exports = {
  signupSchema,
  signinSchema,
  refreshTokenSchema
};
