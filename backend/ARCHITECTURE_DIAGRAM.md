# Project Architecture with Sequelize ORM

## Current Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         Express Server                           │
│                         (server.js)                              │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │
        ┌─────────────────────┴─────────────────────┐
        │                                           │
        ▼                                           ▼
┌──────────────────┐                    ┌──────────────────────┐
│   Raw SQL Path   │                    │   Sequelize Path     │
│   (Existing)     │                    │   (New - Optional)   │
└──────────────────┘                    └──────────────────────┘
        │                                           │
        │                                           │
        ▼                                           ▼
┌──────────────────┐                    ┌──────────────────────┐
│  models/         │                    │  database/models/    │
│  - User.js       │                    │  - index.js          │
│  - Seller.js     │                    │  - User.sequelize.js │
│  - NGO.js        │                    │  - Seller.sequelize  │
│  - Order.js      │                    │  - Product.sequelize │
│  - Donation.js   │                    │  - Order.sequelize   │
│  - Swap.js       │                    │  - etc...            │
└──────────────────┘                    └──────────────────────┘
        │                                           │
        │                                           │
        ▼                                           ▼
┌──────────────────┐                    ┌──────────────────────┐
│ config/          │                    │ config/              │
│ database.js      │                    │ sequelize.js         │
│ (mysql2 pool)    │                    │ (Sequelize instance) │
└──────────────────┘                    └──────────────────────┘
        │                                           │
        └─────────────────────┬─────────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │   MySQL Database │
                    │  marketplace_db  │
                    └──────────────────┘
```

## Database Schema

```
┌─────────────┐
│    users    │──┐
└─────────────┘  │
                 │ 1:1
                 ├──────────┐
                 │          │
                 ▼          ▼
         ┌──────────┐  ┌──────────┐
         │ sellers  │  │   ngos   │
         └──────────┘  └──────────┘
              │             │
              │ 1:N         │ 1:N
              ▼             ▼
         ┌──────────┐  ┌──────────┐
         │ products │  │donations │
         └──────────┘  └──────────┘
              │
              │ 1:N
              ▼
    ┌──────────────────┐
    │ product_images   │
    └──────────────────┘

┌─────────────┐
│   orders    │──┐
└─────────────┘  │ 1:N
                 ▼
         ┌──────────────┐
         │ order_items  │
         └──────────────┘

┌──────────────────┐
│ product_swaps    │
└──────────────────┘

┌──────────────────┐
│    reviews       │
└──────────────────┘

┌──────────────────┐
│  notifications   │
└──────────────────┘

┌──────────────────┐
│   admin_logs     │
└──────────────────┘

┌──────────────────┐
│   categories     │──┐
└──────────────────┘  │ self-referencing
                      │ (parent_id)
                      └──┐
```

## Model Associations Map

```
User
├── hasOne: Seller (as 'sellerProfile')
├── hasOne: NGO (as 'ngoProfile')
├── hasMany: Order (as 'orders')
├── hasMany: Notification (as 'notifications')
└── hasMany: AdminLog (as 'adminLogs')

Seller
├── belongsTo: User (as 'user')
├── hasMany: Product (as 'products')
├── hasMany: OrderItem (as 'orderItems')
└── hasMany: Review (as 'reviews')

NGO
├── belongsTo: User (as 'user')
└── hasMany: Donation (as 'donations')

Product
├── belongsTo: Seller (as 'seller')
├── belongsTo: Category (as 'category')
├── hasMany: ProductImage (as 'images')
├── hasMany: OrderItem (as 'orderItems')
├── hasMany: Review (as 'reviews')
└── hasMany: Donation (as 'donations')

Order
├── belongsTo: User (as 'buyer')
└── hasMany: OrderItem (as 'items')

OrderItem
├── belongsTo: Order (as 'order')
├── belongsTo: Product (as 'product')
└── belongsTo: Seller (as 'seller')

Donation
├── belongsTo: User (as 'donor')
├── belongsTo: NGO (as 'ngo')
└── belongsTo: Product (as 'product')

ProductSwap
├── belongsTo: User (as 'requester')
├── belongsTo: User (as 'owner')
├── belongsTo: Product (as 'requesterProduct')
└── belongsTo: Product (as 'ownerProduct')

Category
├── hasMany: Category (as 'subcategories')
├── belongsTo: Category (as 'parent')
└── hasMany: Product (as 'products')
```

## Request Flow Examples

### Example 1: User Registration (Using Raw SQL)
```
Client Request
    │
    ▼
routes/auth.js (POST /signup)
    │
    ▼
models/User.js (User.create)
    │
    ▼
config/database.js (mysql2 pool)
    │
    ▼
MySQL Database
    │
    ▼
Response to Client
```

### Example 2: Get Order with Items (Using Sequelize)
```
Client Request
    │
    ▼
routes/orders.js (GET /orders/:id)
    │
    ▼
database/models/index.js (Order.findByPk with include)
    │
    ▼
config/sequelize.js (Sequelize instance)
    │
    ▼
MySQL Database (automatic JOIN)
    │
    ▼
Response to Client (nested JSON)
```

## File Organization

```
backend/
│
├── config/
│   ├── database.js          # Raw SQL connection (mysql2)
│   └── sequelize.js         # Sequelize ORM connection
│
├── database/
│   ├── models/              # Sequelize models
│   │   ├── index.js         # Model registry + associations
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
│   │
│   ├── schema.sql           # Database schema
│   ├── seed.sql             # Sample data
│   ├── SEQUELIZE_SETUP.md   # Documentation
│   └── MIGRATION_EXAMPLES.md # Migration guide
│
├── models/                  # Raw SQL models (existing)
│   ├── User.js
│   ├── Seller.js
│   ├── NGO.js
│   ├── Order.js
│   ├── Donation.js
│   ├── Swap.js
│   └── Product.js (empty)
│
├── routes/
│   ├── auth.js              # Authentication routes
│   ├── products.js          # Product routes
│   └── swaps.js             # Swap routes
│
├── middleware/
│   └── auth.js              # JWT authentication
│
├── server.js                # Express server + Sequelize init
├── test-sequelize.js        # Sequelize test script
└── package.json             # Dependencies
```

## Data Flow Comparison

### Raw SQL Approach
```
Route Handler
    ↓
Model Class (static method)
    ↓
db.query('SELECT ...', [params])
    ↓
mysql2 pool
    ↓
MySQL Database
    ↓
[rows] array
    ↓
Manual data transformation
    ↓
Response
```

### Sequelize Approach
```
Route Handler
    ↓
Model.findAll({ where, include })
    ↓
Sequelize ORM
    ↓
Automatic SQL generation
    ↓
mysql2 (reused)
    ↓
MySQL Database
    ↓
Model instances (objects)
    ↓
Automatic data transformation
    ↓
Response (nested JSON)
```

## Migration Path

```
┌─────────────────────────────────────────────────────────┐
│ Phase 1: Coexistence (Current)                          │
│ ✅ Both approaches work                                  │
│ ✅ No breaking changes                                   │
│ ✅ New features can use Sequelize                        │
└─────────────────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────┐
│ Phase 2: Gradual Migration                              │
│ 🔄 Migrate one model at a time                          │
│ 🔄 Update routes incrementally                          │
│ 🔄 Test thoroughly                                       │
└─────────────────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────┐
│ Phase 3: Complete Migration                             │
│ ✅ All routes use Sequelize                             │
│ ✅ Remove raw SQL models                                │
│ ✅ Full ORM benefits                                     │
└─────────────────────────────────────────────────────────┘
```

## Key Benefits Visualization

```
Raw SQL                          Sequelize ORM
─────────────────────────────────────────────────────────
Manual SQL strings          →    Automatic query building
Manual JOIN syntax          →    include: [{ model }]
Manual parameter binding    →    Automatic escaping
Manual result mapping       →    Model instances
No type safety              →    Better IDE support
Complex nested queries      →    Simple nested includes
Manual transaction mgmt     →    sequelize.transaction()
No validation               →    Built-in validators
Hard to test                →    Easy to mock
```

## Connection Pooling

```
┌──────────────────────────────────────────┐
│         Application Layer                │
│  (Multiple concurrent requests)          │
└──────────────────────────────────────────┘
                │
                ▼
┌──────────────────────────────────────────┐
│         Connection Pool                  │
│  ┌────┐ ┌────┐ ┌────┐ ... ┌────┐       │
│  │ C1 │ │ C2 │ │ C3 │     │C10 │       │
│  └────┘ └────┘ └────┘     └────┘       │
│  (Max 10 connections)                   │
└──────────────────────────────────────────┘
                │
                ▼
┌──────────────────────────────────────────┐
│         MySQL Database                   │
│         marketplace_db                   │
└──────────────────────────────────────────┘
```

Both raw SQL (mysql2) and Sequelize share the same connection pool configuration for optimal resource usage.
