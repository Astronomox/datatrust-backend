const express = require('express');
const router = express.Router();
const AccessLogController = require('../controllers/accessLogController');
const { authenticate } = require('../middleware/auth');

// All routes require authentication
router.use(authenticate);

router.post('/log', AccessLogController.logAccess);
router.get('/my-data', AccessLogController.getUserAccessLogs);
router.get('/organization/:organizationId', AccessLogController.getOrganizationAccessLogs);

module.exports = router;