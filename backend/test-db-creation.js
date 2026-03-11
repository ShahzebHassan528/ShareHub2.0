/**
 * Database Auto-Creation Test Script
 * 
 * This script demonstrates the automatic database creation feature.
 * It will:
 * 1. Check if the database exists
 * 2. Create it if it doesn't exist
 * 3. Test the connection
 * 
 * Run this script: node test-db-creation.js
 */

require('dotenv').config();
const { ensureDatabaseExists, testConnection, sequelize } = require('./config/sequelize');

async function testDatabaseCreation() {
  console.log('='.repeat(60));
  console.log('Database Auto-Creation Test');
  console.log('='.repeat(60));
  console.log('');
  
  console.log('Configuration:');
  console.log(`  Host: ${process.env.DB_HOST || 'localhost'}`);
  console.log(`  User: ${process.env.DB_USER || 'root'}`);
  console.log(`  Database: ${process.env.DB_NAME || 'marketplace_db'}`);
  console.log('');
  
  // Test 1: Check and create database
  console.log('Step 1: Checking/Creating Database');
  console.log('-'.repeat(60));
  const dbCreated = await ensureDatabaseExists();
  
  if (!dbCreated) {
    console.error('');
    console.error('❌ Failed to ensure database exists!');
    console.error('');
    console.error('Possible issues:');
    console.error('  1. MySQL server is not running');
    console.error('  2. Database credentials are incorrect');
    console.error('  3. User does not have CREATE DATABASE permission');
    console.error('');
    console.error('Solutions:');
    console.error('  - Start MySQL: systemctl start mysql (Linux) or check Services (Windows)');
    console.error('  - Verify credentials in .env file');
    console.error('  - Grant permissions: GRANT ALL PRIVILEGES ON *.* TO \'user\'@\'localhost\';');
    console.error('');
    process.exit(1);
  }
  
  console.log('');
  
  // Test 2: Test connection
  console.log('Step 2: Testing Connection');
  console.log('-'.repeat(60));
  const connected = await testConnection(false); // Don't auto-create again
  
  if (!connected) {
    console.error('');
    console.error('❌ Connection test failed!');
    console.error('');
    process.exit(1);
  }
  
  console.log('');
  
  // Test 3: Verify database is accessible
  console.log('Step 3: Verifying Database Access');
  console.log('-'.repeat(60));
  try {
    const [results] = await sequelize.query('SELECT DATABASE() as current_db');
    console.log(`✅ Connected to database: ${results[0].current_db}`);
    
    // Show existing tables
    const [tables] = await sequelize.query('SHOW TABLES');
    console.log(`✅ Found ${tables.length} table(s) in database`);
    
    if (tables.length > 0) {
      console.log('   Tables:', tables.map(t => Object.values(t)[0]).join(', '));
    } else {
      console.log('   ℹ️  Database is empty (no tables yet)');
      console.log('   💡 Run setup-database.sh to create tables and seed data');
    }
  } catch (error) {
    console.error('❌ Error verifying database:', error.message);
    process.exit(1);
  }
  
  console.log('');
  console.log('='.repeat(60));
  console.log('✅ All tests passed!');
  console.log('='.repeat(60));
  console.log('');
  console.log('Summary:');
  console.log('  ✅ Database exists or was created successfully');
  console.log('  ✅ Connection to database is working');
  console.log('  ✅ Database is accessible');
  console.log('');
  console.log('Next steps:');
  console.log('  1. If tables don\'t exist, run: bash setup-database.sh');
  console.log('  2. Start the server: npm run dev');
  console.log('  3. Test the API: curl http://localhost:5000/api/test-db');
  console.log('');
  
  // Close connection
  await sequelize.close();
  process.exit(0);
}

// Run the test
testDatabaseCreation().catch(error => {
  console.error('');
  console.error('='.repeat(60));
  console.error('❌ Test failed with unexpected error:');
  console.error('='.repeat(60));
  console.error(error);
  console.error('');
  process.exit(1);
});
