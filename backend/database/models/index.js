const { sequelize } = require('../../config/sequelize');
const { DataTypes } = require('sequelize');

// Import all Sequelize models
const UserModel = require('./User.sequelize');
const SellerModel = require('./Seller.sequelize');
const NGOModel = require('./NGO.sequelize');
const CategoryModel = require('./Category.sequelize');
const ProductModel = require('./Product.sequelize');
const ProductImageModel = require('./ProductImage.sequelize');
const OrderModel = require('./Order.sequelize');
const OrderItemModel = require('./OrderItem.sequelize');
const DonationModel = require('./Donation.sequelize');
const ProductSwapModel = require('./ProductSwap.sequelize');
const ReviewModel = require('./Review.sequelize');
const AdminLogModel = require('./AdminLog.sequelize');
const NotificationModel = require('./Notification.sequelize');
const MessageModel = require('./Message.sequelize');

// Initialize models
const User = UserModel(sequelize, DataTypes);
const Seller = SellerModel(sequelize, DataTypes);
const NGO = NGOModel(sequelize, DataTypes);
const Category = CategoryModel(sequelize, DataTypes);
const Product = ProductModel(sequelize, DataTypes);
const ProductImage = ProductImageModel(sequelize, DataTypes);
const Order = OrderModel(sequelize, DataTypes);
const OrderItem = OrderItemModel(sequelize, DataTypes);
const Donation = DonationModel(sequelize, DataTypes);
const ProductSwap = ProductSwapModel(sequelize, DataTypes);
const Review = ReviewModel(sequelize, DataTypes);
const AdminLog = AdminLogModel(sequelize, DataTypes);
const Notification = NotificationModel(sequelize, DataTypes);
const Message = MessageModel(sequelize, DataTypes);

// Define associations
const setupAssociations = () => {
  // User associations
  User.hasOne(Seller, { foreignKey: 'user_id', as: 'sellerProfile' });
  User.hasOne(NGO, { foreignKey: 'user_id', as: 'ngoProfile' });
  User.hasMany(Order, { foreignKey: 'buyer_id', as: 'orders' });
  User.hasMany(Notification, { foreignKey: 'user_id', as: 'notifications' });
  User.hasMany(AdminLog, { foreignKey: 'admin_id', as: 'adminLogs' });

  // Seller associations
  Seller.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
  Seller.hasMany(Product, { foreignKey: 'seller_id', as: 'products' });
  Seller.hasMany(OrderItem, { foreignKey: 'seller_id', as: 'orderItems' });
  Seller.hasMany(Review, { foreignKey: 'seller_id', as: 'reviews' });

  // NGO associations
  NGO.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
  NGO.hasMany(Donation, { foreignKey: 'ngo_id', as: 'donations' });

  // Category associations
  Category.hasMany(Category, { foreignKey: 'parent_id', as: 'subcategories' });
  Category.belongsTo(Category, { foreignKey: 'parent_id', as: 'parent' });
  Category.hasMany(Product, { foreignKey: 'category_id', as: 'products' });

  // Product associations
  Product.belongsTo(Seller, { foreignKey: 'seller_id', as: 'seller' });
  Product.belongsTo(Category, { foreignKey: 'category_id', as: 'category' });
  Product.hasMany(ProductImage, { foreignKey: 'product_id', as: 'images' });
  Product.hasMany(OrderItem, { foreignKey: 'product_id', as: 'orderItems' });
  Product.hasMany(Review, { foreignKey: 'product_id', as: 'reviews' });
  Product.hasMany(Donation, { foreignKey: 'product_id', as: 'donations' });

  // ProductImage associations
  ProductImage.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });

  // Order associations
  Order.belongsTo(User, { foreignKey: 'buyer_id', as: 'buyer' });
  Order.hasMany(OrderItem, { foreignKey: 'order_id', as: 'items' });

  // OrderItem associations
  OrderItem.belongsTo(Order, { foreignKey: 'order_id', as: 'order' });
  OrderItem.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });
  OrderItem.belongsTo(Seller, { foreignKey: 'seller_id', as: 'seller' });

  // Donation associations
  Donation.belongsTo(User, { foreignKey: 'donor_id', as: 'donor' });
  Donation.belongsTo(NGO, { foreignKey: 'ngo_id', as: 'ngo' });
  Donation.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });

  // ProductSwap associations
  ProductSwap.belongsTo(User, { foreignKey: 'requester_id', as: 'requester' });
  ProductSwap.belongsTo(User, { foreignKey: 'owner_id', as: 'owner' });
  ProductSwap.belongsTo(Product, { foreignKey: 'requester_product_id', as: 'requesterProduct' });
  ProductSwap.belongsTo(Product, { foreignKey: 'owner_product_id', as: 'ownerProduct' });

  // Review associations
  Review.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });
  Review.belongsTo(User, { foreignKey: 'buyer_id', as: 'buyer' });
  Review.belongsTo(Seller, { foreignKey: 'seller_id', as: 'seller' });

  // AdminLog associations
  AdminLog.belongsTo(User, { foreignKey: 'admin_id', as: 'admin' });

  // Notification associations
  Notification.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

  // Message associations
  Message.belongsTo(User, { foreignKey: 'sender_id', as: 'sender' });
  Message.belongsTo(User, { foreignKey: 'receiver_id', as: 'receiver' });
  
  // User message associations
  User.hasMany(Message, { foreignKey: 'sender_id', as: 'sentMessages' });
  User.hasMany(Message, { foreignKey: 'receiver_id', as: 'receivedMessages' });
};

// Setup all associations
setupAssociations();

// Sync function (use carefully in production)
const syncDatabase = async (options = {}) => {
  try {
    await sequelize.sync(options);
    console.log('✅ Sequelize: All models synchronized successfully.');
  } catch (error) {
    console.error('❌ Sequelize: Error synchronizing models:', error.message);
    throw error;
  }
};

module.exports = {
  sequelize,
  User,
  Seller,
  NGO,
  Category,
  Product,
  ProductImage,
  Order,
  OrderItem,
  Donation,
  ProductSwap,
  Review,
  AdminLog,
  Notification,
  Message,
  syncDatabase
};
