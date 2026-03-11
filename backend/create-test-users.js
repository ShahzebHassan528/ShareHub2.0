const bcrypt = require('bcrypt');
require('dotenv').config();

// Use Sequelize for database operations
const { sequelize } = require('./config/sequelize');
const { User, Seller, NGO } = require('./database/models');

async function createTestUsers() {
  try {
    console.log('🔌 Connecting to database...');
    await sequelize.authenticate();
    console.log('✅ Database connected!\n');
    
    console.log('Creating test users with proper password hashes...\n');

    // Hash passwords
    const adminHash = await bcrypt.hash('admin123', 10);
    const buyerHash = await bcrypt.hash('buyer123', 10);
    const sellerHash = await bcrypt.hash('seller123', 10);
    const ngoHash = await bcrypt.hash('ngo123', 10);

    // Clear existing test users (disable foreign key checks temporarily)
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 0');
    
    // Delete related records first
    await sequelize.query('DELETE FROM sellers WHERE user_id IN (SELECT id FROM users WHERE email IN (?, ?, ?, ?, ?, ?, ?))', {
      replacements: ['admin@marketplace.com', 'buyer1@example.com', 'buyer2@example.com', 
                     'seller1@example.com', 'seller2@example.com', 'ngo1@example.com', 'ngo2@example.com']
    });
    
    await sequelize.query('DELETE FROM ngos WHERE user_id IN (SELECT id FROM users WHERE email IN (?, ?, ?, ?, ?, ?, ?))', {
      replacements: ['admin@marketplace.com', 'buyer1@example.com', 'buyer2@example.com', 
                     'seller1@example.com', 'seller2@example.com', 'ngo1@example.com', 'ngo2@example.com']
    });
    
    await User.destroy({ 
      where: { 
        email: ['admin@marketplace.com', 'buyer1@example.com', 'buyer2@example.com', 
                'seller1@example.com', 'seller2@example.com', 'ngo1@example.com', 'ngo2@example.com']
      },
      force: true
    });
    
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
    console.log('✓ Cleared existing test users');

    // Insert Admin
    const admin = await User.create({
      email: 'admin@marketplace.com',
      password: adminHash,
      full_name: 'Admin User',
      phone: '1234567890',
      role: 'admin',
      is_active: true,
      is_verified: true
    });
    console.log('✓ Created Admin: admin@marketplace.com / admin123');

    // Insert Buyers
    await User.create({
      email: 'buyer1@example.com',
      password: buyerHash,
      full_name: 'John Doe',
      phone: '9876543210',
      role: 'buyer',
      is_active: true,
      is_verified: true
    });
    console.log('✓ Created Buyer 1: buyer1@example.com / buyer123');

    await User.create({
      email: 'buyer2@example.com',
      password: buyerHash,
      full_name: 'Jane Smith',
      phone: '9876543211',
      role: 'buyer',
      is_active: true,
      is_verified: true
    });
    console.log('✓ Created Buyer 2: buyer2@example.com / buyer123');

    // Insert Sellers
    const seller1 = await User.create({
      email: 'seller1@example.com',
      password: sellerHash,
      full_name: 'Tech Store Owner',
      phone: '9876543212',
      role: 'seller',
      is_active: true,
      is_verified: true
    });
    
    await Seller.create({
      user_id: seller1.id,
      business_name: 'Tech Store',
      business_address: '123 Main St, City',
      business_license: 'LIC123456',
      approval_status: 'approved',
      approved_by: admin.id,
      approved_at: new Date()
    });
    console.log('✓ Created Seller 1 (Approved): seller1@example.com / seller123');

    const seller2 = await User.create({
      email: 'seller2@example.com',
      password: sellerHash,
      full_name: 'Fashion Hub Owner',
      phone: '9876543213',
      role: 'seller',
      is_active: true,
      is_verified: false
    });
    
    await Seller.create({
      user_id: seller2.id,
      business_name: 'Fashion Hub',
      business_address: '456 Market Rd, Town',
      business_license: 'LIC789012',
      approval_status: 'pending'
    });
    console.log('✓ Created Seller 2 (Pending): seller2@example.com / seller123');

    // Insert NGOs
    const ngo1 = await User.create({
      email: 'ngo1@example.com',
      password: ngoHash,
      full_name: 'Help Foundation',
      phone: '9876543214',
      role: 'ngo',
      is_active: true,
      is_verified: true
    });
    
    await NGO.create({
      user_id: ngo1.id,
      ngo_name: 'Help Foundation',
      registration_number: 'NGO123456',
      address: '789 Charity Lane, City',
      verification_status: 'verified',
      verified_by: admin.id,
      verified_at: new Date()
    });
    console.log('✓ Created NGO 1 (Verified): ngo1@example.com / ngo123');

    const ngo2 = await User.create({
      email: 'ngo2@example.com',
      password: ngoHash,
      full_name: 'Care Society',
      phone: '9876543215',
      role: 'ngo',
      is_active: true,
      is_verified: false
    });
    
    await NGO.create({
      user_id: ngo2.id,
      ngo_name: 'Care Society',
      registration_number: 'NGO789012',
      address: '321 Service St, Town',
      verification_status: 'pending'
    });
    console.log('✓ Created NGO 2 (Pending): ngo2@example.com / ngo123');

    console.log('\n✅ All test users created successfully!');
    console.log('\n📋 Login Credentials:');
    console.log('═'.repeat(50));
    console.log('\n🔑 ADMIN:');
    console.log('   Email: admin@marketplace.com');
    console.log('   Password: admin123');
    console.log('\n👤 BUYERS:');
    console.log('   Email: buyer1@example.com | Password: buyer123');
    console.log('   Email: buyer2@example.com | Password: buyer123');
    console.log('\n🏪 SELLERS:');
    console.log('   Email: seller1@example.com | Password: seller123 (Approved)');
    console.log('   Email: seller2@example.com | Password: seller123 (Pending)');
    console.log('\n🏥 NGOs:');
    console.log('   Email: ngo1@example.com | Password: ngo123 (Verified)');
    console.log('   Email: ngo2@example.com | Password: ngo123 (Pending)');
    console.log('\n' + '═'.repeat(50) + '\n');

  } catch (error) {
    console.error('❌ Error creating test users:', error.message);
    if (error.original) {
      console.error('   SQL Error:', error.original.message);
    }
  } finally {
    await sequelize.close();
    process.exit(0);
  }
}

createTestUsers();
