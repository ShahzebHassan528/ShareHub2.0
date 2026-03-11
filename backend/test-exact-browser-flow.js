/**
 * TEST: Exact Browser Flow Simulation
 * This simulates EXACTLY what happens when user clicks Sign In button
 */

const axios = require('axios');

async function testExactBrowserFlow() {
  console.log('');
  console.log('='.repeat(80));
  console.log('🌐 SIMULATING EXACT BROWSER LOGIN FLOW');
  console.log('='.repeat(80));
  console.log('');
  
  console.log('📋 Scenario: User opens http://localhost:3000/signin');
  console.log('   User enters:');
  console.log('   - Email: admin@marketplace.com');
  console.log('   - Password: admin123');
  console.log('   User clicks "Sign In" button');
  console.log('');
  
  console.log('⏳ Step 1: Frontend sends POST request to /api/auth/signin');
  console.log('   URL: http://localhost:3000/api/auth/signin');
  console.log('   (Vite proxy forwards to http://localhost:5000/api/auth/signin)');
  console.log('');
  
  try {
    const startTime = Date.now();
    
    const response = await axios.post('http://localhost:3000/api/auth/signin', {
      email: 'admin@marketplace.com',
      password: 'admin123'
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      validateStatus: () => true // Don't throw on any status
    });
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    console.log('✅ Step 2: Response received from backend');
    console.log('   Duration:', duration + 'ms');
    console.log('');
    
    console.log('📊 RESPONSE DETAILS:');
    console.log('='.repeat(80));
    console.log('Status Code:', response.status);
    console.log('Status Text:', response.statusText);
    console.log('');
    
    console.log('Response Headers:');
    Object.keys(response.headers).forEach(key => {
      console.log(`   ${key}: ${response.headers[key]}`);
    });
    console.log('');
    
    console.log('Response Body:');
    console.log(JSON.stringify(response.data, null, 2));
    console.log('');
    
    console.log('='.repeat(80));
    
    if (response.status === 200 && response.data.token) {
      console.log('✅ LOGIN SUCCESSFUL!');
      console.log('');
      console.log('📋 What should happen in browser:');
      console.log('   1. localStorage.setItem("token", "' + response.data.token.substring(0, 20) + '...")');
      console.log('   2. localStorage.setItem("user", JSON.stringify({...}))');
      console.log('   3. navigate("/dashboard")');
      console.log('');
      console.log('🎉 User should be redirected to dashboard');
      console.log('');
      console.log('='.repeat(80));
      console.log('✅ BACKEND IS WORKING CORRECTLY ON WINDOWS');
      console.log('='.repeat(80));
      
    } else if (response.status === 401) {
      console.log('❌ LOGIN FAILED: Invalid credentials');
      console.log('');
      console.log('Error message:', response.data.error);
      console.log('');
      console.log('⚠️  This means:');
      console.log('   - User not found in database, OR');
      console.log('   - Password does not match');
      console.log('');
      
    } else if (response.status === 500) {
      console.log('❌ SERVER ERROR');
      console.log('');
      console.log('Error message:', response.data.error);
      console.log('');
      console.log('⚠️  Check backend logs for details');
      console.log('');
      
    } else {
      console.log('⚠️  UNEXPECTED RESPONSE');
      console.log('');
      console.log('Status:', response.status);
      console.log('Data:', response.data);
      console.log('');
    }
    
  } catch (error) {
    console.log('');
    console.log('='.repeat(80));
    console.log('❌ REQUEST FAILED');
    console.log('='.repeat(80));
    console.log('');
    
    if (error.code === 'ECONNREFUSED') {
      console.log('⚠️  CONNECTION REFUSED');
      console.log('');
      console.log('This means:');
      console.log('   - Frontend server is not running on port 3000, OR');
      console.log('   - Backend server is not running on port 5000');
      console.log('');
      console.log('Solution:');
      console.log('   1. Start backend: cd backend && npm run dev');
      console.log('   2. Start frontend: cd frontend && npm run dev');
      console.log('');
      
    } else if (error.code === 'ETIMEDOUT') {
      console.log('⚠️  REQUEST TIMEOUT');
      console.log('');
      console.log('This means:');
      console.log('   - Server is taking too long to respond');
      console.log('   - Network issue');
      console.log('');
      
    } else {
      console.log('Error:', error.message);
      console.log('');
      if (error.response) {
        console.log('Response status:', error.response.status);
        console.log('Response data:', error.response.data);
      }
    }
  }
  
  console.log('');
  console.log('='.repeat(80));
  console.log('🏁 TEST COMPLETE');
  console.log('='.repeat(80));
  console.log('');
  
  process.exit(0);
}

testExactBrowserFlow();
