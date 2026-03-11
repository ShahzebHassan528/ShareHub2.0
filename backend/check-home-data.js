/**
 * Check Home Page Data
 * Verifies all data needed for home page sections
 */

require('dotenv').config();
const { Product, ProductSwap, NGO, Category } = require('./database/models');

async function checkHomeData() {
  try {
    console.log('🏠 Checking Home Page Data...\n');

    // Check Products (Just for You section)
    console.log('📦 PRODUCTS (Just for You):');
    const products = await Product.findAll({
      where: { is_available: true },
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['name']
        }
      ],
      limit: 4,
      order: [['created_at', 'DESC']]
    });
    
    console.log(`   Total Available: ${products.length}`);
    if (products.length > 0) {
      products.forEach((p, i) => {
        console.log(`   ${i + 1}. ${p.title} - PKR ${p.price} (${p.category?.name || 'No Category'})`);
      });
    } else {
      console.log('   ❌ No products found!');
    }

    // Check Swap Items
    console.log('\n🔄 SWAP ITEMS:');
    const swaps = await ProductSwap.findAll({
      where: { status: 'pending' },
      limit: 5,
      order: [['created_at', 'DESC']]
    });
    
    console.log(`   Total Available: ${swaps.length}`);
    if (swaps.length > 0) {
      swaps.forEach((s, i) => {
        console.log(`   ${i + 1}. Swap ID: ${s.id} - Status: ${s.status}`);
      });
    } else {
      console.log('   ❌ No swap items found!');
    }

    // Check NGOs
    console.log('\n❤️  VERIFIED NGOs:');
    const ngos = await NGO.findAll({
      where: { 
        verification_status: 'approved'
      },
      limit: 3,
      order: [['created_at', 'DESC']]
    });
    
    console.log(`   Total Verified: ${ngos.length}`);
    if (ngos.length > 0) {
      ngos.forEach((n, i) => {
        console.log(`   ${i + 1}. ${n.ngo_name} - ${n.address?.substring(0, 30)}...`);
      });
    } else {
      console.log('   ❌ No verified NGOs found!');
    }

    console.log('\n✅ Home Page Data Check Complete!\n');
    
    // Summary
    console.log('📊 SUMMARY:');
    console.log(`   Products: ${products.length >= 4 ? '✅' : '⚠️'} ${products.length}/4`);
    console.log(`   Swaps: ${swaps.length >= 5 ? '✅' : '⚠️'} ${swaps.length}/5`);
    console.log(`   NGOs: ${ngos.length >= 3 ? '✅' : '⚠️'} ${ngos.length}/3`);
    
    if (products.length >= 4 && swaps.length >= 5 && ngos.length >= 3) {
      console.log('\n🎉 All sections have enough data to display!\n');
    } else {
      console.log('\n⚠️  Some sections need more data. Run seed scripts if needed.\n');
    }

  } catch (error) {
    console.error('❌ Error checking home data:', error.message);
    console.error(error);
  } finally {
    process.exit(0);
  }
}

checkHomeData();
