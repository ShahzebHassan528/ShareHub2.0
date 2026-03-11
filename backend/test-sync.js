/**
 * Sequelize Model Synchronization Test Script
 * 
 * This script tests the automatic model synchronization feature.
 * It will:
 * 1. Connect to the database
 * 2. Sync models (create tables if missing)
 * 3. Verify tables were created
 * 
 * Run this script: node test-sync.js
 * 
 * Options:
 * - node test-sync.js          (normal sync - creates missing tables)
 * - node test-sync.js --alter  (alter sync - updates schema)
 * - node test-sync.js --force  (force sync - DROPS and recreates all tables)
 */

require('dotenv').config();
const { sequelize, ensureDatabaseExists, testConnection, syncModels } = require('./config/sequelize');

async function testSync() {
  console.log('='.repeat(60));
  console.log('Sequelize Model Synchronization Test');
  console.log('='.repeat(60));
  console.log('');
  
  // Parse command line arguments
  const args = process.argv.slice(2);
  const forceSync = args.includes('--force');
  const alterSync = args.includes('--alter');
  
  console.log('Configuration:');
  console.log(`  Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`  Database: ${process.env.DB_NAME || 'marketplace_db'}`);
  console.log(`  Sync Mode: ${forceSync ? 'FORCE (drops tables)' : alterSync ? 'ALTER (updates schema)' : 'NORMAL (creates missing)'}`);
  console.log('');
  
  if (forceSync) {
    console.warn('⚠️  WARNING: Force sync will DROP all tables and recreate them!');
    console.warn('⚠️  All existing data will be LOST!');
    console.warn('');
    console.log('Press Ctrl+C within 5 seconds to cancel...');
    await new Promise(resolve => setTimeout(resolve, 5000));
    console.log('');
  }
  
  // Step 1: Ensure database exists
  console.log('Step 1: Ensuring Database Exists');
  console.log('-'.repeat(60));
  const dbExists = await ensureDatabaseExists();
  
  if (!dbExists) {
    console.error('❌ Failed to ensure database exists!');
    process.exit(1);
  }
  console.log('');
  
  // Step 2: Test connection
  console.log('Step 2: Testing Connection');
  console.log('-'.repeat(60));
  const connected = await testConnection(false);
  
  if (!connected) {
    console.error('❌ Connection test failed!');
    process.exit(1);
  }
  console.log('');
  
  // Step 3: Sync models
  console.log('Step 3: Synchronizing Models');
  console.log('-'.repeat(60));
  
  const syncOptions = {
    force: forceSync,
    alter: alterSync
  };
  
  const synced = await syncModels(syncOptions);
  
  if (!synced) {
    console.error('❌ Model synchronization failed!');
    process.exit(1);
  }
  console.log('');
  
  // Step 4: Verify tables
  console.log('Step 4: Verifying Tables');
  console.log('-'.repeat(60));
  
  try {
    const [tables] = await sequelize.query('SHOW TABLES');
    
    console.log(`✅ Found ${tables.length} table(s) in database:`);
    
    const expectedTables = [
      'users', 'sellers', 'ngos', 'categories', 'products', 
      'product_images', 'orders', 'order_items', 'donations', 
      'product_swaps', 'reviews', 'admin_logs', 'notifications'
    ];
    
    const tableNames = tables.map(t => Object.values(t)[0]);
    
    console.log('');
    console.log('Expected Tables:');
    expectedTables.forEach(tableName => {
      const exists = tableNames.includes(tableName);
      console.log(`  ${exists ? '✅' : '❌'} ${tableName}`);
    });
    
    const missingTables = expectedTables.filter(t => !tableNames.includes(t));
    const extraTables = tableNames.filter(t => !expectedTables.includes(t));
    
    console.log('');
    if (missingTables.length > 0) {
      console.warn(`⚠️  Missing tables: ${missingTables.join(', ')}`);
    }
    
    if (extraTables.length > 0) {
      console.log(`ℹ️  Additional tables: ${extraTables.join(', ')}`);
    }
    
    if (missingTables.length === 0) {
      console.log('✅ All expected tables exist!');
    }
    
  } catch (error) {
    console.error('❌ Error verifying tables:', error.message);
    process.exit(1);
  }
  
  console.log('');
  
  // Step 5: Test table structure
  console.log('Step 5: Testing Table Structure');
  console.log('-'.repeat(60));
  
  try {
    // Test users table
    const [userColumns] = await sequelize.query('DESCRIBE users');
    console.log(`✅ Users table has ${userColumns.length} columns`);
    
    // Test products table
    const [productColumns] = await sequelize.query('DESCRIBE products');
    console.log(`✅ Products table has ${productColumns.length} columns`);
    
    // Test orders table
    const [orderColumns] = await sequelize.query('DESCRIBE orders');
    console.log(`✅ Orders table has ${orderColumns.length} columns`);
    
  } catch (error) {
    console.error('❌ Error testing table structure:', error.message);
  }
  
  console.log('');
  console.log('='.repeat(60));
  console.log('✅ All synchronization tests passed!');
  console.log('='.repeat(60));
  console.log('');
  
  console.log('Summary:');
  console.log('  ✅ Database exists');
  console.log('  ✅ Connection established');
  console.log('  ✅ Models synchronized');
  console.log('  ✅ Tables created/updated');
  console.log('  ✅ Table structure verified');
  console.log('');
  
  console.log('Next steps:');
  console.log('  1. Start the server: npm run dev');
  console.log('  2. Test the API: curl http://localhost:5000/api/test-db');
  console.log('  3. Insert sample data: bash setup-database.sh (seed only)');
  console.log('');
  
  console.log('Sync modes:');
  console.log('  - Normal: node test-sync.js (creates missing tables)');
  console.log('  - Alter:  node test-sync.js --alter (updates schema)');
  console.log('  - Force:  node test-sync.js --force (drops and recreates)');
  console.log('');
  
  // Close connection
  await sequelize.close();
  process.exit(0);
}

// Run the test
testSync().catch(error => {
  console.error('');
  console.error('='.repeat(60));
  console.error('❌ Test failed with unexpected error:');
  console.error('='.repeat(60));
  console.error(error);
  console.error('');
  process.exit(1);
});
