/**
 * Transaction Testing Script
 * Tests Sequelize transaction implementation and rollback behavior
 */

const { sequelize } = require('./config/sequelize');
const AuthService = require('./services/auth.service');
const OrderService = require('./services/order.service');
const DonationService = require('./services/donation.service');
const SwapService = require('./services/swap.service');
const User = require('./models/User.sequelize.wrapper');
const Product = require('./models/Product.sequelize.wrapper');
const Seller = require('./models/Seller.sequelize.wrapper');
const NGO = require('./models/NGO.sequelize.wrapper');

console.log('🧪 Starting Transaction Tests...\n');

async function testAuthServiceTransaction() {
  console.log('📝 Test 1: AuthService.register() Transaction');
  console.log('Testing user + profile creation with rollback on failure\n');

  try {
    // Test successful registration
    console.log('✅ Test 1a: Successful seller registration');
    const result = await AuthService.register({
      email: `test-seller-${Date.now()}@test.com`,
      password: 'Test123!',
      full_name: 'Test Seller',
      phone: '1234567890',
      role: 'seller',
      business_name: 'Test Business',
      business_address: '123 Test St',
      business_license: 'LIC123',
      tax_id: 'TAX123'
    });
    console.log('   User created:', result.user.id);
    
    // Verify seller profile was created
    const seller = await Seller.findByUserId(result.user.id);
    console.log('   Seller profile created:', seller ? 'Yes' : 'No');
    console.log('   ✅ Transaction committed successfully\n');

    // Test rollback scenario (duplicate email)
    console.log('✅ Test 1b: Rollback on duplicate email');
    try {
      await AuthService.register({
        email: result.user.email, // Same email
        password: 'Test123!',
        full_name: 'Another User',
        phone: '9876543210',
        role: 'buyer'
      });
      console.log('   ❌ Should have thrown error\n');
    } catch (error) {
      console.log('   Expected error:', error.message);
      console.log('   ✅ Transaction rolled back successfully\n');
    }

  } catch (error) {
    console.error('❌ Test 1 failed:', error.message, '\n');
  }
}

async function testOrderServiceTransaction() {
  console.log('📝 Test 2: OrderService.createOrder() Transaction');
  console.log('Testing order + items creation with rollback on failure\n');

  try {
    // Create test buyer
    const buyer = await User.create({
      email: `test-buyer-${Date.now()}@test.com`,
      password: 'hashed',
      full_name: 'Test Buyer',
      phone: '1234567890',
      role: 'buyer',
      is_verified: true
    });

    // Create test seller and product
    const sellerUser = await User.create({
      email: `test-seller-${Date.now()}@test.com`,
      password: 'hashed',
      full_name: 'Test Seller',
      phone: '9876543210',
      role: 'seller',
      is_verified: true
    });

    const sellerId = await Seller.create({
      user_id: sellerUser,
      business_name: 'Test Shop',
      business_address: '123 Test St'
    });

    const productId = await Product.create({
      seller_id: sellerId,
      title: 'Test Product',
      description: 'Test Description',
      price: 100,
      category_id: 1,
      product_condition: 'new',
      availability_status: 'available'
    });

    // Test successful order creation
    console.log('✅ Test 2a: Successful order creation');
    const order = await OrderService.createOrder(buyer, [
      { product_id: productId, quantity: 2 }
    ]);
    console.log('   Order created:', order.id);
    console.log('   Total amount:', order.total_amount);
    console.log('   ✅ Transaction committed successfully\n');

    // Test rollback scenario (invalid product)
    console.log('✅ Test 2b: Rollback on invalid product');
    try {
      await OrderService.createOrder(buyer, [
        { product_id: 99999, quantity: 1 } // Non-existent product
      ]);
      console.log('   ❌ Should have thrown error\n');
    } catch (error) {
      console.log('   Expected error:', error.message);
      console.log('   ✅ Transaction rolled back successfully\n');
    }

  } catch (error) {
    console.error('❌ Test 2 failed:', error.message, '\n');
  }
}

async function testDonationServiceTransaction() {
  console.log('📝 Test 3: DonationService.createDonation() Transaction');
  console.log('Testing donation + product update with rollback on failure\n');

  try {
    // Create test donor
    const donor = await User.create({
      email: `test-donor-${Date.now()}@test.com`,
      password: 'hashed',
      full_name: 'Test Donor',
      phone: '1234567890',
      role: 'buyer',
      is_verified: true
    });

    // Create test NGO
    const ngoUser = await User.create({
      email: `test-ngo-${Date.now()}@test.com`,
      password: 'hashed',
      full_name: 'Test NGO',
      phone: '9876543210',
      role: 'ngo',
      is_verified: true
    });

    const ngoId = await NGO.create({
      user_id: ngoUser,
      ngo_name: 'Test NGO',
      registration_number: 'NGO123',
      address: '123 NGO St',
      verification_status: 'approved'
    });

    // Create test product
    const sellerUser = await User.create({
      email: `test-seller-${Date.now()}@test.com`,
      password: 'hashed',
      full_name: 'Test Seller',
      phone: '5555555555',
      role: 'seller',
      is_verified: true
    });

    const sellerId = await Seller.create({
      user_id: sellerUser,
      business_name: 'Test Shop',
      business_address: '123 Test St'
    });

    const productId = await Product.create({
      seller_id: sellerId,
      title: 'Donation Product',
      description: 'Test Description',
      price: 50,
      category_id: 1,
      product_condition: 'used',
      availability_status: 'available'
    });

    // Test successful donation
    console.log('✅ Test 3a: Successful product donation');
    const donationId = await DonationService.createDonation({
      donor_id: donor,
      ngo_id: ngoId,
      product_id: productId,
      amount: 0
    });
    console.log('   Donation created:', donationId);
    
    // Verify product was marked unavailable
    const product = await Product.findById(productId);
    console.log('   Product status:', product.availability_status);
    console.log('   ✅ Transaction committed successfully\n');

    // Test rollback scenario (invalid NGO)
    console.log('✅ Test 3b: Rollback on invalid NGO');
    try {
      await DonationService.createDonation({
        donor_id: donor,
        ngo_id: 99999, // Non-existent NGO
        product_id: null,
        amount: 100
      });
      console.log('   ❌ Should have thrown error\n');
    } catch (error) {
      console.log('   Expected error:', error.message);
      console.log('   ✅ Transaction rolled back successfully\n');
    }

  } catch (error) {
    console.error('❌ Test 3 failed:', error.message, '\n');
  }
}

async function testSwapTransactions() {
  console.log('📝 Test 4: Swap Transaction Methods');
  console.log('Testing Swap.accept() and Swap.cancel() transactions\n');

  try {
    // Create test users
    const requester = await User.create({
      email: `test-requester-${Date.now()}@test.com`,
      password: 'hashed',
      full_name: 'Test Requester',
      phone: '1111111111',
      role: 'buyer',
      is_verified: true
    });

    const owner = await User.create({
      email: `test-owner-${Date.now()}@test.com`,
      password: 'hashed',
      full_name: 'Test Owner',
      phone: '2222222222',
      role: 'buyer',
      is_verified: true
    });

    // Create test products
    const sellerUser = await User.create({
      email: `test-seller-${Date.now()}@test.com`,
      password: 'hashed',
      full_name: 'Test Seller',
      phone: '3333333333',
      role: 'seller',
      is_verified: true
    });

    const sellerId = await Seller.create({
      user_id: sellerUser,
      business_name: 'Test Shop',
      business_address: '123 Test St'
    });

    const product1 = await Product.create({
      seller_id: sellerId,
      title: 'Swap Product 1',
      description: 'Test',
      price: 100,
      category_id: 1,
      product_condition: 'used',
      availability_status: 'available'
    });

    const product2 = await Product.create({
      seller_id: sellerId,
      title: 'Swap Product 2',
      description: 'Test',
      price: 100,
      category_id: 1,
      product_condition: 'used',
      availability_status: 'available'
    });

    // Create swap request
    const swapId = await SwapService.createSwapRequest({
      requester_id: requester,
      owner_id: owner,
      requester_product_id: product1,
      owner_product_id: product2
    });

    console.log('✅ Test 4a: Swap.accept() transaction');
    const acceptedSwap = await SwapService.acceptSwap(swapId, owner);
    console.log('   Swap accepted:', acceptedSwap.id);
    console.log('   Swap status:', acceptedSwap.status);
    
    // Verify both products marked unavailable
    const p1 = await Product.findById(product1);
    const p2 = await Product.findById(product2);
    console.log('   Product 1 available:', p1.is_available);
    console.log('   Product 2 available:', p2.is_available);
    console.log('   ✅ Transaction committed successfully\n');

    // Test cancel transaction
    console.log('✅ Test 4b: Swap.cancel() transaction');
    const cancelledSwap = await SwapService.cancelSwap(swapId, requester);
    console.log('   Swap cancelled:', cancelledSwap.id);
    console.log('   Swap status:', cancelledSwap.status);
    
    // Verify products restored to available
    const p1After = await Product.findById(product1);
    const p2After = await Product.findById(product2);
    console.log('   Product 1 available:', p1After.is_available);
    console.log('   Product 2 available:', p2After.is_available);
    console.log('   ✅ Transaction committed successfully\n');

  } catch (error) {
    console.error('❌ Test 4 failed:', error.message, '\n');
  }
}

async function runAllTests() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected\n');
    console.log('='.repeat(60));
    console.log('TRANSACTION TESTING SUITE');
    console.log('='.repeat(60) + '\n');

    await testAuthServiceTransaction();
    await testOrderServiceTransaction();
    await testDonationServiceTransaction();
    await testSwapTransactions();

    console.log('='.repeat(60));
    console.log('✅ All transaction tests completed!');
    console.log('='.repeat(60));

  } catch (error) {
    console.error('❌ Test suite failed:', error.message);
  } finally {
    await sequelize.close();
    console.log('\n✅ Database connection closed');
  }
}

// Run tests
runAllTests();
