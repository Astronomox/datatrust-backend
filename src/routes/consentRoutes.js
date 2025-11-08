const express = require('express');
const router = express.Router();
const ConsentController = require('../controllers/consentController');
const { authenticate } = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: Consent
 *   description: Consent management operations
 */

router.post('/grant', authenticate, ConsentController.grantConsent);
router.get('/my-consents', authenticate, ConsentController.getMyConsents);
router.get('/:id', authenticate, ConsentController.getConsent);
router.put('/:id/revoke', authenticate, ConsentController.revokeConsent);

module.exports = router;
