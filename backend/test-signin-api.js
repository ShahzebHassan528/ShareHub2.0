const axios = require('axios');

async function testSignin() {
  try {
    console.log('🧪 Testing Signin API\n');
    console.log('📍 URL: http://localhost:5000/api/auth/signin');
    console.log('📧 Email: admin@marketplace.com');
    console.log('🔑 Password: admin123\n');
    
    const response = await axios.post('http://localhost:5000/api/auth/signin', {
      email: 'admin@marketplace.com',
      password: 'admin123'
    });
    
    console.log('✅ Signin successful!');
    console.log('\n📋 Response:');
    console.log(JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.error('❌ Signin failed!');
    
    if (error.response) {
      console.error('\n📋 Error Response:');
      console.error('   Status:', error.response.status);
      console.error('   Data:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error('\n   Error:', error.message);
    }
  }
}

testSignin();
