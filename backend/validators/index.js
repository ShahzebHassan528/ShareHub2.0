/**
 * Validators Index
 * Central export for all validation schemas
 */

const authValidators = require('./auth.validator');
const productValidators = require('./product.validator');
const orderValidators = require('./order.validator');
const swapValidators = require('./swap.validator');
const donationValidators = require('./donation.validator');
const userValidators = require('./user.validator');

module.exports = {
  auth: authValidators,
  product: productValidators,
  order: orderValidators,
  swap: swapValidators,
  donation: donationValidators,
  user: userValidators
};
