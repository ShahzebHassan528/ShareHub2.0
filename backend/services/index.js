/**
 * Service Layer Index
 * Central export for all services
 */

const AuthService = require('./auth.service');
const UserService = require('./user.service');
const ProductService = require('./product.service');
const OrderService = require('./order.service');
const DonationService = require('./donation.service');
const SwapService = require('./swap.service');
const NotificationService = require('./notificationService');

module.exports = {
  AuthService,
  UserService,
  ProductService,
  OrderService,
  DonationService,
  SwapService,
  NotificationService
};
