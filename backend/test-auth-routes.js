/**
 * Authentication Routes Test Script
 * 
 * This script tests the auth routes to verify they work correctly
 * with the Sequelize User model.
 * 
 * Run: node test-auth-routes.js
 * 
 * Prerequisites:
 * - Server must be running on port 5000
 * - Database must be set up
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';
const testEmail = `test_${Date.now()}@example.com`;
const testPassword = 'test123';

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(color, message) {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function testSignup() {
  console.log('');
  log('cyan', '='.repeat(60));
  log('cyan', 'Test 1: Signup (Buyer)');
  log('cyan', '='.repeat(60));
  
  try {
    const response = await axios.post(`${BASE_URL}/auth/signup`, {
      email: testEmail,
      password: testPassword,
      full_name: 'Test User',
      phone: '1234567890',
      role: 'buyer'
    });
    
    log('green', '✅ Signup successful');
    log('blue', `   Status: ${response.status}`);
    log('blue', `   Message: ${response.data.message}`);
    log('blue', `   User ID: ${response.data.user.id}`);
    log('blue', `   Email: ${response.data.user.email}`);
    log('blue', `   Role: ${response.data.user.role}`);
    log('blue', `   Verified: ${response.data.user.is_verified}`);
    log('blue', `   Token: ${response.data.token.substring(0, 20)}...`);
    
    return {
      success: true,
      userId: response.data.user.id,
      token: response.data.token
    };
  } catch (error) {
    log('red', '❌ Signup failed');
    if (error.response) {
      log('red', `   Status: ${error.response.status}`);
      log('red', `   Error: ${error.response.data.error}`);
    } else {
      log('red', `   Error: ${error.message}`);
    }
    return { success: false };
  }
}

async function testSignin() {
  console.log('');
  log('cyan', '='.repeat(60));
  log('cyan', 'Test 2: Signin');
  log('cyan', '='.repeat(60));
  
  try {
    const response = await axios.post(`${BASE_URL}/auth/signin`, {
      email: testEmail,
      password: testPassword
    });
    
    log('green', '✅ Signin successful');
    log('blue', `   Status: ${response.status}`);
    log('blue', `   Message: ${response.data.message}`);
    log('blue', `   User ID: ${response.data.user.id}`);
    log('blue', `   Email: ${response.data.user.email}`);
    log('blue', `   Role: ${response.data.user.role}`);
    log('blue', `   Token: ${response.data.token.substring(0, 20)}...`);
    
    return { success: true };
  } catch (error) {
    log('red', '❌ Signin failed');
    if (error.response) {
      log('red', `   Status: ${error.response.status}`);
      log('red', `   Error: ${error.response.data.error}`);
    } else {
      log('red', `   Error: ${error.message}`);
    }
    return { success: false };
  }
}

async function testDuplicateSignup() {
  console.log('');
  log('cyan', '='.repeat(60));
  log('cyan', 'Test 3: Duplicate Signup (Should Fail)');
  log('cyan', '='.repeat(60));
  
  try {
    await axios.post(`${BASE_URL}/auth/signup`, {
      email: testEmail,
      password: testPassword,
      full_name: 'Test User 2',
      phone: '1234567890',
      role: 'buyer'
    });
    
    log('red', '❌ Test failed: Duplicate signup should have been rejected');
    return { success: false };
  } catch (error) {
    if (error.response && error.response.status === 400) {
      log('green', '✅ Duplicate signup correctly rejected');
      log('blue', `   Status: ${error.response.status}`);
      log('blue', `   Error: ${error.response.data.error}`);
      return { success: true };
    } else {
      log('red', '❌ Unexpected error');
      log('red', `   Error: ${error.message}`);
      return { success: false };
    }
  }
}

async function testInvalidSignin() {
  console.log('');
  log('cyan', '='.repeat(60));
  log('cyan', 'Test 4: Invalid Signin (Should Fail)');
  log('cyan', '='.repeat(60));
  
  try {
    await axios.post(`${BASE_URL}/auth/signin`, {
      email: testEmail,
      password: 'wrongpassword'
    });
    
    log('red', '❌ Test failed: Invalid signin should have been rejected');
    return { success: false };
  } catch (error) {
    if (error.response && error.response.status === 401) {
      log('green', '✅ Invalid signin correctly rejected');
      log('blue', `   Status: ${error.response.status}`);
      log('blue', `   Error: ${error.response.data.error}`);
      return { success: true };
    } else {
      log('red', '❌ Unexpected error');
      log('red', `   Error: ${error.message}`);
      return { success: false };
    }
  }
}

async function testNonExistentUser() {
  console.log('');
  log('cyan', '='.repeat(60));
  log('cyan', 'Test 5: Non-existent User Signin (Should Fail)');
  log('cyan', '='.repeat(60));
  
  try {
    await axios.post(`${BASE_URL}/auth/signin`, {
      email: 'nonexistent@example.com',
      password: 'password'
    });
    
    log('red', '❌ Test failed: Non-existent user signin should have been rejected');
    return { success: false };
  } catch (error) {
    if (error.response && error.response.status === 401) {
      log('green', '✅ Non-existent user signin correctly rejected');
      log('blue', `   Status: ${error.response.status}`);
      log('blue', `   Error: ${error.response.data.error}`);
      return { success: true };
    } else {
      log('red', '❌ Unexpected error');
      log('red', `   Error: ${error.message}`);
      return { success: false };
    }
  }
}

async function testSellerSignup() {
  console.log('');
  log('cyan', '='.repeat(60));
  log('cyan', 'Test 6: Seller Signup');
  log('cyan', '='.repeat(60));
  
  const sellerEmail = `seller_${Date.now()}@example.com`;
  
  try {
    const response = await axios.post(`${BASE_URL}/auth/signup`, {
      email: sellerEmail,
      password: testPassword,
      full_name: 'Test Seller',
      phone: '1234567890',
      role: 'seller',
      business_name: 'Test Business',
      business_address: '123 Test St',
      business_license: 'LIC123',
      tax_id: 'TAX123'
    });
    
    log('green', '✅ Seller signup successful');
    log('blue', `   Status: ${response.status}`);
    log('blue', `   Message: ${response.data.message}`);
    log('blue', `   User ID: ${response.data.user.id}`);
    log('blue', `   Role: ${response.data.user.role}`);
    log('blue', `   Verified: ${response.data.user.is_verified}`);
    
    return { success: true };
  } catch (error) {
    log('red', '❌ Seller signup failed');
    if (error.response) {
      log('red', `   Status: ${error.response.status}`);
      log('red', `   Error: ${error.response.data.error}`);
    } else {
      log('red', `   Error: ${error.message}`);
    }
    return { success: false };
  }
}

async function runTests() {
  console.log('');
  log('yellow', '='.repeat(60));
  log('yellow', 'Authentication Routes Test Suite');
  log('yellow', '='.repeat(60));
  log('yellow', '');
  log('yellow', 'Testing with Sequelize User Model');
  log('yellow', `Test Email: ${testEmail}`);
  log('yellow', '');
  log('yellow', 'Prerequisites:');
  log('yellow', '  - Server running on http://localhost:5000');
  log('yellow', '  - Database set up and accessible');
  log('yellow', '  - USE_SEQUELIZE=true (or not set)');
  
  const results = [];
  
  // Run tests
  results.push(await testSignup());
  results.push(await testSignin());
  results.push(await testDuplicateSignup());
  results.push(await testInvalidSignin());
  results.push(await testNonExistentUser());
  results.push(await testSellerSignup());
  
  // Summary
  console.log('');
  log('yellow', '='.repeat(60));
  log('yellow', 'Test Summary');
  log('yellow', '='.repeat(60));
  
  const passed = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  
  log('blue', `Total Tests: ${results.length}`);
  log('green', `Passed: ${passed}`);
  if (failed > 0) {
    log('red', `Failed: ${failed}`);
  }
  
  console.log('');
  if (failed === 0) {
    log('green', '✅ All tests passed!');
    log('green', '✅ Sequelize User model is working correctly');
    log('green', '✅ Auth routes are functioning as expected');
  } else {
    log('red', '❌ Some tests failed');
    log('yellow', '⚠️  Check server logs for details');
  }
  
  console.log('');
  log('yellow', 'Next Steps:');
  log('yellow', '  1. Check server console for Sequelize logs');
  log('yellow', '  2. Verify [Sequelize] markers in logs');
  log('yellow', '  3. Compare with raw SQL performance');
  log('yellow', '  4. Monitor for any issues');
  console.log('');
  
  process.exit(failed === 0 ? 0 : 1);
}

// Check if server is running
async function checkServer() {
  try {
    await axios.get(`${BASE_URL}`);
    return true;
  } catch (error) {
    return false;
  }
}

// Main
(async () => {
  const serverRunning = await checkServer();
  
  if (!serverRunning) {
    log('red', '❌ Server is not running on http://localhost:5000');
    log('yellow', '');
    log('yellow', 'Please start the server first:');
    log('yellow', '  cd backend');
    log('yellow', '  npm run dev');
    log('yellow', '');
    process.exit(1);
  }
  
  await runTests();
})();
