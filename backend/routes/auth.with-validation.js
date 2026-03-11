/**
 * Authentication Routes with Validation
 * Example showing how to use Joi validation middleware
 * 
 * MIGRATION GUIDE:
 * 1. Import validate middleware and validators
 * 2. Add validate(schema) before route handler
 * 3. Validation runs BEFORE controller execution
 * 4. Invalid requests rejected automatically
 */

const express = require('express');
const { AuthService } = require('../services');
const catchAsync = require('../utils/catchAsync');
const validate = require('../middleware/validate');
const { auth: authValidators } = require('../validators');

const router = express.Router();

console.log('🔧 Auth routes initialized with validation middleware');

/**
 * POST /api/auth/signup
 * Register a new user
 * 
 * Validation:
 * - Email format
 * - Password strength (min 8 chars, uppercase, lowercase, number)
 * - Role enum (buyer, seller, ngo)
 * - Required fields based on role
 */
router.post(
  '/signup',
  validate(authValidators.signupSchema),
  catchAsync(async (req, res) => {
    const result = await AuthService.register(req.body);
    
    console.log('✅ Signup successful for:', req.body.email);
    
    res.status(201).json(result);
  })
);

/**
 * POST /api/auth/signin
 * Authenticate user and return token
 * 
 * Validation:
 * - Email format
 * - Password required
 */
router.post(
  '/signin',
  validate(authValidators.signinSchema),
  catchAsync(async (req, res) => {
    console.log('🔐 Signin request for:', req.body.email);
    
    const result = await AuthService.login(req.body.email, req.body.password);
    
    console.log('✅ Signin successful for:', req.body.email);
    
    res.json(result);
  })
);

/**
 * POST /api/auth/refresh
 * Refresh JWT token
 * 
 * Validation:
 * - Token required
 */
router.post(
  '/refresh',
  validate(authValidators.refreshTokenSchema),
  catchAsync(async (req, res) => {
    const newToken = AuthService.refreshToken(req.body.token);
    
    res.json({
      message: 'Token refreshed successfully',
      token: newToken
    });
  })
);

module.exports = router;
