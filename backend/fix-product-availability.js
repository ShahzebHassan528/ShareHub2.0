const { sequelize } = require('./database/models');

async function fixAvailability() {
  try {
    console.log('Checking product availability...\n');
    
    // Check current status
    const [products] = await sequelize.query(`
      SELECT id, title, is_available, product_status
      FROM products
      WHERE seller_id IN (SELECT id FROM sellers WHERE user_id = 2)
      ORDER BY id
    `);
    
    console.log('Current status of John Doe\'s products:');
    console.log('='.repeat(80));
    products.forEach(p => {
      console.log(`ID: ${p.id} | ${p.title.padEnd(30)} | Available: ${p.is_available} | Status: ${p.product_status}`);
    });
    
    // Update all products to be available
    const [result] = await sequelize.query(`
      UPDATE products 
      SET is_available = 1, product_status = 'active'
      WHERE product_status != 'blocked'
    `);
    
    console.log('\n' + '='.repeat(80));
    console.log(`✓ Updated ${result.affectedRows} products to be available`);
    
    // Check again
    const [updatedProducts] = await sequelize.query(`
      SELECT id, title, is_available, product_status
      FROM products
      WHERE seller_id IN (SELECT id FROM sellers WHERE user_id = 2)
      ORDER BY id
    `);
    
    console.log('\nUpdated status:');
    console.log('='.repeat(80));
    updatedProducts.forEach(p => {
      console.log(`ID: ${p.id} | ${p.title.padEnd(30)} | Available: ${p.is_available} | Status: ${p.product_status}`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

fixAvailability();
