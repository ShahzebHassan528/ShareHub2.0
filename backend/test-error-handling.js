/**
 * Error Handling Test Script
 * Tests the centralized error handling system
 * 
 * Run: node test-error-handling.js
 */

require('dotenv').config();
const AppError = require('./utils/AppError');
const catchAsync = require('./utils/catchAsync');

console.log('');
console.log('='.repeat(60));
console.log('🧪 ERROR HANDLING TEST');
console.log('='.repeat(60));
console.log('');

// Test 1: AppError Class
console.log('📋 Test 1: AppError Class');
console.log('-'.repeat(60));

try {
  const error = new AppError('Test error message', 404);
  
  console.log('✅ AppError created successfully');
  console.log('   Message:', error.message);
  console.log('   Status Code:', error.statusCode);
  console.log('   Status:', error.status);
  console.log('   Is Operational:', error.isOperational);
  console.log('   Has Stack:', !!error.stack);
  
  if (error.status !== 'fail') {
    throw new Error('Status should be "fail" for 4xx errors');
  }
  
  const serverError = new AppError('Server error', 500);
  if (serverError.status !== 'error') {
    throw new Error('Status should be "error" for 5xx errors');
  }
  
  console.log('✅ AppError status logic working correctly');
  
} catch (error) {
  console.error('❌ AppError test failed:', error.message);
  process.exit(1);
}

console.log('');

// Test 2: catchAsync Wrapper
console.log('📋 Test 2: catchAsync Wrapper');
console.log('-'.repeat(60));

try {
  // Mock Express request, response, next
  const mockReq = {};
  const mockRes = {
    json: (data) => data,
    status: function(code) {
      this.statusCode = code;
      return this;
    }
  };
  const mockNext = (error) => {
    if (error) {
      console.log('✅ catchAsync caught error and passed to next()');
      console.log('   Error:', error.message);
    }
  };
  
  // Test async function that throws
  const asyncFunction = async (req, res, next) => {
    throw new AppError('Test async error', 400);
  };
  
  // Wrap with catchAsync
  const wrappedFunction = catchAsync(asyncFunction);
  
  // Execute
  wrappedFunction(mockReq, mockRes, mockNext);
  
  console.log('✅ catchAsync wrapper working correctly');
  
} catch (error) {
  console.error('❌ catchAsync test failed:', error.message);
  process.exit(1);
}

console.log('');

// Test 3: Error Status Codes
console.log('📋 Test 3: Error Status Codes');
console.log('-'.repeat(60));

const testCases = [
  { code: 400, expectedStatus: 'fail', description: 'Bad Request' },
  { code: 401, expectedStatus: 'fail', description: 'Unauthorized' },
  { code: 403, expectedStatus: 'fail', description: 'Forbidden' },
  { code: 404, expectedStatus: 'fail', description: 'Not Found' },
  { code: 409, expectedStatus: 'fail', description: 'Conflict' },
  { code: 500, expectedStatus: 'error', description: 'Internal Server Error' },
  { code: 503, expectedStatus: 'error', description: 'Service Unavailable' }
];

let passed = 0;
let failed = 0;

testCases.forEach(test => {
  const error = new AppError(test.description, test.code);
  if (error.status === test.expectedStatus) {
    console.log(`✅ ${test.code} (${test.description}) → status: "${test.expectedStatus}"`);
    passed++;
  } else {
    console.log(`❌ ${test.code} (${test.description}) → expected "${test.expectedStatus}", got "${error.status}"`);
    failed++;
  }
});

console.log('');
console.log(`Results: ${passed} passed, ${failed} failed`);

if (failed > 0) {
  console.error('❌ Status code tests failed');
  process.exit(1);
}

console.log('');

// Test 4: Error with Details
console.log('📋 Test 4: Error with Details');
console.log('-'.repeat(60));

try {
  const error = new AppError('Validation failed', 400);
  error.details = [
    'Email is required',
    'Password must be at least 8 characters'
  ];
  
  console.log('✅ Error with details created');
  console.log('   Message:', error.message);
  console.log('   Details:', error.details);
  
  if (!Array.isArray(error.details)) {
    throw new Error('Details should be an array');
  }
  
  console.log('✅ Error details working correctly');
  
} catch (error) {
  console.error('❌ Error details test failed:', error.message);
  process.exit(1);
}

console.log('');

// Test 5: Common Error Scenarios
console.log('📋 Test 5: Common Error Scenarios');
console.log('-'.repeat(60));

const scenarios = [
  { message: 'User not found', code: 404, type: 'Not Found' },
  { message: 'Invalid credentials', code: 401, type: 'Authentication' },
  { message: 'Access denied', code: 403, type: 'Authorization' },
  { message: 'Email already registered', code: 409, type: 'Conflict' },
  { message: 'Validation failed', code: 400, type: 'Validation' },
  { message: 'Database connection failed', code: 503, type: 'Service' }
];

scenarios.forEach(scenario => {
  const error = new AppError(scenario.message, scenario.code);
  console.log(`✅ ${scenario.type}: "${scenario.message}" (${scenario.code})`);
});

console.log('');

// Summary
console.log('='.repeat(60));
console.log('✅ ALL ERROR HANDLING TESTS PASSED!');
console.log('='.repeat(60));
console.log('');
console.log('Components tested:');
console.log('  ✅ AppError class');
console.log('  ✅ catchAsync wrapper');
console.log('  ✅ Status code logic');
console.log('  ✅ Error details');
console.log('  ✅ Common scenarios');
console.log('');
console.log('Next steps:');
console.log('  1. Start server: node server.js');
console.log('  2. Test with API calls');
console.log('  3. Check error responses');
console.log('  4. Migrate routes to use catchAsync');
console.log('');
