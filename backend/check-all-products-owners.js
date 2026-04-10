const db = require('./config/database');

async function checkAllProducts() {
  try {
    console.log('Checking all products and their owners...\n');
    
    const [products] = await db.query(`
      SELECT 
        p.id,
        p.title,
        p.price,
        p.seller_id,
        u.full_name as seller_name,
        u.email as seller_email,
        u.role as seller_role,
        p.is_available,
        p.product_status
      FROM products p
      LEFT JOIN users u ON p.seller_id = u.id
      ORDER BY p.id
    `);
    
    console.log(`Found ${products.length} products:\n`);
    
    products.forEach(product => {
      console.log(`Product ID: ${product.id}`);
      console.log(`  Title: ${product.title}`);
      console.log(`  Price: Rs. ${product.price}`);
      console.log(`  Seller: ${product.seller_name} (${product.seller_email})`);
      console.log(`  Seller ID: ${product.seller_id}`);
      console.log(`  Status: ${product.product_status || 'active'}`);
      console.log(`  Available: ${product.is_available ? 'Yes' : 'No'}`);
      console.log('---\n');
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkAllProducts();
