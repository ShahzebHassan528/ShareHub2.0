require('dotenv').config();
const { Product: ProductModel } = require('./database/models');

async function addProducts() {
  console.log('Creating products for Seller ID 1 (User ID 4 - Tech Store Owner)...\n');
  
  const products = [
    { seller_id: 1, category_id: null, title: 'Samsung Galaxy S24 Ultra', description: 'Latest Samsung flagship phone', price: 119999, product_condition: 'new', is_available: true },
    { seller_id: 1, category_id: null, title: 'MacBook Pro 16" M3 Max', description: 'Powerful laptop for professionals', price: 449999, product_condition: 'new', is_available: true },
    { seller_id: 1, category_id: null, title: 'Sony WH-1000XM5 Headphones', description: 'Best noise cancelling headphones', price: 54999, product_condition: 'new', is_available: true }
  ];
  
  for (const p of products) {
    const created = await ProductModel.create(p);
    console.log(`✅ Created: ${p.title} (Product ID: ${created.id})`);
  }
  
  console.log('\n✅ Done! Tech Store Owner (seller1@example.com) now has new products.');
  process.exit(0);
}

addProducts().catch(e => { console.error(e); process.exit(1); });
