/**
 * Fix NGO Table - Add latitude and longitude columns
 */

require('dotenv').config();
const { sequelize } = require('./config/sequelize');
const db = require('./database/models');

async function fixNgoTable() {
  try {
    console.log('');
    console.log('='.repeat(60));
    console.log('🔧 Fixing NGO Table - Adding Location Columns');
    console.log('='.repeat(60));
    console.log('');

    // Test connection
    await sequelize.authenticate();
    console.log('✅ Database connected');
    console.log('');

    // Check if columns exist
    const [columns] = await sequelize.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = '${process.env.DB_NAME}' 
      AND TABLE_NAME = 'ngos'
      AND COLUMN_NAME IN ('latitude', 'longitude')
    `);

    if (columns.length === 2) {
      console.log('✅ Columns already exist!');
      console.log('   - latitude');
      console.log('   - longitude');
      console.log('');
      console.log('No changes needed.');
      process.exit(0);
    }

    console.log('📝 Adding missing columns to NGO table...');
    console.log('');

    // Add latitude column if missing
    if (!columns.find(c => c.COLUMN_NAME === 'latitude')) {
      await sequelize.query(`
        ALTER TABLE ngos 
        ADD COLUMN latitude FLOAT NULL 
        COMMENT 'NGO location latitude'
      `);
      console.log('✅ Added latitude column');
    }

    // Add longitude column if missing
    if (!columns.find(c => c.COLUMN_NAME === 'longitude')) {
      await sequelize.query(`
        ALTER TABLE ngos 
        ADD COLUMN longitude FLOAT NULL 
        COMMENT 'NGO location longitude'
      `);
      console.log('✅ Added longitude column');
    }

    // Add index for location-based queries
    try {
      await sequelize.query(`
        CREATE INDEX idx_ngo_location ON ngos(latitude, longitude)
      `);
      console.log('✅ Added location index');
    } catch (err) {
      if (err.message.includes('Duplicate key name')) {
        console.log('ℹ️  Location index already exists');
      } else {
        throw err;
      }
    }

    console.log('');
    console.log('='.repeat(60));
    console.log('✅ NGO Table Fixed Successfully!');
    console.log('='.repeat(60));
    console.log('');
    console.log('Next step: Restart your backend server');
    console.log('   cd backend');
    console.log('   npm start');
    console.log('');

    process.exit(0);
  } catch (error) {
    console.error('');
    console.error('❌ Error fixing NGO table:', error.message);
    console.error('');
    console.error('SQL Error:', error.sql || 'N/A');
    console.error('');
    process.exit(1);
  }
}

fixNgoTable();
