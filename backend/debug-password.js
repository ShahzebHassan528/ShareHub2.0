const bcrypt = require('bcrypt');
require('dotenv').config();

const { User } = require('./database/models');
const { sequelize } = require('./config/sequelize');

async function debugPassword() {
  try {
    await sequelize.authenticate();
    console.log('✅ Connected to database\n');
    
    // Find admin user
    const admin = await User.findOne({
      where: { email: 'admin@marketplace.com' },
      raw: true
    });
    
    if (!admin) {
      console.log('❌ Admin user not found!');
      return;
    }
    
    console.log('📋 Admin User:');
    console.log('   ID:', admin.id);
    console.log('   Email:', admin.email);
    console.log('   Full Name:', admin.full_name);
    console.log('   Role:', admin.role);
    console.log('   Password Hash Length:', admin.password.length);
    console.log('   Password Hash:', admin.password);
    console.log('');
    
    // Test multiple passwords
    const testPasswords = ['admin123', 'Admin123', 'ADMIN123', 'admin@123'];
    
    console.log('🔐 Testing passwords:');
    console.log('');
    
    for (const pwd of testPasswords) {
      const isMatch = await bcrypt.compare(pwd, admin.password);
      console.log(`   "${pwd}" → ${isMatch ? '✅ MATCH' : '❌ NO MATCH'}`);
    }
    
    console.log('');
    console.log('🔧 Creating fresh hash for "admin123"...');
    const freshHash = await bcrypt.hash('admin123', 10);
    console.log('   Fresh Hash:', freshHash);
    
    const testFresh = await bcrypt.compare('admin123', freshHash);
    console.log('   Test Fresh:', testFresh ? '✅ WORKS' : '❌ BROKEN');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await sequelize.close();
    process.exit(0);
  }
}

debugPassword();
