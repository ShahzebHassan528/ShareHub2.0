/**
 * Test password verification
 */

require('dotenv').config();
const bcrypt = require('bcrypt');
const { User } = require('./database/models');

async function testPassword() {
  try {
    const email = 'admin@marketplace.com';
    const testPasswords = ['password123', 'admin123', 'admin', 'password'];

    console.log(`\n🔐 Testing passwords for: ${email}\n`);

    // Get user from database
    const user = await User.findOne({ where: { email }, raw: true });
    
    if (!user) {
      console.log('❌ User not found!');
      return;
    }

    console.log('✅ User found:', user.full_name);
    console.log('📧 Email:', user.email);
    console.log('🔑 Stored hash:', user.password.substring(0, 30) + '...\n');

    // Test each password
    for (const password of testPasswords) {
      const isMatch = await bcrypt.compare(password, user.password);
      console.log(`${isMatch ? '✅' : '❌'} Password "${password}": ${isMatch ? 'CORRECT' : 'wrong'}`);
    }

    console.log('\n💡 Try these passwords in Postman!\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    process.exit(0);
  }
}

testPassword();
