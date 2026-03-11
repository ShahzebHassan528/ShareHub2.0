/**
 * Auth Routes (MVC Pattern)
 * Uses AuthController for all authentication endpoints
 */

const express = require('express');
const AuthController = require('../../controllers/auth.controller');
const { authenticate } = require('../../middleware/auth');

const router = express.Router();

console.log('🔧 Auth routes initialized with MVC pattern (AuthController)');

// POST /api/v1/auth/register
router.post('/register', AuthController.register);
router.post('/signup', AuthController.register); // Alias for backward compatibility

// POST /api/v1/auth/login
router.post('/login', AuthController.login);
router.post('/signin', AuthController.login); // Alias for backward compatibility

// GET /api/v1/auth/me
router.get('/me', authenticate, AuthController.getMe);

// POST /api/v1/auth/refresh
router.post('/refresh', AuthController.refreshToken);

// POST /api/v1/auth/logout
router.post('/logout', authenticate, AuthController.logout);

module.exports = router;
