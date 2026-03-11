/**
 * Swap Validation Schemas
 * Joi schemas for swap-related requests
 */

const Joi = require('joi');

/**
 * Create Swap Request Validation Schema
 */
const createSwapSchema = Joi.object({
  body: Joi.object({
    requester_product_id: Joi.number()
      .integer()
      .positive()
      .required()
      .messages({
        'number.base': 'Requester product ID must be a number',
        'number.integer': 'Requester product ID must be an integer',
        'number.positive': 'Requester product ID must be positive',
        'any.required': 'Requester product ID is required'
      }),
    
    owner_product_id: Joi.number()
      .integer()
      .positive()
      .required()
      .messages({
        'number.base': 'Owner product ID must be a number',
        'number.integer': 'Owner product ID must be an integer',
        'number.positive': 'Owner product ID must be positive',
        'any.required': 'Owner product ID is required'
      }),
    
    message: Joi.string()
      .max(500)
      .optional()
      .allow('', null)
      .messages({
        'string.max': 'Message must not exceed 500 characters'
      })
  })
});

/**
 * Accept/Reject/Complete/Cancel Swap Validation Schema
 */
const swapActionSchema = Joi.object({
  params: Joi.object({
    id: Joi.number()
      .integer()
      .positive()
      .required()
      .messages({
        'number.base': 'Swap ID must be a number',
        'number.integer': 'Swap ID must be an integer',
        'number.positive': 'Swap ID must be positive',
        'any.required': 'Swap ID is required'
      })
  })
});

/**
 * Get Swap by ID Validation Schema
 */
const getSwapByIdSchema = Joi.object({
  params: Joi.object({
    id: Joi.number()
      .integer()
      .positive()
      .required()
      .messages({
        'number.base': 'Swap ID must be a number',
        'number.integer': 'Swap ID must be an integer',
        'number.positive': 'Swap ID must be positive',
        'any.required': 'Swap ID is required'
      })
  })
});

module.exports = {
  createSwapSchema,
  swapActionSchema,
  getSwapByIdSchema
};
