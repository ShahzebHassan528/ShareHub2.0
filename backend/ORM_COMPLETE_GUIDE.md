# 🗄️ ORM (Sequelize) Complete Guide - Node.js

## What is ORM?

**ORM (Object-Relational Mapping)** is a technique that lets you interact with your database using JavaScript objects instead of writing raw SQL queries.

**Benefits:**
- Write JavaScript instead of SQL
- Database-agnostic code
- Automatic query generation
- Built-in validation
- Relationship management
- Migration support

---

## 1️⃣ DATABASE CONNECTION

### Installation

```bash
npm install sequelize mysql2
```

### Configuration File

**File**: `config/sequelize.js`

```javascript
const { Sequelize } = require('sequelize');
require('dotenv').config();

// Create Sequelize instance
const sequelize = new Sequelize(
  process.env.DB_NAME,      // Database name
  process.env.DB_USER,      // Username
  process.env.DB_PASSWORD,  // Password
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'mysql',        // Database type
    
    // Logging
    logging: console.log,    // Log SQL queries
    
    // Connection pool
    pool: {
      max: 10,              // Maximum connections
      min: 0,               // Minimum connections
      acquire: 30000,       // Max time to get connection
      idle: 10000           // Max idle time
    },
    
    // Model defaults
    define: {
      timestamps: true,     // Add createdAt, updatedAt
      underscored: false,   // Use camelCase
      createdAt: 'created_at',
      updatedAt: 'updated_at'
    }
  }
);

// Test connection
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected successfully');
    return true;
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    return false;
  }
};

module.exports = { sequelize, testConnection };
```

### Environment Variables (.env)

```env
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=marketplace_db
```

---

## 2️⃣ MODEL DEFINITION

### Basic Model Structure

**File**: `database/models/User.sequelize.js`

```javascript
module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    // Primary Key
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    
    // String field with validation
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    
    // Required string
    password: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    
    // Optional string
    full_name: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    
    // Optional field
    phone: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    
    // Text field (long content)
    address: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    
    // Enum field
    role: {
      type: DataTypes.ENUM('admin', 'seller', 'buyer', 'ngo'),
      allowNull: false
    },
    
    // Boolean with default
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    
    // Date field
    suspended_at: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    // Table options
    tableName: 'users',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    
    // Indexes for performance
    indexes: [
      { fields: ['email'] },
      { fields: ['role'] }
    ]
  });

  return User;
};
```

### Data Types Reference

```javascript
// Numbers
DataTypes.INTEGER           // Integer
DataTypes.BIGINT           // Big integer
DataTypes.FLOAT            // Float
DataTypes.DECIMAL(10, 2)   // Decimal (10 digits, 2 after point)

// Strings
DataTypes.STRING           // VARCHAR(255)
DataTypes.STRING(100)      // VARCHAR(100)
DataTypes.TEXT             // TEXT (long content)
DataTypes.TEXT('tiny')     // TINYTEXT
DataTypes.TEXT('medium')   // MEDIUMTEXT
DataTypes.TEXT('long')     // LONGTEXT

// Boolean
DataTypes.BOOLEAN          // TINYINT(1)

// Date/Time
DataTypes.DATE             // DATETIME
DataTypes.DATEONLY         // DATE (no time)
DataTypes.TIME             // TIME

// Special
DataTypes.ENUM('a', 'b')   // ENUM
DataTypes.JSON             // JSON (MySQL 5.7+)
DataTypes.UUID             // UUID
```

### Validation Options

```javascript
{
  email: {
    type: DataTypes.STRING,
    validate: {
      isEmail: true,           // Must be email
      notEmpty: true,          // Cannot be empty
      len: [5, 100],          // Length between 5-100
      isAlphanumeric: true,   // Only letters and numbers
      isNumeric: true,        // Only numbers
      isLowercase: true,      // Only lowercase
      isUppercase: true,      // Only uppercase
      isUrl: true,            // Must be URL
      isIP: true,             // Must be IP address
      isIn: [['a', 'b']],    // Must be in array
      min: 0,                 // Minimum value
      max: 100,               // Maximum value
      
      // Custom validator
      isEven(value) {
        if (parseInt(value) % 2 !== 0) {
          throw new Error('Only even numbers allowed');
        }
      }
    }
  }
}
```

---

## 3️⃣ RELATIONSHIPS (ASSOCIATIONS)

### Types of Relationships

```javascript
// One-to-One
User.hasOne(Seller, { foreignKey: 'user_id', as: 'sellerProfile' });
Seller.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// One-to-Many
User.hasMany(Order, { foreignKey: 'buyer_id', as: 'orders' });
Order.belongsTo(User, { foreignKey: 'buyer_id', as: 'buyer' });

// Many-to-Many (through junction table)
Product.belongsToMany(Order, { 
  through: 'OrderItem',
  foreignKey: 'product_id',
  otherKey: 'order_id'
});
```

### Complete Association Setup

**File**: `database/models/index.js`

```javascript
const { sequelize } = require('../../config/sequelize');
const { DataTypes } = require('sequelize');

// Import models
const UserModel = require('./User.sequelize');
const ProductModel = require('./Product.sequelize');
const OrderModel = require('./Order.sequelize');

// Initialize models
const User = UserModel(sequelize, DataTypes);
const Product = ProductModel(sequelize, DataTypes);
const Order = OrderModel(sequelize, DataTypes);

// Define associations
const setupAssociations = () => {
  // User has many orders
  User.hasMany(Order, { 
    foreignKey: 'buyer_id', 
    as: 'orders' 
  });
  
  // Order belongs to user
  Order.belongsTo(User, { 
    foreignKey: 'buyer_id', 
    as: 'buyer' 
  });
  
  // Product has many orders
  Product.hasMany(Order, { 
    foreignKey: 'product_id', 
    as: 'orders' 
  });
  
  // Order belongs to product
  Order.belongsTo(Product, { 
    foreignKey: 'product_id', 
    as: 'product' 
  });
};

setupAssociations();

module.exports = { sequelize, User, Product, Order };
```

---

## 4️⃣ CRUD OPERATIONS

### CREATE (Insert)

```javascript
const { User } = require('../database/models');

// Create single record
const user = await User.create({
  email: 'john@example.com',
  password: 'hashed_password',
  full_name: 'John Doe',
  role: 'buyer'
});

console.log('Created user ID:', user.id);

// Create multiple records
const users = await User.bulkCreate([
  { email: 'user1@example.com', full_name: 'User 1', role: 'buyer' },
  { email: 'user2@example.com', full_name: 'User 2', role: 'seller' }
]);

// Create or update (upsert)
const [user, created] = await User.findOrCreate({
  where: { email: 'john@example.com' },
  defaults: {
    full_name: 'John Doe',
    role: 'buyer'
  }
});

console.log('Created:', created); // true if new, false if existing
```

### READ (Select)

```javascript
// Find by primary key
const user = await User.findByPk(1);

// Find one record
const user = await User.findOne({
  where: { email: 'john@example.com' }
});

// Find all records
const users = await User.findAll();

// Find with conditions
const users = await User.findAll({
  where: {
    role: 'buyer',
    is_active: true
  }
});

// Find with operators
const { Op } = require('sequelize');

const users = await User.findAll({
  where: {
    // AND condition
    [Op.and]: [
      { role: 'buyer' },
      { is_active: true }
    ],
    
    // OR condition
    [Op.or]: [
      { role: 'buyer' },
      { role: 'seller' }
    ],
    
    // Greater than
    id: { [Op.gt]: 10 },
    
    // Less than
    id: { [Op.lt]: 100 },
    
    // Between
    id: { [Op.between]: [1, 100] },
    
    // IN array
    role: { [Op.in]: ['buyer', 'seller'] },
    
    // NOT IN
    role: { [Op.notIn]: ['admin'] },
    
    // LIKE
    email: { [Op.like]: '%@gmail.com' },
    
    // NOT NULL
    phone: { [Op.ne]: null }
  }
});

// Select specific columns
const users = await User.findAll({
  attributes: ['id', 'email', 'full_name']
});

// Exclude columns
const users = await User.findAll({
  attributes: { 
    exclude: ['password', 'created_at'] 
  }
});

// Order by
const users = await User.findAll({
  order: [
    ['created_at', 'DESC'],
    ['full_name', 'ASC']
  ]
});

// Limit and offset (pagination)
const users = await User.findAll({
  limit: 10,
  offset: 20  // Skip first 20
});

// Count records
const count = await User.count({
  where: { role: 'buyer' }
});

// Find and count all
const { count, rows } = await User.findAndCountAll({
  where: { role: 'buyer' },
  limit: 10,
  offset: 0
});
```

### UPDATE

```javascript
// Update single record
await User.update(
  { full_name: 'John Updated' },  // New values
  { where: { id: 1 } }            // Condition
);

// Update multiple records
await User.update(
  { is_active: false },
  { where: { role: 'buyer' } }
);

// Update and return affected rows
const [affectedRows] = await User.update(
  { is_active: false },
  { where: { id: 1 } }
);

console.log('Rows updated:', affectedRows);

// Increment/Decrement
await Product.increment('views', {
  by: 1,
  where: { id: 1 }
});

await Product.decrement('quantity', {
  by: 5,
  where: { id: 1 }
});
```

### DELETE

```javascript
// Delete records
await User.destroy({
  where: { id: 1 }
});

// Delete multiple
await User.destroy({
  where: { 
    role: 'buyer',
    is_active: false
  }
});

// Delete all (dangerous!)
await User.destroy({
  where: {},
  truncate: true
});

// Soft delete (if paranoid: true in model)
await User.destroy({
  where: { id: 1 }
}); // Sets deletedAt instead of deleting

// Force delete (even with paranoid)
await User.destroy({
  where: { id: 1 },
  force: true
});
```

---

## 5️⃣ ADVANCED QUERIES

### Joins (Include)

```javascript
// Include related data
const users = await User.findAll({
  include: [
    {
      model: Order,
      as: 'orders'
    }
  ]
});

// Nested includes
const products = await Product.findAll({
  include: [
    {
      model: Seller,
      as: 'seller',
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['full_name', 'email']
        }
      ]
    },
    {
      model: Category,
      as: 'category'
    }
  ]
});

// Include with conditions
const users = await User.findAll({
  include: [
    {
      model: Order,
      as: 'orders',
      where: { status: 'completed' },
      required: false  // LEFT JOIN (true = INNER JOIN)
    }
  ]
});
```

### Aggregations

```javascript
// Count
const count = await User.count();

// Sum
const total = await Order.sum('total_amount');

// Average
const avg = await Product.avg('price');

// Min/Max
const min = await Product.min('price');
const max = await Product.max('price');

// Group by
const results = await Order.findAll({
  attributes: [
    'status',
    [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
    [sequelize.fn('SUM', sequelize.col('total_amount')), 'total']
  ],
  group: ['status']
});
```

### Raw Queries

```javascript
// Execute raw SQL
const [results, metadata] = await sequelize.query(
  'SELECT * FROM users WHERE role = ?',
  {
    replacements: ['buyer'],
    type: sequelize.QueryTypes.SELECT
  }
);

// With named parameters
const results = await sequelize.query(
  'SELECT * FROM users WHERE role = :role',
  {
    replacements: { role: 'buyer' },
    type: sequelize.QueryTypes.SELECT
  }
);
```

### Transactions

```javascript
const { sequelize } = require('../database/models');

// Managed transaction (automatic commit/rollback)
const result = await sequelize.transaction(async (t) => {
  // Create user
  const user = await User.create({
    email: 'john@example.com',
    full_name: 'John Doe'
  }, { transaction: t });
  
  // Create seller profile
  await Seller.create({
    user_id: user.id,
    business_name: 'John\'s Store'
  }, { transaction: t });
  
  return user;
});

// Manual transaction
const t = await sequelize.transaction();

try {
  await User.create({ ... }, { transaction: t });
  await Seller.create({ ... }, { transaction: t });
  
  await t.commit();
} catch (error) {
  await t.rollback();
  throw error;
}
```

---

## 6️⃣ PRACTICAL EXAMPLES FROM YOUR PROJECT

### Example 1: User Authentication

```javascript
// Find user by email
const user = await User.findOne({
  where: { email: 'admin@marketplace.com' }
});

// Check if user exists and verify password
if (user && await bcrypt.compare(password, user.password)) {
  // Generate JWT token
  const token = jwt.sign({ id: user.id, role: user.role }, secret);
}
```

### Example 2: Product Search with Location

```javascript
const { Op } = require('sequelize');

// Haversine formula for distance
const haversineFormula = `
  (6371 * acos(
    cos(radians(${latitude})) * 
    cos(radians(latitude)) * 
    cos(radians(longitude) - radians(${longitude})) + 
    sin(radians(${latitude})) * 
    sin(radians(latitude))
  ))
`;

const products = await Product.findAll({
  attributes: {
    include: [
      [sequelize.literal(haversineFormula), 'distance']
    ]
  },
  where: {
    is_available: true,
    latitude: { [Op.ne]: null },
    longitude: { [Op.ne]: null },
    [Op.and]: [
      sequelize.where(
        sequelize.literal(haversineFormula),
        '<=',
        radiusKm
      )
    ]
  },
  order: [[sequelize.literal('distance'), 'ASC']]
});
```

### Example 3: Swap with Transaction

```javascript
const swap = await sequelize.transaction(async (transaction) => {
  // Update swap status
  await ProductSwap.update(
    { status: 'accepted' },
    { where: { id: swapId }, transaction }
  );
  
  // Mark both products unavailable
  await Product.update(
    { is_available: false },
    { 
      where: { 
        id: { [Op.in]: [product1Id, product2Id] }
      },
      transaction 
    }
  );
  
  return swap;
});
```

### Example 4: Get User Profile with Relations

```javascript
const user = await User.findByPk(userId, {
  include: [
    {
      model: Seller,
      as: 'sellerProfile',
      required: false
    },
    {
      model: Order,
      as: 'orders',
      limit: 5,
      order: [['created_at', 'DESC']]
    }
  ],
  attributes: {
    exclude: ['password']
  }
});
```

---

## 7️⃣ BEST PRACTICES

### 1. Use Indexes

```javascript
{
  indexes: [
    { fields: ['email'] },              // Single column
    { fields: ['role', 'is_active'] },  // Composite
    { unique: true, fields: ['email'] } // Unique index
  ]
}
```

### 2. Validate Data

```javascript
{
  email: {
    type: DataTypes.STRING,
    validate: {
      isEmail: true,
      notEmpty: true
    }
  }
}
```

### 3. Use Transactions for Multiple Operations

```javascript
await sequelize.transaction(async (t) => {
  // All operations here
});
```

### 4. Exclude Sensitive Data

```javascript
const user = await User.findByPk(id, {
  attributes: { exclude: ['password'] }
});
```

### 5. Use Connection Pooling

```javascript
pool: {
  max: 10,
  min: 0,
  acquire: 30000,
  idle: 10000
}
```

---

## 8️⃣ YOUR PROJECT STRUCTURE

```
backend/
├── config/
│   └── sequelize.js          ← Connection setup
├── database/
│   └── models/
│       ├── index.js          ← Model initialization & associations
│       ├── User.sequelize.js ← User model definition
│       └── Product.sequelize.js
└── models/
    └── User.sequelize.wrapper.js ← Business logic wrapper
```

---

## 🧪 TEST YOUR ORM

```bash
cd backend
node test-sequelize.js
```

Your project already has Sequelize fully implemented with:
- ✅ Database connection
- ✅ 14 models defined
- ✅ All relationships configured
- ✅ CRUD operations
- ✅ Transactions
- ✅ Advanced queries

Check `database/models/` for all model definitions!
