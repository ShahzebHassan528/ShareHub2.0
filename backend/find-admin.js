const { sequelize } = require('./database/models');

async function findAdmin() {
  try {
    const [results] = await sequelize.query(`
      SELECT id, full_name, email, role, is_suspended 
      FROM users 
      WHERE role = 'admin'
    `);
    
    console.log('Admin users found:');
    console.log('='.repeat(80));
    if (results.length === 0) {
      console.log('NO ADMIN USERS FOUND!');
    } else {
      results.forEach(user => {
        console.log(`ID: ${user.id} | Name: ${user.full_name} | Email: ${user.email} | Suspended: ${user.is_suspended}`);
      });
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

findAdmin();
