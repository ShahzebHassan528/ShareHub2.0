# Migration Examples: Raw SQL to Sequelize

This document shows side-by-side comparisons of raw SQL vs Sequelize implementations to help with migration.

## Example 1: User Model

### Raw SQL (Current - models/User.js)
```javascript
const db = require('../config/database');

class User {
  static async create(userData) {
    const [result] = await db.query(
      'INSERT INTO users (email, password, full_name, phone, role, is_verified) VALUES (?, ?, ?, ?, ?, ?)',
      [userData.email, userData.password, userData.full_name, userData.phone, userData.role, userData.is_verified || false]
    );
    return result.insertId;
  }

  static async findByEmail(email) {
    const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    return rows[0];
  }

  static async findById(id) {
    const [rows] = await db.query('SELECT * FROM users WHERE id = ?', [id]);
    return rows[0];
  }
}
```

### Sequelize (New)
```javascript
const { User } = require('../database/models');

// Create
const userId = await User.create({
  email: userData.email,
  password: userData.password,
  full_name: userData.full_name,
  phone: userData.phone,
  role: userData.role,
  is_verified: userData.is_verified || false
});
// Returns the full user object, access id with: userId.id

// Find by email
const user = await User.findOne({ where: { email } });

// Find by ID
const user = await User.findByPk(id);
```

## Example 2: Seller Model with Joins

### Raw SQL (Current - models/Seller.js)
```javascript
static async findPending() {
  const [rows] = await db.query(
    `SELECT s.*, u.email, u.full_name, u.phone 
     FROM sellers s
     JOIN users u ON s.user_id = u.id
     WHERE s.approval_status = 'pending'
     ORDER BY s.created_at DESC`
  );
  return rows;
}
```

### Sequelize (New)
```javascript
const { Seller, User } = require('../database/models');

const pendingSellers = await Seller.findAll({
  where: { approval_status: 'pending' },
  include: [{
    model: User,
    as: 'user',
    attributes: ['email', 'full_name', 'phone']
  }],
  order: [['created_at', 'DESC']]
});

// Access data: pendingSellers[0].user.email
```

## Example 3: Donation Model with Multiple Joins

### Raw SQL (Current - models/Donation.js)
```javascript
static async findByDonor(donorId) {
  const [rows] = await db.query(
    `SELECT d.*, n.ngo_name, p.title as product_title, p.product_condition
     FROM donations d
     JOIN ngos n ON d.ngo_id = n.id
     JOIN products p ON d.product_id = p.id
     WHERE d.donor_id = ?
     ORDER BY d.created_at DESC`,
    [donorId]
  );
  return rows;
}
```

### Sequelize (New)
```javascript
const { Donation, NGO, Product } = require('../database/models');

const donations = await Donation.findAll({
  where: { donor_id: donorId },
  include: [
    {
      model: NGO,
      as: 'ngo',
      attributes: ['ngo_name']
    },
    {
      model: Product,
      as: 'product',
      attributes: ['title', 'product_condition']
    }
  ],
  order: [['created_at', 'DESC']]
});

// Access data: 
// donations[0].ngo.ngo_name
// donations[0].product.title
```

## Example 4: Order with Nested Relationships

### Raw SQL (Current - models/Order.js)
```javascript
static async findById(orderId) {
  const [orders] = await db.query('SELECT * FROM orders WHERE id = ?', [orderId]);
  if (orders.length === 0) return null;

  const [items] = await db.query(
    `SELECT oi.*, p.title, s.business_name 
     FROM order_items oi
     JOIN products p ON oi.product_id = p.id
     JOIN sellers s ON oi.seller_id = s.id
     WHERE oi.order_id = ?`,
    [orderId]
  );

  return { ...orders[0], items };
}
```

### Sequelize (New)
```javascript
const { Order, OrderItem, Product, Seller } = require('../database/models');

const order = await Order.findByPk(orderId, {
  include: [{
    model: OrderItem,
    as: 'items',
    include: [
      { model: Product, as: 'product', attributes: ['title'] },
      { model: Seller, as: 'seller', attributes: ['business_name'] }
    ]
  }]
});

// Access data:
// order.items[0].product.title
// order.items[0].seller.business_name
```

## Example 5: Complex Swap Query with Subqueries

### Raw SQL (Current - models/Swap.js)
```javascript
static async findAll(filters = {}) {
  let query = `
    SELECT ps.*, 
           p.title as item_title, p.description, p.product_condition,
           c.name as category_name,
           u.full_name as owner_name,
           (SELECT image_url FROM product_images WHERE product_id = p.id AND is_primary = TRUE LIMIT 1) as primary_image,
           (SELECT COUNT(*) FROM product_swaps WHERE owner_id = ps.owner_id AND status = 'completed') as successful_swaps
    FROM product_swaps ps
    LEFT JOIN products p ON ps.owner_product_id = p.id
    LEFT JOIN categories c ON p.category_id = c.id
    LEFT JOIN users u ON ps.owner_id = u.id
    WHERE ps.status = 'pending'
  `;
  
  const params = [];
  
  if (filters.category) {
    query += ' AND c.name = ?';
    params.push(filters.category);
  }
  
  if (filters.condition) {
    query += ' AND p.product_condition = ?';
    params.push(filters.condition);
  }
  
  query += ' ORDER BY ps.created_at DESC';
  
  const [rows] = await db.query(query, params);
  return rows;
}
```

### Sequelize (New)
```javascript
const { ProductSwap, Product, Category, User, ProductImage } = require('../database/models');
const { Op } = require('sequelize');

const whereClause = { status: 'pending' };

const swaps = await ProductSwap.findAll({
  where: whereClause,
  include: [
    {
      model: Product,
      as: 'ownerProduct',
      attributes: ['title', 'description', 'product_condition'],
      include: [
        { 
          model: Category, 
          as: 'category',
          attributes: ['name'],
          where: filters.category ? { name: filters.category } : undefined
        },
        {
          model: ProductImage,
          as: 'images',
          where: { is_primary: true },
          attributes: ['image_url'],
          required: false,
          limit: 1
        }
      ],
      where: filters.condition ? { product_condition: filters.condition } : undefined
    },
    {
      model: User,
      as: 'owner',
      attributes: ['full_name']
    }
  ],
  order: [['created_at', 'DESC']]
});

// For successful_swaps count, you can either:
// 1. Add it as a virtual field in the model
// 2. Use a separate query
// 3. Use raw attributes with subquery
```

## Example 6: Update Operations

### Raw SQL (Current)
```javascript
static async approve(sellerId, adminId) {
  await db.query(
    `UPDATE sellers SET approval_status = 'approved', approved_by = ?, approved_at = NOW() 
     WHERE id = ?`,
    [adminId, sellerId]
  );
}
```

### Sequelize (New)
```javascript
const { Seller } = require('../database/models');

await Seller.update(
  { 
    approval_status: 'approved',
    approved_by: adminId,
    approved_at: new Date()
  },
  { where: { id: sellerId } }
);
```

## Example 7: Transactions (Order Creation)

### Raw SQL (Current - models/Order.js)
```javascript
static async create(orderData) {
  const orderNumber = 'ORD' + Date.now();
  const [result] = await db.query(
    `INSERT INTO orders (buyer_id, order_number, total_amount, shipping_address, notes) 
     VALUES (?, ?, ?, ?, ?)`,
    [orderData.buyer_id, orderNumber, orderData.total_amount, orderData.shipping_address, orderData.notes]
  );
  return { orderId: result.insertId, orderNumber };
}

static async addItem(orderItem) {
  await db.query(
    `INSERT INTO order_items (order_id, product_id, seller_id, quantity, price, product_condition) 
     VALUES (?, ?, ?, ?, ?, ?)`,
    [orderItem.order_id, orderItem.product_id, orderItem.seller_id, orderItem.quantity, orderItem.price, orderItem.product_condition]
  );
}
```

### Sequelize with Transaction (New)
```javascript
const { sequelize, Order, OrderItem } = require('../database/models');

const result = await sequelize.transaction(async (t) => {
  const orderNumber = 'ORD' + Date.now();
  
  const order = await Order.create({
    buyer_id: orderData.buyer_id,
    order_number: orderNumber,
    total_amount: orderData.total_amount,
    shipping_address: orderData.shipping_address,
    notes: orderData.notes
  }, { transaction: t });

  await OrderItem.create({
    order_id: order.id,
    product_id: orderItem.product_id,
    seller_id: orderItem.seller_id,
    quantity: orderItem.quantity,
    price: orderItem.price,
    product_condition: orderItem.product_condition
  }, { transaction: t });

  return { orderId: order.id, orderNumber };
});
```

## Migration Checklist for Each Model

- [ ] Import Sequelize models instead of raw db connection
- [ ] Replace `db.query()` with Sequelize methods
- [ ] Convert WHERE clauses to `where` objects
- [ ] Convert JOINs to `include` arrays
- [ ] Update field access (flat object vs nested objects)
- [ ] Test all methods thoroughly
- [ ] Update route handlers if needed
- [ ] Keep raw SQL version commented out initially
- [ ] Remove raw SQL after confirming Sequelize works

## Common Patterns

### Operators
```javascript
const { Op } = require('sequelize');

// WHERE price <= 100
{ price: { [Op.lte]: 100 } }

// WHERE status IN ('pending', 'approved')
{ status: { [Op.in]: ['pending', 'approved'] } }

// WHERE name LIKE '%search%'
{ name: { [Op.like]: '%search%' } }

// WHERE created_at > '2024-01-01'
{ created_at: { [Op.gt]: new Date('2024-01-01') } }
```

### Pagination
```javascript
const limit = 10;
const offset = (page - 1) * limit;

const products = await Product.findAndCountAll({
  limit,
  offset,
  order: [['created_at', 'DESC']]
});

// products.count = total count
// products.rows = actual data
```

### Attributes Selection
```javascript
// Select specific fields
await User.findAll({
  attributes: ['id', 'email', 'full_name']
});

// Exclude fields
await User.findAll({
  attributes: { exclude: ['password'] }
});
```
