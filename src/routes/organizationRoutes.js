const express = require('express');
const router = express.Router();
const OrganizationController = require('../controllers/organizationController');
const { authenticate } = require('../middleware/auth');

// Public routes
router.get('/', OrganizationController.getOrganizations);
router.get('/:organizationId', OrganizationController.getOrganization);

// Protected routes
router.use(authenticate);
router.get('/user/my-organizations', OrganizationController.getUserOrganizations);
router.post('/', OrganizationController.createOrganization); // Admin only

module.exports = router;