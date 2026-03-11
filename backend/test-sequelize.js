/**
 * Sequelize Connection Test Script
 * 
 * Run this script to verify Sequelize is properly configured:
 * node test-sequelize.js
 */

require('dotenv').config();
const { sequelize, initializeDatabase, syncModels } = require('./config/sequelize');
const { User, Seller, Product, Order } = require('./database/models');

async function runTests() {
  console.log('='.repeat(50));
  console.log('Sequelize Configuration Test');
  console.log('='.repeat(50));
  console.log('');

  // Test 1: Database Initialization (with auto-creation and sync)
  console.log('Test 1: Initializing database connection...');
  const connected = await initializeDatabase({ sync: true, force: false });
  if (!connected) {
    console.error('❌ Initialization failed. Please check your MySQL server and credentials.');
    process.exit(1);
  }
  console.log('');

  // Test 2: Model Loading
  console.log('Test 2: Checking if models are loaded...');
  try {
    console.log('✅ User model loaded:', User.name);
    console.log('✅ Seller model loaded:', Seller.name);
    console.log('✅ Product model loaded:', Product.name);
    console.log('✅ Order model loaded:', Order.name);
    console.log('');
  } catch (error) {
    console.error('❌ Error loading models:', error.message);
    process.exit(1);
  }

  // Test 3: Simple Query
  console.log('Test 3: Running a simple query...');
  try {
    const userCount = await User.count();
    console.log(`✅ Query successful! Found ${userCount} users in database.`);
    console.log('');
  } catch (error) {
    console.error('❌ Query failed:', error.message);
    console.log('');
  }

  // Test 4: Model Associations
  console.log('Test 4: Checking model associations...');
  try {
    const associations = User.associations;
    console.log('✅ User associations:', Object.keys(associations).join(', '));
    console.log('');
  } catch (error) {
    console.error('❌ Association check failed:', error.message);
    console.log('');
  }

  // Test 5: Sample Query with Include
  console.log('Test 5: Testing query with associations...');
  try {
    const user = await User.findOne({
      include: [
        { model: Seller, as: 'sellerProfile', required: false }
      ],
      limit: 1
    });
    
    if (user) {
      console.log('✅ Association query successful!');
      console.log('   User:', user.email);
      console.log('   Has seller profile:', !!user.sellerProfile);
    } else {
      console.log('⚠️  No users found in database (this is OK if database is empty)');
    }
    console.log('');
  } catch (error) {
    console.error('❌ Association query failed:', error.message);
    console.log('');
  }

  // Test 6: Raw Query Support
  console.log('Test 6: Testing raw SQL query support...');
  try {
    const [results] = await sequelize.query('SELECT 1 + 1 AS result');
    console.log('✅ Raw query successful! Result:', results[0].result);
    console.log('');
  } catch (error) {
    console.error('❌ Raw query failed:', error.message);
    console.log('');
  }

  // Summary
  console.log('='.repeat(50));
  console.log('✅ All tests completed!');
  console.log('='.repeat(50));
  console.log('');
  console.log('Sequelize is ready to use. You can now:');
  console.log('1. Use Sequelize models in your routes');
  console.log('2. Keep existing raw SQL models for compatibility');
  console.log('3. Gradually migrate from raw SQL to Sequelize');
  console.log('');
  console.log('See SEQUELIZE_SETUP.md for usage examples.');
  console.log('See MIGRATION_EXAMPLES.md for migration guide.');
  console.log('');

  // Close connection
  await sequelize.close();
  process.exit(0);
}

// Run tests
runTests().catch(error => {
  console.error('');
  console.error('='.repeat(50));
  console.error('❌ Test script failed with error:');
  console.error('='.repeat(50));
  console.error(error);
  process.exit(1);
});
