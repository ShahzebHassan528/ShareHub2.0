/**
 * Seed Swap Items
 * Creates sample swap items in the database for testing
 */

require('dotenv').config();
const { ProductSwap, Product, User } = require('./database/models');

async function seedSwapItems() {
  try {
    console.log('🌱 Seeding swap items...\n');

    // Get some products
    const products = await Product.findAll({
      where: { is_available: true },
      limit: 10
    });

    if (products.length < 2) {
      console.log('❌ Not enough products available. Need at least 2 products.');
      console.log('💡 Please add products first or run the product seed script.\n');
      return;
    }

    // Get some users
    const users = await User.findAll({ limit: 5 });

    if (users.length < 2) {
      console.log('❌ Not enough users. Need at least 2 users.');
      console.log('💡 Please create users first.\n');
      return;
    }

    console.log(`✅ Found ${products.length} products and ${users.length} users\n`);

    // Create swap items (these are products available for swap)
    // In the swap system, a ProductSwap represents a swap REQUEST
    // But for the home page, we want to show products that are available for swapping
    
    // Let's create some swap requests to populate the system
    const swapsToCreate = [];
    
    for (let i = 0; i < Math.min(5, products.length - 1); i++) {
      const requester = users[i % users.length];
      const owner = users[(i + 1) % users.length];
      const requesterProduct = products[i];
      const ownerProduct = products[i + 1];

      swapsToCreate.push({
        requester_id: requester.id,
        requester_product_id: requesterProduct.id,
        owner_id: owner.id,
        owner_product_id: ownerProduct.id,
        swap_number: `SWP${Date.now()}${i}`,
        status: 'pending',
        message: `I'd like to swap my ${requesterProduct.title} for your ${ownerProduct.title}`
      });
    }

    // Insert swap items
    const createdSwaps = await ProductSwap.bulkCreate(swapsToCreate);

    console.log(`✅ Created ${createdSwaps.length} swap items!\n`);

    // Display created swaps
    for (const swap of createdSwaps) {
      const ownerProduct = await Product.findByPk(swap.owner_product_id);
      const requesterProduct = await Product.findByPk(swap.requester_product_id);
      
      console.log(`📦 Swap ID ${swap.id}:`);
      console.log(`   ${requesterProduct.title} ⇄ ${ownerProduct.title}`);
      console.log(`   Status: ${swap.status}\n`);
    }

    console.log('✅ Swap items seeded successfully!\n');
    console.log('💡 Now refresh your home page to see the swap items.\n');

  } catch (error) {
    console.error('❌ Error seeding swap items:', error.message);
    console.error(error);
  } finally {
    process.exit(0);
  }
}

seedSwapItems();
