# Service Layer Architecture

## Overview

The Service Layer architecture separates business logic from route handlers, creating a cleaner, more maintainable codebase.

## Architecture Flow

```
Request → Route → Controller → Service → Model Wrapper → Sequelize → Database
                     ↓            ↓           ↓
                  Validation   Business    Data Access
                  Response     Logic
```

### Detailed Flow

1. **Route** (`routes/*.js`): Receives HTTP request
2. **Controller** (inline in route): Handles request/response, basic validation
3. **Service** (`services/*.service.js`): Contains business logic
4. **Model Wrapper** (`models/*.sequelize.wrapper.js`): Database operations
5. **Sequelize Model** (`database/models/*.sequelize.js`): ORM definitions

## Benefits

✅ **Separation of Concerns**: Each layer has a single responsibility
✅ **Reusability**: Services can be used by multiple routes
✅ **Testability**: Business logic can be tested independently
✅ **Maintainability**: Changes are isolated to specific layers
✅ **Backward Compatibility**: Existing APIs continue to work

## Service Layer Structure

```
backend/
├── services/
│   ├── index.js                    # Central export
│   ├── auth.service.js             # Authentication logic
│   ├── user.service.js             # User management
│   ├── product.service.js          # Product management
│   ├── order.service.js            # Order management
│   ├── donation.service.js         # Donation management
│   ├── swap.service.js             # Swap management
│   └── notificationService.js      # Notification logic (existing)
```

## Service Responsibilities

### AuthService
- User registration with role-specific profiles
- User authentication and login
- JWT token generation and verification
- Token refresh

### UserService
- Profile management (get, update)
- Public profile access
- User suspension/reactivation (admin)
- Profile data validation

### ProductService
- Product CRUD operations
- Location-based search (nearby products)
- Product blocking/unblocking (admin)
- Product validation

### OrderService
- Order creation with items
- Order status management
- Payment status tracking
- Order statistics

### DonationService
- Donation creation
- Donation acceptance/rejection
- NGO verification check
- Donation tracking

### SwapService
- Swap request creation
- Swap acceptance/rejection
- Swap completion
- Product availability validation

### NotificationService
- Notification creation
- Notification triggers (message, donation, swap, order)
- Mark as read functionality
- Unread count

## Migration Strategy

### Phase 1: Create Services (✅ DONE)
- Created all service files
- Implemented business logic
- Added validation
- Maintained backward compatibility

### Phase 2: Create Refactored Routes (✅ DONE)
- Created `*.refactored.js` examples
- Demonstrated service usage
- Kept original routes intact

### Phase 3: Testing (TODO)
- Test refactored routes
- Verify all functionality works
- Check error handling

### Phase 4: Gradual Migration (TODO)
- Rename original routes to `*.old.js`
- Rename refactored routes to remove `.refactored`
- Update one route at a time
- Test after each migration

### Phase 5: Cleanup (TODO)
- Remove old route files
- Update documentation
- Remove debug logs

## Usage Examples

### Example 1: Using AuthService

```javascript
// OLD WAY (in route)
router.post('/signup', async (req, res) => {
  const { email, password } = req.body;
  const existingUser = await User.findByEmail(email);
  if (existingUser) {
    return res.status(400).json({ error: 'Email exists' });
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  const userId = await User.create({ email, password: hashedPassword });
  const token = jwt.sign({ id: userId }, JWT_SECRET);
  res.json({ token });
});

// NEW WAY (with service)
router.post('/signup', async (req, res) => {
  try {
    const result = await AuthService.register(req.body);
    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});
```

### Example 2: Using ProductService

```javascript
// OLD WAY
router.get('/nearby', async (req, res) => {
  const { lat, lng, radius } = req.query;
  if (!lat || !lng) {
    return res.status(400).json({ error: 'Missing params' });
  }
  const products = await Product.findNearby(lat, lng, radius || 5);
  res.json({ products });
});

// NEW WAY
router.get('/nearby', async (req, res) => {
  try {
    const { lat, lng, radius } = req.query;
    const products = await ProductService.findNearbyProducts(
      parseFloat(lat),
      parseFloat(lng),
      radius ? parseFloat(radius) : 5
    );
    res.json({ products });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});
```

### Example 3: Using UserService

```javascript
// OLD WAY
router.put('/profile', auth, async (req, res) => {
  const { full_name, phone } = req.body;
  if (!full_name || full_name.length > 255) {
    return res.status(400).json({ error: 'Invalid name' });
  }
  const profile = await User.updateProfile(req.user.id, { full_name, phone });
  res.json({ profile });
});

// NEW WAY
router.put('/profile', auth, async (req, res) => {
  try {
    const profile = await UserService.updateProfile(req.user.id, req.body);
    res.json({ profile });
  } catch (error) {
    if (error.message === 'Validation failed') {
      return res.status(400).json({ error: error.message, details: error.details });
    }
    res.status(500).json({ error: 'Failed to update' });
  }
});
```

## Best Practices

### 1. Service Methods Should:
- Be static (no instance needed)
- Throw errors (don't return error objects)
- Validate input data
- Handle business logic only
- Not handle HTTP responses

### 2. Controllers Should:
- Extract data from request
- Call service methods
- Handle HTTP responses
- Catch and format errors
- Keep logic minimal

### 3. Error Handling:
```javascript
// Service throws error
throw new Error('User not found');

// Controller catches and responds
try {
  const user = await UserService.getUserById(id);
  res.json({ user });
} catch (error) {
  if (error.message === 'User not found') {
    return res.status(404).json({ error: error.message });
  }
  res.status(500).json({ error: 'Server error' });
}
```

### 4. Validation:
```javascript
// Service validates
static validateProductData(data) {
  const errors = [];
  if (!data.title) errors.push('Title required');
  if (errors.length > 0) {
    const error = new Error('Validation failed');
    error.details = errors;
    throw error;
  }
}

// Controller handles validation errors
catch (error) {
  if (error.message === 'Validation failed') {
    return res.status(400).json({
      error: error.message,
      details: error.details
    });
  }
}
```

## Testing Services

```javascript
// Example: Testing AuthService
const { AuthService } = require('../services');

describe('AuthService', () => {
  it('should register a new user', async () => {
    const userData = {
      email: 'test@example.com',
      password: 'password123',
      full_name: 'Test User',
      role: 'buyer'
    };
    
    const result = await AuthService.register(userData);
    
    expect(result).toHaveProperty('token');
    expect(result.user.email).toBe(userData.email);
  });
  
  it('should throw error for duplicate email', async () => {
    await expect(AuthService.register(userData))
      .rejects
      .toThrow('Email already registered');
  });
});
```

## Migration Checklist

- [x] Create service files
- [x] Implement business logic in services
- [x] Add validation in services
- [x] Create refactored route examples
- [ ] Test refactored routes
- [ ] Migrate auth routes
- [ ] Migrate user routes
- [ ] Migrate product routes
- [ ] Migrate order routes
- [ ] Migrate donation routes
- [ ] Migrate swap routes
- [ ] Remove old route files
- [ ] Update documentation

## Notes

- Original routes remain unchanged for backward compatibility
- Services can be used by multiple routes
- Refactored routes are in `*.refactored.js` files
- Test thoroughly before replacing original routes
- Migration can be done gradually, one route at a time
