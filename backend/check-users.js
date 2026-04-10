const db = require('./config/database');

async function checkUsers() {
  try {
    console.log('Checking users...\n');
    
    const [users] = await db.query(`
      SELECT id, email, full_name, role
      FROM users
      WHERE id IN (1, 2, 4)
      ORDER BY id
    `);
    
    users.forEach(user => {
      console.log(`ID: ${user.id}`);
      console.log(`Email: ${user.email}`);
      console.log(`Name: ${user.full_name}`);
      console.log(`Role: ${user.role}`);
      console.log('---\n');
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkUsers();
