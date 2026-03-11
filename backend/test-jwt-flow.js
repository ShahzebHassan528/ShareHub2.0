/**
 * JWT Token Flow Test
 * Complete JWT implementation ka practical demonstration
 */

const axios = require('axios');
const jwt = require('jsonwebtoken');

const BASE_URL = 'http://localhost:5000/api';

console.log('');
console.log('='.repeat(80));
console.log('🔐 JWT TOKEN COMPLETE FLOW DEMONSTRATION');
console.log('='.repeat(80));
console.log('');

async function demonstrateJWTFlow() {
  try {
    // ==================== STEP 1: LOGIN ====================
    console.log('📝 STEP 1: LOGIN (Token Generation)');
    console.log('-'.repeat(80));
    
    const loginData = {
      email: 'admin@marketplace.com',
      password: 'admin123'
    };
    
    console.log('Request:');
    console.log('  POST', BASE_URL + '/auth/signin');
    console.log('  Body:', JSON.stringify(loginData, null, 2));
    console.log('');
    
    const loginResponse = await axios.post(`${BASE_URL}/auth/signin`, loginData);
    
    const token = loginResponse.data.token;
    const user = loginResponse.data.user;
    
    console.log('✅ Response:');
    console.log('  Status:', loginResponse.status);
    console.log('  Token:', token.substring(0, 50) + '...');
    console.log('  User:', JSON.stringify(user, null, 2));
    console.log('');
    
    // ==================== TOKEN DECODE ====================
    console.log('🔍 TOKEN ANALYSIS (Decode without verification)');
    console.log('-'.repeat(80));
    
    // Token ke 3 parts
    const parts = token.split('.');
    console.log('Token Parts:');
    console.log('  1. Header:', parts[0].substring(0, 30) + '...');
    console.log('  2. Payload:', parts[1].substring(0, 30) + '...');
    console.log('  3. Signature:', parts[2].substring(0, 30) + '...');
    console.log('');
    
    // Decode karo (verification ke bina)
    const decoded = jwt.decode(token);
    console.log('Decoded Payload:');
    console.log('  User ID:', decoded.id);
    console.log('  Role:', decoded.role);
    console.log('  Issued At:', new Date(decoded.iat * 1000).toLocaleString());
    console.log('  Expires At:', new Date(decoded.exp * 1000).toLocaleString());
    
    const now = Math.floor(Date.now() / 1000);
    const timeLeft = decoded.exp - now;
    const daysLeft = Math.floor(timeLeft / 86400);
    const hoursLeft = Math.floor((timeLeft % 86400) / 3600);
    
    console.log('  Time Left:', `${daysLeft} days, ${hoursLeft} hours`);
    console.log('');
    
    // ==================== STEP 2: USE TOKEN ====================
    console.log('📝 STEP 2: USE TOKEN (Protected Route Access)');
    console.log('-'.repeat(80));
    
    console.log('Request:');
    console.log('  GET', BASE_URL + '/users/profile');
    console.log('  Headers:');
    console.log('    Authorization: Bearer ' + token.substring(0, 30) + '...');
    console.log('');
    
    const profileResponse = await axios.get(`${BASE_URL}/users/profile`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    console.log('✅ Response:');
    console.log('  Status:', profileResponse.status);
    console.log('  Profile:', JSON.stringify(profileResponse.data.profile, null, 2));
    console.log('');
    
    // ==================== STEP 3: INVALID TOKEN ====================
    console.log('📝 STEP 3: INVALID TOKEN TEST');
    console.log('-'.repeat(80));
    
    const invalidToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.invalid.signature';
    
    console.log('Request with Invalid Token:');
    console.log('  GET', BASE_URL + '/users/profile');
    console.log('  Headers:');
    console.log('    Authorization: Bearer ' + invalidToken);
    console.log('');
    
    try {
      await axios.get(`${BASE_URL}/users/profile`, {
        headers: {
          Authorization: `Bearer ${invalidToken}`
        }
      });
      console.log('❌ Should have failed!');
    } catch (error) {
      console.log('✅ Request Rejected (Expected):');
      console.log('  Status:', error.response.status);
      console.log('  Error:', error.response.data.error);
    }
    console.log('');
    
    // ==================== STEP 4: NO TOKEN ====================
    console.log('📝 STEP 4: NO TOKEN TEST');
    console.log('-'.repeat(80));
    
    console.log('Request without Token:');
    console.log('  GET', BASE_URL + '/users/profile');
    console.log('  Headers: (no Authorization header)');
    console.log('');
    
    try {
      await axios.get(`${BASE_URL}/users/profile`);
      console.log('❌ Should have failed!');
    } catch (error) {
      console.log('✅ Request Rejected (Expected):');
      console.log('  Status:', error.response.status);
      console.log('  Error:', error.response.data.error);
    }
    console.log('');
    
    // ==================== STEP 5: MULTIPLE REQUESTS ====================
    console.log('📝 STEP 5: MULTIPLE REQUESTS WITH SAME TOKEN');
    console.log('-'.repeat(80));
    
    console.log('Making 3 requests with same token...');
    console.log('');
    
    for (let i = 1; i <= 3; i++) {
      const response = await axios.get(`${BASE_URL}/notifications/unread-count`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log(`  Request ${i}: ✅ Success (Status: ${response.status})`);
    }
    console.log('');
    console.log('✅ Same token can be used multiple times until it expires');
    console.log('');
    
    // ==================== SUMMARY ====================
    console.log('='.repeat(80));
    console.log('✅ JWT FLOW DEMONSTRATION COMPLETE');
    console.log('='.repeat(80));
    console.log('');
    console.log('Key Points:');
    console.log('');
    console.log('1. TOKEN GENERATION:');
    console.log('   - Login/Signup par server token generate karta hai');
    console.log('   - Token mein user ID aur role hota hai');
    console.log('   - Expiry time set hota hai (7 days)');
    console.log('');
    console.log('2. TOKEN STORAGE:');
    console.log('   - Frontend localStorage mein save karta hai');
    console.log('   - localStorage.setItem("token", token)');
    console.log('');
    console.log('3. TOKEN USAGE:');
    console.log('   - Har protected request mein Authorization header mein bhejo');
    console.log('   - Format: "Authorization: Bearer <token>"');
    console.log('');
    console.log('4. TOKEN VERIFICATION:');
    console.log('   - Middleware token ko verify karta hai');
    console.log('   - jwt.verify() se signature check hota hai');
    console.log('   - Expiry check hoti hai');
    console.log('');
    console.log('5. TOKEN SECURITY:');
    console.log('   - Invalid token = 401 Unauthorized');
    console.log('   - No token = 401 Unauthorized');
    console.log('   - Expired token = 401 Token expired');
    console.log('');
    console.log('6. TOKEN LIFECYCLE:');
    console.log('   - Generate → Store → Use → Expire → Re-login');
    console.log('');
    
  } catch (error) {
    console.error('');
    console.error('❌ TEST FAILED');
    console.error('');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Error:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
  }
}

// Run the demonstration
demonstrateJWTFlow().then(() => {
  process.exit(0);
}).catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
