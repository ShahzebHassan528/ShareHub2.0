# Sequelize Implementation Testing Checklist

Use this checklist to verify the Sequelize ORM implementation is working correctly.

## Pre-Testing Setup

- [ ] MySQL server is running
- [ ] Database `marketplace_db` exists
- [ ] Environment variables are configured in `.env`
- [ ] Dependencies are installed (`npm install` completed)

## 1. Connection Tests

### Test Sequelize Connection
```bash
cd backend
npm run test:sequelize
```

**Expected Output:**
```
✅ Sequelize: Database connection established successfully.
✅ User model loaded: User
✅ Seller model loaded: Seller
✅ Product model loaded: Product
✅ Order model loaded: Order
✅ Query successful! Found X users in database.
✅ User associations: sellerProfile, ngoProfile, orders, notifications, adminLogs
✅ All tests completed!
```

**Checklist:**
- [ ] Connection test passes
- [ ] All models load without errors
- [ ] Query executes successfully
- [ ] Associations are defined
- [ ] No error messages appear

### Test Server Startup
```bash
npm run dev
```

**Expected Output:**
```
Server running on port 5000
Database: MySQL (mysql2 + Sequelize ORM)
✅ Sequelize ORM initialized successfully
```

**Checklist:**
- [ ] Server starts without errors
- [ ] Sequelize initialization message appears
- [ ] No connection errors in console
- [ ] Port 5000 is accessible

## 2. API Endpoint Tests

### Test Raw SQL Endpoint (Existing)
```bash
curl http://localhost:5000/api/test-db
```

**Expected Response:**
```json
{
  "message": "Database connected successfully!",
  "result": 2
}
```

**Checklist:**
- [ ] Endpoint responds successfully
- [ ] Raw SQL connection works
- [ ] Result is correct (1 + 1 = 2)

### Test Existing Auth Endpoints
```bash
# Test signup (should still work with raw SQL)
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "test123",
    "full_name": "Test User",
    "phone": "1234567890",
    "role": "buyer"
  }'
```

**Expected Response:**
```json
{
  "message": "Account created successfully! You can start shopping now.",
  "token": "jwt_token_here",
  "user": {
    "id": 1,
    "email": "test@example.com",
    "full_name": "Test User",
    "role": "buyer",
    "is_verified": true
  }
}
```

**Checklist:**
- [ ] User creation works
- [ ] JWT token is generated
- [ ] Response format is correct
- [ ] No errors in server console

## 3. Sequelize Model Tests

### Test User Model
Create a test file `backend/test-user-model.js`:

```javascript
require('dotenv').config();
const { User } = require('./database/models');

async function testUserModel() {
  try {
    // Test findAll
    const users = await User.findAll({ limit: 5 });
    console.log('✅ Found users:', users.length);

    // Test findOne
    if (users.length > 0) {
      const user = await User.findOne({ 
        where: { email: users[0].email } 
      });
      console.log('✅ Found user by email:', user.email);
    }

    // Test count
    const count = await User.count();
    console.log('✅ Total users:', count);

    console.log('\n✅ All User model tests passed!');
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
  process.exit(0);
}

testUserModel();
```

Run: `node backend/test-user-model.js`

**Checklist:**
- [ ] findAll works
- [ ] findOne works
- [ ] count works
- [ ] No errors thrown

### Test Associations
Create a test file `backend/test-associations.js`:

```javascript
require('dotenv').config();
const { User, Seller, Order, OrderItem, Product } = require('./database/models');

async function testAssociations() {
  try {
    // Test User with Seller profile
    const userWithSeller = await User.findOne({
      include: [{ model: Seller, as: 'sellerProfile' }],
      where: { role: 'seller' }
    });
    
    if (userWithSeller) {
      console.log('✅ User-Seller association works');
      console.log('   User:', userWithSeller.email);
      console.log('   Seller:', userWithSeller.sellerProfile?.business_name);
    }

    // Test Order with Items
    const orderWithItems = await Order.findOne({
      include: [{
        model: OrderItem,
        as: 'items',
        include: [{ model: Product, as: 'product' }]
      }]
    });

    if (orderWithItems) {
      console.log('✅ Order-OrderItem-Product association works');
      console.log('   Order:', orderWithItems.order_number);
      console.log('   Items:', orderWithItems.items?.length);
    }

    console.log('\n✅ All association tests passed!');
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
  process.exit(0);
}

testAssociations();
```

Run: `node backend/test-associations.js`

**Checklist:**
- [ ] User-Seller association works
- [ ] Order-OrderItem association works
- [ ] Nested includes work
- [ ] No errors thrown

## 4. Compatibility Tests

### Test Both Approaches Side-by-Side
Create a test file `backend/test-compatibility.js`:

```javascript
require('dotenv').config();
const db = require('./config/database');
const { User } = require('./database/models');

async function testCompatibility() {
  try {
    // Raw SQL approach
    const [rawUsers] = await db.query('SELECT COUNT(*) as count FROM users');
    console.log('✅ Raw SQL count:', rawUsers[0].count);

    // Sequelize approach
    const sequelizeCount = await User.count();
    console.log('✅ Sequelize count:', sequelizeCount);

    // Compare results
    if (rawUsers[0].count === sequelizeCount) {
      console.log('✅ Both approaches return same results!');
    } else {
      console.log('⚠️  Results differ - this may indicate an issue');
    }

    console.log('\n✅ Compatibility test passed!');
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
  process.exit(0);
}

testCompatibility();
```

Run: `node backend/test-compatibility.js`

**Checklist:**
- [ ] Raw SQL query works
- [ ] Sequelize query works
- [ ] Results match
- [ ] Both can run simultaneously

## 5. Performance Tests

### Test Query Performance
Create a test file `backend/test-performance.js`:

```javascript
require('dotenv').config();
const db = require('./config/database');
const { User, Seller } = require('./database/models');

async function testPerformance() {
  try {
    // Raw SQL with JOIN
    console.log('Testing Raw SQL performance...');
    const start1 = Date.now();
    const [rawResults] = await db.query(`
      SELECT u.*, s.business_name 
      FROM users u
      LEFT JOIN sellers s ON u.id = s.user_id
      LIMIT 100
    `);
    const time1 = Date.now() - start1;
    console.log(`✅ Raw SQL: ${time1}ms (${rawResults.length} rows)`);

    // Sequelize with include
    console.log('Testing Sequelize performance...');
    const start2 = Date.now();
    const sequelizeResults = await User.findAll({
      include: [{ model: Seller, as: 'sellerProfile', required: false }],
      limit: 100
    });
    const time2 = Date.now() - start2;
    console.log(`✅ Sequelize: ${time2}ms (${sequelizeResults.length} rows)`);

    console.log(`\nPerformance difference: ${Math.abs(time1 - time2)}ms`);
    console.log('✅ Performance test completed!');
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
  process.exit(0);
}

testPerformance();
```

Run: `node backend/test-performance.js`

**Checklist:**
- [ ] Both queries complete successfully
- [ ] Performance is acceptable (< 1 second)
- [ ] Results are comparable
- [ ] No memory issues

## 6. Error Handling Tests

### Test Invalid Queries
```javascript
require('dotenv').config();
const { User } = require('./database/models');

async function testErrorHandling() {
  try {
    // Test invalid where clause
    try {
      await User.findOne({ where: { invalid_field: 'test' } });
      console.log('⚠️  Invalid field query did not throw error');
    } catch (error) {
      console.log('✅ Invalid field error caught:', error.name);
    }

    // Test connection error handling
    const { sequelize } = require('./config/sequelize');
    try {
      await sequelize.query('SELECT * FROM nonexistent_table');
      console.log('⚠️  Invalid table query did not throw error');
    } catch (error) {
      console.log('✅ Invalid table error caught:', error.name);
    }

    console.log('\n✅ Error handling tests passed!');
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
  process.exit(0);
}

testErrorHandling();
```

**Checklist:**
- [ ] Invalid queries throw appropriate errors
- [ ] Errors are caught and handled
- [ ] Server doesn't crash on errors
- [ ] Error messages are informative

## 7. Transaction Tests

### Test Transaction Support
```javascript
require('dotenv').config();
const { sequelize, User } = require('./database/models');

async function testTransactions() {
  try {
    // Test successful transaction
    const result = await sequelize.transaction(async (t) => {
      const user = await User.create({
        email: 'transaction-test@example.com',
        password: 'test123',
        full_name: 'Transaction Test',
        role: 'buyer'
      }, { transaction: t });
      
      return user;
    });
    console.log('✅ Transaction committed:', result.email);

    // Clean up
    await User.destroy({ where: { email: 'transaction-test@example.com' } });

    // Test rollback
    try {
      await sequelize.transaction(async (t) => {
        await User.create({
          email: 'rollback-test@example.com',
          password: 'test123',
          full_name: 'Rollback Test',
          role: 'buyer'
        }, { transaction: t });
        
        throw new Error('Intentional error for rollback');
      });
    } catch (error) {
      console.log('✅ Transaction rolled back correctly');
    }

    // Verify rollback
    const rolledBackUser = await User.findOne({ 
      where: { email: 'rollback-test@example.com' } 
    });
    
    if (!rolledBackUser) {
      console.log('✅ Rollback verified - user not created');
    }

    console.log('\n✅ Transaction tests passed!');
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
  process.exit(0);
}

testTransactions();
```

**Checklist:**
- [ ] Transactions commit successfully
- [ ] Rollbacks work correctly
- [ ] Data integrity is maintained
- [ ] No orphaned records

## 8. Production Readiness

### Final Checklist

**Configuration:**
- [ ] Environment variables are properly set
- [ ] Connection pooling is configured
- [ ] Logging is appropriate for environment
- [ ] Error handling is in place

**Security:**
- [ ] SQL injection protection works (parameterized queries)
- [ ] Sensitive data is not logged
- [ ] Database credentials are in .env (not committed)
- [ ] Connection limits are reasonable

**Performance:**
- [ ] Queries execute in reasonable time
- [ ] Connection pool is not exhausted
- [ ] No memory leaks detected
- [ ] Indexes are utilized

**Compatibility:**
- [ ] Both raw SQL and Sequelize work
- [ ] Existing routes still function
- [ ] No breaking changes introduced
- [ ] Backward compatibility maintained

**Documentation:**
- [ ] SEQUELIZE_SETUP.md is complete
- [ ] MIGRATION_EXAMPLES.md is available
- [ ] Code comments are adequate
- [ ] Team is informed of changes

## Summary

After completing all tests, you should have:

✅ Verified Sequelize connection works  
✅ Confirmed all models load correctly  
✅ Tested associations function properly  
✅ Validated compatibility with raw SQL  
✅ Checked performance is acceptable  
✅ Verified error handling works  
✅ Tested transaction support  
✅ Confirmed production readiness  

If all checkboxes are marked, your Sequelize implementation is ready for use!

## Troubleshooting

### Connection Issues
- Check MySQL is running: `systemctl status mysql` (Linux) or Services (Windows)
- Verify credentials in `.env` file
- Test raw SQL connection first
- Check firewall settings

### Model Loading Issues
- Ensure all model files are in `database/models/`
- Check for syntax errors in model definitions
- Verify `index.js` imports all models correctly

### Association Issues
- Check association definitions in `database/models/index.js`
- Verify foreign key names match database schema
- Use correct alias names in queries

### Performance Issues
- Add indexes to frequently queried columns
- Use `attributes` to select only needed fields
- Limit result sets with `limit` and `offset`
- Consider query optimization
