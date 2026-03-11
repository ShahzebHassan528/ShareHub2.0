/**
 * Fix Product Table - Add product_status column
 */

require('dotenv').config();
const { sequelize } = require('./config/sequelize');

async function fixProductTable() {
  try {
    console.log('');
    console.log('='.repeat(60));
    console.log('🔧 Fixing Product Table - Adding ALL Missing Columns');
    console.log('='.repeat(60));
    console.log('');

    await sequelize.authenticate();
    console.log('✅ Database connected');
    console.log('');

    // Check if columns exist
    const [columns] = await sequelize.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = '${process.env.DB_NAME}' 
      AND TABLE_NAME = 'products'
      AND COLUMN_NAME IN ('product_status', 'latitude', 'longitude', 'address')
    `);

    if (columns.length === 4) {
      console.log('✅ All columns already exist!');
      console.log('');
      process.exit(0);
    }

    console.log('📝 Adding missing columns...');
    
    // Check and add each column
    const columnsToAdd = [
      { name: 'product_status', sql: "ADD COLUMN product_status ENUM('active', 'blocked') DEFAULT 'active' AFTER is_approved" },
      { name: 'blocked_at', sql: "ADD COLUMN blocked_at DATETIME NULL AFTER product_status" },
      { name: 'blocked_by', sql: "ADD COLUMN blocked_by INT NULL AFTER blocked_at" },
      { name: 'block_reason', sql: "ADD COLUMN block_reason TEXT NULL AFTER blocked_by" },
      { name: 'approved_by', sql: "ADD COLUMN approved_by INT NULL AFTER is_approved" },
      { name: 'views', sql: "ADD COLUMN views INT DEFAULT 0 AFTER approved_by" },
      { name: 'latitude', sql: "ADD COLUMN latitude FLOAT NULL AFTER views" },
      { name: 'longitude', sql: "ADD COLUMN longitude FLOAT NULL AFTER latitude" },
      { name: 'address', sql: "ADD COLUMN address VARCHAR(500) NULL AFTER longitude" }
    ];

    for (const col of columnsToAdd) {
      const [existing] = await sequelize.query(`
        SELECT COLUMN_NAME 
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_SCHEMA = '${process.env.DB_NAME}' 
        AND TABLE_NAME = 'products'
        AND COLUMN_NAME = '${col.name}'
      `);

      if (existing.length === 0) {
        try {
          await sequelize.query(`ALTER TABLE products ${col.sql}`);
          console.log(`✅ Added ${col.name} column`);
        } catch (err) {
          if (!err.message.includes('Duplicate column')) {
            console.log(`⚠️  Could not add ${col.name}: ${err.message}`);
          }
        }
      } else {
        console.log(`ℹ️  ${col.name} already exists`);
      }
    }

    console.log('');
    console.log('='.repeat(60));
    console.log('✅ Product Table Fixed Successfully!');
    console.log('='.repeat(60));
    console.log('');

    process.exit(0);
  } catch (error) {
    console.error('');
    console.error('❌ Error:', error.message);
    console.error('');
    process.exit(1);
  }
}

fixProductTable();
