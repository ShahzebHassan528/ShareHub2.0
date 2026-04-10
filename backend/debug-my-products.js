/**
 * Debug script to check "My Products" endpoint logic
 */

require('dotenv').config();
const { User, Seller, Product, ProductImage, Category } = require('./database/models');

async function debugMyProducts() {
  try {
    console.log('🔍 Debugging "My Products" endpoint logic...\n');

    // Get all users
    const users = await User.findAll({
      attributes: ['id', 'full_name', 'email', 'role'],
      raw: true
    });
    console.log('📋 All Users:');
    console.table(users);

    // Get all sellers
    const sellers = await Seller.findAll({
      attributes: ['id', 'user_id', 'business_name'],
      raw: true
    });
    console.log('\n📋 All Sellers:');
    console.table(sellers);

    // Get all products with seller info
    const products = await Product.findAll({
      attributes: ['id', 'title', 'seller_id', 'price'],
      raw: true
    });
    console.log('\n📋 All Products:');
    console.table(products);

    // Test for John Doe (user_id = 2)
    console.log('\n🧪 Testing for John Doe (user_id = 2)...');
    const johnDoe = await User.findOne({ where: { id: 2 } });
    if (!johnDoe) {
      console.log('❌ John Doe not found!');
      return;
    }
    console.log('✅ Found user:', johnDoe.full_name, '(ID:', johnDoe.id, ')');

    const johnSeller = await Seller.findOne({ where: { user_id: 2 } });
    if (!johnSeller) {
      console.log('❌ John Doe has no seller profile!');
      console.log('\n🔍 Checking which products have no matching seller...');
      
      // Find products where seller_id doesn't match any user_id in sellers table
      const orphanProducts = await Product.findAll({
        attributes: ['id', 'title', 'seller_id'],
        raw: true
      });
      
      for (const prod of orphanProducts) {
        const seller = await Seller.findOne({ where: { id: prod.seller_id } });
        if (seller) {
          console.log(`Product "${prod.title}" (ID: ${prod.id}) -> Seller ID: ${prod.seller_id} -> User ID: ${seller.user_id}`);
        } else {
          console.log(`Product "${prod.title}" (ID: ${prod.id}) -> Seller ID: ${prod.seller_id} -> ❌ NO SELLER FOUND`);
        }
      }
      return;
    }
    console.log('✅ Found seller profile: ID', johnSeller.id);

    const johnProducts = await Product.findAll({
      where: { seller_id: johnSeller.id },
      attributes: ['id', 'title', 'seller_id', 'price'],
      raw: true
    });
    console.log(`\n✅ John Doe's products (seller_id = ${johnSeller.id}):`);
    console.table(johnProducts);
    console.log(`\n📊 Total: ${johnProducts.length} product(s)`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    process.exit(0);
  }
}

debugMyProducts();
