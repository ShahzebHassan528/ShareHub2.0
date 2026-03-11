/**
 * Order Validation Schemas
 * Joi schemas for order-related requests
 */

const Joi = require('joi');

/**
 * Create Order Validation Schema
 */
const createOrderSchema = Joi.object({
  body: Joi.object({
    items: Joi.array()
      .items(
        Joi.object({
          product_id: Joi.number()
            .integer()
            .positive()
            .required()
            .messages({
              'number.base': 'Product ID must be a number',
              'number.integer': 'Product ID must be an integer',
              'number.positive': 'Product ID must be positive',
              'any.required': 'Product ID is required'
            }),
          
          quantity: Joi.number()
            .integer()
            .positive()
            .required()
            .messages({
              'number.base': 'Quantity must be a number',
              'number.integer': 'Quantity must be an integer',
              'number.positive': 'Quantity must be greater than 0',
              'any.required': 'Quantity is required'
            })
        })
      )
      .min(1)
      .required()
      .messages({
        'array.min': 'Order must contain at least one item',
        'any.required': 'Order items are required'
      }),
    
    shipping_address: Joi.string()
      .max(500)
      .optional()
      .allow('', null)
      .messages({
        'string.max': 'Shipping address must not exceed 500 characters'
      }),
    
    payment_method: Joi.string()
      .valid('cash', 'card', 'online')
      .optional()
      .messages({
        'any.only': 'Payment method must be one of: cash, card, online'
      })
  })
});

/**
 * Update Order Status Validation Schema
 */
const updateOrderStatusSchema = Joi.object({
  params: Joi.object({
    id: Joi.number()
      .integer()
      .positive()
      .required()
      .messages({
        'number.base': 'Order ID must be a number',
        'number.integer': 'Order ID must be an integer',
        'number.positive': 'Order ID must be positive',
        'any.required': 'Order ID is required'
      })
  }),
  
  body: Joi.object({
    order_status: Joi.string()
      .valid('pending', 'processing', 'shipped', 'delivered', 'cancelled')
      .required()
      .messages({
        'any.only': 'Order status must be one of: pending, processing, shipped, delivered, cancelled',
        'any.required': 'Order status is required'
      })
  })
});

/**
 * Update Payment Status Validation Schema
 */
const updatePaymentStatusSchema = Joi.object({
  params: Joi.object({
    id: Joi.number()
      .integer()
      .positive()
      .required()
  }),
  
  body: Joi.object({
    payment_status: Joi.string()
      .valid('pending', 'paid', 'failed', 'refunded')
      .required()
      .messages({
        'any.only': 'Payment status must be one of: pending, paid, failed, refunded',
        'any.required': 'Payment status is required'
      })
  })
});

/**
 * Get Order by ID Validation Schema
 */
const getOrderByIdSchema = Joi.object({
  params: Joi.object({
    id: Joi.number()
      .integer()
      .positive()
      .required()
      .messages({
        'number.base': 'Order ID must be a number',
        'number.integer': 'Order ID must be an integer',
        'number.positive': 'Order ID must be positive',
        'any.required': 'Order ID is required'
      })
  })
});

module.exports = {
  createOrderSchema,
  updateOrderStatusSchema,
  updatePaymentStatusSchema,
  getOrderByIdSchema
};
