# Service Layer Migration Guide

## Overview

This guide helps you migrate existing routes to use the new Service Layer architecture without breaking functionality.

## Migration Strategy: Gradual & Safe

We follow a **zero-downtime** migration approach:

1. ✅ Create services (DONE)
2. ✅ Create refactored route examples (DONE)
3. ⏳ Test refactored routes
4. ⏳ Migrate one route at a time
5. ⏳ Remove old code after verification

## Step-by-Step Migration

### Step 1: Test Service Layer

```bash
# Run service layer tests
node test-service-layer.js
```

Expected output:
- ✅ AuthService tests passed
- ✅ UserService tests passed
- ✅ ProductService tests passed
- ✅ All other services working

### Step 2: Review Refactored Examples

Compare original vs refactored:

```bash
# Original
backend/routes/auth.js

# Refactored (example)
backend/routes/auth.refactored.js
```

Key differences:
- Business logic moved to services
- Routes only handle HTTP concerns
- Better error handling
- Cleaner code

### Step 3: Test Refactored Routes

#### Option A: Temporary Testing

1. Rename original route:
   ```bash
   mv routes/auth.js routes/auth.backup.js
   ```

2. Rename refactored route:
   ```bash
   mv routes/auth.refactored.js routes/auth.js
   ```

3. Test with Postman/Thunder Client:
   - POST /api/auth/signup
   - POST /api/auth/signin
   - Verify responses match original

4. If issues found, revert:
   ```bash
   mv routes/auth.js routes/auth.refactored.js
   mv routes/auth.backup.js routes/auth.js
   ```

#### Option B: Side-by-Side Testing

1. Create test route:
   ```javascript
   // routes/auth.test.js
   const express = require('express');
   const { AuthService } = require('../services');
   const router = express.Router();
   
   router.post('/test-signup', async (req, res) => {
     try {
       const result = await AuthService.register(req.body);
       res.status(201).json(result);
     } catch (error) {
       res.status(400).json({ error: error.message });
     }
   });
   
   module.exports = router;
   ```

2. Add to server.js:
   ```javascript
   const authTestRoutes = require('./routes/auth.test');
   app.use('/api/auth', authTestRoutes);
   ```

3. Test new endpoint:
   - POST /api/auth/test-signup
   - Compare with POST /api/auth/signup

### Step 4: Migrate Routes One by One

#### Priority Order (Recommended)

1. **auth.js** (authentication) - Most critical
2. **users.js** (user profiles) - Simple, good starting point
3. **products.js** (products) - Medium complexity
4. **orders.js** (orders) - Complex, has dependencies
5. **swaps.js** (swaps) - Complex, has transactions
6. **donations.js** (donations) - Medium complexity
7. **admin.js** (admin) - Can use multiple services

#### Migration Checklist Per Route

- [ ] Review original route logic
- [ ] Verify service has all needed methods
- [ ] Create refactored version
- [ ] Test all endpoints
- [ ] Check error handling
- [ ] Verify response format matches
- [ ] Test with frontend (if applicable)
- [ ] Backup original file
- [ ] Replace with refactored version
- [ ] Monitor for issues
- [ ] Remove backup after 1 week

### Step 5: Update Server.js (if needed)

No changes needed! Services are imported in routes, not in server.js.

## Migration Examples

### Example 1: Simple Route (GET)

#### Before:
```javascript
router.get('/profile', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const profile = await User.getProfile(userId);
    
    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }
    
    res.json({ message: 'Success', profile });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});
```

#### After:
```javascript
router.get('/profile', auth, async (req, res) => {
  try {
    const profile = await UserService.getProfile(req.user.id);
    res.json({ message: 'Success', profile });
  } catch (error) {
    console.error('Error:', error.message);
    
    if (error.message === 'Profile not found') {
      return res.status(404).json({ error: error.message });
    }
    
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});
```

### Example 2: Complex Route (POST with validation)

#### Before:
```javascript
router.post('/signup', async (req, res) => {
  try {
    const { email, password, full_name, role } = req.body;
    
    // Validation
    if (!['buyer', 'seller', 'ngo'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }
    
    // Check existing
    const existing = await User.findByEmail(email);
    if (existing) {
      return res.status(400).json({ error: 'Email exists' });
    }
    
    // Hash password
    const hashed = await bcrypt.hash(password, 10);
    
    // Create user
    const userId = await User.create({
      email, password: hashed, full_name, role
    });
    
    // Generate token
    const token = jwt.sign({ id: userId, role }, JWT_SECRET);
    
    res.status(201).json({ token, user: { id: userId, email, role } });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create account' });
  }
});
```

#### After:
```javascript
router.post('/signup', async (req, res) => {
  try {
    const result = await AuthService.register(req.body);
    res.status(201).json(result);
  } catch (error) {
    console.error('Signup error:', error.message);
    
    if (error.message === 'Invalid role') {
      return res.status(400).json({ error: error.message });
    }
    
    if (error.message === 'Email already registered') {
      return res.status(400).json({ error: error.message });
    }
    
    res.status(500).json({ error: 'Failed to create account' });
  }
});
```

## Common Patterns

### Pattern 1: Simple CRUD

```javascript
// Before: Direct model access
const item = await Model.findById(id);

// After: Service method
const item = await Service.getById(id);
```

### Pattern 2: Validation

```javascript
// Before: Validation in route
if (!data.title || data.title.length > 255) {
  return res.status(400).json({ error: 'Invalid title' });
}

// After: Validation in service
try {
  await Service.create(data); // Validation inside
} catch (error) {
  if (error.message === 'Validation failed') {
    return res.status(400).json({ 
      error: error.message,
      details: error.details 
    });
  }
}
```

### Pattern 3: Multiple Operations

```javascript
// Before: Multiple model calls in route
const user = await User.findById(userId);
const orders = await Order.findByBuyer(userId);
const stats = calculateStats(orders);

// After: Single service call
const stats = await OrderService.getOrderStatistics(userId, 'buyer');
```

## Testing Checklist

### For Each Migrated Route:

- [ ] Test with valid data
- [ ] Test with invalid data
- [ ] Test with missing data
- [ ] Test authentication (if protected)
- [ ] Test authorization (if role-based)
- [ ] Test error responses
- [ ] Test response format
- [ ] Test status codes
- [ ] Compare with original behavior
- [ ] Test with frontend (if applicable)

### Test Tools:

1. **Postman** - API testing
2. **Thunder Client** (VS Code) - Quick testing
3. **curl** - Command line testing
4. **Frontend** - Integration testing

## Rollback Plan

If issues occur after migration:

### Immediate Rollback:

```bash
# Restore original route
mv routes/auth.js routes/auth.new.js
mv routes/auth.backup.js routes/auth.js

# Restart server
# Test original functionality
```

### Investigate Issue:

1. Check error logs
2. Compare request/response
3. Verify service logic
4. Check database queries
5. Test service independently

### Fix and Retry:

1. Fix issue in service
2. Test service independently
3. Update refactored route
4. Test again
5. Migrate when confident

## Best Practices

### DO:

✅ Migrate one route at a time
✅ Test thoroughly before moving to next
✅ Keep backups until verified
✅ Document any issues found
✅ Update tests if they exist
✅ Monitor logs after migration

### DON'T:

❌ Migrate all routes at once
❌ Skip testing
❌ Delete backups immediately
❌ Change service and route simultaneously
❌ Ignore error messages
❌ Deploy without testing

## Troubleshooting

### Issue: Service method not found

```
Error: Service.methodName is not a function
```

**Solution:** Check service file, ensure method is exported

### Issue: Validation errors not showing

```
Error: Validation failed (no details)
```

**Solution:** Check error handling in route:
```javascript
if (error.message === 'Validation failed') {
  return res.status(400).json({
    error: error.message,
    details: error.details // Include details
  });
}
```

### Issue: Different response format

**Solution:** Match original response format:
```javascript
// Original
res.json({ data: result });

// Service returns just result
// Wrap it in route
res.json({ data: result });
```

## Progress Tracking

Create a checklist file:

```markdown
# Migration Progress

## Routes to Migrate

- [ ] auth.js (Priority: HIGH)
- [ ] users.js (Priority: HIGH)
- [ ] products.js (Priority: MEDIUM)
- [ ] orders.js (Priority: MEDIUM)
- [ ] swaps.js (Priority: LOW)
- [ ] donations.js (Priority: LOW)
- [ ] admin.js (Priority: LOW)

## Completed

- [x] Service layer created
- [x] Refactored examples created
- [x] Test script created
- [ ] auth.js migrated
- [ ] users.js migrated
- [ ] ...
```

## Timeline Suggestion

- **Week 1:** Test services, review examples
- **Week 2:** Migrate auth.js and users.js
- **Week 3:** Migrate products.js and orders.js
- **Week 4:** Migrate remaining routes
- **Week 5:** Remove backups, update docs

## Support

If you encounter issues:

1. Check SERVICE_LAYER_ARCHITECTURE.md
2. Review SERVICE_LAYER_QUICK_REF.md
3. Look at refactored examples
4. Test services independently
5. Check error messages carefully
