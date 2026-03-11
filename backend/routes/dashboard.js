/**
 * Dashboard Routes with Redis Caching
 */

const express = require('express');
const router = express.Router();
const { cacheMiddleware } = require('../middleware/cache');
const { authenticate, authorize } = require('../middleware/auth');
const { User, Product, Order, Donation, ProductSwap, Seller, NGO } = require('../database/models');
const { Op } = require('sequelize');

/**
 * GET /api/dashboard/stats - CACHED
 */
router.get('/stats',
  authenticate,
  authorize('admin'),
  cacheMiddleware(),
  async (req, res) => {
    try {
      // Get counts in parallel
      const [
        totalUsers,
        totalSellers,
        totalNGOs,
        totalProducts,
        totalOrders,
        totalDonations,
        totalSwaps,
        activeProducts,
        pendingOrders,
        completedOrders
      ] = await Promise.all([
        User.count(),
        Seller.count(),
        NGO.count(),
        Product.count(),
        Order.count(),
        Donation.count(),
        ProductSwap.count(),
        Product.count({ where: { availability_status: 'available' } }),
        Order.count({ where: { order_status: 'pending' } }),
        Order.count({ where: { order_status: 'delivered' } })
      ]);

      // Calculate revenue (sum of completed orders)
      const revenueResult = await Order.sum('total_amount', {
        where: { order_status: 'delivered' }
      });
      const totalRevenue = revenueResult || 0;

      // Get recent activity (last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const [
        newUsersThisWeek,
        newProductsThisWeek,
        newOrdersThisWeek
      ] = await Promise.all([
        User.count({ where: { created_at: { [Op.gte]: sevenDaysAgo } } }),
        Product.count({ where: { created_at: { [Op.gte]: sevenDaysAgo } } }),
        Order.count({ where: { created_at: { [Op.gte]: sevenDaysAgo } } })
      ]);

      res.json({
        success: true,
        stats: {
          users: {
            total: totalUsers,
            sellers: totalSellers,
            ngos: totalNGOs,
            new_this_week: newUsersThisWeek
          },
          products: {
            total: totalProducts,
            active: activeProducts,
            inactive: totalProducts - activeProducts,
            new_this_week: newProductsThisWeek
          },
          orders: {
            total: totalOrders,
            pending: pendingOrders,
            completed: completedOrders,
            new_this_week: newOrdersThisWeek
          },
          donations: {
            total: totalDonations
          },
          swaps: {
            total: totalSwaps
          },
          revenue: {
            total: parseFloat(totalRevenue).toFixed(2),
            currency: 'USD'
          }
        },
        generated_at: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      res.status(500).json({ 
        success: false,
        error: 'Failed to fetch dashboard statistics' 
      });
    }
  }
);

/**
 * GET /api/dashboard/seller-stats
 * Get seller-specific statistics
 * Cache TTL: 5 minutes
 * Seller only
 */
router.get('/seller-stats',
  authenticate,
  authorize('seller'),
  cacheMiddleware(),
  async (req, res) => {
    try {
      const sellerId = req.user.seller_id;

      if (!sellerId) {
        return res.status(400).json({ 
          success: false,
          error: 'Seller profile not found' 
        });
      }

      // Get seller statistics
      const [
        totalProducts,
        activeProducts,
        totalOrders,
        pendingOrders,
        completedOrders,
        totalViews
      ] = await Promise.all([
        Product.count({ where: { seller_id: sellerId } }),
        Product.count({ where: { seller_id: sellerId, availability_status: 'available' } }),
        Order.count({ 
          include: [{
            model: Product,
            where: { seller_id: sellerId }
          }]
        }),
        Order.count({ 
          where: { order_status: 'pending' },
          include: [{
            model: Product,
            where: { seller_id: sellerId }
          }]
        }),
        Order.count({ 
          where: { order_status: 'delivered' },
          include: [{
            model: Product,
            where: { seller_id: sellerId }
          }]
        }),
        Product.sum('view_count', { where: { seller_id: sellerId } })
      ]);

      // Calculate revenue
      const revenueResult = await Order.sum('total_amount', {
        where: { order_status: 'delivered' },
        include: [{
          model: Product,
          where: { seller_id: sellerId }
        }]
      });
      const totalRevenue = revenueResult || 0;

      res.json({
        success: true,
        stats: {
          products: {
            total: totalProducts,
            active: activeProducts,
            inactive: totalProducts - activeProducts,
            total_views: totalViews || 0
          },
          orders: {
            total: totalOrders,
            pending: pendingOrders,
            completed: completedOrders
          },
          revenue: {
            total: parseFloat(totalRevenue).toFixed(2),
            currency: 'USD'
          }
        },
        generated_at: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error fetching seller stats:', error);
      res.status(500).json({ 
        success: false,
        error: 'Failed to fetch seller statistics' 
      });
    }
  }
);

/**
 * GET /api/dashboard/buyer-stats
 * Get buyer-specific statistics
 * Cache TTL: 5 minutes
 * Buyer only
 */
router.get('/buyer-stats',
  authenticate,
  cacheMiddleware(),
  async (req, res) => {
    try {
      const userId = req.user.id;

      // Get buyer statistics
      const [
        totalOrders,
        pendingOrders,
        completedOrders,
        totalDonations,
        totalSwaps
      ] = await Promise.all([
        Order.count({ where: { buyer_id: userId } }),
        Order.count({ where: { buyer_id: userId, order_status: 'pending' } }),
        Order.count({ where: { buyer_id: userId, order_status: 'delivered' } }),
        Donation.count({ where: { donor_id: userId } }),
        ProductSwap.count({ where: { requester_id: userId } })
      ]);

      // Calculate total spent
      const spentResult = await Order.sum('total_amount', {
        where: { buyer_id: userId, order_status: 'delivered' }
      });
      const totalSpent = spentResult || 0;

      // Calculate total donated
      const donatedResult = await Donation.sum('amount', {
        where: { donor_id: userId, donation_status: 'completed' }
      });
      const totalDonated = donatedResult || 0;

      res.json({
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
            total_amount: parseFloat(totalDonated).toFixed(2)
          },
          swaps: {
            total: totalSwaps
          }
        },
        generated_at: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error fetching buyer stats:', error);
      res.status(500).json({ 
        success: false,
        error: 'Failed to fetch buyer statistics' 
      });
    }
  }
);

/**
 * GET /api/dashboard/ngo-stats
 * Get NGO-specific statistics
 * Cache TTL: 5 minutes
 * NGO only
 */
router.get('/ngo-stats',
  authenticate,
  authorize('ngo'),
  cacheMiddleware(),
  async (req, res) => {
    try {
      const ngoId = req.user.ngo_id;

      if (!ngoId) {
        return res.status(400).json({ 
          success: false,
          error: 'NGO profile not found' 
        });
      }

      // Get NGO statistics
      const [
        totalDonations,
        pendingDonations,
        acceptedDonations,
        completedDonations
      ] = await Promise.all([
        Donation.count({ where: { ngo_id: ngoId } }),
        Donation.count({ where: { ngo_id: ngoId, donation_status: 'pending' } }),
        Donation.count({ where: { ngo_id: ngoId, donation_status: 'accepted' } }),
        Donation.count({ where: { ngo_id: ngoId, donation_status: 'completed' } })
      ]);

      // Calculate total received
      const receivedResult = await Donation.sum('amount', {
        where: { ngo_id: ngoId, donation_status: 'completed' }
      });
      const totalReceived = receivedResult || 0;

      res.json({
        success: true,
        stats: {
          donations: {
            total: totalDonations,
            pending: pendingDonations,
            accepted: acceptedDonations,
            completed: completedDonations,
            total_received: parseFloat(totalReceived).toFixed(2)
          }
        },
        generated_at: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error fetching NGO stats:', error);
      res.status(500).json({ 
        success: false,
        error: 'Failed to fetch NGO statistics' 
      });
    }
  }
);

module.exports = router;
