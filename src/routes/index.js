const express = require('express');
const router = express.Router();

// Import route modules
const authRoutes = require('./authRoutes');
const consentRoutes = require('./consentRoutes');
const accessLogRoutes = require('./accessLogRoutes');
const complianceRoutes = require('./complianceRoutes');
const organizationRoutes = require('./organizationRoutes');
const dashboardRoutes = require('./dashboardRoutes');

// Mount routes
router.use('/auth', authRoutes);
router.use('/consent', consentRoutes);
router.use('/access-logs', accessLogRoutes);
router.use('/compliance', complianceRoutes);
router.use('/organizations', organizationRoutes);
router.use('/dashboard', dashboardRoutes);

// Health check route
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

module.exports = router;