const express = require('express');
const router = express.Router();
const {
  getCitizenDashboard,
  getOrganizationDashboard
} = require('../controllers/dashboardController');
const { protect, authorize } = require('../middleware/auth');

// Citizen dashboard
router.get('/citizen', protect, authorize('citizen'), getCitizenDashboard);

// Organization dashboard
router.get('/organization/:orgId', protect, authorize('organization', 'admin'), getOrganizationDashboard);

module.exports = router;