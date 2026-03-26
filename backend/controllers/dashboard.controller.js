/**
 * Dashboard Controller (MVC Pattern)
 * Handles dashboard statistics HTTP requests
 */

const { User, Product, Order, OrderItem, Donation, ProductSwap, Seller, NGO } = require('../database/models');
const { Op } = require('sequelize');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

class DashboardController {
  /**
   * Get admin dashboard statistics
   * GET /api/v1/dashboard/stats
   */
  static getAdminStats = catchAsync(async (req, res, next) => {
    const [
      totalUsers, totalSellers, totalNGOs, totalProducts,
      totalOrders, totalDonations, totalSwaps,
      activeProducts, pendingOrders, completedOrders
    ] = await Promise.all([
      User.count(), Seller.count(), NGO.count(), Product.count(),
      Order.count(), Donation.count(), ProductSwap.count(),
      Product.count({ where: { is_available: true } }),
      Order.count({ where: { status: 'pending' } }),
      Order.count({ where: { status: 'delivered' } })
    ]);

    const revenueResult = await Order.sum('total_amount', { where: { status: 'delivered' } });
    const totalRevenue = revenueResult || 0;

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const [newUsersThisWeek, newProductsThisWeek, newOrdersThisWeek] = await Promise.all([
      User.count({ where: { created_at: { [Op.gte]: sevenDaysAgo } } }),
      Product.count({ where: { created_at: { [Op.gte]: sevenDaysAgo } } }),
      Order.count({ where: { created_at: { [Op.gte]: sevenDaysAgo } } })
    ]);

    res.status(200).json({
      success: true,
      stats: {
        users: { total: totalUsers, sellers: totalSellers, ngos: totalNGOs, new_this_week: newUsersThisWeek },
        products: { total: totalProducts, active: activeProducts, inactive: totalProducts - activeProducts, new_this_week: newProductsThisWeek },
        orders: { total: totalOrders, pending: pendingOrders, completed: completedOrders, new_this_week: newOrdersThisWeek },
        donations: { total: totalDonations },
        swaps: { total: totalSwaps },
        revenue: { total: parseFloat(totalRevenue).toFixed(2), currency: 'USD' }
      },
      generated_at: new Date().toISOString()
    });
  });

  /**
   * Get seller dashboard statistics
   * GET /api/v1/dashboard/seller-stats
   */
  static getSellerStats = catchAsync(async (req, res, next) => {
    const userId = req.user.id;

    const seller = await Seller.findOne({ where: { user_id: userId } });
    if (!seller) return next(new AppError('Seller profile not found', 400));
    const sellerId = seller.id;

    const [totalProducts, activeProducts, totalOrders, pendingOrders, completedOrders, totalViews] = await Promise.all([
      Product.count({ where: { seller_id: sellerId } }),
      Product.count({ where: { seller_id: sellerId, is_available: true } }),
      Order.count({ include: [{ model: OrderItem, as: 'items', required: true, where: { seller_id: sellerId } }] }),
      Order.count({ where: { status: 'pending' }, include: [{ model: OrderItem, as: 'items', required: true, where: { seller_id: sellerId } }] }),
      Order.count({ where: { status: 'delivered' }, include: [{ model: OrderItem, as: 'items', required: true, where: { seller_id: sellerId } }] }),
      Product.sum('views', { where: { seller_id: sellerId } })
    ]);

    // Revenue: fetch rows and sum in JS to avoid Sequelize literal alias issues
    const deliveredItems = await OrderItem.findAll({
      attributes: ['price', 'quantity'],
      where: { seller_id: sellerId },
      include: [{ model: Order, as: 'order', required: true, where: { status: 'delivered' }, attributes: [] }],
      raw: true
    });
    const totalRevenue = deliveredItems.reduce(
      (sum, item) => sum + parseFloat(item.price || 0) * parseInt(item.quantity || 0), 0
    );

    res.status(200).json({
      success: true,
      stats: {
        products: { total: totalProducts, active: activeProducts, inactive: totalProducts - activeProducts, total_views: totalViews || 0 },
        orders: { total: totalOrders, pending: pendingOrders, completed: completedOrders },
        revenue: { total: parseFloat(totalRevenue).toFixed(2), currency: 'USD' }
      },
      generated_at: new Date().toISOString()
    });
  });

  /**
   * Get buyer dashboard statistics
   * GET /api/v1/dashboard/buyer-stats
   *
   * FIX: Removed Donation.sum('amount') — the donations table has NO 'amount' column.
   * Donations in this app are product-based (a user donates a product to an NGO),
   * not monetary. Summing 'amount' caused a Sequelize crash → 500 error.
   */
  static getBuyerStats = catchAsync(async (req, res, next) => {
    const userId = req.user.id;

    const [totalOrders, pendingOrders, completedOrders, totalDonations, totalSwaps] = await Promise.all([
      Order.count({ where: { buyer_id: userId } }),
      Order.count({ where: { buyer_id: userId, status: 'pending' } }),
      Order.count({ where: { buyer_id: userId, status: 'delivered' } }),
      Donation.count({ where: { donor_id: userId } }),
      ProductSwap.count({ where: { requester_id: userId } })
    ]);

    const spentResult = await Order.sum('total_amount', {
      where: { buyer_id: userId, status: 'delivered' }
    });
    const totalSpent = spentResult || 0;

    res.status(200).json({
      success: true,
      stats: {
        orders: {
          total: totalOrders,
          pending: pendingOrders,
          completed: completedOrders,
          total_spent: parseFloat(totalSpent).toFixed(2)
        },
        donations: {
          total: totalDonations,
          total_amount: '0.00'  // No amount column — product-based donations
        },
        swaps: { total: totalSwaps }
      },
      generated_at: new Date().toISOString()
    });
  });

  /**
   * Get NGO dashboard statistics
   * GET /api/v1/dashboard/ngo-stats
   *
   * FIX: Removed Donation.sum('amount') — same reason as buyer stats above.
   */
  static getNGOStats = catchAsync(async (req, res, next) => {
    const userId = req.user.id;

    const ngo = await NGO.findOne({ where: { user_id: userId } });
    if (!ngo) return next(new AppError('NGO profile not found', 400));
    const ngoId = ngo.id;

    const [totalDonations, pendingDonations, acceptedDonations, completedDonations] = await Promise.all([
      Donation.count({ where: { ngo_id: ngoId } }),
      Donation.count({ where: { ngo_id: ngoId, status: 'pending' } }),
      Donation.count({ where: { ngo_id: ngoId, status: 'accepted' } }),
      Donation.count({ where: { ngo_id: ngoId, status: 'completed' } })
    ]);

    res.status(200).json({
      success: true,
      stats: {
        donations: {
          total: totalDonations,
          pending: pendingDonations,
          accepted: acceptedDonations,
          completed: completedDonations,
          total_received: '0.00'  // No amount column — product-based donations
        }
      },
      generated_at: new Date().toISOString()
    });
  });
}

module.exports = DashboardController;
