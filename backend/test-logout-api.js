/**
 * Test Logout API
 * Automatically login, get token, then test logout
 */

require('dotenv').config();

async function testLogout() {
  console.log('');
  console.log('='.repeat(60));
  console.log('🔐 TESTING LOGOUT API');
  console.log('='.repeat(60));
  console.log('');

  try {
    // Step 1: Login to get token
    console.log('Step 1: Logging in...');
    const loginResponse = await fetch('http://localhost:5000/api/v1/auth/signin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'admin@marketplace.com',
        password: 'admin123'
      })
    });

    const loginData = await loginResponse.json();

    if (!loginResponse.ok) {
      console.log('❌ Login failed:', loginData.error);
      return;
    }

    console.log('✅ Login successful!');
    console.log('   User:', loginData.user.email);
    console.log('   Role:', loginData.user.role);
    console.log('');
    console.log('🔑 Token received:');
    console.log('   ' + loginData.token.substring(0, 50) + '...');
    console.log('');

    // Step 2: Test logout with token
    console.log('Step 2: Testing logout...');
    const logoutResponse = await fetch('http://localhost:5000/api/v1/auth/logout', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${loginData.token}`,
        'Content-Type': 'application/json'
      }
    });

    const logoutData = await logoutResponse.json();

    if (logoutResponse.ok) {
      console.log('✅ Logout successful!');
      console.log('   Message:', logoutData.message);
    } else {
      console.log('❌ Logout failed!');
      console.log('   Error:', logoutData.error);
    }

    console.log('');
    console.log('='.repeat(60));
    console.log('📋 COPY THIS TOKEN FOR POSTMAN:');
    console.log('='.repeat(60));
    console.log('');
    console.log(loginData.token);
    console.log('');
    console.log('='.repeat(60));
    console.log('');

  } catch (error) {
    console.log('❌ Error:', error.message);
  }
}

// Wait for server
setTimeout(() => {
  testLogout();
}, 2000);
