const bcrypt = require('bcrypt');
require('dotenv').config();

const { User } = require('./database/models');
const { sequelize } = require('./config/sequelize');

async function testPassword() {
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
    
    console.log('📋 Admin User Found:');
    console.log('   Email:', admin.email);
    console.log('   Password Hash:', admin.password.substring(0, 20) + '...');
    console.log('');
    
    // Test password
    const testPassword = 'admin123';
    console.log('🔐 Testing password:', testPassword);
    
    const isMatch = await bcrypt.compare(testPassword, admin.password);
    
    if (isMatch) {
      console.log('✅ Password matches!');
    } else {
      console.log('❌ Password does NOT match!');
      console.log('');
      console.log('🔧 Creating new hash for admin123...');
      const newHash = await bcrypt.hash('admin123', 10);
      console.log('   New Hash:', newHash.substring(0, 20) + '...');
      
      // Update password
      await User.update(
        { password: newHash },
        { where: { email: 'admin@marketplace.com' } }
      );
      console.log('✅ Password updated in database!');
      console.log('');
      console.log('🔄 Testing again...');
      
      const isMatchNow = await bcrypt.compare('admin123', newHash);
      console.log(isMatchNow ? '✅ Now it matches!' : '❌ Still not matching');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await sequelize.close();
    process.exit(0);
  }
}

testPassword();
