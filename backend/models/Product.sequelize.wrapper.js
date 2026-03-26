/**
 * Product Model - Sequelize Wrapper
 */

const { Product: ProductModel, Seller, Category, User, ProductImage } = require('../database/models');
const { Op } = require('sequelize');

class Product {
  static async findAll(filters = {}) {
    console.log('🔷 Product.findAll() called with Sequelize, filters:', filters);
    try {
      const whereClause = { is_available: true, is_approved: true };
      const includeClause = [
        {
          model: Category,
          as: 'category',
          attributes: ['name'],
          where: filters.category ? { name: filters.category } : undefined
        },
        {
          model: Seller,
          as: 'seller',
          attributes: ['business_name'],
          include: [{ model: User, as: 'user', attributes: ['full_name'] }]
        }
      ];

      if (filters.minPrice) whereClause.price = { [Op.gte]: filters.minPrice };
      if (filters.maxPrice) whereClause.price = { ...whereClause.price, [Op.lte]: filters.maxPrice };
      if (filters.condition) whereClause.product_condition = filters.condition;
      if (filters.seller_id) whereClause.seller_id = filters.seller_id;

      const products = await ProductModel.findAll({
        where: whereClause,
        include: includeClause,
        order: [['created_at', 'DESC']],
        raw: false
      });

      const result = await Promise.all(products.map(async (product) => {
        const plain = product.get({ plain: true });
        const primaryImage = await ProductImage.findOne({
          where: { product_id: plain.id, is_primary: true },
          attributes: ['image_url'],
          raw: true
        });
        return {
          ...plain,
          category_name: plain.category?.name || null,
          business_name: plain.seller?.business_name || null,
          seller_name: plain.seller?.user?.full_name || null,
          primary_image: primaryImage?.image_url || null,
          category: undefined,
          seller: undefined
        };
      }));

      console.log('✅ Product.findAll() successful, found:', result.length);
      return result;
    } catch (error) {
      console.error('❌ Product.findAll() failed:', error.message);
      throw error;
    }
  }

  static async findById(id) {
    console.log('🔷 Product.findById() called with Sequelize for ID:', id);
    try {
      const product = await ProductModel.findByPk(id, {
        include: [
          { model: Category, as: 'category', attributes: ['name'] },
          {
            model: Seller,
            as: 'seller',
            attributes: ['business_name', 'business_address'],
            include: [{ model: User, as: 'user', attributes: ['full_name', 'email', 'phone'] }]
          }
        ],
        raw: false
      });

      if (!product) return null;

      const plain = product.get({ plain: true });
      const images = await ProductImage.findAll({
        where: { product_id: plain.id },
        attributes: ['image_url', 'is_primary'],
        order: [['display_order', 'ASC']],
        raw: true
      });

      return {
        ...plain,
        category_name: plain.category?.name || null,
        business_name: plain.seller?.business_name || null,
        business_address: plain.seller?.business_address || null,
        seller_name: plain.seller?.user?.full_name || null,
        seller_email: plain.seller?.user?.email || null,
        seller_phone: plain.seller?.user?.phone || null,
        images,
        category: undefined,
        seller: undefined
      };
    } catch (error) {
      console.error('❌ Product.findById() failed:', error.message);
      throw error;
    }
  }

  static async findBySeller(sellerId) {
    console.log('🔷 Product.findBySeller() called for seller:', sellerId);
    try {
      const products = await ProductModel.findAll({
        where: { seller_id: sellerId },
        include: [{ model: Category, as: 'category', attributes: ['name'] }],
        order: [['created_at', 'DESC']],
        raw: false
      });

      return products.map(p => {
        const plain = p.get({ plain: true });
        return { ...plain, category_name: plain.category?.name || null, category: undefined };
      });
    } catch (error) {
      console.error('❌ Product.findBySeller() failed:', error.message);
      throw error;
    }
  }

  static async create(productData) {
    console.log('🔷 Product.create() called with Sequelize');
    try {
      const product = await ProductModel.create({
        seller_id: productData.seller_id,
        category_id: productData.category_id || null,
        title: productData.title,
        description: productData.description,
        price: productData.price,
        product_condition: productData.product_condition,
        quantity: productData.quantity || 1,
        is_available: productData.is_available !== undefined ? productData.is_available : true,
        is_approved: productData.is_approved || false,
        latitude: productData.latitude || null,
        longitude: productData.longitude || null,
        address: productData.address || productData.location || null
      });

      console.log('✅ Product.create() successful, ID:', product.id);
      return product.id;
    } catch (error) {
      console.error('❌ Product.create() failed:', error.message);
      throw error;
    }
  }

  static async update(productId, updateData) {
    console.log('🔷 Product.update() called for ID:', productId);
    try {
      await ProductModel.update(updateData, { where: { id: productId } });
      console.log('✅ Product.update() successful');
    } catch (error) {
      console.error('❌ Product.update() failed:', error.message);
      throw error;
    }
  }

  /**
   * FIX: This method was missing — caused "Product.delete is not a function" crash
   */
  static async delete(productId) {
    console.log('🔷 Product.delete() called for ID:', productId);
    try {
      const deleted = await ProductModel.destroy({ where: { id: productId } });
      console.log('✅ Product.delete() successful, rows deleted:', deleted);
      return deleted > 0;
    } catch (error) {
      console.error('❌ Product.delete() failed:', error.message);
      throw error;
    }
  }

  static async incrementViews(productId) {
    try {
      await ProductModel.increment('views', { where: { id: productId } });
    } catch (error) {
      console.error('❌ Product.incrementViews() failed:', error.message);
      throw error;
    }
  }

  static async updateAvailability(productId, isAvailable) {
    try {
      await ProductModel.update({ is_available: isAvailable }, { where: { id: productId } });
    } catch (error) {
      console.error('❌ Product.updateAvailability() failed:', error.message);
      throw error;
    }
  }

  static async approve(productId, adminId) {
    try {
      await ProductModel.update({ is_approved: true, approved_by: adminId }, { where: { id: productId } });
    } catch (error) {
      console.error('❌ Product.approve() failed:', error.message);
      throw error;
    }
  }

  static async block(productId, adminId, reason) {
    try {
      await ProductModel.update(
        { product_status: 'blocked', is_available: false, blocked_at: new Date(), blocked_by: adminId, block_reason: reason },
        { where: { id: productId } }
      );
    } catch (error) {
      console.error('❌ Product.block() failed:', error.message);
      throw error;
    }
  }

  static async unblock(productId) {
    try {
      await ProductModel.update(
        { product_status: 'active', is_available: true, blocked_at: null, blocked_by: null, block_reason: null },
        { where: { id: productId } }
      );
    } catch (error) {
      console.error('❌ Product.unblock() failed:', error.message);
      throw error;
    }
  }

  static async search(searchTerm) {
    try {
      const products = await ProductModel.findAll({
        where: {
          is_available: true,
          is_approved: true,
          [Op.or]: [
            { title: { [Op.like]: `%${searchTerm}%` } },
            { description: { [Op.like]: `%${searchTerm}%` } }
          ]
        },
        include: [{ model: Category, as: 'category', attributes: ['name'] }],
        order: [['created_at', 'DESC']],
        raw: false
      });

      return products.map(p => {
        const plain = p.get({ plain: true });
        return { ...plain, category_name: plain.category?.name || null, category: undefined };
      });
    } catch (error) {
      console.error('❌ Product.search() failed:', error.message);
      throw error;
    }
  }

  static async findNearby(latitude, longitude, radiusKm = 5) {
    try {
      const { sequelize } = require('../database/models');
      const haversineFormula = `
        (6371 * acos(
          cos(radians(${latitude})) * cos(radians(latitude)) *
          cos(radians(longitude) - radians(${longitude})) +
          sin(radians(${latitude})) * sin(radians(latitude))
        ))
      `;

      const products = await ProductModel.findAll({
        attributes: { include: [[sequelize.literal(haversineFormula), 'distance']] },
        where: {
          is_available: true, is_approved: true, product_status: 'active',
          latitude: { [Op.ne]: null }, longitude: { [Op.ne]: null },
          [Op.and]: [sequelize.where(sequelize.literal(haversineFormula), '<=', radiusKm)]
        },
        include: [
          { model: Category, as: 'category', attributes: ['name'] },
          { model: Seller, as: 'seller', attributes: ['business_name'] }
        ],
        order: [[sequelize.literal('distance'), 'ASC']],
        raw: false
      });

      return await Promise.all(products.map(async (product) => {
        const plain = product.get({ plain: true });
        const primaryImage = await ProductImage.findOne({
          where: { product_id: plain.id, is_primary: true },
          attributes: ['image_url'], raw: true
        });
        return {
          ...plain,
          distance: parseFloat(plain.distance).toFixed(2),
          category_name: plain.category?.name || null,
          business_name: plain.seller?.business_name || null,
          primary_image: primaryImage?.image_url || null,
          category: undefined, seller: undefined
        };
      }));
    } catch (error) {
      console.error('❌ Product.findNearby() failed:', error.message);
      throw error;
    }
  }
}

module.exports = Product;