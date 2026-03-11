/**
 * Check Swap Items in Database
 * This script checks what swap items are available in the database
 */

require('dotenv').config();
const { ProductSwap, Product, User, Category, ProductImage } = require('./database/models');

async function checkSwapItems() {
  try {
    console.log('🔍 Checking swap items in database...\n');

    // Get all product swaps
    const swaps = await ProductSwap.findAll({
      include: [
        {
          model: Product,
          as: 'ownerProduct',
          attributes: ['id', 'title', 'description', 'product_condition', 'price'],
          include: [
            {
              model: Category,
              as: 'category',
              attributes: ['name']
            }
          ]
        },
        {
          model: User,
          as: 'owner',
          attributes: ['id', 'full_name', 'email']
        }
      ],
      order: [['created_at', 'DESC']]
    });

    console.log(`📊 Total Swap Items: ${swaps.length}\n`);

    if (swaps.length === 0) {
      console.log('❌ No swap items found in database!');
      console.log('\n💡 To add swap items, you need to:');
      console.log('   1. Create products first (as a seller)');
      console.log('   2. Then create swap requests for those products');
      console.log('   3. Or run the seed script to populate test data\n');
      return;
    }

    // Display each swap item
    swaps.forEach((swap, index) => {
      const plain = swap.get({ plain: true });
      console.log(`\n${index + 1}. Swap ID: ${plain.id}`);
      console.log(`   Status: ${plain.status}`);
      console.log(`   Owner Product: ${plain.ownerProduct?.title || 'N/A'}`);
      console.log(`   Description: ${plain.ownerProduct?.description || 'N/A'}`);
      console.log(`   Condition: ${plain.ownerProduct?.product_condition || 'N/A'}`);
      console.log(`   Category: ${plain.ownerProduct?.category?.name || 'N/A'}`);
      console.log(`   Owner: ${plain.owner?.full_name || 'N/A'} (${plain.owner?.email || 'N/A'})`);
      console.log(`   Created: ${plain.created_at}`);
    });

    // Check products available for swap
    console.log('\n\n🔍 Checking products that could be used for swaps...\n');
    
    const products = await Product.findAll({
      where: { is_available: true },
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['name']
        }
      ],
      limit: 10,
      order: [['created_at', 'DESC']]
    });

    console.log(`📦 Available Products: ${products.length}\n`);

    if (products.length === 0) {
      console.log('❌ No products available for swap!');
      console.log('💡 You need to add products first before creating swaps.\n');
    } else {
      products.forEach((product, index) => {
        const plain = product.get({ plain: true });
        console.log(`${index + 1}. ${plain.title} - ${plain.category?.name || 'No Category'} - PKR ${plain.price}`);
      });
    }

    console.log('\n✅ Check complete!\n');

  } catch (error) {
    console.error('❌ Error checking swap items:', error.message);
    console.error(error);
  } finally {
    process.exit(0);
  }
}

checkSwapItems();
