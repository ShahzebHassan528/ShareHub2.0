/**
 * Authentication Routes with Centralized Error Handling
 * Example showing how to use catchAsync and AppError
 * 
 * MIGRATION GUIDE:
 * 1. Import catchAsync and AppError
 * 2. Wrap route handlers with catchAsync
 * 3. Remove try-catch blocks
 * 4. Throw AppError for operational errors
 * 5. Let catchAsync handle async errors
 */

const express = require('express');
const { AuthService } = require('../services');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

const router = express.Router();

console.log('🔧 Auth routes initialized with centralized error handling');

/**
 * POST /api/auth/signup
 * Register a new user
 * 
 * BEFORE: try-catch block
 * AFTER: catchAsync wrapper + throw AppError
 */
router.post('/signup', catchAsync(async (req, res, next) => {
  const result = await AuthService.register(req.body);
  
  console.log('✅ Signup successful for:', req.body.email);
  
  res.status(201).json(result);
}));

/**
 * POST /api/auth/signin
 * Authenticate user and return token
 * 
 * BEFORE: try-catch with multiple error checks
 * AFTER: catchAsync wrapper, service throws errors
 */
router.post('/signin', catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  
  // Validate input
  if (!email || !password) {
    throw new AppError('Please provide email and password', 400);
  }
  
  console.log('🔐 Signin request for:', email);
  
  const result = await AuthService.login(email, password);
  
  console.log('✅ Signin successful for:', email);
  
  res.json(result);
}));

/**
 * POST /api/auth/refresh
 * Refresh JWT token
 */
router.post('/refresh', catchAsync(async (req, res, next) => {
  const { token } = req.body;
  
  if (!token) {
    throw new AppError('Token is required', 400);
  }
  
  const newToken = AuthService.refreshToken(token);
  
  res.json({
    message: 'Token refreshed successfully',
    token: newToken
  });
}));

module.exports = router;
