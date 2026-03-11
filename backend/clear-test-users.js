require('dotenv').config();
const { sequelize } = require('./config/sequelize');

async function clearTestUsers() {
  try {
    await sequelize.authenticate();
    console.log('✅ Connected to database\n');
    
    console.log('🗑️  Clearing all test users and related data...\n');
    
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 0');
    
    // Clear all test data
    await sequelize.query('DELETE FROM sellers');
    console.log('✓ Cleared sellers');
    
    await sequelize.query('DELETE FROM ngos');
    console.log('✓ Cleared ngos');
    
    await sequelize.query('DELETE FROM users');
    console.log('✓ Cleared users');
    
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
    
    console.log('\n✅ All test data cleared successfully!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await sequelize.close();
    process.exit(0);
  }
}

clearTestUsers();
