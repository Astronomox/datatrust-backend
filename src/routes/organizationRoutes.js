const express = require('express');
const router = express.Router();
const {
  createOrganization,
  getMyOrganization,
  getOrganizationById,
  updateOrganization,
  getAllOrganizations,
  regenerateApiKey
} = require('../controllers/organizationController');
const { protect, authorize, optionalAuth } = require('../middleware/auth');

// Public routes
router.get('/', optionalAuth, getAllOrganizations);
router.get('/:id', getOrganizationById);

// Organization routes
router.post('/', protect, authorize('organization'), createOrganization);
router.get('/my/organization', protect, authorize('organization'), getMyOrganization);
router.put('/:id', protect, authorize('organization', 'admin'), updateOrganization);
router.post('/:id/regenerate-key', protect, authorize('organization', 'admin'), regenerateApiKey);

module.exports = router;