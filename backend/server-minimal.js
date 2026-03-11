const express = require('express');
const cors = require('cors');
require('dotenv').config();

console.log('✅ Starting minimal server...');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Minimal server running!' });
});

// Auth routes - load dynamically
try {
  console.log('Loading auth routes...');
  const authRoutes = require('./routes/auth');
  app.use('/api/auth', authRoutes);
  console.log('✅ Auth routes loaded');
} catch (error) {
  console.error('❌ Failed to load auth routes:', error.message);
}

// Products routes
try {
  console.log('Loading products routes...');
  const productsRoutes = require('./routes/products');
  app.use('/api/products', productsRoutes);
  console.log('✅ Products routes loaded');
} catch (error) {
  console.error('❌ Failed to load products routes:', error.message);
}

// Dashboard routes
try {
  console.log('Loading dashboard routes...');
  const dashboardRoutes = require('./routes/dashboard');
  app.use('/api/dashboard', dashboardRoutes);
  console.log('✅ Dashboard routes loaded');
} catch (error) {
  console.error('❌ Failed to load dashboard routes:', error.message);
}

// Users routes
try {
  console.log('Loading users routes...');
  const usersRoutes = require('./routes/users');
  app.use('/api/users', usersRoutes);
  console.log('✅ Users routes loaded');
} catch (error) {
  console.error('❌ Failed to load users routes:', error.message);
}

// Swaps routes
try {
  console.log('Loading swaps routes...');
  const swapsRoutes = require('./routes/swaps');
  app.use('/api/swaps', swapsRoutes);
  console.log('✅ Swaps routes loaded');
} catch (error) {
  console.error('❌ Failed to load swaps routes:', error.message);
}

// Donations routes
try {
  console.log('Loading donations routes...');
  const donationsRoutes = require('./routes/donations');
  app.use('/api/donations', donationsRoutes);
  console.log('✅ Donations routes loaded');
} catch (error) {
  console.error('❌ Failed to load donations routes:', error.message);
}

// Notifications routes
try {
  console.log('Loading notifications routes...');
  const notificationsRoutes = require('./routes/notifications');
  app.use('/api/notifications', notificationsRoutes);
  console.log('✅ Notifications routes loaded');
} catch (error) {
  console.error('❌ Failed to load notifications routes:', error.message);
}

// Orders routes
try {
  console.log('Loading orders routes...');
  const ordersRoutes = require('./routes/orders');
  app.use('/api/orders', ordersRoutes);
  console.log('✅ Orders routes loaded');
} catch (error) {
  console.error('❌ Failed to load orders routes:', error.message);
}

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: err.message });
});

app.listen(PORT, () => {
  console.log('');
  console.log('='.repeat(60));
  console.log(`✅ MINIMAL SERVER RUNNING ON PORT ${PORT}`);
  console.log(`   Health: http://localhost:${PORT}/api/health`);
  console.log(`   Auth: http://localhost:${PORT}/api/auth/login`);
  console.log('='.repeat(60));
  console.log('');
});
