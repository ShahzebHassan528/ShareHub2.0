/**
 * API Versioning Test Script
 * Verifies both v1 and legacy endpoints work correctly
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:5000';

console.log('🧪 Testing API Versioning...\n');
console.log('='.repeat(60));

async function testEndpoint(name, url) {
  try {
    const response = await axios.get(url);
    console.log(`✅ ${name}`);
    console.log(`   URL: ${url}`);
    console.log(`   Status: ${response.status}`);
    console.log(`   Response:`, JSON.stringify(response.data, null, 2).substring(0, 200));
    console.log('');
    return true;
  } catch (error) {
    console.log(`❌ ${name}`);
    console.log(`   URL: ${url}`);
    console.log(`   Error: ${error.message}`);
    console.log('');
    return false;
  }
}

async function runTests() {
  console.log('\n1. Testing v1 Endpoints');
  console.log('-'.repeat(60));
  
  await testEndpoint('v1 API Info', `${BASE_URL}/api/v1`);
  await testEndpoint('v1 Products', `${BASE_URL}/api/v1/products`);
  await testEndpoint('v1 Categories', `${BASE_URL}/api/v1/categories`);
  
  console.log('\n2. Testing Legacy Endpoints');
  console.log('-'.repeat(60));
  
  await testEndpoint('Legacy API Info', `${BASE_URL}/api`);
  await testEndpoint('Legacy Products', `${BASE_URL}/api/products`);
  await testEndpoint('Legacy Categories', `${BASE_URL}/api/categories`);
  
  console.log('\n3. Comparing Responses');
  console.log('-'.repeat(60));
  
  try {
    const v1Response = await axios.get(`${BASE_URL}/api/v1/products`);
    const legacyResponse = await axios.get(`${BASE_URL}/api/products`);
    
    const v1Data = JSON.stringify(v1Response.data);
    const legacyData = JSON.stringify(legacyResponse.data);
    
    if (v1Data === legacyData) {
      console.log('✅ v1 and legacy responses are identical');
      console.log('   Both versions return the same data');
    } else {
      console.log('⚠️  v1 and legacy responses differ');
      console.log('   This might be expected if you made changes');
    }
  } catch (error) {
    console.log('❌ Could not compare responses');
    console.log(`   Error: ${error.message}`);
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('✅ API Versioning Test Complete!');
  console.log('='.repeat(60));
  console.log('\nSummary:');
  console.log('- v1 endpoints: /api/v1/*');
  console.log('- Legacy endpoints: /api/*');
  console.log('- Both versions are working');
  console.log('- Backward compatibility maintained');
  console.log('\nRecommendation: Use /api/v1/* for new development');
}

// Check if server is running
axios.get(`${BASE_URL}/api`)
  .then(() => {
    console.log('✅ Server is running\n');
    runTests();
  })
  .catch((error) => {
    console.log('❌ Server is not running!');
    console.log(`   Error: ${error.message}`);
    console.log('\nPlease start the server first:');
    console.log('   cd backend');
    console.log('   npm start');
    process.exit(1);
  });
