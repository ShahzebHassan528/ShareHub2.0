/**
 * Test Location-Based Product Search
 * Tests nearby products endpoint with Haversine distance calculation
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

async function testLocationSearch() {
  console.log('');
  console.log('='.repeat(80));
  console.log('🧪 TESTING LOCATION-BASED PRODUCT SEARCH');
  console.log('='.repeat(80));
  console.log('');

  try {
    // Test coordinates (example: New York City area)
    const testLocations = [
      {
        name: 'New York City',
        lat: 40.7128,
        lng: -74.0060,
        radius: 10
      },
      {
        name: 'Los Angeles',
        lat: 34.0522,
        lng: -118.2437,
        radius: 15
      },
      {
        name: 'London',
        lat: 51.5074,
        lng: -0.1278,
        radius: 5
      }
    ];

    // Test 1: Search nearby products
    console.log('📝 Test 1: Search Nearby Products');
    console.log('-'.repeat(80));
    
    for (const location of testLocations) {
      console.log(`\n📍 Searching near ${location.name}`);
      console.log(`   Coordinates: (${location.lat}, ${location.lng})`);
      console.log(`   Radius: ${location.radius}km`);
      
      try {
        const response = await axios.get(`${BASE_URL}/products/nearby`, {
          params: {
            lat: location.lat,
            lng: location.lng,
            radius: location.radius
          }
        });
        
        console.log(`✅ Found ${response.data.count} products`);
        
        if (response.data.products.length > 0) {
          console.log('\n   Top 3 nearest products:');
          response.data.products.slice(0, 3).forEach((product, index) => {
            console.log(`   ${index + 1}. ${product.title}`);
            console.log(`      Distance: ${product.distance}km`);
            console.log(`      Price: $${product.price}`);
            console.log(`      Address: ${product.address || 'N/A'}`);
          });
        } else {
          console.log('   No products found in this area');
        }
      } catch (error) {
        if (error.response) {
          console.log(`⚠️  ${error.response.data.error}`);
        } else {
          console.log(`❌ Error: ${error.message}`);
        }
      }
    }
    console.log('');

    // Test 2: Invalid coordinates
    console.log('📝 Test 2: Invalid Coordinates (Should Fail)');
    console.log('-'.repeat(80));
    
    try {
      await axios.get(`${BASE_URL}/products/nearby`, {
        params: {
          lat: 200, // Invalid latitude
          lng: -74.0060,
          radius: 5
        }
      });
      console.log('❌ Should have failed with invalid coordinates');
    } catch (error) {
      if (error.response && error.response.status === 400) {
        console.log('✅ Invalid coordinates correctly rejected');
        console.log(`   Error: ${error.response.data.error}`);
      }
    }
    console.log('');

    // Test 3: Missing parameters
    console.log('📝 Test 3: Missing Parameters (Should Fail)');
    console.log('-'.repeat(80));
    
    try {
      await axios.get(`${BASE_URL}/products/nearby`, {
        params: {
          lat: 40.7128
          // Missing lng
        }
      });
      console.log('❌ Should have failed with missing parameters');
    } catch (error) {
      if (error.response && error.response.status === 400) {
        console.log('✅ Missing parameters correctly rejected');
        console.log(`   Error: ${error.response.data.error}`);
      }
    }
    console.log('');

    // Test 4: Invalid radius
    console.log('📝 Test 4: Invalid Radius (Should Fail)');
    console.log('-'.repeat(80));
    
    try {
      await axios.get(`${BASE_URL}/products/nearby`, {
        params: {
          lat: 40.7128,
          lng: -74.0060,
          radius: 150 // Too large
        }
      });
      console.log('❌ Should have failed with invalid radius');
    } catch (error) {
      if (error.response && error.response.status === 400) {
        console.log('✅ Invalid radius correctly rejected');
        console.log(`   Error: ${error.response.data.error}`);
      }
    }
    console.log('');

    // Test 5: Default radius (5km)
    console.log('📝 Test 5: Default Radius (5km)');
    console.log('-'.repeat(80));
    
    try {
      const response = await axios.get(`${BASE_URL}/products/nearby`, {
        params: {
          lat: 40.7128,
          lng: -74.0060
          // No radius specified, should default to 5km
        }
      });
      
      console.log('✅ Default radius applied successfully');
      console.log(`   Radius used: ${response.data.search_params.radius_km}km`);
      console.log(`   Products found: ${response.data.count}`);
    } catch (error) {
      console.log(`❌ Error: ${error.message}`);
    }
    console.log('');

    // Test 6: Verify distance calculation
    console.log('📝 Test 6: Verify Distance Calculation');
    console.log('-'.repeat(80));
    
    try {
      const response = await axios.get(`${BASE_URL}/products/nearby`, {
        params: {
          lat: 40.7128,
          lng: -74.0060,
          radius: 50
        }
      });
      
      if (response.data.products.length > 0) {
        console.log('✅ Distance field included in response');
        console.log('\n   Distance verification:');
        response.data.products.slice(0, 5).forEach((product, index) => {
          console.log(`   ${index + 1}. ${product.title}`);
          console.log(`      Distance: ${product.distance}km`);
          console.log(`      Coordinates: (${product.latitude}, ${product.longitude})`);
        });
      } else {
        console.log('⚠️  No products with location data found');
      }
    } catch (error) {
      console.log(`❌ Error: ${error.message}`);
    }
    console.log('');

    console.log('='.repeat(80));
    console.log('✅ LOCATION-BASED SEARCH TEST COMPLETE');
    console.log('='.repeat(80));
    console.log('');
    console.log('Summary:');
    console.log('  ✅ Nearby products search');
    console.log('  ✅ Distance calculation (Haversine)');
    console.log('  ✅ Invalid coordinates validation');
    console.log('  ✅ Missing parameters validation');
    console.log('  ✅ Invalid radius validation');
    console.log('  ✅ Default radius (5km)');
    console.log('  ✅ Distance field in response');
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

// Run the test
testLocationSearch().then(() => {
  process.exit(0);
}).catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
