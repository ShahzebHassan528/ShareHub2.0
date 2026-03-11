/**
 * Test Frontend Login Flow
 * This simulates what the frontend does when logging in
 */

const axios = require('axios');

async function testFrontendLogin() {
  console.log('🧪 Testing Frontend Login Flow\n');
  
  const credentials = {
    email: 'admin@marketplace.com',
    password: 'admin123'
  };
  
  console.log('📍 Testing through Vite proxy: http://localhost:3000/api/auth/signin');
  console.log('📧 Email:', credentials.email);
  console.log('🔑 Password:', credentials.password);
  console.log('');
  
  try {
    // Test through Vite proxy (simulating frontend)
    const response = await axios.post('http://localhost:3000/api/auth/signin', credentials, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Login successful through Vite proxy!\n');
    console.log('📋 Response:');
    console.log(JSON.stringify(response.data, null, 2));
    console.log('');
    console.log('🎉 Frontend login is working correctly!');
    
  } catch (error) {
    console.error('❌ Login failed!\n');
    
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else if (error.request) {
      console.error('No response received from server');
      console.error('Error:', error.message);
    } else {
      console.error('Error:', error.message);
    }
  }
}

testFrontendLogin();
