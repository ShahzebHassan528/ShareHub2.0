const express = require('express');
const { authenticate } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/checkAbility');
const NGO = require('../models/NGO.sequelize.wrapper');
const User = require('../models/User.sequelize.wrapper');
const Product = require('../models/Product.sequelize.wrapper');
const { AdminLog: AdminLogModel } = require('../database/models');

const router = express.Router();

console.log('🔧 Admin routes initialized with CASL authorization + NGO verification and user/product management endpoints');

// GET /api/admin/ngos/pending
router.get('/ngos/pending', authenticate, requireAdmin(), async (req, res) => {
  try {
    const pendingNGOs = await NGO.findPending();
    res.status(200).json({ success: true, count: pendingNGOs.length, data: pendingNGOs });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/admin/ngos/approved
router.get('/ngos/approved', authenticate, requireAdmin(), async (req, res) => {
  try {
    const approvedNGOs = await NGO.findApproved();
    res.status(200).json({ success: true, count: approvedNGOs.length, data: approvedNGOs });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT /api/admin/ngo/approve/:id
router.put('/ngo/approve/:id', authenticate, requireAdmin(), async (req, res) => {
  try {
    const ngoId = parseInt(req.params.id);
    const adminId = req.user.id;
    const ngo = await NGO.findById(ngoId);
    if (!ngo) return res.status(404).json({ success: false, error: 'NGO not found' });
    await NGO.approve(ngoId, adminId);
    await AdminLogModel.create({ admin_id: adminId, action: 'approve_ngo', target_type: 'ngo', target_id: ngoId, details: JSON.stringify({ ngo_name: ngo.ngo_name }) });
    res.status(200).json({ success: true, message: 'NGO approved successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT /api/admin/ngo/reject/:id
router.put('/ngo/reject/:id', authenticate, requireAdmin(), async (req, res) => {
  try {
    const ngoId = parseInt(req.params.id);
    const adminId = req.user.id;
    const { reason } = req.body;
    if (!reason) return res.status(400).json({ success: false, error: 'Reason is required' });
    const ngo = await NGO.findById(ngoId);
    if (!ngo) return res.status(404).json({ success: false, error: 'NGO not found' });
    await NGO.reject(ngoId, adminId, reason);
    await AdminLogModel.create({ admin_id: adminId, action: 'reject_ngo', target_type: 'ngo', target_id: ngoId, details: JSON.stringify({ ngo_name: ngo.ngo_name, reason }) });
    res.status(200).json({ success: true, message: 'NGO rejected successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/admin/users
router.get('/users', authenticate, requireAdmin(), async (req, res) => {
  try {
    const users = await User.findAllUsers({});
    res.status(200).json({ success: true, count: users.length, data: users });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT /api/admin/users/suspend/:id
router.put('/users/suspend/:id', authenticate, requireAdmin(), async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    const { reason } = req.body;
    if (!reason) return res.status(400).json({ success: false, error: 'Reason is required' });
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });
    if (user.role === 'admin') return res.status(403).json({ success: false, error: 'Cannot suspend admin' });
    await User.suspend(userId, req.user.id, reason);
    res.status(200).json({ success: true, message: 'User suspended successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT /api/admin/users/reactivate/:id
router.put('/users/reactivate/:id', authenticate, requireAdmin(), async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    await User.reactivate(userId);
    res.status(200).json({ success: true, message: 'User reactivated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT /api/admin/products/remove/:id
router.put('/products/remove/:id', authenticate, requireAdmin(), async (req, res) => {
  try {
    const productId = parseInt(req.params.id);
    const { reason } = req.body;
    if (!reason) return res.status(400).json({ success: false, error: 'Reason is required' });
    await Product.block(productId, req.user.id, reason);
    res.status(200).json({ success: true, message: 'Product blocked successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT /api/admin/products/unblock/:id
router.put('/products/unblock/:id', authenticate, requireAdmin(), async (req, res) => {
  try {
    const productId = parseInt(req.params.id);
    await Product.unblock(productId);
    res.status(200).json({ success: true, message: 'Product unblocked successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;