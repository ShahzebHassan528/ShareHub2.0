/**
 * Product Validation Schemas
 * Joi schemas for product-related requests
 */

const Joi = require('joi');

/**
 * Create Product Validation Schema
 */
const createProductSchema = Joi.object({
  body: Joi.object({
    title: Joi.string()
      .min(3)
      .max(255)
      .required()
      .messages({
        'string.min': 'Title must be at least 3 characters long',
        'string.max': 'Title must not exceed 255 characters',
        'any.required': 'Title is required'
      }),
    
    description: Joi.string()
      .max(2000)
      .optional()
      .allow('', null)
      .messages({
        'string.max': 'Description must not exceed 2000 characters'
      }),
    
    price: Joi.number()
      .positive()
      .precision(2)
      .required()
      .messages({
        'number.positive': 'Price must be greater than 0',
        'number.base': 'Price must be a number',
        'any.required': 'Price is required'
      }),
    
    category_id: Joi.number()
      .integer()
      .positive()
      .optional()
      .allow(null)
      .messages({
        'number.base': 'Category ID must be a number',
        'number.integer': 'Category ID must be an integer',
        'number.positive': 'Category ID must be positive'
      }),
    
    condition: Joi.string()
      .valid('new', 'like_new', 'good', 'fair', 'poor')
      .optional()
      .messages({
        'any.only': 'Condition must be one of: new, like_new, good, fair, poor'
      }),
    
    availability_status: Joi.string()
      .valid('available', 'sold', 'reserved')
      .optional()
      .messages({
        'any.only': 'Availability status must be one of: available, sold, reserved'
      }),
    
    latitude: Joi.number()
      .min(-90)
      .max(90)
      .optional()
      .allow(null)
      .messages({
        'number.min': 'Latitude must be between -90 and 90',
        'number.max': 'Latitude must be between -90 and 90'
      }),
    
    longitude: Joi.number()
      .min(-180)
      .max(180)
      .optional()
      .allow(null)
      .messages({
        'number.min': 'Longitude must be between -180 and 180',
        'number.max': 'Longitude must be between -180 and 180'
      }),
    
    address: Joi.string()
      .max(500)
      .optional()
      .allow('', null)
      .messages({
        'string.max': 'Address must not exceed 500 characters'
      })
  })
});

/**
 * Update Product Validation Schema
 */
const updateProductSchema = Joi.object({
  params: Joi.object({
    id: Joi.number()
      .integer()
      .positive()
      .required()
      .messages({
        'number.base': 'Product ID must be a number',
        'number.integer': 'Product ID must be an integer',
        'number.positive': 'Product ID must be positive',
        'any.required': 'Product ID is required'
      })
  }),
  
  body: Joi.object({
    title: Joi.string()
      .min(3)
      .max(255)
      .optional()
      .messages({
        'string.min': 'Title must be at least 3 characters long',
        'string.max': 'Title must not exceed 255 characters'
      }),
    
    description: Joi.string()
      .max(2000)
      .optional()
      .allow('', null),
    
    price: Joi.number()
      .positive()
      .precision(2)
      .optional()
      .messages({
        'number.positive': 'Price must be greater than 0'
      }),
    
    condition: Joi.string()
      .valid('new', 'like_new', 'good', 'fair', 'poor')
      .optional(),
    
    availability_status: Joi.string()
      .valid('available', 'sold', 'reserved')
      .optional(),
    
    latitude: Joi.number()
      .min(-90)
      .max(90)
      .optional()
      .allow(null),
    
    longitude: Joi.number()
      .min(-180)
      .max(180)
      .optional()
      .allow(null),
    
    address: Joi.string()
      .max(500)
      .optional()
      .allow('', null)
  }).min(1) // At least one field must be provided
});

/**
 * Get Product by ID Validation Schema
 */
const getProductByIdSchema = Joi.object({
  params: Joi.object({
    id: Joi.number()
      .integer()
      .positive()
      .required()
      .messages({
        'number.base': 'Product ID must be a number',
        'number.integer': 'Product ID must be an integer',
        'number.positive': 'Product ID must be positive',
        'any.required': 'Product ID is required'
      })
  })
});

/**
 * Get Nearby Products Validation Schema
 */
const getNearbyProductsSchema = Joi.object({
  query: Joi.object({
    lat: Joi.number()
      .min(-90)
      .max(90)
      .required()
      .messages({
        'number.base': 'Latitude must be a number',
        'number.min': 'Latitude must be between -90 and 90',
        'number.max': 'Latitude must be between -90 and 90',
        'any.required': 'Latitude is required'
      }),
    
    lng: Joi.number()
      .min(-180)
      .max(180)
      .required()
      .messages({
        'number.base': 'Longitude must be a number',
        'number.min': 'Longitude must be between -180 and 180',
        'number.max': 'Longitude must be between -180 and 180',
        'any.required': 'Longitude is required'
      }),
    
    radius: Joi.number()
      .positive()
      .max(100)
      .optional()
      .messages({
        'number.positive': 'Radius must be greater than 0',
        'number.max': 'Radius must not exceed 100 km'
      })
  })
});

/**
 * Get Products with Filters Validation Schema
 */
const getProductsSchema = Joi.object({
  query: Joi.object({
    category: Joi.number()
      .integer()
      .positive()
      .optional(),
    
    condition: Joi.string()
      .valid('new', 'like_new', 'good', 'fair', 'poor')
      .optional(),
    
    minPrice: Joi.number()
      .positive()
      .optional(),
    
    maxPrice: Joi.number()
      .positive()
      .optional(),
    
    availability_status: Joi.string()
      .valid('available', 'sold', 'reserved')
      .optional()
  })
});

module.exports = {
  createProductSchema,
  updateProductSchema,
  getProductByIdSchema,
  getNearbyProductsSchema,
  getProductsSchema
};
