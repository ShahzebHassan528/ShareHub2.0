/**
 * Test /my endpoint with user 2 token
 */

require('dotenv').config();
const axios = require('axios');

async function testMyEndpoint() {
  try {
    console.log('🧪 Testing /my endpoint for User 2...\n');

    // Login as user 2
    console.log('1️⃣ Logging in as buyer1@example.com...');
    const loginRes = await axios.post('http://localhost:5000/api/v1/auth/login', {
      email: 'buyer1@example.com',
      password: 'password123'
    });

    const token = loginRes.data.token;
    const user = loginRes.data.user;
    console.log('✅ Logged in:', user.full_name, '(ID:', user.id, ')');

    // Call /my endpoint
    console.log('\n2️⃣ Calling GET /api/v1/products/my...');
    const myRes = await axios.get('http://localhost:5000/api/v1/products/my', {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log('✅ Response received:');
    console.log('   Status:', myRes.status);
    console.log('   Success:', myRes.data.success);
    console.log('   Count:', myRes.data.count);
    console.log('   Products:', myRes.data.products?.length || 0);

    if (myRes.data.products && myRes.data.products.length > 0) {
      console.log('\n📦 Products:');
      myRes.data.products.forEach(p => {
        console.log(`   - ${p.title} (ID: ${p.id}, Price: Rs. ${p.price})`);
      });
    } else {
      console.log('\n⚠️  No products returned!');
    }

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

testMyEndpoint();
