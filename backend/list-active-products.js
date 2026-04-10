const { sequelize } = require('./database/models');

async function listProducts() {
  try {
    const [results] = await sequelize.query(`
      SELECT id, title, product_status, is_available
      FROM products 
      ORDER BY id
    `);
    
    console.log('All Products:');
    console.log('='.repeat(80));
    results.forEach(p => {
      const status = p.product_status || 'active';
      const icon = status === 'blocked' ? '🚫' : '✓';
      console.log(`${icon} ID: ${p.id} | ${p.title.padEnd(30)} | Status: ${status}`);
    });
    
    const activeProducts = results.filter(p => p.product_status !== 'blocked');
    console.log('\n' + '='.repeat(80));
    console.log(`Active products: ${activeProducts.length}`);
    console.log(`Blocked products: ${results.length - activeProducts.length}`);
    
    if (activeProducts.length > 0) {
      console.log('\nYou can test blocking these product IDs:');
      console.log(activeProducts.slice(0, 5).map(p => p.id).join(', '));
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

listProducts();
