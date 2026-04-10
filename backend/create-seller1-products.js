require('dotenv').config();
const db = require('./config/database');

async function createSeller1Products() {
  try {
    console.log('Creating products for Seller 1 (Tech Store Owner - ID: 4)...\n');
    
    // Create products for seller_id = 4
    const products = [
      {
        seller_id: 4,
        category_id: 1, // Electronics
        title: 'Samsung Galaxy S24',
        description: 'Latest Samsung flagship phone with amazing camera',
        price: 89999,
        product_condition: 'new',
        location: 'Karachi',
        is_available: true
      },
      {
        seller_id: 4,
        category_id: 1,
        title: 'MacBook Pro M3',
        description: 'Brand new MacBook Pro with M3 chip',
        price: 349999,
        product_condition: 'new',
        location: 'Karachi',
        is_available: true
      },
      {
        seller_id: 4,
        category_id: 1,
        title: 'Sony WH-1000XM5 Headphones',
        description: 'Premium noise cancelling headphones',
        price: 45999,
        product_condition: 'like_new',
        location: 'Karachi',
        is_available: true
      }
    ];
    
    for (const product of products) {
      const [result] = await db.query(
        `INSERT INTO products (seller_id, category_id, title, description, price, product_condition, is_available, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        [product.seller_id, product.category_id, product.title, product.description, product.price, product.product_condition, product.is_available]
      );
      
      console.log(`✅ Created: ${product.title} (ID: ${result.insertId})`);
    }
    
    console.log('\n✅ All products created successfully!');
    console.log('\nNow Seller 1 (seller1@example.com) has products that can be used for swap requests.');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

createSeller1Products();
