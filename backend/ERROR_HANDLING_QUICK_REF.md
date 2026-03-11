# Error Handling Quick Reference

## Import

```javascript
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
```

## Route Pattern

```javascript
router.method('/path', catchAsync(async (req, res) => {
  // Your code - no try-catch needed
  const result = await Service.method();
  res.json({ success: true, result });
}));
```

## Throw Errors

```javascript
// Not found
throw new AppError('User not found', 404);

// Validation
throw new AppError('Email is required', 400);

// Authentication
throw new AppError('Invalid credentials', 401);

// Authorization
throw new AppError('Access denied', 403);

// Conflict
throw new AppError('Email already registered', 409);

// Server error
throw new AppError('Something went wrong', 500);
```

## Validation with Details

```javascript
const errors = [];
if (!data.email) errors.push('Email is required');
if (!data.password) errors.push('Password is required');

if (errors.length > 0) {
  const error = new AppError('Validation failed', 400);
  error.details = errors;
  throw error;
}
```

## Status Codes

| Code | Use Case |
|------|----------|
| 400 | Bad Request / Validation |
| 401 | Unauthorized / Login Required |
| 403 | Forbidden / No Permission |
| 404 | Not Found |
| 409 | Conflict / Duplicate |
| 500 | Server Error |
| 503 | Service Unavailable |

## Response Format

Development:
```json
{
  "success": false,
  "status": "fail",
  "message": "Error message",
  "error": { /* full error */ },
  "stack": "Error stack trace"
}
```

Production:
```json
{
  "success": false,
  "status": "fail",
  "message": "Error message"
}
```

## Auto-Handled Errors

- Sequelize validation errors
- Unique constraint errors
- Foreign key errors
- Database connection errors
- JWT errors (invalid/expired)
- Cast errors

## Migration Steps

1. Import catchAsync and AppError
2. Wrap route with catchAsync
3. Remove try-catch blocks
4. Throw AppError instead of Error
5. Let errors bubble up

## Before/After

### Before
```javascript
router.get('/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'Not found' });
    }
    res.json({ user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

### After
```javascript
router.get('/users/:id', catchAsync(async (req, res) => {
  const user = await UserService.getUserById(req.params.id);
  res.json({ success: true, user });
}));
```

## Common Patterns

### Pattern 1: Simple GET
```javascript
router.get('/resource/:id', catchAsync(async (req, res) => {
  const resource = await Service.getById(req.params.id);
  res.json({ success: true, resource });
}));
```

### Pattern 2: POST with Validation
```javascript
router.post('/resource', catchAsync(async (req, res) => {
  if (!req.body.field) {
    throw new AppError('Field is required', 400);
  }
  const resource = await Service.create(req.body);
  res.status(201).json({ success: true, resource });
}));
```

### Pattern 3: Protected Route
```javascript
router.put('/resource/:id', auth, catchAsync(async (req, res) => {
  const resource = await Service.update(req.params.id, req.body);
  res.json({ success: true, resource });
}));
```

### Pattern 4: Admin Only
```javascript
router.delete('/resource/:id', auth, authorize(['admin']), catchAsync(async (req, res) => {
  await Service.delete(req.params.id);
  res.json({ success: true, message: 'Deleted' });
}));
```

## Testing

```bash
# Test 404
curl http://localhost:5000/api/users/99999

# Test validation
curl -X POST http://localhost:5000/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'

# Test invalid token
curl http://localhost:5000/api/users/profile \
  -H "Authorization: Bearer invalid"

# Test 404 route
curl http://localhost:5000/api/nonexistent
```

## Checklist

- [ ] Import catchAsync and AppError
- [ ] Wrap routes with catchAsync
- [ ] Remove try-catch blocks
- [ ] Use AppError in services
- [ ] Test error responses
- [ ] Check status codes
- [ ] Verify error messages
- [ ] Test in development
- [ ] Test in production mode
