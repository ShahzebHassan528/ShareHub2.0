# Sequelize Quick Start Guide

## Installation Complete ✅

Sequelize ORM has been successfully installed and configured in your project.

## What Was Added

### New Files
```
backend/
├── config/
│   └── sequelize.js                    # Sequelize configuration
├── database/
│   ├── models/                         # All Sequelize models
│   │   ├── index.js                    # Model registry
│   │   ├── User.sequelize.js
│   │   ├── Seller.sequelize.js
│   │   ├── NGO.sequelize.js
│   │   ├── Product.sequelize.js
│   │   ├── ProductImage.sequelize.js
│   │   ├── Order.sequelize.js
│   │   ├── OrderItem.sequelize.js
│   │   ├── Donation.sequelize.js
│   │   ├── ProductSwap.sequelize.js
│   │   ├── Review.sequelize.js
│   │   ├── AdminLog.sequelize.js
│   │   └── Notification.sequelize.js
│   ├── SEQUELIZE_SETUP.md              # Detailed documentation
│   └── MIGRATION_EXAMPLES.md           # Migration guide
├── test-sequelize.js                   # Test script
└── SEQUELIZE_QUICK_START.md            # This file
```

### Modified Files
- `server.js` - Added Sequelize initialization
- `package.json` - Added sequelize dependency

### Unchanged (Still Working)
- All existing raw SQL models in `models/`
- All existing routes
- Database connection in `config/database.js`
- All existing functionality

## Quick Test

Run the test script to verify everything is working:

```bash
cd backend
node test-sequelize.js
```

Expected output:
```
✅ Sequelize: Database connection established successfully.
✅ All tests completed!
```

### Test Database Auto-Creation

To test the automatic database creation feature:

```bash
npm run test:db-creation
```

This will:
- Check if the database exists
- Create it if it doesn't exist
- Test the connection
- Show database status

**Note:** The database is automatically created when you start the server, so this test is optional.

## Start Using Sequelize

### Option 1: In New Routes (Recommended)
```javascript
// In a new route file
const { User, Product, Order } = require('../database/models');

router.get('/products', async (req, res) => {
  const products = await Product.findAll({
    include: [
      { model: Seller, as: 'seller' },
      { model: Category, as: 'category' }
    ]
  });
  res.json(products);
});
```

### Option 2: Gradually Replace Existing Code
```javascript
// Before (raw SQL)
const User = require('../models/User');
const user = await User.findByEmail(email);

// After (Sequelize)
const { User } = require('../database/models');
const user = await User.findOne({ where: { email } });
```

## Common Operations

### Create
```javascript
const { User } = require('../database/models');

const user = await User.create({
  email: 'user@example.com',
  password: 'hashed_password',
  full_name: 'John Doe',
  role: 'buyer'
});
```

### Read
```javascript
// Find by ID
const user = await User.findByPk(1);

// Find one
const user = await User.findOne({ where: { email: 'user@example.com' } });

// Find all
const users = await User.findAll({ where: { role: 'buyer' } });
```

### Update
```javascript
await User.update(
  { is_verified: true },
  { where: { id: 1 } }
);
```

### Delete
```javascript
await User.destroy({ where: { id: 1 } });
```

### With Relationships
```javascript
const order = await Order.findByPk(1, {
  include: [
    { 
      model: OrderItem, 
      as: 'items',
      include: [
        { model: Product, as: 'product' }
      ]
    }
  ]
});
```

## Environment Variables

Uses the same variables as your existing setup:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=marketplace_db
NODE_ENV=development
```

## Key Features

✅ **Coexistence**: Works alongside existing raw SQL  
✅ **Same Database**: Uses your existing MySQL database  
✅ **Same Driver**: Reuses mysql2 package  
✅ **No Schema Changes**: Maps to existing tables  
✅ **Associations**: All relationships pre-configured  
✅ **Type Safety**: Better IDE support  
✅ **Security**: Built-in SQL injection prevention  

## Next Steps

1. **Test the setup**: Run `node test-sequelize.js`
2. **Read documentation**: Check `SEQUELIZE_SETUP.md` for detailed usage
3. **See examples**: Review `MIGRATION_EXAMPLES.md` for migration patterns
4. **Start small**: Try Sequelize in one route first
5. **Gradually migrate**: Move one model at a time

## Important Notes

⚠️ **DO NOT** run `sequelize.sync()` in production - it can drop tables!  
⚠️ **DO NOT** delete raw SQL models until fully migrated  
⚠️ **DO** test thoroughly before deploying  
⚠️ **DO** keep both approaches working during transition  

## Getting Help

- **Sequelize Docs**: https://sequelize.org/docs/v6/
- **Project Docs**: See `SEQUELIZE_SETUP.md`
- **Examples**: See `MIGRATION_EXAMPLES.md`

## Troubleshooting

### Connection Issues
```bash
# Check MySQL is running
systemctl status mysql  # Linux
# or check Windows services

# Test connection
node test-sequelize.js
```

### Model Not Found
```javascript
// Make sure to import from the right location
const { User } = require('../database/models');  // ✅ Correct
const User = require('../models/User');          // ❌ Old raw SQL model
```

### Association Errors
```javascript
// Always use the 'as' alias defined in associations
include: [{ model: Seller, as: 'seller' }]  // ✅ Correct
include: [{ model: Seller }]                 // ❌ May fail
```

## Success! 🎉

Your project now has Sequelize ORM configured and ready to use. Both raw SQL and Sequelize will work side-by-side, allowing you to migrate at your own pace.
