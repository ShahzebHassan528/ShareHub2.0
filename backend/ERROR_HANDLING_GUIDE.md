# Centralized Error Handling Guide

## Overview

Enterprise-grade centralized error handling system that eliminates try-catch blocks and provides consistent error responses.

## Architecture

```
Error Occurs → catchAsync → Service throws AppError → Global Error Handler → Client Response
```

## Components

### 1. AppError Class (`utils/AppError.js`)

Custom error class for operational errors.

```javascript
const AppError = require('../utils/AppError');

// Create error
throw new AppError('User not found', 404);
throw new AppError('Invalid credentials', 401);
throw new AppError('Validation failed', 400);
```

**Properties:**
- `message` - Error message
- `statusCode` - HTTP status code (400, 401, 403, 404, 500, etc.)
- `status` - 'fail' (4xx) or 'error' (5xx)
- `isOperational` - true (marks as expected error)

### 2. catchAsync Wrapper (`utils/catchAsync.js`)

Eliminates try-catch blocks in routes.

```javascript
const catchAsync = require('../utils/catchAsync');

// Before (with try-catch)
router.get('/users/:id', async (req, res) => {
  try {
    const user = await UserService.getUserById(req.params.id);
    res.json({ user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// After (with catchAsync)
router.get('/users/:id', catchAsync(async (req, res) => {
  const user = await UserService.getUserById(req.params.id);
  res.json({ user });
}));
```

### 3. Global Error Handler (`middleware/errorHandler.js`)

Catches all errors and formats responses.

**Handles:**
- Sequelize validation errors
- Unique constraint errors
- Foreign key errors
- Database connection errors
- JWT errors (invalid, expired)
- Cast errors
- Custom AppError instances

**Response Format:**

Development:
```json
{
  "success": false,
  "status": "fail",
  "message": "User not found",
  "error": { /* full error object */ },
  "stack": "Error: User not found\n    at ..."
}
```

Production:
```json
{
  "success": false,
  "status": "fail",
  "message": "User not found"
}
```

## Usage Examples

### Example 1: Simple Route

```javascript
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const { UserService } = require('../services');

// Get user profile
router.get('/profile', auth, catchAsync(async (req, res) => {
  const profile = await UserService.getProfile(req.user.id);
  
  res.json({
    success: true,
    profile
  });
}));
```

### Example 2: Route with Validation

```javascript
router.post('/signup', catchAsync(async (req, res) => {
  const { email, password } = req.body;
  
  // Validate input
  if (!email || !password) {
    throw new AppError('Email and password are required', 400);
  }
  
  const result = await AuthService.register(req.body);
  
  res.status(201).json({
    success: true,
    ...result
  });
}));
```

### Example 3: Service with AppError

```javascript
const AppError = require('../utils/AppError');

class UserService {
  static async getUserById(userId) {
    const user = await User.findById(userId);
    
    if (!user) {
      throw new AppError('User not found', 404);
    }
    
    return user;
  }
  
  static async suspendUser(userId, adminId, reason) {
    const user = await User.findById(userId);
    
    if (!user) {
      throw new AppError('User not found', 404);
    }
    
    if (user.role === 'admin') {
      throw new AppError('Cannot suspend admin users', 403);
    }
    
    if (user.is_suspended) {
      throw new AppError('User is already suspended', 400);
    }
    
    // Suspend user...
  }
}
```

## Error Types Handled Automatically

### 1. Sequelize Validation Errors

```javascript
// Sequelize throws validation error
// Global handler catches and formats:
{
  "success": false,
  "status": "fail",
  "message": "Validation failed: Email must be valid. Password is required."
}
```

### 2. Unique Constraint Errors

```javascript
// Duplicate email
{
  "success": false,
  "status": "fail",
  "message": "Duplicate value for email: 'user@example.com'. Please use another value."
}
```

### 3. Foreign Key Errors

```javascript
// Invalid reference
{
  "success": false,
  "status": "fail",
  "message": "Invalid reference. The referenced record does not exist."
}
```

### 4. Database Connection Errors

```javascript
// Connection failed
{
  "success": false,
  "status": "error",
  "message": "Database connection failed. Please try again later."
}
```

### 5. JWT Errors

```javascript
// Invalid token
{
  "success": false,
  "status": "fail",
  "message": "Invalid token. Please log in again."
}

// Expired token
{
  "success": false,
  "status": "fail",
  "message": "Your token has expired. Please log in again."
}
```

## Migration Guide

### Step 1: Update Routes

**Before:**
```javascript
router.post('/endpoint', async (req, res) => {
  try {
    const result = await Service.method(data);
    res.json({ result });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
});
```

**After:**
```javascript
router.post('/endpoint', catchAsync(async (req, res) => {
  const result = await Service.method(data);
  res.json({ success: true, result });
}));
```

### Step 2: Update Services

**Before:**
```javascript
static async getUser(userId) {
  const user = await User.findById(userId);
  if (!user) {
    throw new Error('User not found');
  }
  return user;
}
```

**After:**
```javascript
static async getUser(userId) {
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError('User not found', 404);
  }
  return user;
}
```

### Step 3: Update Validation

**Before:**
```javascript
if (!email) {
  return res.status(400).json({ error: 'Email required' });
}
```

**After:**
```javascript
if (!email) {
  throw new AppError('Email is required', 400);
}
```

## Status Codes Reference

| Code | Meaning | When to Use |
|------|---------|-------------|
| 400 | Bad Request | Validation errors, invalid input |
| 401 | Unauthorized | Authentication required, invalid credentials |
| 403 | Forbidden | User authenticated but not authorized |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Duplicate resource, constraint violation |
| 500 | Internal Server Error | Unexpected errors |
| 503 | Service Unavailable | Database connection failed |

## Common Error Messages

```javascript
// Authentication
throw new AppError('Invalid credentials', 401);
throw new AppError('Please log in to access this resource', 401);
throw new AppError('You do not have permission to perform this action', 403);

// Validation
throw new AppError('Email and password are required', 400);
throw new AppError('Invalid email format', 400);
throw new AppError('Password must be at least 8 characters', 400);

// Not Found
throw new AppError('User not found', 404);
throw new AppError('Product not found', 404);
throw new AppError('Order not found', 404);

// Conflict
throw new AppError('Email already registered', 409);
throw new AppError('Product already exists', 409);

// Business Logic
throw new AppError('Cannot suspend admin users', 403);
throw new AppError('Product is not available', 400);
throw new AppError('Insufficient stock', 400);
```

## Validation Errors with Details

```javascript
// In service
const errors = [];
if (!data.title) errors.push('Title is required');
if (!data.price) errors.push('Price is required');

if (errors.length > 0) {
  const error = new AppError('Validation failed', 400);
  error.details = errors;
  throw error;
}

// Response
{
  "success": false,
  "status": "fail",
  "message": "Validation failed",
  "details": [
    "Title is required",
    "Price is required"
  ]
}
```

## Testing Error Handling

### Test 1: Not Found Error

```bash
curl http://localhost:5000/api/users/99999/public
```

Expected:
```json
{
  "success": false,
  "status": "fail",
  "message": "User not found"
}
```

### Test 2: Validation Error

```bash
curl -X POST http://localhost:5000/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'
```

Expected:
```json
{
  "success": false,
  "status": "fail",
  "message": "Email and password are required"
}
```

### Test 3: Invalid Token

```bash
curl http://localhost:5000/api/users/profile \
  -H "Authorization: Bearer invalid_token"
```

Expected:
```json
{
  "success": false,
  "status": "fail",
  "message": "Invalid token. Please log in again."
}
```

### Test 4: 404 Route

```bash
curl http://localhost:5000/api/nonexistent
```

Expected:
```json
{
  "success": false,
  "status": "fail",
  "message": "Cannot find /api/nonexistent on this server"
}
```

## Best Practices

### DO:

✅ Use AppError for operational errors
✅ Wrap all async routes with catchAsync
✅ Throw errors in services, not return them
✅ Use appropriate status codes
✅ Provide clear error messages
✅ Include validation details when needed

### DON'T:

❌ Use try-catch in routes (use catchAsync)
❌ Return error objects (throw them)
❌ Use generic error messages
❌ Expose sensitive information in errors
❌ Use wrong status codes
❌ Catch errors in services (let them bubble up)

## Backward Compatibility

The error handling system is backward compatible:

- Existing routes continue to work
- Old error responses still valid
- Gradual migration possible
- No breaking changes

## Migration Checklist

- [x] Create AppError class
- [x] Create catchAsync wrapper
- [x] Create global error handler
- [x] Register error handler in server.js
- [x] Update AuthService to use AppError
- [x] Update UserService to use AppError
- [x] Update ProductService to use AppError
- [ ] Update OrderService to use AppError
- [ ] Update DonationService to use AppError
- [ ] Update SwapService to use AppError
- [ ] Migrate auth routes to use catchAsync
- [ ] Migrate user routes to use catchAsync
- [ ] Migrate product routes to use catchAsync
- [ ] Migrate other routes to use catchAsync
- [ ] Test all error scenarios
- [ ] Update frontend error handling

## Troubleshooting

### Issue: Errors not caught

**Solution:** Ensure catchAsync wraps the route handler:
```javascript
router.get('/endpoint', catchAsync(async (req, res) => {
  // Your code
}));
```

### Issue: Wrong error format

**Solution:** Throw AppError, not generic Error:
```javascript
throw new AppError('Message', 404); // ✅
throw new Error('Message'); // ❌
```

### Issue: Stack trace in production

**Solution:** Set NODE_ENV=production in .env file

### Issue: 404 handler not working

**Solution:** Ensure notFoundHandler is BEFORE errorHandler in server.js
