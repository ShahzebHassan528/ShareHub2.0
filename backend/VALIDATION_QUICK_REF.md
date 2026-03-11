# Validation Quick Reference

## Import

```javascript
const validate = require('../middleware/validate');
const { auth, product, order, swap, donation, user } = require('../validators');
```

## Usage Pattern

```javascript
router.method(
  '/path',
  validate(validators.schemaName),
  catchAsync(async (req, res) => {
    // Validation passed - data is sanitized
  })
);
```

## Available Schemas

### Auth
```javascript
validate(auth.signupSchema)       // POST /signup
validate(auth.signinSchema)       // POST /signin
validate(auth.refreshTokenSchema) // POST /refresh
```

### Product
```javascript
validate(product.createProductSchema)      // POST /products
validate(product.updateProductSchema)      // PUT /products/:id
validate(product.getProductByIdSchema)     // GET /products/:id
validate(product.getNearbyProductsSchema)  // GET /products/nearby
validate(product.getProductsSchema)        // GET /products
```

### Order
```javascript
validate(order.createOrderSchema)          // POST /orders
validate(order.updateOrderStatusSchema)    // PUT /orders/:id/status
validate(order.updatePaymentStatusSchema)  // PUT /orders/:id/payment
validate(order.getOrderByIdSchema)         // GET /orders/:id
```

### Swap
```javascript
validate(swap.createSwapSchema)    // POST /swaps
validate(swap.swapActionSchema)    // PUT /swaps/:id/accept|reject|complete|cancel
validate(swap.getSwapByIdSchema)   // GET /swaps/:id
```

### Donation
```javascript
validate(donation.createDonationSchema)   // POST /donations
validate(donation.donationActionSchema)   // PUT /donations/:id/accept|reject
validate(donation.getDonationByIdSchema)  // GET /donations/:id
```

### User
```javascript
validate(user.updateProfileSchema)  // PUT /users/profile
validate(user.getUserByIdSchema)    // GET /users/:id
validate(user.suspendUserSchema)    // PUT /admin/users/:id/suspend
```

## Common Validations

### Email
```javascript
Joi.string().email().required()
```

### Password
```javascript
Joi.string()
  .min(8)
  .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
  .required()
```

### ID
```javascript
Joi.number().integer().positive().required()
```

### Price
```javascript
Joi.number().positive().precision(2).required()
```

### Enum
```javascript
Joi.string().valid('value1', 'value2', 'value3')
```

### Coordinates
```javascript
lat: Joi.number().min(-90).max(90).required()
lng: Joi.number().min(-180).max(180).required()
```

### Optional Field
```javascript
Joi.string().optional().allow('', null)
```

## Error Response

```json
{
  "success": false,
  "status": "fail",
  "message": "Validation failed",
  "details": [
    "Error message 1",
    "Error message 2"
  ]
}
```

## Examples

### Example 1: Auth Route
```javascript
router.post(
  '/signup',
  validate(auth.signupSchema),
  catchAsync(async (req, res) => {
    const result = await AuthService.register(req.body);
    res.status(201).json(result);
  })
);
```

### Example 2: Product Route
```javascript
router.post(
  '/products',
  auth,
  validate(product.createProductSchema),
  catchAsync(async (req, res) => {
    const productId = await ProductService.createProduct(req.body);
    res.status(201).json({ productId });
  })
);
```

### Example 3: Params Validation
```javascript
router.get(
  '/products/:id',
  validate(product.getProductByIdSchema),
  catchAsync(async (req, res) => {
    const product = await ProductService.getProductById(req.params.id);
    res.json({ product });
  })
);
```

### Example 4: Query Validation
```javascript
router.get(
  '/products/nearby',
  validate(product.getNearbyProductsSchema),
  catchAsync(async (req, res) => {
    const products = await ProductService.findNearbyProducts(
      req.query.lat,
      req.query.lng,
      req.query.radius
    );
    res.json({ products });
  })
);
```

## Testing

```bash
# Invalid email
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"invalid","password":"Test123","role":"buyer"}'

# Weak password
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"weak","role":"buyer"}'

# Invalid price
curl -X POST http://localhost:5000/api/products \
  -H "Authorization: Bearer <token>" \
  -d '{"title":"Product","price":-10}'

# Invalid coordinates
curl http://localhost:5000/api/products/nearby?lat=100&lng=200
```

## Checklist

- [ ] Import validate middleware
- [ ] Import validators
- [ ] Add validate() before handler
- [ ] Test with invalid data
- [ ] Verify error response
- [ ] Test with valid data
- [ ] Check data sanitization
