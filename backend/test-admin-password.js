const axios = require('axios');

async function testPasswords() {
  const passwords = ['password123', 'admin123'];
  
  for (const pwd of passwords) {
    try {
      console.log(`\nTrying password: ${pwd}`);
      const res = await axios.post('http://localhost:5000/api/v1/auth/login', {
        email: 'admin@marketplace.com',
        password: pwd
      });
      console.log(`✓ SUCCESS with password: ${pwd}`);
      console.log(`Token: ${res.data.token.substring(0, 30)}...`);
      break;
    } catch (error) {
      console.log(`✗ FAILED with password: ${pwd}`);
      if (error.response) {
        console.log(`  Error: ${error.response.data.message}`);
      }
    }
  }
}

testPasswords();
