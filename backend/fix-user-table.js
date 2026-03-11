const { sequelize } = require('./config/sequelize');
const { User } = require('./database/models');

async function fixUserTable() {
  try {
    console.log('🔧 Fixing users table schema...');
    console.log('');
    
    // Sync User model with alter: true to add missing columns
    await User.sync({ alter: true });
    
    console.log('✅ Users table schema updated successfully!');
    console.log('');
    console.log('Added columns:');
    console.log('  - address (TEXT)');
    console.log('  - profile_image (VARCHAR)');
    console.log('  - is_suspended (BOOLEAN)');
    console.log('  - suspended_at (DATE)');
    console.log('  - suspended_by (INTEGER)');
    console.log('  - suspension_reason (TEXT)');
    console.log('');
    
    // Verify the changes
    const [results] = await sequelize.query('DESCRIBE users');
    console.log('Current users table structure:');
    results.forEach(col => {
      console.log(`  - ${col.Field}: ${col.Type}`);
    });
    
    await sequelize.close();
    console.log('');
    console.log('✅ Done! You can now restart the server.');
    
  } catch (error) {
    console.error('❌ Error fixing table:', error.message);
    process.exit(1);
  }
}

fixUserTable();
