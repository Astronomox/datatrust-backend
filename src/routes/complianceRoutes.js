const express = require('express');
const router = express.Router();
const ComplianceController = require('../controllers/complianceController');
const { authenticate } = require('../middleware/auth');

// All routes require authentication
router.use(authenticate);

router.post('/check', ComplianceController.checkCompliance);
router.get('/user-score', ComplianceController.getUserComplianceScore);
router.get('/organization/:organizationId', ComplianceController.getOrganizationCompliance);
router.post('/report-violation', ComplianceController.reportViolation);

module.exports = router;