const express = require('express');
const router = express.Router();
const {
  scanOrganization,
  getComplianceSummary,
  getViolations,
  resolveViolation,
  getComplianceRules
} = require('../controllers/complianceController');
const { protect, authorize } = require('../middleware/auth');

// Compliance rules (public)
router.get('/rules', protect, getComplianceRules);

// Organization compliance
router.post('/scan/:orgId', protect, authorize('organization', 'admin'), scanOrganization);
router.get('/summary/:orgId', protect, authorize('organization', 'admin'), getComplianceSummary);
router.get('/violations/:orgId', protect, authorize('organization', 'admin'), getViolations);
router.put('/violations/:violationId/resolve', protect, authorize('organization', 'admin'), resolveViolation);

module.exports = router;