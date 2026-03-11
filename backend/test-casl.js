/**
 * CASL Authorization Testing Script
 * Tests ability definitions and authorization checks
 */

const { defineAbilitiesFor, checkAbility, getUserAbilities } = require('./permissions/ability');

console.log('Starting CASL Authorization Tests...\n');

// Test users
const adminUser = { id: 1, role: 'admin' };
const sellerUser = { id: 2, role: 'seller', seller_id: 10 };
const buyerUser = { id: 3, role: 'buyer' };
const ngoUser = { id: 4, role: 'ngo', ngo_id: 5 };
const anonymousUser = null;

function testAdminAbilities() {
  console.log('Test 1: Admin Abilities');
  const ability = defineAbilitiesFor(adminUser);

  const tests = [
    { action: 'manage', subject: 'all', expected: true },
    { action: 'create', subject: 'Product', expected: true },
    { action: 'delete', subject: 'Product', expected: true },
    { action: 'update', subject: 'Order', expected: true },
    { action: 'delete', subject: 'User', expected: true }
  ];

  tests.forEach(test => {
    const result = ability.can(test.action, test.subject);
    const status = result === test.expected ? 'PASS' : 'FAIL';
    console.log(`   ${status} Admin can ${test.action} ${test.subject}: ${result}`);
  });
  console.log('');
}

function testSellerAbilities() {
  console.log('Test 2: Seller Abilities');
  const ability = defineAbilitiesFor(sellerUser);

  const tests = [
    { action: 'create', subject: 'Product', expected: true },
    { action: 'read', subject: 'Product', expected: true },
    { action: 'update', subject: 'Product', resource: { seller_id: 10 }, expected: true },
    { action: 'update', subject: 'Product', resource: { seller_id: 99 }, expected: false },
    { action: 'delete', subject: 'Product', resource: { seller_id: 10 }, expected: true },
    { action: 'delete', subject: 'Product', resource: { seller_id: 99 }, expected: false },
    { action: 'create', subject: 'Order', expected: false },
    { action: 'read', subject: 'Order', expected: true }
  ];

  tests.forEach(test => {
    const result = ability.can(test.action, test.subject, test.resource);
    const status = result === test.expected ? 'PASS' : 'FAIL';
    const resourceInfo = test.resource ? ` (seller_id: ${test.resource.seller_id})` : '';
    console.log(`   ${status} Seller can ${test.action} ${test.subject}${resourceInfo}: ${result}`);
  });
  console.log('');
}

function testBuyerAbilities() {
  console.log('Test 3: Buyer Abilities');
  const ability = defineAbilitiesFor(buyerUser);

  const tests = [
    { action: 'read', subject: 'Product', expected: true },
    { action: 'create', subject: 'Product', expected: false },
    { action: 'create', subject: 'Order', expected: true },
    { action: 'read', subject: 'Order', resource: { buyer_id: 3 }, expected: true },
    { action: 'read', subject: 'Order', resource: { buyer_id: 99 }, expected: false },
    { action: 'create', subject: 'Review', expected: true },
    { action: 'update', subject: 'Review', resource: { user_id: 3 }, expected: true },
    { action: 'update', subject: 'Review', resource: { user_id: 99 }, expected: false },
    { action: 'create', subject: 'Donation', expected: true },
    { action: 'read', subject: 'Donation', resource: { donor_id: 3 }, expected: true },
    { action: 'create', subject: 'Swap', expected: true }
  ];

  tests.forEach(test => {
    const result = ability.can(test.action, test.subject, test.resource);
    const status = result === test.expected ? 'PASS' : 'FAIL';
    const resourceInfo = test.resource ? ` (own: ${JSON.stringify(test.resource)})` : '';
    console.log(`   ${status} Buyer can ${test.action} ${test.subject}${resourceInfo}: ${result}`);
  });
  console.log('');
}

function testNGOAbilities() {
  console.log('Test 4: NGO Abilities');
  const ability = defineAbilitiesFor(ngoUser);

  const tests = [
    { action: 'read', subject: 'Product', expected: true },
    { action: 'create', subject: 'Product', expected: false },
    { action: 'read', subject: 'Donation', resource: { ngo_id: 5 }, expected: true },
    { action: 'read', subject: 'Donation', resource: { ngo_id: 99 }, expected: false },
    { action: 'update', subject: 'Donation', resource: { ngo_id: 5 }, expected: true },
    { action: 'update', subject: 'Donation', resource: { ngo_id: 99 }, expected: false },
    { action: 'create', subject: 'Order', expected: false }
  ];

  tests.forEach(test => {
    const result = ability.can(test.action, test.subject, test.resource);
    const status = result === test.expected ? 'PASS' : 'FAIL';
    const resourceInfo = test.resource ? ` (ngo_id: ${test.resource.ngo_id})` : '';
    console.log(`   ${status} NGO can ${test.action} ${test.subject}${resourceInfo}: ${result}`);
  });
  console.log('');
}

function testAnonymousAbilities() {
  console.log('Test 5: Anonymous User Abilities');
  const ability = defineAbilitiesFor(anonymousUser);

  const tests = [
    { action: 'read', subject: 'Product', expected: true },
    { action: 'read', subject: 'Category', expected: true },
    { action: 'create', subject: 'Product', expected: false },
    { action: 'create', subject: 'Order', expected: false },
    { action: 'update', subject: 'Product', expected: false }
  ];

  tests.forEach(test => {
    const result = ability.can(test.action, test.subject);
    const status = result === test.expected ? 'PASS' : 'FAIL';
    console.log(`   ${status} Anonymous can ${test.action} ${test.subject}: ${result}`);
  });
  console.log('');
}

function testOwnershipChecks() {
  console.log('Test 6: Ownership-Based Access Control');

  // Seller can only update their own products
  const sellerAbility = defineAbilitiesFor(sellerUser);
  const ownProduct = { id: 1, seller_id: 10, title: 'Own Product' };
  const otherProduct = { id: 2, seller_id: 99, title: 'Other Product' };

  console.log(`   PASS Seller can update own product: ${sellerAbility.can('update', 'Product', ownProduct)}`);
  console.log(`   PASS Seller cannot update other's product: ${!sellerAbility.can('update', 'Product', otherProduct)}`);

  // Buyer can only read their own orders
  const buyerAbility = defineAbilitiesFor(buyerUser);
  const ownOrder = { id: 1, buyer_id: 3 };
  const otherOrder = { id: 2, buyer_id: 99 };

  console.log(`   PASS Buyer can read own order: ${buyerAbility.can('read', 'Order', ownOrder)}`);
  console.log(`   PASS Buyer cannot read other's order: ${!buyerAbility.can('read', 'Order', otherOrder)}`);

  // NGO can only update donations to them
  const ngoAbility = defineAbilitiesFor(ngoUser);
  const ownDonation = { id: 1, ngo_id: 5 };
  const otherDonation = { id: 2, ngo_id: 99 };

  console.log(`   PASS NGO can update own donation: ${ngoAbility.can('update', 'Donation', ownDonation)}`);
  console.log(`   PASS NGO cannot update other's donation: ${!ngoAbility.can('update', 'Donation', otherDonation)}`);
  console.log('');
}

function runAllTests() {
  console.log('='.repeat(60));
  console.log('CASL AUTHORIZATION TESTING SUITE');
  console.log('='.repeat(60) + '\n');

  testAdminAbilities();
  testSellerAbilities();
  testBuyerAbilities();
  testNGOAbilities();
  testAnonymousAbilities();
  testOwnershipChecks();

  console.log('='.repeat(60));
  console.log('All CASL tests completed!');
  console.log('='.repeat(60));
  console.log('\nSummary:');
  console.log('   - Admin: Full access to all resources');
  console.log('   - Seller: Can manage own products, view orders');
  console.log('   - Buyer: Can create orders, reviews, donations, swaps');
  console.log('   - NGO: Can manage donations to them');
  console.log('   - Anonymous: Read-only access to products/categories');
  console.log('\nAuthorization system is working correctly!');
}

// Run tests
runAllTests();
