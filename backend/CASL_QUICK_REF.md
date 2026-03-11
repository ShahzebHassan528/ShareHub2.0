# CASL Authorization - Quick Reference

## Installation
```bash
npm install @casl/ability
```

## Import
```javascript
const { authenticate } = require('../middleware/auth');
const { checkAbility, requireAdmin, authorize } = require('../middleware/checkAbility');
const AppError = require('../utils/AppError');
```

## Usage Patterns

### 1. Basic Permission Check (No Ownership)
```javascript
router.post('/products',
  authenticate,
  checkAbility('create', 'Product'),
  async (req, res, next) => {
    // Handler code
  }
);
```

### 2. Ownership-Based Check
```javascript
router.put('/products/:id',
  authenticate,
  checkAbility('update', 'Product', async (req) => {
    const product = await Product.findById(req.params.id);
    if (!product) throw new AppError('Product not found', 404);
    return product;
  }),
  async (req, res, next) => {
    // Handler code
  }
);
```

### 3. Admin-Only Route
```javascript
router.get('/admin/users',
  authenticate,
  requireAdmin(),
  async (req, res) => {
    // Handler code
  }
);
```

### 4. In-Handler Check
```javascript
router.get('/data', authenticate, async (req, res, next) => {
  try {
    authorize(req, 'read', 'Data', { user_id: req.user.id });
    // Continue with logic
  } catch (error) {
    next(error);
  }
});
```

### 5. Multiple Role Check
```javascript
const { requireRole } = require('../middleware/checkAbility');

router.get('/seller-or-admin',
  authenticate,
  requireRole(['seller', 'admin']),
  async (req, res) => {
    // Handler code
  }
);
```

## Permission Matrix

| Action | Admin | Seller | Buyer | NGO | Anonymous |
|--------|-------|--------|-------|-----|-----------|
| **Product** |
| Create | ✅ | ✅ | ❌ | ❌ | ❌ |
| Read | ✅ | ✅ | ✅ | ✅ | ✅ |
| Update (own) | ✅ | ✅ | ❌ | ❌ | ❌ |
| Delete (own) | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Order** |
| Create | ✅ | ❌ | ✅ | ❌ | ❌ |
| Read (own) | ✅ | ✅ | ✅ | ❌ | ❌ |
| Update (own) | ✅ | ✅ | ✅ | ❌ | ❌ |
| **Donation** |
| Create | ✅ | ❌ | ✅ | ❌ | ❌ |
| Read (own) | ✅ | ❌ | ✅ | ✅ | ❌ |
| Update (own) | ✅ | ❌ | ❌ | ✅ | ❌ |
| **Swap** |
| Create | ✅ | ❌ | ✅ | ❌ | ❌ |
| Read (own) | ✅ | ❌ | ✅ | ❌ | ❌ |
| Update (owner) | ✅ | ❌ | ✅ | ❌ | ❌ |
| Cancel (requester) | ✅ | ❌ | ✅ | ❌ | ❌ |

## Common Actions

- `create` - Create new resource
- `read` - View resource
- `update` - Modify resource
- `delete` - Remove resource
- `manage` - All actions (admin only)
- `cancel` - Cancel operation (swaps)
- `reply` - Reply to resource (reviews)

## Error Codes

- **401** - Authentication required
- **403** - Permission denied
- **404** - Resource not found

## Testing

```bash
# Test CASL functionality
node test-casl-simple.js

# Test integration
node test-casl-integration.js
```

## Files

- `permissions/ability.js` - Permission definitions
- `middleware/checkAbility.js` - Authorization middleware
- `middleware/auth.js` - Authentication (updated)
- `routes/*.js` - Protected routes

## Tips

1. Always use `authenticate` before `checkAbility`
2. Use `requireAdmin()` for admin-only routes
3. Pass resource getter for ownership checks
4. Use `authorize()` for in-handler checks
5. Always use `next(error)` for error handling
