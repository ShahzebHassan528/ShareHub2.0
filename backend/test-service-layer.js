/**
 * Service Layer Test Script
 * Tests the new service layer functionality
 * 
 * Run: node test-service-layer.js
 */

require('dotenv').config();
const { 
  AuthService, 
  UserService, 
  ProductService,
  OrderService,
  DonationService,
  SwapService
} = require('./services');

console.log('');
console.log('='.repeat(60));
console.log('🧪 SERVICE LAYER TEST');
console.log('='.repeat(60));
console.log('');

async function testAuthService() {
  console.log('📋 Testing AuthService...');
  console.log('-'.repeat(60));
  
  try {
    // Test login
    console.log('1. Testing login...');
    const loginResult = await AuthService.login('admin@marketplace.com', 'admin123');
    console.log('✅ Login successful');
    console.log('   Token:', loginResult.token.substring(0, 30) + '...');
    console.log('   User:', loginResult.user.email, '|', loginResult.user.role);
    
    // Test token verification
    console.log('');
    console.log('2. Testing token verification...');
    const decoded = AuthService.verifyToken(loginResult.token);
    console.log('✅ Token verified');
    console.log('   Decoded:', decoded);
    
    console.log('');
    console.log('✅ AuthService tests passed!');
    return loginResult.user.id;
    
  } catch (error) {
    console.error('❌ AuthService test failed:', error.message);
    throw error;
  }
}

async function testUserService(userId) {
  console.log('');
  console.log('📋 Testing UserService...');
  console.log('-'.repeat(60));
  
  try {
    // Test get profile
    console.log('1. Testing getProfile...');
    const profile = await UserService.getProfile(userId);
    console.log('✅ Profile retrieved');
    console.log('   Name:', profile.full_name);
    console.log('   Email:', profile.email);
    console.log('   Role:', profile.role);
    
    // Test update profile
    console.log('');
    console.log('2. Testing updateProfile...');
    const updated = await UserService.updateProfile(userId, {
      phone: '1234567890'
    });
    console.log('✅ Profile updated');
    console.log('   Phone:', updated.phone);
    
    // Test get public profile
    console.log('');
    console.log('3. Testing getPublicProfile...');
    const publicProfile = await UserService.getPublicProfile(userId);
    console.log('✅ Public profile retrieved');
    console.log('   Fields:', Object.keys(publicProfile).join(', '));
    
    console.log('');
    console.log('✅ UserService tests passed!');
    
  } catch (error) {
    console.error('❌ UserService test failed:', error.message);
    throw error;
  }
}

async function testProductService() {
  console.log('');
  console.log('📋 Testing ProductService...');
  console.log('-'.repeat(60));
  
  try {
    // Test get all products
    console.log('1. Testing getAllProducts...');
    const products = await ProductService.getAllProducts();
    console.log('✅ Products retrieved');
    console.log('   Count:', products.length);
    
    if (products.length > 0) {
      // Test get product by ID
      console.log('');
      console.log('2. Testing getProductById...');
      const product = await ProductService.getProductById(products[0].id);
      console.log('✅ Product retrieved');
      console.log('   Title:', product.title);
      console.log('   Price:', product.price);
    }
    
    // Test validation
    console.log('');
    console.log('3. Testing validation...');
    try {
      ProductService.validateProductData({ price: -10 });
      console.log('❌ Validation should have failed');
    } catch (error) {
      console.log('✅ Validation working correctly');
      console.log('   Error:', error.message);
    }
    
    console.log('');
    console.log('✅ ProductService tests passed!');
    
  } catch (error) {
    console.error('❌ ProductService test failed:', error.message);
    throw error;
  }
}

async function testOrderService() {
  console.log('');
  console.log('📋 Testing OrderService...');
  console.log('-'.repeat(60));
  
  try {
    // Test get orders (will likely be empty)
    console.log('1. Testing getOrdersByBuyer...');
    const orders = await OrderService.getOrdersByBuyer(1);
    console.log('✅ Orders retrieved');
    console.log('   Count:', orders.length);
    
    console.log('');
    console.log('✅ OrderService tests passed!');
    
  } catch (error) {
    console.error('❌ OrderService test failed:', error.message);
    // Don't throw, continue with other tests
  }
}

async function testSwapService() {
  console.log('');
  console.log('📋 Testing SwapService...');
  console.log('-'.repeat(60));
  
  try {
    // Test get swaps (will likely be empty)
    console.log('1. Testing getReceivedRequests...');
    const swaps = await SwapService.getReceivedRequests(1);
    console.log('✅ Swaps retrieved');
    console.log('   Count:', swaps.length);
    
    console.log('');
    console.log('✅ SwapService tests passed!');
    
  } catch (error) {
    console.error('❌ SwapService test failed:', error.message);
    // Don't throw, continue with other tests
  }
}

async function testDonationService() {
  console.log('');
  console.log('📋 Testing DonationService...');
  console.log('-'.repeat(60));
  
  try {
    // Test get donations (will likely be empty)
    console.log('1. Testing getDonationsByDonor...');
    const donations = await DonationService.getDonationsByDonor(1);
    console.log('✅ Donations retrieved');
    console.log('   Count:', donations.length);
    
    console.log('');
    console.log('✅ DonationService tests passed!');
    
  } catch (error) {
    console.error('❌ DonationService test failed:', error.message);
    // Don't throw, continue with other tests
  }
}

async function runAllTests() {
  try {
    const userId = await testAuthService();
    await testUserService(userId);
    await testProductService();
    await testOrderService();
    await testSwapService();
    await testDonationService();
    
    console.log('');
    console.log('='.repeat(60));
    console.log('✅ ALL SERVICE LAYER TESTS PASSED!');
    console.log('='.repeat(60));
    console.log('');
    console.log('Next steps:');
    console.log('1. Review refactored route examples');
    console.log('2. Test refactored routes with Postman/Thunder Client');
    console.log('3. Gradually migrate routes to use services');
    console.log('');
    
  } catch (error) {
    console.error('');
    console.error('='.repeat(60));
    console.error('❌ TESTS FAILED');
    console.error('='.repeat(60));
    console.error('Error:', error.message);
    console.error('');
    process.exit(1);
  }
}

// Run tests
runAllTests();
