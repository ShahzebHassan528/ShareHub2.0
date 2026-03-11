# Gradual Migration Guide: Raw SQL to Sequelize ORM

## Overview

This guide documents the gradual migration from raw SQL queries to Sequelize ORM. The migration is done incrementally, one model at a time, with full backward compatibility maintained throughout.

## Migration Strategy

### Phase 1: User Model ✅ IN PROGRESS

**Status:** Sequelize wrapper created, ready for testing

**Files:**
- Original: `models/User.js` (raw SQL)
- New: `models/User.sequelize.wrapper.js` (Sequelize)
- Test: `test-user-migration.js`

**Methods Migrated:**
- ✅ `create(userData)` - Create new user
- ✅ `findByEmail(email)` - Find user by email
- ✅ `findById(id)` - Find user by ID
- ✅ `updateVerification(id, isVerified)` - Update verification status

**Additional Methods (Sequelize-only):**
- ✅ `findAll(options)` - Find all users with filters
- ✅ `count(where)` - Count users
- ✅ `update(id, updates)` - Update user fields
- ✅ `delete(id)` - Soft delete user
- ✅ `findByIdWithRelations(id, options)` - Find with related data

**Routes Using This Model:**
- `routes/auth.js` - Sign up and sign in

### Phase 2: Seller Model (PLANNED)

**Status:** Not started

**Files:**
- Original: `models/Seller.js`
- New: `models/Seller.sequelize.wrapper.js` (to be created)

**Methods to Migrate:**
- `create(sellerData)`
- `findByUserId(userId)`
- `findPending()`
- `approve(sellerId, adminId)`
- `reject(sellerId, adminId, reason)`

### Phase 3: NGO Model (PLANNED)

**Status:** Not started

**Files:**
- Original: `models/NGO.js`
- New: `models/NGO.sequelize.wrapper.js` (to be created)

**Methods to Migrate:**
- `create(ngoData)`
- `findByUserId(userId)`
- `findPending()`
- `verify(ngoId, adminId)`
- `reject(ngoId, adminId, reason)`
- `findVerified()`

### Phase 4: Order Model (PLANNED)

**Status:** Not started

**Files:**
- Original: `models/Order.js`
- New: `models/Order.sequelize.wrapper.js` (to be created)

**Methods to Migrate:**
- `create(orderData)`
- `addItem(orderItem)`
- `findByBuyer(buyerId)`
- `findById(orderId)`
- `updateStatus(orderId, status)`

### Phase 5: Donation Model (PLANNED)

**Status:** Not started

**Files:**
- Original: `models/Donation.js`
- New: `models/Donation.sequelize.wrapper.js` (to be created)

**Methods to Migrate:**
- `create(donationData)`
- `findByDonor(donorId)`
- `findByNGO(ngoId)`
- `updateStatus(donationId, status)`

### Phase 6: Swap Model (PLANNED)

**Status:** Not started

**Files:**
- Original: `models/Swap.js`
- New: `models/Swap.sequelize.wrapper.js` (to be created)

**Methods to Migrate:**
- `findAll(filters)`
- `findById(id)`
- `create(swapData)`

### Phase 7: Product Model (PLANNED)

**Status:** Not started (currently empty)

**Files:**
- Original: `models/Product.js` (empty)
- New: `models/Product.sequelize.wrapper.js` (to be created)

## Migration Process

### Step 1: Create Sequelize Wrapper

For each model, create a new file `Model.sequelize.wrapper.js` that:

1. Imports the Sequelize model from `database/models`
2. Wraps Sequelize methods to match raw SQL API
3. Returns plain objects (using `raw: true`) for compatibility
4. Maintains exact same method signatures
5. Adds additional Sequelize-specific features

**Template:**

```javascript
const { ModelName } = require('../database/models');

class Model {
  static async existingMethod(params) {
    // Sequelize implementation
    const result = await ModelName.findOne({
      where: { /* conditions */ },
      raw: true // Important for compatibility
    });
    return result;
  }
  
  // Additional Sequelize-only methods
  static async newMethod(params) {
    // New functionality using Sequelize features
  }
}

module.exports = Model;
```

### Step 2: Create Test Script

Create `test-{model}-migration.js` to verify:

1. Both versions return same data types
2. Both versions return same object structures
3. All methods work identically
4. Edge cases handled correctly

### Step 3: Run Tests

```bash
node test-{model}-migration.js
```

Verify all tests pass before proceeding.

### Step 4: Update Routes (Gradual)

**Option A: Immediate Switch**

```javascript
// Before
const User = require('../models/User');

// After
const User = require('../models/User.sequelize.wrapper');
```

**Option B: Feature Flag**

```javascript
const USE_SEQUELIZE = process.env.USE_SEQUELIZE === 'true';
const User = USE_SEQUELIZE 
  ? require('../models/User.sequelize.wrapper')
  : require('../models/User');
```

**Option C: Try-Catch Fallback**

```javascript
const UserSequelize = require('../models/User.sequelize.wrapper');
const UserRawSQL = require('../models/User');

async function getUser(email) {
  try {
    return await UserSequelize.findByEmail(email);
  } catch (error) {
    console.warn('Sequelize failed, falling back to raw SQL:', error);
    return await UserRawSQL.findByEmail(email);
  }
}
```

### Step 5: Test in Development

1. Start server with Sequelize version
2. Test all endpoints using the model
3. Verify responses match expected format
4. Check for any errors or warnings

### Step 6: Monitor in Production

1. Deploy with feature flag enabled
2. Monitor error logs
3. Compare performance metrics
4. Verify data consistency

### Step 7: Remove Raw SQL Version

After successful migration and monitoring:

1. Remove original `models/Model.js`
2. Rename `models/Model.sequelize.wrapper.js` to `models/Model.js`
3. Update all imports
4. Remove fallback code

## Testing Checklist

For each model migration:

- [ ] Sequelize wrapper created
- [ ] Test script created
- [ ] All tests pass
- [ ] Routes updated
- [ ] Manual testing completed
- [ ] No errors in logs
- [ ] Response format matches
- [ ] Performance acceptable
- [ ] Deployed to staging
- [ ] Monitored for 24 hours
- [ ] Deployed to production
- [ ] Raw SQL version removed

## Current Status

### User Model Migration

**Progress:** 70% Complete

**Completed:**
- [x] Sequelize wrapper created
- [x] Test script created
- [x] All core methods implemented
- [x] Additional methods added
- [ ] Tests run and verified
- [ ] Routes updated
- [ ] Manual testing
- [ ] Production deployment

**Next Steps:**
1. Run `node test-user-migration.js`
2. Verify all tests pass
3. Update `routes/auth.js` to use Sequelize version
4. Test signup and signin endpoints
5. Deploy to staging

## Benefits of Gradual Migration

### 1. Risk Mitigation
- One model at a time reduces risk
- Easy to rollback if issues occur
- Existing functionality continues working

### 2. Learning Curve
- Team learns Sequelize incrementally
- Time to adapt to new patterns
- Identify issues early

### 3. Performance Comparison
- Compare raw SQL vs Sequelize performance
- Optimize before full migration
- Make informed decisions

### 4. Zero Downtime
- No service interruption
- Gradual rollout possible
- Feature flags for control

## Compatibility Guidelines

### Return Types

**Raw SQL:**
```javascript
const userId = await User.create(userData);
// Returns: number (insertId)
```

**Sequelize Wrapper:**
```javascript
const userId = await User.create(userData);
// Returns: number (user.id)
```

Both return the same type!

### Object Structure

**Raw SQL:**
```javascript
const user = await User.findByEmail(email);
// Returns: plain object { id, email, password, ... }
```

**Sequelize Wrapper:**
```javascript
const user = await User.findByEmail(email);
// Returns: plain object { id, email, password, ... }
// Using raw: true option
```

Both return plain objects!

### Undefined vs Null

**Raw SQL:**
```javascript
const user = await User.findByEmail('nonexistent@example.com');
// Returns: undefined
```

**Sequelize Wrapper:**
```javascript
const user = await User.findByEmail('nonexistent@example.com');
// Returns: undefined (explicitly handled)
```

Both return undefined!

## Performance Considerations

### Query Optimization

**Raw SQL:**
- Direct SQL queries
- Manual optimization
- No ORM overhead

**Sequelize:**
- Generated SQL queries
- Automatic optimization
- Small ORM overhead
- Better for complex joins

### Benchmarking

Run performance tests:

```bash
# Test raw SQL performance
node benchmark-raw-sql.js

# Test Sequelize performance
node benchmark-sequelize.js

# Compare results
node compare-performance.js
```

### Optimization Tips

1. **Use raw: true** for simple queries
2. **Use indexes** on frequently queried columns
3. **Limit selected fields** with attributes
4. **Use eager loading** for related data
5. **Cache frequently accessed data**

## Troubleshooting

### Issue: Different Return Types

**Problem:** Sequelize returns model instance instead of plain object

**Solution:** Use `raw: true` option

```javascript
const user = await UserModel.findOne({
  where: { email },
  raw: true // Returns plain object
});
```

### Issue: Undefined vs Null

**Problem:** Sequelize returns null, raw SQL returns undefined

**Solution:** Explicitly convert

```javascript
const user = await UserModel.findOne({ where: { email } });
return user || undefined; // Convert null to undefined
```

### Issue: Different Field Names

**Problem:** Sequelize uses camelCase, database uses snake_case

**Solution:** Configure in model definition

```javascript
define: {
  underscored: false, // Use camelCase
  createdAt: 'created_at', // Map to snake_case
  updatedAt: 'updated_at'
}
```

### Issue: Transaction Handling

**Problem:** Raw SQL uses manual transactions

**Solution:** Use Sequelize transactions

```javascript
const { sequelize } = require('../config/sequelize');

await sequelize.transaction(async (t) => {
  await User.create(userData, { transaction: t });
  await Seller.create(sellerData, { transaction: t });
});
```

## Best Practices

### 1. Maintain API Compatibility

Always match the original method signatures:

```javascript
// Original
static async findByEmail(email) { ... }

// Sequelize wrapper - same signature
static async findByEmail(email) { ... }
```

### 2. Add New Features Separately

Don't modify existing methods, add new ones:

```javascript
// Existing method (unchanged)
static async findById(id) { ... }

// New Sequelize-specific method
static async findByIdWithRelations(id, options) { ... }
```

### 3. Document Changes

Add comments explaining differences:

```javascript
/**
 * Find user by email
 * @param {string} email - User email
 * @returns {Promise<Object|undefined>} - User object or undefined
 * 
 * Note: Returns undefined (not null) for compatibility with raw SQL version
 */
static async findByEmail(email) { ... }
```

### 4. Test Thoroughly

Test all edge cases:
- Valid data
- Invalid data
- Non-existent records
- Duplicate records
- Null values
- Empty strings

### 5. Monitor Performance

Track query performance:
- Query execution time
- Number of queries
- Database load
- Memory usage

## Resources

### Documentation
- Sequelize Official Docs: https://sequelize.org/docs/v6/
- Migration Examples: `database/MIGRATION_EXAMPLES.md`
- Sequelize Setup: `database/SEQUELIZE_SETUP.md`

### Test Scripts
- User Migration: `test-user-migration.js`
- Full Sequelize Test: `test-sequelize.js`
- Sync Test: `test-sync.js`

### Support
- Check existing documentation first
- Review migration examples
- Test in development before production
- Monitor logs for issues

## Timeline

### Week 1: User Model
- [x] Create Sequelize wrapper
- [x] Create test script
- [ ] Run tests
- [ ] Update routes
- [ ] Deploy to staging

### Week 2: Seller & NGO Models
- [ ] Create Sequelize wrappers
- [ ] Create test scripts
- [ ] Run tests
- [ ] Update routes
- [ ] Deploy to staging

### Week 3: Order & Donation Models
- [ ] Create Sequelize wrappers
- [ ] Create test scripts
- [ ] Run tests
- [ ] Update routes
- [ ] Deploy to staging

### Week 4: Swap & Product Models
- [ ] Create Sequelize wrappers
- [ ] Create test scripts
- [ ] Run tests
- [ ] Update routes
- [ ] Deploy to staging

### Week 5: Cleanup
- [ ] Remove raw SQL versions
- [ ] Update documentation
- [ ] Final testing
- [ ] Deploy to production

## Success Criteria

Migration is considered successful when:

✅ All tests pass  
✅ All routes work correctly  
✅ Response formats match  
✅ Performance is acceptable  
✅ No errors in logs  
✅ Data consistency maintained  
✅ Team is comfortable with Sequelize  
✅ Documentation is complete  

## Rollback Plan

If issues occur:

1. **Immediate:** Switch back to raw SQL using feature flag
2. **Short-term:** Fix issues in Sequelize version
3. **Long-term:** Re-test and re-deploy

```javascript
// Emergency rollback
const USE_SEQUELIZE = false; // Set to false
const User = USE_SEQUELIZE 
  ? require('../models/User.sequelize.wrapper')
  : require('../models/User');
```

## Conclusion

This gradual migration approach ensures:
- Zero downtime
- Minimal risk
- Full backward compatibility
- Easy rollback if needed
- Team learning opportunity
- Production safety

Follow this guide for each model migration to ensure a smooth transition from raw SQL to Sequelize ORM.
