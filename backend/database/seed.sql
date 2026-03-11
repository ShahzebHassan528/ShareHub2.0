-- Sample Data for Testing

USE marketplace_db;

-- Insert Admin User (password: admin123)
-- Bcrypt hash for 'admin123'
INSERT INTO users (email, password, full_name, phone, role, is_active, is_verified) VALUES
('admin@marketplace.com', '$2b$10$YQ98PzqCNy6B5qJZ5qJZ5eK5qJZ5qJZ5qJZ5qJZ5qJZ5qJZ5qJZ5q', 'Admin User', '1234567890', 'admin', TRUE, TRUE);

-- Insert Sample Buyers (password: buyer123)
INSERT INTO users (email, password, full_name, phone, role, is_active, is_verified) VALUES
('buyer1@example.com', '$2b$10$YQ98PzqCNy6B5qJZ5qJZ5eK5qJZ5qJZ5qJZ5qJZ5qJZ5qJZ5qJZ5q', 'John Doe', '9876543210', 'buyer', TRUE, TRUE),
('buyer2@example.com', '$2b$10$YQ98PzqCNy6B5qJZ5qJZ5eK5qJZ5qJZ5qJZ5qJZ5qJZ5qJZ5qJZ5q', 'Jane Smith', '9876543211', 'buyer', TRUE, TRUE);

-- Insert Sample Sellers (password: seller123)
INSERT INTO users (email, password, full_name, phone, role, is_active, is_verified) VALUES
('seller1@example.com', '$2b$10$YQ98PzqCNy6B5qJZ5qJZ5eK5qJZ5qJZ5qJZ5qJZ5qJZ5qJZ5qJZ5q', 'Tech Store Owner', '9876543212', 'seller', TRUE, TRUE),
('seller2@example.com', '$2b$10$YQ98PzqCNy6B5qJZ5qJZ5eK5qJZ5qJZ5qJZ5qJZ5qJZ5qJZ5qJZ5q', 'Fashion Hub Owner', '9876543213', 'seller', TRUE, FALSE);

-- Insert Seller Profiles
INSERT INTO sellers (user_id, business_name, business_address, business_license, approval_status, approved_by, approved_at) VALUES
(4, 'Tech Store', '123 Main St, City', 'LIC123456', 'approved', 1, NOW()),
(5, 'Fashion Hub', '456 Market Rd, Town', 'LIC789012', 'pending', NULL, NULL);

-- Insert Sample NGOs (password: ngo123)
INSERT INTO users (email, password, full_name, phone, role, is_active, is_verified) VALUES
('ngo1@example.com', '$2b$10$YQ98PzqCNy6B5qJZ5qJZ5eK5qJZ5qJZ5qJZ5qJZ5qJZ5qJZ5qJZ5q', 'Help Foundation', '9876543214', 'ngo', TRUE, TRUE),
('ngo2@example.com', '$2b$10$YQ98PzqCNy6B5qJZ5qJZ5eK5qJZ5qJZ5qJZ5qJZ5qJZ5qJZ5qJZ5q', 'Care Society', '9876543215', 'ngo', TRUE, FALSE);

-- Insert NGO Profiles
INSERT INTO ngos (user_id, ngo_name, registration_number, address, verification_status, verified_by, verified_at) VALUES
(6, 'Help Foundation', 'NGO123456', '789 Charity Lane, City', 'verified', 1, NOW()),
(7, 'Care Society', 'NGO789012', '321 Service St, Town', 'pending', NULL, NULL);

-- Insert Categories
INSERT INTO categories (name, description, parent_id) VALUES
('Electronics', 'Electronic items and gadgets', NULL),
('Clothing', 'Clothes and fashion items', NULL),
('Books', 'Books and educational materials', NULL),
('Furniture', 'Home and office furniture', NULL),
('Toys', 'Toys and games for children', NULL);

-- Insert Sample Products (4 per category)
-- Electronics (Category 1)
INSERT INTO products (seller_id, category_id, title, description, price, product_condition, quantity, is_available, is_approved, approved_by) VALUES
(1, 1, 'iPhone 13 Pro', 'Excellent condition iPhone 13 Pro with minimal signs of use. Comes with original box and accessories. Battery health at 95%.', 899.99, 'like_new', 3, TRUE, TRUE, 1),
(1, 1, 'MacBook Air M2', 'MacBook Air M2 2023 model, barely used. Perfect for students and professionals. Includes charger and case.', 1199.99, 'new', 2, TRUE, TRUE, 1),
(1, 1, 'Sony Headphones WH-1000XM4', 'Premium noise-cancelling headphones in good condition. All features working perfectly.', 249.99, 'good', 5, TRUE, TRUE, 1),
(1, 1, 'Canon EOS Camera', 'Canon EOS DSLR camera with 18-55mm lens. Great for photography enthusiasts. Includes camera bag.', 599.99, 'like_new', 1, TRUE, TRUE, 1),

-- Clothing (Category 2)
(1, 2, 'Winter Jacket - North Face', 'Warm winter jacket from North Face, barely used. Size L. Perfect for cold weather.', 89.99, 'new', 4, TRUE, TRUE, 1),
(1, 2, 'Running Shoes - Nike', 'Nike running shoes size 10. Comfortable and in excellent condition. Used only a few times.', 129.99, 'like_new', 3, TRUE, TRUE, 1),
(1, 2, 'Leather Handbag', 'Genuine leather handbag in brown color. Stylish and spacious with multiple compartments.', 79.99, 'good', 2, TRUE, TRUE, 1),
(1, 2, 'Denim Jeans - Levis', 'Classic Levis 501 jeans in blue. Size 32. Comfortable fit and durable material.', 49.99, 'like_new', 6, TRUE, TRUE, 1),

-- Books (Category 3)
(1, 3, 'Clean Code by Robert Martin', 'Essential book for software developers. Teaches best practices for writing clean, maintainable code.', 39.99, 'good', 5, TRUE, TRUE, 1),
(1, 3, 'Harry Potter Complete Set', 'All 7 Harry Potter books in excellent condition. Perfect gift for fantasy lovers.', 89.99, 'like_new', 2, TRUE, TRUE, 1),
(1, 3, 'The Lean Startup', 'Business book about building successful startups. Great condition with minimal wear.', 24.99, 'good', 4, TRUE, TRUE, 1),
(1, 3, 'JavaScript: The Good Parts', 'Classic JavaScript programming book. Essential for web developers learning JS fundamentals.', 29.99, 'good', 3, TRUE, TRUE, 1),

-- Furniture (Category 4)
(1, 4, 'Office Desk - Wooden', 'Solid wooden office desk with drawers. Perfect for home office setup. Dimensions: 120x60cm.', 199.99, 'good', 1, TRUE, TRUE, 1),
(1, 4, 'Gaming Chair - Ergonomic', 'Comfortable ergonomic gaming chair with lumbar support. Adjustable height and armrests.', 149.99, 'like_new', 2, TRUE, TRUE, 1),
(1, 4, 'Bookshelf - 5 Tier', 'Tall bookshelf with 5 tiers. Can hold books, decorations, and storage boxes. Easy to assemble.', 79.99, 'new', 3, TRUE, TRUE, 1),
(1, 4, 'Coffee Table - Modern', 'Modern glass-top coffee table with wooden legs. Perfect for living room. Dimensions: 100x50cm.', 119.99, 'good', 1, TRUE, TRUE, 1),

-- Toys (Category 5)
(1, 5, 'LEGO Star Wars Set', 'Complete LEGO Star Wars Millennium Falcon set. All pieces included. Great for ages 8+.', 159.99, 'like_new', 2, TRUE, TRUE, 1),
(1, 5, 'Remote Control Car', 'Fast RC car with rechargeable battery. Suitable for outdoor play. Includes remote controller.', 69.99, 'new', 4, TRUE, TRUE, 1),
(1, 5, 'Board Game Collection', 'Collection of 5 popular board games including Monopoly, Scrabble, and Chess. Family fun guaranteed.', 99.99, 'good', 1, TRUE, TRUE, 1),
(1, 5, 'Barbie Dreamhouse', 'Large Barbie dreamhouse with furniture and accessories. Perfect gift for kids. Gently used.', 89.99, 'good', 1, TRUE, TRUE, 1);

-- Insert Product Images (using emojis as placeholders)
INSERT INTO product_images (product_id, image_url, is_primary, display_order) VALUES
-- Electronics
(1, '📱', TRUE, 1),
(2, '💻', TRUE, 1),
(3, '🎧', TRUE, 1),
(4, '📷', TRUE, 1),
-- Clothing
(5, '🧥', TRUE, 1),
(6, '👟', TRUE, 1),
(7, '👜', TRUE, 1),
(8, '👖', TRUE, 1),
-- Books
(9, '📚', TRUE, 1),
(10, '📖', TRUE, 1),
(11, '📕', TRUE, 1),
(12, '📘', TRUE, 1),
-- Furniture
(13, '🪑', TRUE, 1),
(14, '🪑', TRUE, 1),
(15, '📚', TRUE, 1),
(16, '🛋️', TRUE, 1),
-- Toys
(17, '🧱', TRUE, 1),
(18, '🚗', TRUE, 1),
(19, '🎲', TRUE, 1),
(20, '🏠', TRUE, 1);

-- Insert Sample Swap Items (4 per category for user-to-user swaps)
-- Note: For swaps, we need products that users want to exchange
-- Electronics Swaps
INSERT INTO products (seller_id, category_id, title, description, price, product_condition, quantity, is_available, is_approved, approved_by) VALUES
(1, 1, 'PlayStation 5 Console', 'PS5 in excellent condition with 2 controllers and 3 games. Looking to swap for Xbox Series X.', 0, 'like_new', 1, TRUE, TRUE, 1),
(1, 1, 'iPad Pro 2022', 'iPad Pro 11 inch with Apple Pencil. Want to swap for Samsung Galaxy Tab or laptop.', 0, 'like_new', 1, TRUE, TRUE, 1),
(1, 1, 'Nintendo Switch', 'Nintendo Switch with games. Looking to swap for PS5 or gaming laptop.', 0, 'good', 1, TRUE, TRUE, 1),
(1, 1, 'Smart Watch - Apple Watch', 'Apple Watch Series 7. Want to swap for fitness tracker or wireless earbuds.', 0, 'like_new', 1, TRUE, TRUE, 1);

-- Insert images for swap items
INSERT INTO product_images (product_id, image_url, is_primary, display_order) VALUES
(21, '🎮', TRUE, 1),
(22, '📱', TRUE, 1),
(23, '🎮', TRUE, 1),
(24, '⌚', TRUE, 1);

-- Insert Swap Requests (linking products to swap marketplace)
INSERT INTO product_swaps (requester_id, requester_product_id, owner_id, owner_product_id, swap_number, status, message) VALUES
(2, 1, 2, 21, 'SWAP001', 'pending', 'Xbox Series X or Nintendo Switch'),
(2, 2, 2, 22, 'SWAP002', 'pending', 'Samsung Galaxy Tab or Laptop'),
(2, 3, 2, 23, 'SWAP003', 'pending', 'PS5 or Gaming Laptop'),
(2, 4, 2, 24, 'SWAP004', 'pending', 'Fitness Tracker or Wireless Earbuds');
