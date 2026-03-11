# 🚀 Node.js API Structure Complete Guide

## Table of Contents
1. [Project Structure](#project-structure)
2. [Route Definitions](#route-definitions)
3. [Controller Logic](#controller-logic)
4. [Request Handling](#request-handling)
5. [Response Sending](#response-sending)
6. [Error Handling](#error-handling)
7. [Middleware](#middleware)
8. [Best Practices](#best-practices)

---

## 1️⃣ PROJECT STRUCTURE

### Recommended Folder Structure

```
backend/
├── server.js                 ← Entry point
├── config/
│   ├── database.js          ← Database connection
│   └── sequelize.js         ← ORM configuration
├── middleware/
│   ├── auth.js              ← Authentication middleware
│   └── errorHandler.js      ← Error handling middleware
├── routes/
│   ├── auth.js              ← Authentication routes
│   ├── users.js             ← User routes
│   └── products.js          ← Product routes
├── controllers/             ← Business logic (optional)
│   ├── authController.js
│   └── userController.js
├── models/                  ← Data models
│   └── User.js
├── services/                ← Business services
│   └── notificationService.js
└── utils/                   ← Helper functions
    └── validators.js
```

---

## 2️⃣ ROUTE DEFINITIONS

### Basic Route Setup

**File**: `server.js`

```javascript
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());                    // Enable CORS
app.use(express.json());            // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const productRoutes = require('./routes/products');

// Register routes
app.use('/api/auth', authRoutes);       // /api/auth/*
app.use('/api/users', userRoutes);      // /api/users/*
app.use('/api/products', productRoutes); // /api/products/*

// Health check endpoint
app.get('/api', (req, res) => {
  res.json({ 
    message: 'API is running',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
```

### Route File Structure

**File**: `routes/users.js`

```javascript
const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const User = require('../models/User');

// Public route (no authentication)
router.get('/:id/public', async (req, res) => {
  // Handler logic
});

// Protected route (requires authentication)
router.get('/profile', auth, async (req, res) => {
  // Handler logic
});

// Protected route with multiple middleware
router.put('/profile', auth, validateProfile, async (req, res) => {
  // Handler logic
});

module.exports = router;
```

### HTTP Methods

```javascript
// GET - Retrieve data
router.get('/users', async (req, res) => {
  // Get all users
});

// POST - Create new resource
router.post('/users', async (req, res) => {
  // Create user
});

// PUT - Update entire resource
router.put('/users/:id', async (req, res) => {
  // Update user completely
});

// PATCH - Update partial resource
router.patch('/users/:id', async (req, res) => {
  // Update specific fields
});

// DELETE - Remove resource
router.delete('/users/:id', async (req, res) => {
  // Delete user
});
```

---

## 3️⃣ CONTROLLER LOGIC

### Inline Controller (Simple)

**File**: `routes/users.js`

```javascript
router.get('/profile', auth, async (req, res) => {
  try {
    // 1. Extract data from request
    const userId = req.user.id;
    
    // 2. Validate input
    if (!userId) {
      return res.status(400).json({ error: 'User ID required' });
    }
    
    // 3. Business logic
    const profile = await User.getProfile(userId);
    
    // 4. Check result
    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }
    
    // 5. Send response
    res.json({
      message: 'Profile retrieved successfully',
      profile
    });
    
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
```

### Separate Controller (Complex)

**File**: `controllers/userController.js`

```javascript
const User = require('../models/User');

class UserController {
  // Get user profile
  static async getProfile(req, res) {
    try {
      const userId = req.user.id;
      
      const profile = await User.getProfile(userId);
      
      if (!profile) {
        return res.status(404).json({ error: 'Profile not found' });
      }
      
      res.json({
        message: 'Profile retrieved successfully',
        profile
      });
      
    } catch (error) {
      console.error('Error fetching profile:', error);
      res.status(500).json({ error: 'Failed to fetch profile' });
    }
  }
  
  // Update user profile
  static async updateProfile(req, res) {
    try {
      const userId = req.user.id;
      const updates = req.body;
      
      // Validation
      const errors = validateProfileData(updates);
      if (errors.length > 0) {
        return res.status(400).json({ 
          error: 'Validation failed',
          details: errors
        });
      }
      
      // Update
      const updatedProfile = await User.updateProfile(userId, updates);
      
      res.json({
        message: 'Profile updated successfully',
        profile: updatedProfile
      });
      
    } catch (error) {
      console.error('Error updating profile:', error);
      res.status(500).json({ error: 'Failed to update profile' });
    }
  }
}

module.exports = UserController;
```

**File**: `routes/users.js`

```javascript
const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const UserController = require('../controllers/userController');

// Use controller methods
router.get('/profile', auth, UserController.getProfile);
router.put('/profile', auth, UserController.updateProfile);

module.exports = router;
```

---

## 4️⃣ REQUEST HANDLING

### Accessing Request Data

```javascript
router.post('/users', async (req, res) => {
  // 1. URL Parameters
  const userId = req.params.id;  // /users/:id
  
  // 2. Query Parameters
  const page = req.query.page;   // /users?page=1
  const limit = req.query.limit; // /users?limit=10
  
  // 3. Request Body
  const { email, name } = req.body;  // POST/PUT data
  
  // 4. Headers
  const token = req.header('Authorization');
  const contentType = req.header('Content-Type');
  
  // 5. Cookies (requires cookie-parser)
  const sessionId = req.cookies.sessionId;
  
  // 6. Files (requires multer)
  const file = req.file;
  const files = req.files;
  
  // 7. Custom data (from middleware)
  const user = req.user;  // Added by auth middleware
});
```

### Request Validation

```javascript
router.put('/profile', auth, async (req, res) => {
  try {
    const { full_name, phone, address } = req.body;
    
    // Validation array
    const errors = [];
    
    // Validate full_name
    if (full_name !== undefined) {
      if (typeof full_name !== 'string' || full_name.trim().length === 0) {
        errors.push('Full name cannot be empty');
      } else if (full_name.length > 255) {
        errors.push('Full name is too long (max 255 characters)');
      }
    }
    
    // Validate phone
    if (phone !== undefined && phone !== null && phone !== '') {
      if (typeof phone !== 'string') {
        errors.push('Phone must be a string');
      } else if (!/^[\d\s\-\+\(\)]+$/.test(phone)) {
        errors.push('Phone number contains invalid characters');
      }
    }
    
    // Check for errors
    if (errors.length > 0) {
      return res.status(400).json({ 
        error: 'Validation failed',
        details: errors
      });
    }
    
    // Process valid data
    const updatedProfile = await User.updateProfile(req.user.id, {
      full_name: full_name?.trim(),
      phone: phone?.trim(),
      address: address?.trim()
    });
    
    res.json({
      message: 'Profile updated successfully',
      profile: updatedProfile
    });
    
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
```

### Query Parameters Handling

```javascript
router.get('/users', async (req, res) => {
  try {
    // Extract query parameters with defaults
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const role = req.query.role;
    const search = req.query.search;
    
    // Build filter object
    const filters = {};
    if (role) filters.role = role;
    if (search) filters.search = search;
    
    // Calculate offset for pagination
    const offset = (page - 1) * limit;
    
    // Fetch data
    const users = await User.findAll({
      where: filters,
      limit,
      offset
    });
    
    const total = await User.count({ where: filters });
    
    res.json({
      message: 'Users retrieved successfully',
      data: users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
    
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});
```

---

## 5️⃣ RESPONSE SENDING

### Standard Response Formats

```javascript
// Success Response (200 OK)
res.json({
  message: 'Operation successful',
  data: result
});

// Created Response (201 Created)
res.status(201).json({
  message: 'Resource created',
  data: newResource
});

// No Content (204 No Content)
res.status(204).send();

// Bad Request (400)
res.status(400).json({
  error: 'Invalid input',
  details: ['Email is required', 'Password too short']
});

// Unauthorized (401)
res.status(401).json({
  error: 'Authentication required'
});

// Forbidden (403)
res.status(403).json({
  error: 'Access denied'
});

// Not Found (404)
res.status(404).json({
  error: 'Resource not found'
});

// Internal Server Error (500)
res.status(500).json({
  error: 'Internal server error'
});
```

### Response Structure Best Practices

```javascript
// ✅ Good - Consistent structure
res.json({
  message: 'Users retrieved successfully',
  data: users,
  pagination: {
    page: 1,
    limit: 10,
    total: 100
  }
});

// ✅ Good - Error with details
res.status(400).json({
  error: 'Validation failed',
  details: [
    'Email is required',
    'Password must be at least 8 characters'
  ]
});

// ❌ Bad - Inconsistent structure
res.json(users);  // No message or metadata

// ❌ Bad - Exposing sensitive info
res.status(500).json({
  error: error.stack  // Don't expose stack traces
});
```

### HTTP Status Codes

```javascript
// 2xx Success
200 - OK                    // Successful GET, PUT, PATCH
201 - Created               // Successful POST
204 - No Content            // Successful DELETE

// 4xx Client Errors
400 - Bad Request           // Invalid input
401 - Unauthorized          // Not authenticated
403 - Forbidden             // Not authorized
404 - Not Found             // Resource doesn't exist
409 - Conflict              // Duplicate resource
422 - Unprocessable Entity  // Validation failed

// 5xx Server Errors
500 - Internal Server Error // Server error
503 - Service Unavailable   // Server down
```

---

## 6️⃣ ERROR HANDLING

### Try-Catch Pattern

```javascript
router.get('/users/:id', async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    
    // Validation
    if (isNaN(userId)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }
    
    // Business logic
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({
      message: 'User retrieved successfully',
      user
    });
    
  } catch (error) {
    console.error('Error fetching user:', error);
    
    // Handle specific errors
    if (error.name === 'SequelizeConnectionError') {
      return res.status(503).json({ 
        error: 'Database connection failed' 
      });
    }
    
    // Generic error
    res.status(500).json({ 
      error: 'Failed to fetch user' 
    });
  }
});
```

### Global Error Handler Middleware

**File**: `middleware/errorHandler.js`

```javascript
const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);
  
  // Sequelize validation error
  if (err.name === 'SequelizeValidationError') {
    return res.status(400).json({
      error: 'Validation failed',
      details: err.errors.map(e => e.message)
    });
  }
  
  // Sequelize unique constraint error
  if (err.name === 'SequelizeUniqueConstraintError') {
    return res.status(409).json({
      error: 'Resource already exists',
      details: err.errors.map(e => e.message)
    });
  }
  
  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      error: 'Invalid token'
    });
  }
  
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      error: 'Token expired'
    });
  }
  
  // Default error
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error'
  });
};

module.exports = errorHandler;
```

**File**: `server.js`

```javascript
const errorHandler = require('./middleware/errorHandler');

// ... routes ...

// Error handler (must be last)
app.use(errorHandler);
```

### Custom Error Classes

```javascript
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(message, 404);
  }
}

class ValidationError extends AppError {
  constructor(message = 'Validation failed', details = []) {
    super(message, 400);
    this.details = details;
  }
}

// Usage
router.get('/users/:id', async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      throw new NotFoundError('User not found');
    }
    
    res.json({ user });
  } catch (error) {
    next(error);  // Pass to error handler
  }
});
```

---

## 7️⃣ MIDDLEWARE

### Authentication Middleware

**File**: `middleware/auth.js`

```javascript
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    // Extract token from header
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Fetch user
    const user = await User.findById(decoded.id);

    if (!user || !user.is_active) {
      return res.status(401).json({ error: 'Invalid authentication' });
    }

    // Attach user to request
    req.user = user;
    req.token = token;
    
    // Continue to next middleware/route
    next();
    
  } catch (error) {
    res.status(401).json({ error: 'Invalid authentication' });
  }
};

module.exports = { auth };
```

### Authorization Middleware

```javascript
const authorize = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    next();
  };
};

// Usage
router.delete('/users/:id', auth, authorize(['admin']), async (req, res) => {
  // Only admins can access
});
```

### Validation Middleware

```javascript
const validateUser = (req, res, next) => {
  const { email, password, full_name } = req.body;
  const errors = [];
  
  if (!email || !email.includes('@')) {
    errors.push('Valid email is required');
  }
  
  if (!password || password.length < 8) {
    errors.push('Password must be at least 8 characters');
  }
  
  if (!full_name || full_name.trim().length === 0) {
    errors.push('Full name is required');
  }
  
  if (errors.length > 0) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors
    });
  }
  
  next();
};

// Usage
router.post('/signup', validateUser, async (req, res) => {
  // Validation passed
});
```

### Logging Middleware

```javascript
const logger = (req, res, next) => {
  const start = Date.now();
  
  // Log request
  console.log(`${req.method} ${req.url}`);
  
  // Log response when finished
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.url} ${res.statusCode} - ${duration}ms`);
  });
  
  next();
};

// Usage
app.use(logger);
```

---

## 8️⃣ BEST PRACTICES

### 1. Use Async/Await

```javascript
// ✅ Good
router.get('/users', async (req, res) => {
  try {
    const users = await User.findAll();
    res.json({ users });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// ❌ Bad - Callback hell
router.get('/users', (req, res) => {
  User.findAll((err, users) => {
    if (err) {
      res.status(500).json({ error: 'Failed' });
    } else {
      res.json({ users });
    }
  });
});
```

### 2. Validate Input

```javascript
// ✅ Good - Validate before processing
router.post('/users', async (req, res) => {
  const { email } = req.body;
  
  if (!email || !email.includes('@')) {
    return res.status(400).json({ error: 'Valid email required' });
  }
  
  // Process...
});

// ❌ Bad - No validation
router.post('/users', async (req, res) => {
  const user = await User.create(req.body);  // Dangerous!
});
```

### 3. Use HTTP Status Codes Correctly

```javascript
// ✅ Good
res.status(201).json({ message: 'Created' });  // POST success
res.status(404).json({ error: 'Not found' });  // Resource missing
res.status(401).json({ error: 'Unauthorized' }); // Not authenticated

// ❌ Bad
res.json({ error: 'Not found' });  // Missing status code
res.status(200).json({ error: 'Failed' });  // Wrong status
```

### 4. Don't Expose Sensitive Data

```javascript
// ✅ Good - Exclude password
const user = await User.findById(id, {
  attributes: { exclude: ['password'] }
});

// ❌ Bad - Exposing password
const user = await User.findById(id);
res.json({ user });  // Includes password!
```

### 5. Use Environment Variables

```javascript
// ✅ Good
const secret = process.env.JWT_SECRET;

// ❌ Bad
const secret = 'hardcoded_secret';  // Never do this!
```

### 6. Handle Errors Properly

```javascript
// ✅ Good
try {
  const user = await User.findById(id);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  res.json({ user });
} catch (error) {
  console.error('Error:', error);
  res.status(500).json({ error: 'Internal server error' });
}

// ❌ Bad
const user = await User.findById(id);  // No error handling!
res.json({ user });
```

---

## 🎯 COMPLETE EXAMPLE

**File**: `routes/users.js`

```javascript
const express = require('express');
const router = express.Router();
const { auth, authorize } = require('../middleware/auth');
const User = require('../models/User');

// GET /api/users - List users (admin only)
router.get('/', auth, authorize(['admin']), async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    
    const users = await User.findAll({ limit, offset });
    const total = await User.count();
    
    res.json({
      message: 'Users retrieved successfully',
      data: users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// GET /api/users/profile - Get own profile
router.get('/profile', auth, async (req, res) => {
  try {
    const profile = await User.getProfile(req.user.id);
    
    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }
    
    res.json({
      message: 'Profile retrieved successfully',
      profile
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// PUT /api/users/profile - Update own profile
router.put('/profile', auth, async (req, res) => {
  try {
    const { full_name, phone } = req.body;
    
    // Validation
    const errors = [];
    if (full_name && full_name.length > 255) {
      errors.push('Name too long');
    }
    if (phone && !/^[\d\s\-\+\(\)]+$/.test(phone)) {
      errors.push('Invalid phone number');
    }
    
    if (errors.length > 0) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors
      });
    }
    
    // Update
    const updatedProfile = await User.updateProfile(req.user.id, {
      full_name,
      phone
    });
    
    res.json({
      message: 'Profile updated successfully',
      profile: updatedProfile
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

module.exports = router;
```

---

## 📚 YOUR PROJECT STRUCTURE

Your project follows these patterns:

```
backend/
├── server.js                    ← Entry point with route registration
├── routes/
│   ├── auth.js                 ← Authentication (signup/signin)
│   ├── users.js                ← User profile management
│   ├── products.js             ← Product CRUD
│   ├── admin.js                ← Admin operations
│   ├── messages.js             ← Messaging system
│   ├── notifications.js        ← Notifications
│   └── swaps.js                ← Product swaps
├── middleware/
│   └── auth.js                 ← Authentication & authorization
├── models/
│   └── *.sequelize.wrapper.js  ← Business logic layer
├── services/
│   └── notificationService.js  ← Notification service
└── database/
    └── models/                 ← Sequelize models
```

All your routes follow the best practices outlined in this guide!
