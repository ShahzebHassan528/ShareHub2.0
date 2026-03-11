/**
 * Security Test Script
 * Tests security middleware configuration
 * 
 * Run: node test-security.js
 */

const http = require('http');

console.log('');
console.log('='.repeat(60));
console.log('🔒 SECURITY CONFIGURATION TEST');
console.log('='.repeat(60));
console.log('');

const SERVER_URL = 'http://localhost:5000';

// Test 1: Check if server is running
console.log('📋 Test 1: Server Availability');
console.log('-'.repeat(60));

http.get(`${SERVER_URL}/api`, (res) => {
  if (res.statusCode === 200) {
    console.log('✅ Server is running');
    console.log(`   Status Code: ${res.statusCode}`);
    
    // Test 2: Check security headers
    console.log('');
    console.log('📋 Test 2: Security Headers');
    console.log('-'.repeat(60));
    
    const securityHeaders = {
      'x-dns-prefetch-control': 'DNS Prefetch Control',
      'x-frame-options': 'Frame Options (Clickjacking)',
      'x-content-type-options': 'Content Type Options (MIME Sniffing)',
      'strict-transport-security': 'HSTS (Force HTTPS)',
      'x-xss-protection': 'XSS Protection',
      'referrer-policy': 'Referrer Policy',
      'x-powered-by': 'Powered By (Should be hidden)'
    };
    
    let headersFound = 0;
    let headersMissing = 0;
    
    Object.keys(securityHeaders).forEach(header => {
      if (res.headers[header]) {
        console.log(`✅ ${securityHeaders[header]}`);
        console.log(`   ${header}: ${res.headers[header]}`);
        headersFound++;
      } else if (header === 'x-powered-by') {
        console.log(`✅ ${securityHeaders[header]}`);
        console.log(`   Header hidden (good!)`);
        headersFound++;
      } else {
        console.log(`⚠️  ${securityHeaders[header]}`);
        console.log(`   ${header}: Not found`);
        headersMissing++;
      }
    });
    
    console.log('');
    console.log(`Results: ${headersFound} found, ${headersMissing} missing`);
    
    // Test 3: Check rate limit headers
    console.log('');
    console.log('📋 Test 3: Rate Limit Headers');
    console.log('-'.repeat(60));
    
    if (res.headers['ratelimit-limit']) {
      console.log('✅ Rate limiting is active');
      console.log(`   Limit: ${res.headers['ratelimit-limit']}`);
      console.log(`   Remaining: ${res.headers['ratelimit-remaining']}`);
      console.log(`   Reset: ${res.headers['ratelimit-reset']}`);
    } else {
      console.log('⚠️  Rate limit headers not found');
      console.log('   This is normal for non-rate-limited routes');
    }
    
    // Test 4: Check CORS headers
    console.log('');
    console.log('📋 Test 4: CORS Headers');
    console.log('-'.repeat(60));
    
    if (res.headers['access-control-allow-origin']) {
      console.log('✅ CORS is configured');
      console.log(`   Allow Origin: ${res.headers['access-control-allow-origin']}`);
      if (res.headers['access-control-allow-methods']) {
        console.log(`   Allow Methods: ${res.headers['access-control-allow-methods']}`);
      }
      if (res.headers['access-control-allow-credentials']) {
        console.log(`   Allow Credentials: ${res.headers['access-control-allow-credentials']}`);
      }
    } else {
      console.log('⚠️  CORS headers not found');
      console.log('   May require OPTIONS request or specific origin');
    }
    
    // Summary
    console.log('');
    console.log('='.repeat(60));
    console.log('✅ SECURITY CONFIGURATION TEST COMPLETE');
    console.log('='.repeat(60));
    console.log('');
    console.log('Security Features Detected:');
    console.log(`  ✅ Security Headers: ${headersFound}/${Object.keys(securityHeaders).length}`);
    console.log('  ✅ Server Running');
    console.log('');
    console.log('Manual Tests Required:');
    console.log('  1. Rate Limiting - Try multiple rapid requests');
    console.log('  2. XSS Protection - Send malicious input');
    console.log('  3. Body Size Limit - Send large payload');
    console.log('  4. CORS - Request from different origin');
    console.log('');
    console.log('Run these commands to test:');
    console.log('');
    console.log('# Test rate limiting (auth routes)');
    console.log('for i in {1..10}; do curl -X POST http://localhost:5000/api/auth/signin \\');
    console.log('  -H "Content-Type: application/json" \\');
    console.log('  -d \'{"email":"test@test.com","password":"test"}\'; done');
    console.log('');
    console.log('# Check all security headers');
    console.log('curl -I http://localhost:5000/api');
    console.log('');
    
  } else {
    console.error(`❌ Server returned status code: ${res.statusCode}`);
  }
}).on('error', (err) => {
  console.error('');
  console.error('❌ Cannot connect to server');
  console.error('');
  console.error('Error:', err.message);
  console.error('');
  console.error('Make sure the server is running:');
  console.error('  node server.js');
  console.error('');
  process.exit(1);
});
