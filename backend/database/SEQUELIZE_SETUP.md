# Sequelize ORM Setup Documentation

## Overview
This project now includes Sequelize ORM alongside the existing raw SQL implementation. Both approaches coexist to allow gradual migration.

## Directory Structure
```
backend/
├── config/
│   ├── database.js          # Original mysql2 connection (still active)
│   └── sequelize.js         # New Sequelize configuration
├── database/
│   ├── models/              # Sequelize model definitions
│   │   ├── index.js         # Central model registry with associations
│   │   ├── User.sequelize.js
│   │   ├── Seller.sequelize.js
│   │   ├── NGO.sequelize.js
│   │   ├── Product.sequelize.js
│   │   ├── Order.sequelize.js
│   │   ├── Donation.sequelize.js
│   │   └── ... (other models)
│   ├── schema.sql           # Original database schema
│   └── seed.sql             # Sample data
└── models/                  # Original raw SQL models (still active)
    ├── User.js
    ├── Seller.js
    └── ... (other models)
```

## Configuration

### Environment Variables
The Sequelize configuration uses the same environment variables as the original setup:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=marketplace_db
NODE_ENV=development
```

### Connection Details
- **Database**: MySQL
- **Driver**: mysql2 (reused from existing setup)
- **Connection Pool**: Max 10 connections
- **Logging**: Enabled in development, disabled in production

## Using Sequelize Models

### Import Models
```javascript
// Import all models and sequelize instance
const { 
  User, 
  Seller, 
  Product, 
  Order,
  sequelize 
} = require('./database/models');
```

### Basic Operations

#### Create
```javascript
const user = await User.create({
  email: 'user@example.com',
  password: 'hashed_password',
  full_name: 'John Doe',
  phone: '1234567890',
  role: 'buyer'
});
```

#### Find
```javascript
// Find by primary key
const user = await User.findByPk(1);

// Find one with conditions
const user = await User.findOne({ 
  where: { email: 'user@example.com' } 
});

// Find all with conditions
const sellers = await Seller.findAll({ 
  where: { approval_status: 'pending' } 
});
```

#### Update
```javascript
await User.update(
  { is_verified: true },
  { where: { id: 1 } }
);
```

#### Delete
```javascript
await User.destroy({ 
  where: { id: 1 } 
});
```

### Working with Associations

#### Include Related Data
```javascript
// Get user with seller profile
const user = await User.findByPk(1, {
  include: [{ 
    model: Seller, 
    as: 'sellerProfile' 
  }]
});

// Get order with items and products
const order = await Order.findByPk(1, {
  include: [
    { 
      model: OrderItem, 
      as: 'items',
      include: [
        { model: Product, as: 'product' },
        { model: Seller, as: 'seller' }
      ]
    }
  ]
});

// Get donations with NGO and product details
const donations = await Donation.findAll({
  where: { donor_id: userId },
  include: [
    { model: NGO, as: 'ngo' },
    { model: Product, as: 'product' }
  ]
});
```

### Complex Queries

#### With Conditions and Ordering
```javascript
const products = await Product.findAll({
  where: {
    is_available: true,
    price: { [Op.lte]: 100 }
  },
  include: [
    { model: Seller, as: 'seller' },
    { model: Category, as: 'category' }
  ],
  order: [['created_at', 'DESC']],
  limit: 10
});
```

#### Aggregations
```javascript
const { Op } = require('sequelize');

// Count products by seller
const count = await Product.count({
  where: { seller_id: 1 }
});

// Get average rating
const avgRating = await Review.findAll({
  attributes: [
    'seller_id',
    [sequelize.fn('AVG', sequelize.col('rating')), 'avg_rating']
  ],
  where: { seller_id: 1 },
  group: ['seller_id']
});
```

### Transactions
```javascript
const t = await sequelize.transaction();

try {
  const order = await Order.create({
    buyer_id: 1,
    order_number: 'ORD123',
    total_amount: 100.00,
    shipping_address: '123 Main St'
  }, { transaction: t });

  await OrderItem.create({
    order_id: order.id,
    product_id: 1,
    seller_id: 1,
    quantity: 1,
    price: 100.00
  }, { transaction: t });

  await t.commit();
} catch (error) {
  await t.rollback();
  throw error;
}
```

## Migration Strategy

### Phase 1: Coexistence (Current)
- Both raw SQL and Sequelize models exist
- New features can use Sequelize
- Existing features continue using raw SQL
- No breaking changes

### Phase 2: Gradual Migration
- Migrate one model at a time
- Update routes to use Sequelize models
- Test thoroughly before moving to next model
- Keep raw SQL as fallback

### Phase 3: Complete Migration
- All routes use Sequelize
- Remove raw SQL models
- Clean up unused code

## Testing Connection

### Test Sequelize Connection
```javascript
const { testConnection } = require('./config/sequelize');

// In your server.js or startup file
testConnection().then(connected => {
  if (connected) {
    console.log('Sequelize is ready!');
  }
});
```

### Test Database Query
```javascript
const { User } = require('./database/models');

// Simple test
const users = await User.findAll({ limit: 1 });
console.log('Sequelize query successful:', users);
```

## Important Notes

### DO NOT Run sync() in Production
```javascript
// NEVER do this in production:
await sequelize.sync({ force: true }); // This drops all tables!

// Use migrations instead for schema changes
```

### Existing Schema
- Sequelize models are mapped to existing tables
- No schema changes are made automatically
- Use the existing schema.sql for database setup
- Sequelize only reads/writes data, doesn't modify structure

### Raw Queries (When Needed)
```javascript
const { sequelize } = require('./database/models');

// Execute raw SQL if needed
const [results, metadata] = await sequelize.query(
  'SELECT * FROM users WHERE role = ?',
  { replacements: ['buyer'] }
);
```

## Advantages of Sequelize

1. **Type Safety**: Better IDE autocomplete and error detection
2. **Associations**: Automatic JOIN handling
3. **Validation**: Built-in data validation
4. **Transactions**: Easy transaction management
5. **Migrations**: Version control for database schema
6. **Security**: Automatic SQL injection prevention
7. **Maintainability**: Less boilerplate code
8. **Testing**: Easier to mock and test

## Resources

- [Sequelize Documentation](https://sequelize.org/docs/v6/)
- [Sequelize Associations](https://sequelize.org/docs/v6/core-concepts/assocs/)
- [Sequelize Querying](https://sequelize.org/docs/v6/core-concepts/model-querying-basics/)
- [Sequelize Transactions](https://sequelize.org/docs/v6/other-topics/transactions/)
