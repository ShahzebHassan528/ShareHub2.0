const db = require('./config/database');

async function checkSellerProducts() {
  try {
    console.log('Checking products by seller...\n');
    
    // Check products for seller_id 1 and 4
    const [products] = await db.query(`
      SELECT 
        p.id,
        p.seller_id,
        p.title,
        p.price,
        p.is_available,
        u.full_name as seller_name,
        u.email as seller_email
      FROM products p
      LEFT JOIN users u ON p.seller_id = u.id
      WHERE p.seller_id IN (1, 4)
      ORDER BY p.seller_id, p.id
    `);
    
    console.log(`Found ${products.length} product(s):\n`);
    
    let currentSeller = null;
    products.forEach(product => {
      if (currentSeller !== product.seller_id) {
        currentSeller = product.seller_id;
        console.log(`\n=== SELLER: ${product.seller_name} (${product.seller_email}) - ID: ${product.seller_id} ===\n`);
      }
      console.log(`  Product ID: ${product.id}`);
      console.log(`  Title: ${product.title}`);
      console.log(`  Price: Rs. ${product.price}`);
      console.log(`  Available: ${product.is_available ? 'Yes' : 'No'}`);
      console.log('  ---');
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkSellerProducts();
