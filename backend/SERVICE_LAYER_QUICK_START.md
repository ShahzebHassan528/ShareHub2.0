# Service Layer Quick Start Guide

## 🚀 What Was Done

Service Layer architecture introduced to separate business logic from routes.

## 📁 New Files Created

### Services (8 files)
```
backend/services/
├── index.js                    # Central export
├── auth.service.js             # Authentication
├── user.service.js             # User management
├── product.service.js          # Product management
├── order.service.js            # Order management
├── donation.service.js         # Donation management
├── swap.service.js             # Swap management
└── notificationService.js      # Notifications (existing)
```

### Examples (2 files)
```
backend/routes/
├── auth.refactored.js          # Auth with services
└── users.refactored.js         # Users with services
```

### Documentation (5 files)
```
backend/
├── SERVICE_LAYER_ARCHITECTURE.md    # Complete guide
├── SERVICE_LAYER_QUICK_REF.md       # Method reference
├── SERVICE_LAYER_DIAGRAM.md         # Visual diagrams
├── SERVICE_MIGRATION_GUIDE.md       # Migration steps
└── test-service-layer.js            # Test script
```

## ⚡ Quick Test

```bash
# Test services
cd backend
node test-service-layer.js
```

Expected output:
```
✅ AuthService tests passed!
✅ UserService tests passed!
✅ ProductService tests passed!
✅ ALL SERVICE LAYER TESTS PASSED!
```

## 📖 How to Use Services

### Import Services

```javascript
// Import all
const { 
  AuthService, 
  UserService, 
  ProductService 
} = require('../services');

// Or import one
const AuthService = require('../services/auth.service');
```

### Use in Routes

```javascript
// Before
router.post('/signup', async (req, res) => {
  // 50 lines of business logic here...
});

// After
router.post('/signup', async (req, res) => {
  try {
    const result = await AuthService.register(req.body);
    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});
```

## 🎯 Common Service Methods

### AuthService
```javascript
await AuthService.register(userData)
await AuthService.login(email, password)
AuthService.generateToken(userId, role)
```

### UserService
```javascript
await UserService.getProfile(userId)
await UserService.updateProfile(userId, data)
await UserService.suspendUser(userId, adminId, reason)
```

### ProductService
```javascript
await ProductService.getAllProducts(filters)
await ProductService.getProductById(productId)
await ProductService.findNearbyProducts(lat, lng, radius)
await ProductService.blockProduct(productId, adminId, reason)
```

### OrderService
```javascript
await OrderService.createOrder(buyerId, items, orderData)
await OrderService.getOrdersByBuyer(buyerId)
await OrderService.updateOrderStatus(orderId, status, userId)
```

## 🔄 Migration Steps

### 1. Test Services
```bash
node test-service-layer.js
```

### 2. Review Examples
Compare:
- `routes/auth.js` (original)
- `routes/auth.refactored.js` (with services)

### 3. Migrate One Route
```bash
# Backup original
cp routes/auth.js routes/auth.backup.js

# Copy refactored
cp routes/auth.refactored.js routes/auth.js

# Test
# If OK, delete backup
# If issues, restore backup
```

### 4. Repeat for Other Routes
Priority order:
1. auth.js
2. users.js
3. products.js
4. orders.js
5. swaps.js
6. donations.js
7. admin.js

## 📚 Documentation

### For Complete Guide
Read: `SERVICE_LAYER_ARCHITECTURE.md`

### For Quick Reference
Read: `SERVICE_LAYER_QUICK_REF.md`

### For Visual Understanding
Read: `SERVICE_LAYER_DIAGRAM.md`

### For Migration Help
Read: `SERVICE_MIGRATION_GUIDE.md`

## ✅ Benefits

- **Cleaner Routes**: 50-70% less code
- **Reusable Logic**: Use services anywhere
- **Better Testing**: Test services independently
- **Easy Maintenance**: Changes isolated
- **Backward Compatible**: Existing APIs work

## 🔍 Architecture

```
Request → Route → Service → Model → Database
          ↓        ↓         ↓
       HTTP     Business   Data
       Layer    Logic      Access
```

## 🎨 Code Comparison

### Before (Mixed Concerns)
```javascript
router.post('/endpoint', async (req, res) => {
  // Validation
  if (!data.field) return res.status(400).json({...});
  
  // Business logic
  const existing = await Model.find(...);
  if (existing) return res.status(400).json({...});
  
  // More business logic
  const result = await Model.create(...);
  
  // Response
  res.json(result);
});
```

### After (Separated Concerns)
```javascript
router.post('/endpoint', async (req, res) => {
  try {
    const result = await Service.method(req.body);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});
```

## 🚨 Important Notes

- ✅ Original routes NOT modified
- ✅ Backward compatible
- ✅ No database changes needed
- ✅ Gradual migration possible
- ✅ Test before replacing

## 🆘 Need Help?

1. Run test: `node test-service-layer.js`
2. Check `SERVICE_LAYER_QUICK_REF.md`
3. Review refactored examples
4. Read architecture guide

## 📊 Status

- [x] Services created
- [x] Examples created
- [x] Documentation complete
- [x] Test script ready
- [ ] Routes migrated (your next step)

## 🎯 Next Action

```bash
# Test the services
node test-service-layer.js

# Review the examples
# Compare auth.js vs auth.refactored.js

# Start migration when ready
```

---

**Ready to use!** Start with testing, then migrate gradually.
