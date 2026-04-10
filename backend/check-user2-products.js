/**
 * Quick check for User 2 (John Doe) products
 */

require('dotenv').config();
const { User, Seller, Product } = require('./database/models');

async function checkUser2Products() {
  try {
    console.log('🔍 Checking User 2 (John Doe) products...\n');

    // Find user
    const user = await User.findOne({ where: { id: 2 }, raw: true });
    if (!user) {
      console.log('❌ User 2 not found!');
      return;
    }
    console.log('✅ User found:', user.full_name, '(', user.email, ')');

    // Find seller profile
    const seller = await Seller.findOne({ where: { user_id: 2 }, raw: true });
    if (!seller) {
      console.log('❌ No seller profile for user 2');
      return;
    }
    console.log('✅ Seller profile found: ID', seller.id);

    // Find products
    const products = await Product.findAll({
      where: { seller_id: seller.id },
      attributes: ['id', 'title', 'price', 'created_at'],
      raw: true,
      order: [['created_at', 'DESC']]
    });

    console.log(`\n📦 Products for seller ${seller.id}:`);
    if (products.length === 0) {
      console.log('   No products found');
    } else {
      console.table(products);
    }

    console.log(`\n📊 Total: ${products.length} product(s)`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    process.exit(0);
  }
}

checkUser2Products();
