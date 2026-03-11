/**
 * Test Login API - Simple Script
 * Run: node test-login-browser.js
 */

require('dotenv').config();

async function testLogin() {
  console.log('');
  console.log('='.repeat(60));
  console.log('🔐 TESTING LOGIN API');
  console.log('='.repeat(60));
  console.log('');

  const testUsers = [
    {
      email: 'admin@marketplace.com',
      password: 'admin123',
      role: 'Admin'
    },
    {
      email: 'ngo1@example.com',
      password: 'ngo123',
      role: 'NGO'
    }
  ];

  for (const user of testUsers) {
    console.log(`\n📧 Testing ${user.role}: ${user.email}`);
    console.log('-'.repeat(60));

    try {
      const response = await fetch('http://localhost:5000/api/v1/auth/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: user.email,
          password: user.password
        })
      });

      const data = await response.json();

      if (response.ok) {
        console.log('✅ Login Successful!');
        console.log('   User ID:', data.user.id);
        console.log('   Name:', data.user.name);
        console.log('   Email:', data.user.email);
        console.log('   Role:', data.user.role);
        console.log('   Token:', data.token.substring(0, 30) + '...');
      } else {
        console.log('❌ Login Failed!');
        console.log('   Error:', data.error || data.message);
      }
    } catch (error) {
      console.log('❌ Request Failed!');
      console.log('   Error:', error.message);
    }
  }

  console.log('');
  console.log('='.repeat(60));
  console.log('✅ TEST COMPLETE');
  console.log('='.repeat(60));
  console.log('');
}

// Wait for server to start
setTimeout(() => {
  testLogin().catch(console.error);
}, 3000);
