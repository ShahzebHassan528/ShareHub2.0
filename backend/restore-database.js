const { Sequelize } = require('sequelize');
const bcrypt = require('bcryptjs');

// Database connection
const sequelize = new Sequelize('marketplace_db', 'root', '', {
  host: '127.0.0.1',
  port: 3306,
  dialect: 'mysql',
  logging: console.log
});

async function restoreDatabase() {
  try {
    console.log('🔄 Starting database restoration...\n');

    // Test connection
    await sequelize.authenticate();
    console.log('✅ Database connected\n');

    // Import models
    const models = require('./database/models');
    
    // Force sync (recreate all tables)
    console.log('🔄 Recreating all tables...');
    await sequelize.sync({ force: true });
    console.log('✅ All tables created successfully!\n');

    // Create sample data
    console.log('📝 Creating sample data...\n');

    // 1. Create Admin User
    const adminPassword = await bcrypt.hash('admin123', 10);
    const admin = await models.User.create({
      full_name: 'Admin User',
      email: 'admin@marketplace.com',
      password: adminPassword,
      role: 'admin',
      phone: '03001234567',
      address: 'Lahore, Pakistan',
      is_verified: true
    });
    console.log('✅ Admin user created');

    // 2. Create Seller User
    const sellerPassword = await bcrypt.hash('seller123', 10);
    const seller = await models.User.create({
      full_name: 'Test Seller',
      email: 'seller@test.com',
      password: sellerPassword,
      role: 'seller',
      phone: '03001234568',
      address: 'Karachi, Pakistan',
      is_verified: true
    });
    console.log('✅ Seller user created');

    // 3. Create Seller Profile
    await models.Seller.create({
      user_id: seller.id,
      business_name: 'Test Shop',
      business_address: 'Karachi, Pakistan',
      cnic: '12345-1234567-1',
      is_verified: true
    });
    console.log('✅ Seller profile created');

    // 4. Create NGO User
    const ngoPassword = await bcrypt.hash('ngo123', 10);
    const ngoUser = await models.User.create({
      full_name: 'Help Foundation',
      email: 'ngo1@example.com',
      password: ngoPassword,
      role: 'ngo',
      phone: '03001234569',
      address: 'Islamabad, Pakistan',
      is_verified: true
    });
    console.log('✅ NGO user created');

    // 5. Create NGO Profile
    await models.NGO.create({
      user_id: ngoUser.id,
      ngo_name: 'Help Foundation',
      registration_number: 'NGO-2024-001',
      description: 'Supporting underprivileged children',
      address: 'Islamabad, Pakistan',
      phone: '03001234569',
      is_verified: true,
      verification_status: 'approved'
    });
    console.log('✅ NGO profile created');

    // 6. Create Categories
    const categories = [
      { name: 'Electronics', description: 'Electronic items and gadgets' },
      { name: 'Clothing', description: 'Clothes and fashion items' },
      { name: 'Furniture', description: 'Home and office furniture' },
      { name: 'Books', description: 'Books and educational material' },
      { name: 'Others', description: 'Other miscellaneous items' }
    ];

    for (const cat of categories) {
      await models.Category.create(cat);
    }
    console.log('✅ Categories created');

    // 7. Create Sample Products
    const products = [
      {
        seller_id: seller.id,
        title: 'iPhone 13 Pro',
        description: 'Excellent condition, 256GB',
        price: 150000,
        category: 'Electronics',
        condition: 'used',
        location: 'Karachi',
        product_status: 'approved',
        is_available: true
      },
      {
        seller_id: seller.id,
        title: 'Wooden Study Table',
        description: 'Solid wood, good condition',
        price: 8000,
        category: 'Furniture',
        condition: 'used',
        location: 'Karachi',
        product_status: 'approved',
        is_available: true
      },
      {
        seller_id: seller.id,
        title: 'Winter Jacket',
        description: 'Brand new, size L',
        price: 3500,
        category: 'Clothing',
        condition: 'new',
        location: 'Karachi',
        product_status: 'approved',
        is_available: true
      }
    ];

    for (const prod of products) {
      await models.Product.create(prod);
    }
    console.log('✅ Sample products created');

    console.log('\n✅ Database restoration completed successfully!');
    console.log('\n📋 Login Credentials:');
    console.log('   Admin: admin@marketplace.com / admin123');
    console.log('   Seller: seller@test.com / seller123');
    console.log('   NGO: ngo1@example.com / ngo123');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

restoreDatabase();
