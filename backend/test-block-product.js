const axios = require('axios');

async function testBlockProduct() {
  try {
    // First login as admin
    console.log('1. Logging in as admin...');
    const loginRes = await axios.post('http://localhost:5000/api/v1/auth/login', {
      email: 'admin@sharehub.com',
      password: 'admin123'
    });
    
    const token = loginRes.data.token;
    console.log('✓ Login successful');
    console.log('Token:', token.substring(0, 30) + '...');
    
    // Try to block product 17
    console.log('\n2. Attempting to block product 17...');
    console.log('URL: http://localhost:5000/api/v1/admin/products/remove/17');
    console.log('Body:', JSON.stringify({ reason: 'Test blocking from script' }));
    console.log('Headers:', { Authorization: `Bearer ${token.substring(0, 20)}...` });
    
    const blockRes = await axios.put(
      'http://localhost:5000/api/v1/admin/products/remove/17',
      { reason: 'Test blocking from script' },
      { 
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        } 
      }
    );
    
    console.log('\n✓ Block successful!');
    console.log('Response:', JSON.stringify(blockRes.data, null, 2));
    
  } catch (error) {
    console.error('\n✗ Error occurred!');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Status Text:', error.response.statusText);
      console.error('Response Data:', JSON.stringify(error.response.data, null, 2));
      console.error('Response Headers:', error.response.headers);
    } else {
      console.error('Error Message:', error.message);
    }
  }
}

testBlockProduct();
