const axios = require('axios');
const fs = require('fs');

async function test() {
  const log = [];
  
  try {
    log.push('Step 1: Login as admin');
    const loginRes = await axios.post('http://localhost:5000/api/v1/auth/login', {
      email: 'admin@marketplace.com',
      password: 'admin123'
    });
    
    const token = loginRes.data.token;
    log.push('Login SUCCESS');
    
    log.push('\nStep 2: Block product 17');
    const blockRes = await axios.put(
      'http://localhost:5000/api/v1/admin/products/remove/17',
      { reason: 'Test reason for blocking' },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    
    log.push('Block SUCCESS');
    log.push(JSON.stringify(blockRes.data, null, 2));
    
  } catch (error) {
    log.push('\nERROR OCCURRED:');
    if (error.response) {
      log.push(`Status: ${error.response.status}`);
      log.push(`Data: ${JSON.stringify(error.response.data, null, 2)}`);
    } else {
      log.push(`Message: ${error.message}`);
    }
  }
  
  const output = log.join('\n');
  fs.writeFileSync('block-test-result.txt', output);
  console.log(output);
}

test();
