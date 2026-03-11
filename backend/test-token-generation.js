/**
 * JWT Token Generation Demo
 * Shows how tokens are generated and decoded
 */

require('dotenv').config();
const jwt = require('jsonwebtoken');

console.log('');
console.log('='.repeat(80));
console.log('🔑 JWT TOKEN GENERATION DEMO');
console.log('='.repeat(80));
console.log('');

// Simulate user data
const userData = {
  id: 34,
  role: 'admin'
};

console.log('📋 Step 1: User Data (Payload)');
console.log('─'.repeat(80));
console.log(JSON.stringify(userData, null, 2));
console.log('');

// Generate token
console.log('🔧 Step 2: Generating JWT Token...');
console.log('─'.repeat(80));
console.log('Using JWT_SECRET from .env file');
console.log('Expiry: 7 days');
console.log('');

const token = jwt.sign(
  userData,
  process.env.JWT_SECRET,
  { expiresIn: '7d' }
);

console.log('✅ Token Generated!');
console.log('─'.repeat(80));
console.log('');
console.log('FULL TOKEN:');
console.log(token);
console.log('');

// Split token into parts
const parts = token.split('.');
console.log('🔍 Step 3: Token Structure (3 Parts)');
console.log('─'.repeat(80));
console.log('');
console.log('Part 1 - HEADER:');
console.log(parts[0]);
console.log('');
console.log('Part 2 - PAYLOAD:');
console.log(parts[1]);
console.log('');
console.log('Part 3 - SIGNATURE:');
console.log(parts[2]);
console.log('');

// Decode token
console.log('📖 Step 4: Decoding Token');
console.log('─'.repeat(80));

try {
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  console.log('');
  console.log('Decoded Payload:');
  console.log(JSON.stringify(decoded, null, 2));
  console.log('');
  
  // Convert timestamps to readable dates
  const issuedAt = new Date(decoded.iat * 1000);
  const expiresAt = new Date(decoded.exp * 1000);
  
  console.log('📅 Token Timestamps:');
  console.log('─'.repeat(80));
  console.log('Issued At (iat):', issuedAt.toLocaleString());
  console.log('Expires At (exp):', expiresAt.toLocaleString());
  console.log('');
  
  const now = new Date();
  const timeLeft = Math.floor((expiresAt - now) / (1000 * 60 * 60 * 24));
  console.log('⏰ Time Remaining:', timeLeft, 'days');
  console.log('');
  
} catch (error) {
  console.log('❌ Token verification failed:', error.message);
}

console.log('='.repeat(80));
console.log('🎯 HOW TO USE IN POSTMAN');
console.log('='.repeat(80));
console.log('');
console.log('1. Copy the token above');
console.log('2. In Postman, add header:');
console.log('   Key: Authorization');
console.log('   Value: Bearer ' + token.substring(0, 30) + '...');
console.log('');
console.log('3. Send request to protected API');
console.log('   Example: GET /api/v1/users/profile');
console.log('');
console.log('='.repeat(80));
console.log('');

// Test with actual login
console.log('🧪 Step 5: Testing with Real Login API');
console.log('─'.repeat(80));
console.log('');

async function testRealLogin() {
  try {
    console.log('Calling login API...');
    const response = await fetch('http://localhost:5000/api/v1/auth/signin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'admin@marketplace.com',
        password: 'admin123'
      })
    });

    const data = await response.json();

    if (response.ok) {
      console.log('✅ Login Successful!');
      console.log('');
      console.log('📋 Response:');
      console.log(JSON.stringify(data, null, 2));
      console.log('');
      console.log('🔑 COPY THIS TOKEN FOR POSTMAN:');
      console.log('─'.repeat(80));
      console.log(data.token);
      console.log('─'.repeat(80));
      console.log('');
      
      // Decode the real token
      const realDecoded = jwt.verify(data.token, process.env.JWT_SECRET);
      console.log('📖 Decoded Real Token:');
      console.log(JSON.stringify(realDecoded, null, 2));
      console.log('');
      
    } else {
      console.log('❌ Login Failed:', data.error);
    }
  } catch (error) {
    console.log('❌ Error:', error.message);
    console.log('');
    console.log('⚠️  Make sure backend is running:');
    console.log('   cd backend && npm start');
  }
  
  console.log('');
  console.log('='.repeat(80));
  console.log('✅ DEMO COMPLETE');
  console.log('='.repeat(80));
  console.log('');
}

// Wait for server
setTimeout(() => {
  testRealLogin();
}, 2000);
