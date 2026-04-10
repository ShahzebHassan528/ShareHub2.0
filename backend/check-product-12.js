const { sequelize } = require('./database/models');

async function checkProduct() {
  try {
    const [products] = await sequelize.query(`
      SELECT p.*, s.user_id as seller_user_id, u.full_name as seller_name
      FROM products p
      LEFT JOIN sellers s ON p.seller_id = s.id
      LEFT JOIN users u ON s.user_id = u.id
      WHERE p.id = 12
    `);
    
    if (products.length === 0) {
      console.log('Product 12 not found!');
      process.exit(1);
    }
    
    const product = products[0];
    console.log('Product 12 Details:');
    console.log('='.repeat(80));
    console.log(`ID: ${product.id}`);
    console.log(`Title: ${product.title}`);
    console.log(`Price: Rs. ${product.price}`);
    console.log(`Seller ID: ${product.seller_id}`);
    console.log(`Seller User ID: ${product.seller_user_id}`);
    console.log(`Seller Name: ${product.seller_name}`);
    console.log(`Is Available: ${product.is_available}`);
    console.log(`Product Status: ${product.product_status}`);
    console.log(`Created: ${product.created_at}`);
    
    // Also check product 21 (iPhone 11 - John Doe's product)
    const [product21] = await sequelize.query(`
      SELECT p.*, s.user_id as seller_user_id
      FROM products p
      LEFT JOIN sellers s ON p.seller_id = s.id
      WHERE p.id = 21
    `);
    
    if (product21.length > 0) {
      const p21 = product21[0];
      console.log('\n' + '='.repeat(80));
      console.log('Product 21 (iPhone 11 - Your Product):');
      console.log('='.repeat(80));
      console.log(`ID: ${p21.id}`);
      console.log(`Title: ${p21.title}`);
      console.log(`Seller ID: ${p21.seller_id}`);
      console.log(`Seller User ID: ${p21.seller_user_id}`);
      console.log(`Is Available: ${p21.is_available}`);
      console.log(`Product Status: ${p21.product_status}`);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

checkProduct();
