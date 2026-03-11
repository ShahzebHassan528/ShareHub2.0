/**
 * Authentication Routes (Refactored with Service Layer)
 * This is an example of how to refactor routes to use the service layer
 * 
 * MIGRATION GUIDE:
 * 1. Keep the original auth.js file as-is (backward compatibility)
 * 2. Test this refactored version thoroughly
 * 3. Once tested, rename auth.js to auth.old.js
 * 4. Rename this file to auth.js
 */

const express = require('express');
const { AuthService } = require('../services');

const router = express.Router();

console.log('🔧 Auth routes initialized with Service Layer architecture');

/**
 * POST /api/auth/signup
 * Register a new user
 */
router.post('/signup', async (req, res) => {
  try {
    const result = await AuthService.register(req.body);
    
    console.log('✅ Signup successful for:', req.body.email);
    
    res.status(201).json(result);
  } catch (error) {
    console.error('❌ Signup error:', error.message);
    
    // Handle specific errors
    if (error.message === 'Email already registered') {
      return res.status(400).json({ error: error.message });
    }
    
    if (error.message.includes('Invalid role')) {
      return res.status(400).json({ error: error.message });
    }
    
    res.status(500).json({ error: 'Failed to create account' });
  }
});

/**
 * POST /api/auth/signin
 * Authenticate user and return token
 */
router.post('/signin', async (req, res) => {
  try {
    console.log('🔐 Signin request for:', req.body.email);
    
    const result = await AuthService.login(req.body.email, req.body.password);
    
    console.log('✅ Signin successful for:', req.body.email);
    
    res.json(result);
  } catch (error) {
    console.error('❌ Signin error:', error.message);
    
    // Handle specific errors
    if (error.message === 'Invalid credentials') {
      return res.status(401).json({ error: error.message });
    }
    
    if (error.message === 'Account is deactivated') {
      return res.status(403).json({ error: error.message });
    }
    
    if (error.message === 'Account suspended') {
      return res.status(error.statusCode || 403).json({
        error: error.message,
        ...error.details
      });
    }
    
    res.status(500).json({ error: 'Failed to sign in' });
  }
});

/**
 * POST /api/auth/refresh
 * Refresh JWT token
 */
router.post('/refresh', async (req, res) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({ error: 'Token is required' });
    }
    
    const newToken = AuthService.refreshToken(token);
    
    res.json({
      message: 'Token refreshed successfully',
      token: newToken
    });
  } catch (error) {
    console.error('❌ Token refresh error:', error.message);
    res.status(401).json({ error: 'Invalid or expired token' });
  }
});

module.exports = router;
