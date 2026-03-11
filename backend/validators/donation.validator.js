/**
 * Donation Validation Schemas
 * Joi schemas for donation-related requests
 */

const Joi = require('joi');

/**
 * Create Donation Validation Schema
 */
const createDonationSchema = Joi.object({
  body: Joi.object({
    ngo_id: Joi.number()
      .integer()
      .positive()
      .required()
      .messages({
        'number.base': 'NGO ID must be a number',
        'number.integer': 'NGO ID must be an integer',
        'number.positive': 'NGO ID must be positive',
        'any.required': 'NGO ID is required'
      }),
    
    product_id: Joi.number()
      .integer()
      .positive()
      .optional()
      .allow(null)
      .messages({
        'number.base': 'Product ID must be a number',
        'number.integer': 'Product ID must be an integer',
        'number.positive': 'Product ID must be positive'
      }),
    
    amount: Joi.number()
      .positive()
      .precision(2)
      .optional()
      .default(0)
      .messages({
        'number.base': 'Amount must be a number',
        'number.positive': 'Amount must be greater than 0'
      }),
    
    message: Joi.string()
      .max(500)
      .optional()
      .allow('', null)
      .messages({
        'string.max': 'Message must not exceed 500 characters'
      })
  })
  .custom((value, helpers) => {
    // At least one of product_id or amount must be provided
    if (!value.product_id && (!value.amount || value.amount === 0)) {
      return helpers.error('any.custom', {
        message: 'Either product_id or amount must be provided'
      });
    }
    return value;
  })
});

/**
 * Accept/Reject Donation Validation Schema
 */
const donationActionSchema = Joi.object({
  params: Joi.object({
    id: Joi.number()
      .integer()
      .positive()
      .required()
      .messages({
        'number.base': 'Donation ID must be a number',
        'number.integer': 'Donation ID must be an integer',
        'number.positive': 'Donation ID must be positive',
        'any.required': 'Donation ID is required'
      })
  })
});

/**
 * Get Donation by ID Validation Schema
 */
const getDonationByIdSchema = Joi.object({
  params: Joi.object({
    id: Joi.number()
      .integer()
      .positive()
      .required()
      .messages({
        'number.base': 'Donation ID must be a number',
        'number.integer': 'Donation ID must be an integer',
        'number.positive': 'Donation ID must be positive',
        'any.required': 'Donation ID is required'
      })
  })
});

module.exports = {
  createDonationSchema,
  donationActionSchema,
  getDonationByIdSchema
};
