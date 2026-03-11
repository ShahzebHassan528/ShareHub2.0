const axios = require('axios');

async function testLogin() {
  console.log('Testing login with exact credentials...\n');
  
  try {
    const response = await axios.post('http://localhost:5000/api/auth/signin', {
      email: 'admin@marketplace.com',
      password: 'admin123'
    }, {
      validateStatus: () => true
    });
    
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.error('Error:', error.message);
  }
  
  process.exit(0);
}

testLogin();
