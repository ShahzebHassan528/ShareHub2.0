const Product = require('./models/Product.sequelize.wrapper');

async function testBlock() {
  try {
    console.log('Testing product block...\n');
    
    // Get product 10
    const product = await Product.findById(10);
    console.log('Product before block:', {
      id: product.id,
      title: product.title,
      status: product.product_status,
      is_available: product.is_available
    });
    
    // Block it
    console.log('\nBlocking product...');
    await Product.block(10, 1, 'Test block reason');
    
    // Check again
    const productAfter = await Product.findById(10);
    console.log('\nProduct after block:', {
      id: productAfter.id,
      title: productAfter.title,
      status: productAfter.product_status,
      is_available: productAfter.is_available,
      block_reason: productAfter.block_reason,
      blocked_by: productAfter.blocked_by
    });
    
    console.log('\n✅ Block successful!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

testBlock();
