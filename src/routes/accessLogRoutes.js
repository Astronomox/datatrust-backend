const express = require('express');
const router = express.Router();
const {
  logAccess,
  getMyAccessLogs,
  getOrganizationLogs,
  getUnauthorizedAccess
} = require('../controllers/accessLogController');
const { protect, authorize } = require('../middleware/auth');

// Organization routes
router.post('/', protect, authorize('organization', 'admin'), logAccess);
router.get('/organization/:orgId', protect, authorize('organization', 'admin'), getOrganizationLogs);

// Citizen routes
router.get('/my-data', protect, authorize('citizen'), getMyAccessLogs);

// Admin routes
router.get('/unauthorized', protect, authorize('admin'), getUnauthorizedAccess);

module.exports = router;