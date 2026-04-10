/**
 * List all users in the database
 */

require('dotenv').config();
const { User } = require('./database/models');

async function listUsers() {
  try {
    const users = await User.findAll({
      attributes: ['id', 'full_name', 'email', 'role'],
      raw: true
    });

    console.log('📋 All Users in Database:\n');
    users.forEach(u => {
      console.log(`ID: ${u.id} | Name: ${u.full_name} | Email: ${u.email} | Role: ${u.role}`);
    });
    console.log(`\nTotal: ${users.length} user(s)`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    process.exit(0);
  }
}

listUsers();
