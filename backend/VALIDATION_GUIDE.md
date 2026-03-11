# Request Validation Guide

## Overview

Enterprise-grade request validation using Joi that validates data BEFORE controller execution.

## Architecture

```
Request → Validation Middleware → Route Handler → Service → Response
          (validate schema)        (if valid)
                ↓
          (if invalid)
                ↓
          Error Response
```

## Components

### 1. Joi Schemas (`validators/*.validator.js`)

Define validation rules for each module.

### 2. Validate Middleware (`middleware/validate.js`)

Validates request data against schemas.

### 3. Integration

Add `validate(schema)` before route handlers.

## Validators

### Auth Validator (`validators/auth.validator.js`)

**Schemas:**
- `signupSchema` - User registration
- `signinSchema` - User login
- `refreshTokenSchema` - Token refresh

**Validations:**
- Email format
- Password strength (min 8 chars, uppercase, lowercase, number)
- Role enum (buyer, seller, ngo)
- Role-specific required fields
- Phone number format

### Product Validator (`validators/product.validator.js`)

**Schemas:**
- `createProductSchema` - Create product
- `updateProductSchema` - Update product
- `getProductByIdSchema` - Get by ID
- `getNearbyProductsSchema` - Location search
- `getProductsSchema` - List with filters

**Validations:**
- Title (3-255 chars)
- Price (positive number)
- Condition enum (new, like_new, good, fair, poor)
- Coordinates (-90 to 90, -180 to 180)
- Radius (0-100 km)

### Order Validator (`validators/order.validator.js`)

**Schemas:**
- `createOrderSchema` - Create order
- `updateOrderStatusSchema` - Update status
- `updatePaymentStatusSchema` - Update payment
- `getOrderByIdSchema` - Get by ID

**Validations:**
- Items array (min 1 item)
- Product ID (positive integer)
- Quantity (positive integer)
- Order status enum
- Payment status enum

### Swap Validator (`validators/swap.validator.js`)

**Schemas:**
- `createSwapSchema` - Create swap request
- `swapActionSchema` - Accept/reject/complete/cancel
- `getSwapByIdSchema` - Get by ID

**Validations:**
- Product IDs (positive integers)
- Swap ID (positive integer)
- Message (max 500 chars)

### Donation Validator (`validators/donation.validator.js`)

**Schemas:**
- `createDonationSchema` - Create donation
- `donationActionSchema` - Accept/reject
- `getDonationByIdSchema` - Get by ID

**Validations:**
- NGO ID (required, positive integer)
- Product ID or Amount (at least one required)
- Amount (positive number)
- Message (max 500 chars)

### User Validator (`validators/user.validator.js`)

**Schemas:**
- `updateProfileSchema` - Update profile
- `getUserByIdSchema` - Get by ID
- `suspendUserSchema` - Suspend user (admin)

**Validations:**
- Full name (2-255 chars)
- Phone format
- Address (max 1000 chars)
- Profile image URL
- Suspension reason (10-500 chars)

## Usage

### Step 1: Import

```javascript
const validate = require('../middleware/validate');
const { auth: authValidators } = require('../validators');
```

### Step 2: Add to Route

```javascript
router.post(
  '/signup',
  validate(authValidators.signupSchema),
  catchAsync(async (req, res) => {
    // Validation passed, data is sanitized
    const result = await AuthService.register(req.body);
    res.status(201).json(result);
  })
);
```

### Step 3: Validation Runs Automatically

- If valid: proceeds to route handler
- If invalid: returns 400 error with details

## Validation Response Format

### Success

Request proceeds to route handler with sanitized data.

### Failure

```json
{
  "success": false,
  "status": "fail",
  "message": "Validation failed",
  "details": [
    "Email is required",
    "Password must be at least 8 characters long",
    "Password must contain at least one uppercase letter, one lowercase letter, and one number"
  ]
}
```

## Examples

### Example 1: Auth Signup

**Request:**
```json
POST /api/auth/signup
{
  "email": "invalid-email",
  "password": "weak",
  "role": "invalid"
}
```

**Response:**
```json
{
  "success": false,
  "status": "fail",
  "message": "Validation failed",
  "details": [
    "Please provide a valid email address",
    "Password must be at least 8 characters long",
    "Password must contain at least one uppercase letter, one lowercase letter, and one number",
    "Role must be one of: buyer, seller, ngo"
  ]
}
```

### Example 2: Product Creation

**Request:**
```json
POST /api/products
{
  "title": "AB",
  "price": -10,
  "condition": "invalid"
}
```

**Response:**
```json
{
  "success": false,
  "status": "fail",
  "message": "Validation failed",
  "details": [
    "Title must be at least 3 characters long",
    "Price must be greater than 0",
    "Condition must be one of: new, like_new, good, fair, poor"
  ]
}
```

### Example 3: Location Search

**Request:**
```json
GET /api/products/nearby?lat=invalid&lng=200
```

**Response:**
```json
{
  "success": false,
  "status": "fail",
  "message": "Validation failed",
  "details": [
    "Latitude must be a number",
    "Longitude must be between -180 and 180"
  ]
}
```

## Validation Rules

### Email
```javascript
Joi.string().email().required()
```
- Must be valid email format
- Required

### Password
```javascript
Joi.string()
  .min(8)
  .max(128)
  .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
  .required()
```
- Minimum 8 characters
- Maximum 128 characters
- Must contain uppercase, lowercase, and number
- Required

### Role
```javascript
Joi.string()
  .valid('buyer', 'seller', 'ngo')
  .required()
```
- Must be one of: buyer, seller, ngo
- Required

### Price
```javascript
Joi.number()
  .positive()
  .precision(2)
  .required()
```
- Must be positive number
- Maximum 2 decimal places
- Required

### Coordinates
```javascript
// Latitude
Joi.number().min(-90).max(90).required()

// Longitude
Joi.number().min(-180).max(180).required()
```
- Latitude: -90 to 90
- Longitude: -180 to 180

### ID
```javascript
Joi.number()
  .integer()
  .positive()
  .required()
```
- Must be positive integer
- Required

### Enum Fields
```javascript
// Condition
Joi.string().valid('new', 'like_new', 'good', 'fair', 'poor')

// Order Status
Joi.string().valid('pending', 'processing', 'shipped', 'delivered', 'cancelled')

// Payment Status
Joi.string().valid('pending', 'paid', 'failed', 'refunded')
```

## Conditional Validation

### Role-Based Fields

```javascript
business_name: Joi.when('role', {
  is: 'seller',
  then: Joi.string().required(),
  otherwise: Joi.optional()
})
```

If role is 'seller', business_name is required. Otherwise, it's optional.

### Custom Validation

```javascript
.custom((value, helpers) => {
  if (!value.product_id && !value.amount) {
    return helpers.error('any.custom', {
      message: 'Either product_id or amount must be provided'
    });
  }
  return value;
})
```

## Migration Guide

### Before (No Validation)

```javascript
router.post('/products', auth, catchAsync(async (req, res) => {
  // No validation - accepts any data
  const productId = await ProductService.createProduct(req.body);
  res.status(201).json({ productId });
}));
```

### After (With Validation)

```javascript
router.post(
  '/products',
  auth,
  validate(productValidators.createProductSchema),
  catchAsync(async (req, res) => {
    // Validation passed - data is sanitized
    const productId = await ProductService.createProduct(req.body);
    res.status(201).json({ productId });
  })
);
```

## Benefits

✅ **Early Rejection** - Invalid requests rejected before reaching controller
✅ **Consistent Errors** - Standardized error format
✅ **Data Sanitization** - Unknown fields stripped
✅ **Type Coercion** - Strings converted to numbers where needed
✅ **Clear Messages** - Descriptive error messages
✅ **Security** - Prevents injection attacks
✅ **Documentation** - Schemas serve as API documentation

## Best Practices

### DO:

✅ Validate all user input
✅ Use specific error messages
✅ Validate params, query, and body
✅ Use appropriate data types
✅ Set reasonable limits (min/max)
✅ Use enums for fixed values

### DON'T:

❌ Skip validation for "trusted" input
❌ Use generic error messages
❌ Allow unlimited string lengths
❌ Accept any value for enums
❌ Validate in services (do it in middleware)

## Testing Validation

### Test 1: Invalid Email

```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"invalid","password":"Test123","role":"buyer"}'
```

Expected: 400 error with email validation message

### Test 2: Weak Password

```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"weak","role":"buyer"}'
```

Expected: 400 error with password strength message

### Test 3: Invalid Price

```bash
curl -X POST http://localhost:5000/api/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"title":"Product","price":-10}'
```

Expected: 400 error with price validation message

### Test 4: Invalid Coordinates

```bash
curl http://localhost:5000/api/products/nearby?lat=100&lng=200
```

Expected: 400 error with coordinate validation messages

## Troubleshooting

### Issue: Validation not running

**Solution:** Ensure validate middleware is before route handler:
```javascript
router.post('/endpoint', validate(schema), catchAsync(handler));
```

### Issue: Wrong error format

**Solution:** Ensure errorHandler middleware is registered in server.js

### Issue: Valid data rejected

**Solution:** Check schema definition, ensure data types match

### Issue: Optional fields required

**Solution:** Use `.optional()` or `.allow(null, '')` in schema

## Migration Checklist

- [x] Install Joi package
- [x] Create validators folder
- [x] Create validation schemas
- [x] Create validate middleware
- [x] Create example routes
- [ ] Migrate auth routes
- [ ] Migrate product routes
- [ ] Migrate order routes
- [ ] Migrate swap routes
- [ ] Migrate donation routes
- [ ] Migrate user routes
- [ ] Test all validations
- [ ] Update API documentation
