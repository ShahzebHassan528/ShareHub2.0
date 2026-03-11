const { sequelize } = require('./database/models');
const bcrypt = require('bcryptjs');

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...\n');

    // Get models
    const { User, Seller, Product, NGO, Category } = sequelize.models;

    // 1. Create Admin User
    const adminPassword = await bcrypt.hash('admin123', 10);
    const admin = await User.create({
      email: 'admin@sharehub.com',
      password: adminPassword,
      full_name: 'Admin User',
      phone: '03001234567',
      role: 'admin',
      is_active: true,
      is_verified: true
    });
    console.log('✓ Admin created');

    // 2. Create Categories
    const categories = await Category.bulkCreate([
      { name: 'Electronics', description: 'Electronic devices and gadgets', is_active: true },
      { name: 'Clothing', description: 'Clothes and fashion items', is_active: true },
      { name: 'Books', description: 'Books and educational materials', is_active: true },
      { name: 'Furniture', description: 'Home and office furniture', is_active: true },
      { name: 'Sports', description: 'Sports equipment and gear', is_active: true }
    ]);
    console.log('✓ Categories created');

    // 3. Create Seller Users and Sellers
    const sellerPassword = await bcrypt.hash('seller123', 10);
    const sellers = [];
    
    for (let i = 1; i <= 3; i++) {
      const sellerUser = await User.create({
        email: `seller${i}@sharehub.com`,
        password: sellerPassword,
        full_name: `Seller ${i}`,
        phone: `03001234${560 + i}`,
        role: 'seller',
        is_active: true,
        is_verified: true
      });

      const seller = await Seller.create({
        user_id: sellerUser.id,
        business_name: `Business ${i}`,
        business_address: `Shop ${i}, Main Market, Lahore`,
        approval_status: 'approved',
        approved_by: admin.id,
        approved_at: new Date(),
        rating: 4.5
      });

      sellers.push(seller);
    }
    console.log('✓ Sellers created');

    // 4. Create Products for Sale (15 items)
    const saleProducts = [
      { title: 'iPhone 13 Pro', description: 'Excellent condition, 256GB', price: 125000, product_condition: 'like_new', category: 0 },
      { title: 'Samsung Galaxy S21', description: 'Good working condition', price: 85000, product_condition: 'good', category: 0 },
      { title: 'MacBook Air M1', description: 'Barely used, like new', price: 180000, product_condition: 'like_new', category: 0 },
      { title: 'Sony Headphones', description: 'Noise cancelling', price: 15000, product_condition: 'good', category: 0 },
      { title: 'iPad Pro 11"', description: 'Perfect condition', price: 95000, product_condition: 'new', category: 0 },
      { title: 'Winter Jacket', description: 'Brand new, size L', price: 5000, product_condition: 'new', category: 1 },
      { title: 'Jeans Collection', description: '3 pairs, good condition', price: 3000, product_condition: 'good', category: 1 },
      { title: 'Formal Shoes', description: 'Leather, size 42', price: 4500, product_condition: 'like_new', category: 1 },
      { title: 'Programming Books Set', description: '5 books on web development', price: 2500, product_condition: 'good', category: 2 },
      { title: 'Office Desk', description: 'Wooden, sturdy', price: 12000, product_condition: 'good', category: 3 },
      { title: 'Gaming Chair', description: 'Ergonomic, adjustable', price: 18000, product_condition: 'like_new', category: 3 },
      { title: 'Cricket Bat', description: 'Professional grade', price: 8000, product_condition: 'good', category: 4 },
      { title: 'Football', description: 'Official size', price: 2000, product_condition: 'new', category: 4 },
      { title: 'Yoga Mat', description: 'Non-slip, with bag', price: 1500, product_condition: 'new', category: 4 },
      { title: 'Dumbbells Set', description: '5kg to 20kg', price: 15000, product_condition: 'good', category: 4 }
    ];

    for (let i = 0; i < saleProducts.length; i++) {
      const product = saleProducts[i];
      await Product.create({
        seller_id: sellers[i % 3].id,
        category_id: categories[product.category].id,
        title: product.title,
        description: product.description,
        price: product.price,
        product_condition: product.product_condition,
        quantity: 1,
        is_available: true,
        is_approved: true,
        approved_by: admin.id,
        product_status: 'active',
        views: Math.floor(Math.random() * 100)
      });
    }
    console.log('✓ Sale products created');

    // 5. Create Products for Swap (15 items)
    const swapProducts = [
      { title: 'Old iPhone 8', description: 'Working fine, want to swap', price: 35000, product_condition: 'good', category: 0 },
      { title: 'Android Phone', description: 'Samsung A50, good condition', price: 25000, product_condition: 'good', category: 0 },
      { title: 'Laptop Dell', description: 'Core i5, 8GB RAM', price: 45000, product_condition: 'fair', category: 0 },
      { title: 'Bluetooth Speaker', description: 'JBL, good sound', price: 5000, product_condition: 'good', category: 0 },
      { title: 'Smart Watch', description: 'Fitness tracker', price: 8000, product_condition: 'like_new', category: 0 },
      { title: 'Summer Clothes', description: 'T-shirts and shorts', price: 2000, product_condition: 'good', category: 1 },
      { title: 'Sneakers', description: 'Nike, size 41', price: 6000, product_condition: 'good', category: 1 },
      { title: 'Backpack', description: 'School/college bag', price: 1500, product_condition: 'good', category: 1 },
      { title: 'Novel Collection', description: '10 fiction books', price: 3000, product_condition: 'good', category: 2 },
      { title: 'Study Table', description: 'Small, portable', price: 5000, product_condition: 'fair', category: 3 },
      { title: 'Bookshelf', description: '4 shelves, wooden', price: 8000, product_condition: 'good', category: 3 },
      { title: 'Tennis Racket', description: 'Wilson brand', price: 4000, product_condition: 'good', category: 4 },
      { title: 'Badminton Set', description: '2 rackets + shuttles', price: 3000, product_condition: 'good', category: 4 },
      { title: 'Bicycle', description: 'Mountain bike, 21 gears', price: 25000, product_condition: 'good', category: 4 },
      { title: 'Skateboard', description: 'Good for beginners', price: 5000, product_condition: 'fair', category: 4 }
    ];

    for (let i = 0; i < swapProducts.length; i++) {
      const product = swapProducts[i];
      await Product.create({
        seller_id: sellers[i % 3].id,
        category_id: categories[product.category].id,
        title: product.title,
        description: product.description,
        price: product.price,
        product_condition: product.product_condition,
        quantity: 1,
        is_available: true,
        is_approved: true,
        approved_by: admin.id,
        product_status: 'active',
        views: Math.floor(Math.random() * 50)
      });
    }
    console.log('✓ Swap products created');

    // 6. Create NGO Users and NGOs
    const ngoPassword = await bcrypt.hash('ngo123', 10);
    const ngos = [
      {
        name: 'Edhi Foundation',
        reg: 'NGO-001-2020',
        desc: 'Pakistan\'s largest welfare organization providing healthcare, education, and social services',
        website: 'https://edhi.org'
      },
      {
        name: 'The Citizens Foundation',
        reg: 'NGO-002-2019',
        desc: 'Focused on providing quality education to underprivileged children across Pakistan',
        website: 'https://tcf.org.pk'
      },
      {
        name: 'Akhuwat Foundation',
        reg: 'NGO-003-2021',
        desc: 'Interest-free microfinance organization helping families become self-reliant',
        website: 'https://akhuwat.org.pk'
      },
      {
        name: 'Shaukat Khanum Hospital',
        reg: 'NGO-004-2018',
        desc: 'Cancer hospital providing free treatment to 75% of patients',
        website: 'https://shaukatkhanum.org.pk'
      },
      {
        name: 'Al-Khidmat Foundation',
        reg: 'NGO-005-2020',
        desc: 'Humanitarian organization providing healthcare, education, and disaster relief',
        website: 'https://alkhidmat.org'
      }
    ];

    for (let i = 0; i < ngos.length; i++) {
      const ngoData = ngos[i];
      const ngoUser = await User.create({
        email: `${ngoData.name.toLowerCase().replace(/\s+/g, '')}@ngo.com`,
        password: ngoPassword,
        full_name: ngoData.name,
        phone: `03001235${570 + i}`,
        role: 'ngo',
        is_active: true,
        is_verified: true
      });

      await NGO.create({
        user_id: ngoUser.id,
        ngo_name: ngoData.name,
        registration_number: ngoData.reg,
        address: `Office ${i + 1}, Main Boulevard, Lahore, Pakistan`,
        website: ngoData.website,
        description: ngoData.desc,
        verification_status: 'approved',
        verified_by: admin.id,
        verified_at: new Date(),
        latitude: 31.5204 + (i * 0.01),
        longitude: 74.3587 + (i * 0.01)
      });
    }
    console.log('✓ NGOs created');

    console.log('\n✅ Database seeding completed successfully!');
    console.log('\n📋 Login Credentials:');
    console.log('   Admin: admin@sharehub.com / admin123');
    console.log('   Seller 1: seller1@sharehub.com / seller123');
    console.log('   Seller 2: seller2@sharehub.com / seller123');
    console.log('   Seller 3: seller3@sharehub.com / seller123');
    console.log('\n📊 Created:');
    console.log('   ✓ 1 Admin');
    console.log('   ✓ 3 Sellers');
    console.log('   ✓ 5 Categories');
    console.log('   ✓ 15 Products for Sale');
    console.log('   ✓ 15 Products for Swap');
    console.log('   ✓ 5 NGOs');

  } catch (error) {
    console.error('❌ Seeding failed:', error);
  } finally {
    await sequelize.close();
  }
}

seedDatabase();
