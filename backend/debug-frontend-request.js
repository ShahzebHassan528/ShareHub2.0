/**
 * DEBUG: Simulate exact frontend request
 */

const axios = require('axios');

async function testFrontendRequest() {
  console.log('🔍 SIMULATING EXACT FRONTEND LOGIN REQUEST\n');
  
  const credentials = {
    email: 'admin@marketplace.com',
    password: 'admin123'
  };
  
  console.log('📍 Request Details:');
  console.log('   URL: http://localhost:3000/api/auth/signin');
  console.log('   Method: POST');
  console.log('   Headers: Content-Type: application/json');
  console.log('   Body:', JSON.stringify(credentials));
  console.log('');
  
  try {
    console.log('⏳ Sending request...\n');
    
    const response = await axios.post('http://localhost:3000/api/auth/signin', credentials, {
      headers: {
        'Content-Type': 'application/json'
      },
      validateStatus: () => true // Don't throw on any status
    });
    
    console.log('📥 RESPONSE RECEIVED:');
    console.log('   Status:', response.status);
    console.log('   Status Text:', response.statusText);
    console.log('');
    console.log('📋 Response Headers:');
    console.log(JSON.stringify(response.headers, null, 2));
    console.log('');
    console.log('📋 Response Body:');
    console.log(JSON.stringify(response.data, null, 2));
    console.log('');
    
    if (response.status === 200) {
      console.log('✅ LOGIN SUCCESSFUL!');
      console.log('   Token received:', response.data.token ? 'YES' : 'NO');
      console.log('   User data:', response.data.user ? 'YES' : 'NO');
    } else {
      console.log('❌ LOGIN FAILED!');
      console.log('   Error:', response.data.error || 'Unknown error');
    }
    
  } catch (error) {
    console.error('❌ REQUEST ERROR:');
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', error.response.data);
    } else if (error.request) {
      console.error('   No response received');
      console.error('   Error:', error.message);
    } else {
      console.error('   Error:', error.message);
    }
  }
  
  process.exit(0);
}

testFrontendRequest();
