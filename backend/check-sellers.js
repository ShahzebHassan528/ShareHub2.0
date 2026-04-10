require('dotenv').config();
const db = require('./config/database');

async function checkSellers() {
  try {
    console.log('Checking sellers table...\n');
    
    const [sellers] = await db.query(`
      SELECT 
        s.id as seller_id,
        s.user_id,
        s.business_name,
        u.full_name,
        u.email,
        u.role
      FROM sellers s
      LEFT JOIN users u ON s.user_id = u.id
      ORDER BY s.id
    `);
    
    console.log(`Found ${sellers.length} seller(s):\n`);
    sellers.forEach(seller => {
      console.log(`Seller ID: ${seller.seller_id}`);
      console.log(`  User ID: ${seller.user_id}`);
      console.log(`  Business Name: ${seller.business_name}`);
      console.log(`  User Name: ${seller.full_name}`);
      console.log(`  Email: ${seller.email}`);
      console.log(`  Role: ${seller.role}`);
      console.log('---\n');
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkSellers();
