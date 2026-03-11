-- Seed Data for Marketplace Database
-- Run this in phpMyAdmin SQL tab

-- 1. Insert Admin User
INSERT INTO users (email, password, full_name, phone, role, is_verified, created_at, updated_at) 
VALUES ('admin@marketplace.com', '$2a$10$rZ8qH9YvH5vH5vH5vH5vH.rZ8qH9YvH5vH5vH5vH5vH5vH5vH5vH5', 'Admin User', '03001234567', 'admin', 1, NOW(), NOW());

-- 2. Insert Seller Users
INSERT INTO users (email, password, full_name, phone, role, is_verified, created_at, updated_at) 
VALUES 
('ahmed@seller.com', '$2a$10$rZ8qH9YvH5vH5vH5vH5vH.rZ8qH9YvH5vH5vH5vH5vH5vH5vH5vH5', 'Ahmed Khan', '03001234568', 'seller', 1, NOW(), NOW()),
('fatima@seller.com', '$2a$10$rZ8qH9YvH5vH5vH5vH5vH.rZ8qH9YvH5vH5vH5vH5vH5vH5vH5vH5', 'Fatima Ali', '03001234569', 'seller', 1, NOW(), NOW());

-- 3. Insert Seller Profiles
INSERT INTO sellers (user_id, business_name, business_address, cnic, is_verified, created_at, updated_at)
VALUES 
(2, 'Ahmed Electronics', 'Saddar, Karachi', '42101-1234567-1', 1, NOW(), NOW()),
(3, 'Fatima Fashion', 'Gulberg, Lahore', '35202-2345678-2', 1, NOW(), NOW());

-- 4. Insert Categories
INSERT INTO categories (name, description, created_at, updated_at)
VALUES 
('Electronics', 'Electronic items', NOW(), NOW()),
('Clothing', 'Clothing items', NOW(), NOW()),
('Furniture', 'Furniture items', NOW(), NOW()),
('Books', 'Books and educational', NOW(), NOW()),
('Others', 'Other items', NOW(), NOW());

-- 5. Insert 15 Products for SALE
INSERT INTO products (seller_id, title, description, price, product_condition, location, product_status, is_available, created_at, updated_at)
VALUES 
(1, 'iPhone 13 Pro 256GB', 'Excellent condition, PTA approved', 145000, 'used', 'Karachi', 'approved', 1, NOW(), NOW()),
(1, 'Samsung Galaxy S22 Ultra', 'Like new with box', 135000, 'like_new', 'Lahore', 'approved', 1, NOW(), NOW()),
(1, 'MacBook Air M1', '8GB RAM, 256GB SSD', 185000, 'used', 'Islamabad', 'approved', 1, NOW(), NOW()),
(1, 'Sony PlayStation 5', 'Brand new sealed', 125000, 'new', 'Karachi', 'approved', 1, NOW(), NOW()),
(1, 'Canon EOS 90D Camera', 'Professional DSLR', 165000, 'used', 'Lahore', 'approved', 1, NOW(), NOW()),
(2, 'Branded Winter Jacket', 'Size L, imported', 4500, 'new', 'Karachi', 'approved', 1, NOW(), NOW()),
(2, 'Formal Suit 3-Piece', 'Premium fabric', 8500, 'new', 'Lahore', 'approved', 1, NOW(), NOW()),
(1, 'Wooden Study Table', 'Solid wood', 12000, 'good', 'Karachi', 'approved', 1, NOW(), NOW()),
(1, 'L-Shape Sofa Set', '7-seater fabric', 45000, 'like_new', 'Islamabad', 'approved', 1, NOW(), NOW()),
(2, 'Office Chair Executive', 'Ergonomic leather', 15000, 'new', 'Lahore', 'approved', 1, NOW(), NOW()),
(2, 'Medical Books Set', 'MBBS 1st year', 8000, 'good', 'Karachi', 'approved', 1, NOW(), NOW()),
(2, 'Programming Books', 'Python, JS, React', 5000, 'good', 'Lahore', 'approved', 1, NOW(), NOW()),
(1, 'Mountain Bike 21-Speed', 'Excellent condition', 25000, 'used', 'Islamabad', 'approved', 1, NOW(), NOW()),
(1, 'Treadmill Electric', 'Fully functional', 55000, 'used', 'Karachi', 'approved', 1, NOW(), NOW()),
(2, 'Air Conditioner 1.5 Ton', 'Inverter AC', 38000, 'used', 'Lahore', 'approved', 1, NOW(), NOW());

-- 6. Insert 15 Products for SWAP
INSERT INTO products (seller_id, title, description, price, product_condition, location, product_status, is_available, is_swap, created_at, updated_at)
VALUES 
(2, 'iPad Air 2020', 'Swap with iPhone', 0, 'used', 'Karachi', 'approved', 1, 1, NOW(), NOW()),
(2, 'Gaming Laptop HP Omen', 'Swap with MacBook', 0, 'used', 'Lahore', 'approved', 1, 1, NOW(), NOW()),
(1, 'Apple Watch Series 6', 'Swap with AirPods', 0, 'used', 'Islamabad', 'approved', 1, 1, NOW(), NOW()),
(1, 'Nintendo Switch', 'Swap with PS4', 0, 'used', 'Karachi', 'approved', 1, 1, NOW(), NOW()),
(2, 'Designer Handbag', 'Swap with shoes', 0, 'new', 'Lahore', 'approved', 1, 1, NOW(), NOW()),
(2, 'Leather Jacket', 'Swap with coat', 0, 'used', 'Karachi', 'approved', 1, 1, NOW(), NOW()),
(1, 'Dining Table 6-Seater', 'Swap with sofa', 0, 'good', 'Islamabad', 'approved', 1, 1, NOW(), NOW()),
(1, 'King Size Bed', 'Swap with wardrobe', 0, 'good', 'Lahore', 'approved', 1, 1, NOW(), NOW()),
(2, 'Bookshelf Wooden', 'Swap with table', 0, 'good', 'Karachi', 'approved', 1, 1, NOW(), NOW()),
(2, 'Engineering Books', 'Swap with medical books', 0, 'good', 'Lahore', 'approved', 1, 1, NOW(), NOW()),
(1, 'Novel Collection 50+', 'Swap with textbooks', 0, 'good', 'Karachi', 'approved', 1, 1, NOW(), NOW()),
(1, 'Electric Guitar', 'Swap with keyboard', 0, 'used', 'Islamabad', 'approved', 1, 1, NOW(), NOW()),
(2, 'DSLR Camera Nikon', 'Swap with Canon', 0, 'used', 'Lahore', 'approved', 1, 1, NOW(), NOW()),
(2, 'Smart Watch Samsung', 'Swap with earbuds', 0, 'used', 'Karachi', 'approved', 1, 1, NOW(), NOW()),
(1, 'Refrigerator Double Door', 'Swap with washing machine', 0, 'used', 'Islamabad', 'approved', 1, 1, NOW(), NOW());

-- 7. Insert 5 NGO Users
INSERT INTO users (email, password, full_name, phone, role, is_verified, created_at, updated_at)
VALUES 
('contact@edhi.org', '$2a$10$rZ8qH9YvH5vH5vH5vH5vH.rZ8qH9YvH5vH5vH5vH5vH5vH5vH5vH5', 'Edhi Foundation', '021-32721234', 'ngo', 1, NOW(), NOW()),
('info@shaukatkhanum.org', '$2a$10$rZ8qH9YvH5vH5vH5vH5vH.rZ8qH9YvH5vH5vH5vH5vH5vH5vH5vH5', 'Shaukat Khanum Hospital', '042-35905000', 'ngo', 1, NOW(), NOW()),
('info@tcf.org.pk', '$2a$10$rZ8qH9YvH5vH5vH5vH5vH.rZ8qH9YvH5vH5vH5vH5vH5vH5vH5vH5', 'The Citizens Foundation', '021-35821081', 'ngo', 1, NOW(), NOW()),
('info@akhuwat.org.pk', '$2a$10$rZ8qH9YvH5vH5vH5vH5vH.rZ8qH9YvH5vH5vH5vH5vH5vH5vH5vH5', 'Akhuwat Foundation', '042-37236180', 'ngo', 1, NOW(), NOW()),
('info@saylaniwelfare.com', '$2a$10$rZ8qH9YvH5vH5vH5vH5vH.rZ8qH9YvH5vH5vH5vH5vH5vH5vH5vH5', 'Saylani Welfare Trust', '021-34130786', 'ngo', 1, NOW(), NOW());

-- 8. Insert NGO Profiles
INSERT INTO ngos (user_id, ngo_name, registration_number, description, address, phone, website, is_verified, verification_status, created_at, updated_at)
VALUES 
(4, 'Edhi Foundation', 'NGO-001-2024', 'Pakistan largest welfare organization', 'Mithadar, Karachi', '021-32721234', 'www.edhi.org', 1, 'approved', NOW(), NOW()),
(5, 'Shaukat Khanum Memorial Cancer Hospital', 'NGO-002-2024', 'Leading cancer hospital', 'Johar Town, Lahore', '042-35905000', 'www.shaukatkhanum.org.pk', 1, 'approved', NOW(), NOW()),
(6, 'The Citizens Foundation', 'NGO-003-2024', 'Education-focused NGO', 'Clifton, Karachi', '021-35821081', 'www.tcf.org.pk', 1, 'approved', NOW(), NOW()),
(7, 'Akhuwat Foundation', 'NGO-004-2024', 'Interest-free microfinance', 'Data Darbar, Lahore', '042-37236180', 'www.akhuwat.org.pk', 1, 'approved', NOW(), NOW()),
(8, 'Saylani Welfare International Trust', 'NGO-005-2024', 'Food, education, medical care', 'Bahadurabad, Karachi', '021-34130786', 'www.saylaniwelfare.com', 1, 'approved', NOW(), NOW());
