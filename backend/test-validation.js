/**
 * Validation Test Script
 * Tests the Joi validation schemas
 * 
 * Run: node test-validation.js
 */

const Joi = require('joi');
const { auth, product, order, swap, donation, user } = require('./validators');

console.log('');
console.log('='.repeat(60));
console.log('🧪 VALIDATION TEST');
console.log('='.repeat(60));
console.log('');

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

/**
 * Test a validation schema
 */
function testValidation(name, schema, data, shouldPass) {
  totalTests++;
  
  const { error } = schema.validate(data, { abortEarly: false });
  
  if (shouldPass) {
    if (!error) {
      console.log(`✅ ${name}: PASS (valid data accepted)`);
      passedTests++;
    } else {
      console.log(`❌ ${name}: FAIL (valid data rejected)`);
      console.log('   Errors:', error.details.map(d => d.message));
      failedTests++;
    }
  } else {
    if (error) {
      console.log(`✅ ${name}: PASS (invalid data rejected)`);
      console.log('   Errors:', error.details.map(d => d.message).join(', '));
      passedTests++;
    } else {
      console.log(`❌ ${name}: FAIL (invalid data accepted)`);
      failedTests++;
    }
  }
}

// Test 1: Auth Signup - Valid Data
console.log('📋 Test Group 1: Auth Signup Validation');
console.log('-'.repeat(60));

testValidation(
  'Valid buyer signup',
  auth.signupSchema,
  {
    body: {
      email: 'buyer@example.com',
      password: 'Test1234',
      full_name: 'John Doe',
      role: 'buyer'
    }
  },
  true
);

testValidation(
  'Invalid email format',
  auth.signupSchema,
  {
    body: {
      email: 'invalid-email',
      password: 'Test1234',
      full_name: 'John Doe',
      role: 'buyer'
    }
  },
  false
);

testValidation(
  'Weak password',
  auth.signupSchema,
  {
    body: {
      email: 'test@example.com',
      password: 'weak',
      full_name: 'John Doe',
      role: 'buyer'
    }
  },
  false
);

testValidation(
  'Invalid role',
  auth.signupSchema,
  {
    body: {
      email: 'test@example.com',
      password: 'Test1234',
      full_name: 'John Doe',
      role: 'invalid'
    }
  },
  false
);

console.log('');

// Test 2: Product Validation
console.log('📋 Test Group 2: Product Validation');
console.log('-'.repeat(60));

testValidation(
  'Valid product creation',
  product.createProductSchema,
  {
    body: {
      title: 'Test Product',
      price: 99.99,
      description: 'Test description',
      condition: 'new'
    }
  },
  true
);

testValidation(
  'Title too short',
  product.createProductSchema,
  {
    body: {
      title: 'AB',
      price: 99.99
    }
  },
  false
);

testValidation(
  'Negative price',
  product.createProductSchema,
  {
    body: {
      title: 'Test Product',
      price: -10
    }
  },
  false
);

testValidation(
  'Invalid condition',
  product.createProductSchema,
  {
    body: {
      title: 'Test Product',
      price: 99.99,
      condition: 'invalid'
    }
  },
  false
);

testValidation(
  'Invalid coordinates',
  product.createProductSchema,
  {
    body: {
      title: 'Test Product',
      price: 99.99,
      latitude: 100,
      longitude: 200
    }
  },
  false
);

console.log('');

// Test 3: Location Search Validation
console.log('📋 Test Group 3: Location Search Validation');
console.log('-'.repeat(60));

testValidation(
  'Valid location search',
  product.getNearbyProductsSchema,
  {
    query: {
      lat: 40.7128,
      lng: -74.0060,
      radius: 10
    }
  },
  true
);

testValidation(
  'Missing latitude',
  product.getNearbyProductsSchema,
  {
    query: {
      lng: -74.0060
    }
  },
  false
);

testValidation(
  'Invalid latitude range',
  product.getNearbyProductsSchema,
  {
    query: {
      lat: 100,
      lng: -74.0060
    }
  },
  false
);

testValidation(
  'Radius too large',
  product.getNearbyProductsSchema,
  {
    query: {
      lat: 40.7128,
      lng: -74.0060,
      radius: 150
    }
  },
  false
);

console.log('');

// Test 4: Order Validation
console.log('📋 Test Group 4: Order Validation');
console.log('-'.repeat(60));

testValidation(
  'Valid order creation',
  order.createOrderSchema,
  {
    body: {
      items: [
        { product_id: 1, quantity: 2 },
        { product_id: 2, quantity: 1 }
      ]
    }
  },
  true
);

testValidation(
  'Empty items array',
  order.createOrderSchema,
  {
    body: {
      items: []
    }
  },
  false
);

testValidation(
  'Invalid quantity',
  order.createOrderSchema,
  {
    body: {
      items: [
        { product_id: 1, quantity: -1 }
      ]
    }
  },
  false
);

console.log('');

// Test 5: User Profile Validation
console.log('📋 Test Group 5: User Profile Validation');
console.log('-'.repeat(60));

testValidation(
  'Valid profile update',
  user.updateProfileSchema,
  {
    body: {
      full_name: 'John Doe',
      phone: '+1234567890'
    }
  },
  true
);

testValidation(
  'Invalid phone format',
  user.updateProfileSchema,
  {
    body: {
      phone: 'invalid-phone'
    }
  },
  false
);

testValidation(
  'Invalid profile image URL',
  user.updateProfileSchema,
  {
    body: {
      profile_image: 'not-a-url'
    }
  },
  false
);

console.log('');

// Summary
console.log('='.repeat(60));
console.log('📊 TEST SUMMARY');
console.log('='.repeat(60));
console.log(`Total Tests: ${totalTests}`);
console.log(`Passed: ${passedTests} ✅`);
console.log(`Failed: ${failedTests} ❌`);
console.log('');

if (failedTests === 0) {
  console.log('✅ ALL VALIDATION TESTS PASSED!');
  console.log('');
  console.log('Next steps:');
  console.log('  1. Start server: node server.js');
  console.log('  2. Test with API calls');
  console.log('  3. Migrate routes to use validation');
  console.log('');
  process.exit(0);
} else {
  console.log('❌ SOME TESTS FAILED');
  console.log('');
  console.log('Please review the failed tests above.');
  console.log('');
  process.exit(1);
}
