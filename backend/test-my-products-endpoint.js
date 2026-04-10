/**
 * Test the /api/v1/products/my endpoint
 */

require('dotenv').config();
const axios = require('axios');

async function testMyProductsEndpoint() {
  try {
    console.log('🧪 Testing /api/v1/products/my endpoint...\n');

    // First, login as John Doe to get token
    console.log('1️⃣ Logging in as John Doe...');
    const loginResponse = await axios.post('http://localhost:5000/api/v1/auth/login', {
      email: 'john@example.com',
      password: 'password123'
    });

    const token = loginResponse.data.token;
    const user = loginResponse.data.user;
    console.log('✅ Logged in as:', user.full_name, '(ID:', user.id, ')');
    console.log('   Token:', token.substring(0, 20) + '...\n');

    // Now call /my endpoint
    console.log('2️⃣ Calling GET /api/v1/products/my...');
    const myProductsResponse = await axios.get('http://localhost:5000/api/v1/products/my', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    console.log('✅ Response received:');
    console.log('   Status:', myProductsResponse.status);
    console.log('   Success:', myProductsResponse.data.success);
    console.log('   Count:', myProductsResponse.data.count);
    console.log('   Products:', myProductsResponse.data.products?.length || 0);
    
    if (myProductsResponse.data.products && myProductsResponse.data.products.length > 0) {
      console.log('\n📦 Products returned:');
      myProductsResponse.data.products.forEach(p => {
        console.log(`   - ${p.title} (ID: ${p.id}, Seller ID: ${p.seller_id})`);
      });
    }

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

testMyProductsEndpoint();
