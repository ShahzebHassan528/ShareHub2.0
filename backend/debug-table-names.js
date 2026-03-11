/**
 * DEBUG: Check which tables exist and their data
 */

const { sequelize } = require('./config/sequelize');

async function checkTables() {
  console.log('🔍 CHECKING ALL TABLES IN DATABASE\n');
  
  // Show all tables
  const [tables] = await sequelize.query('SHOW TABLES');
  console.log('📋 All tables in marketplace_db:');
  tables.forEach(table => {
    const tableName = Object.values(table)[0];
    console.log(`   - ${tableName}`);
  });
  console.log('');
  
  // Check if 'user' table exists (singular)
  const [userTable] = await sequelize.query("SHOW TABLES LIKE 'user'");
  console.log('Table "user" (singular) exists:', userTable.length > 0 ? 'YES' : 'NO');
  
  // Check if 'users' table exists (plural)
  const [usersTable] = await sequelize.query("SHOW TABLES LIKE 'users'");
  console.log('Table "users" (plural) exists:', usersTable.length > 0 ? 'YES' : 'NO');
  console.log('');
  
  // Count records in each if they exist
  if (userTable.length > 0) {
    const [userCount] = await sequelize.query('SELECT COUNT(*) as count FROM user');
    console.log('Records in "user" table:', userCount[0].count);
    
    // Show sample data
    const [userData] = await sequelize.query('SELECT id, email, role FROM user LIMIT 5');
    console.log('Sample data from "user":');
    userData.forEach(u => console.log(`   - ID: ${u.id}, Email: ${u.email}, Role: ${u.role}`));
    console.log('');
  }
  
  if (usersTable.length > 0) {
    const [usersCount] = await sequelize.query('SELECT COUNT(*) as count FROM users');
    console.log('Records in "users" table:', usersCount[0].count);
    
    // Show sample data
    const [usersData] = await sequelize.query('SELECT id, email, role FROM users LIMIT 5');
    console.log('Sample data from "users":');
    usersData.forEach(u => console.log(`   - ID: ${u.id}, Email: ${u.email}, Role: ${u.role}`));
    console.log('');
  }
  
  process.exit(0);
}

checkTables().catch(error => {
  console.error('❌ ERROR:', error);
  process.exit(1);
});
