require('dotenv').config();
const { Product: ProductModel } = require('./database/models');

async function addProducts() {
  const products = [
    { seller_id: 4, category_id: null, title: 'Samsung Galaxy S24', description: 'Latest Samsung flagship', price: 89999, product_condition: 'new', is_available: true },
    { seller_id: 4, category_id: null, title: 'MacBook Pro M3', description: 'Brand new MacBook Pro', price: 349999, product_condition: 'new', is_available: true },
    { seller_id: 4, category_id: null, title: 'Sony WH-1000XM5', description: 'Premium headphones', price: 45999, product_condition: 'like_new', is_available: true }
  ];
  
  for (const p of products) {
    const created = await ProductModel.create(p);
    console.log(`✅ Created: ${p.title} (ID: ${created.id})`);
  }
  
  console.log('\n✅ Done! Seller 1 now has 3 products.');
  process.exit(0);
}

addProducts().catch(e => { console.error(e); process.exit(1); });
