const express = require('express');
const router = express.Router();
const { db, auth } = require('../config/firebase');

// ✅ GRANT CONSENT (Save to Firestore)
router.post('/grant', async (req, res) => {
  try {
    const token = req.headers.authorization?.split('Bearer ')[1];
    const decodedToken = await auth.verifyIdToken(token);
    const userId = decodedToken.uid;

    const { organizationId, dataTypes, purpose, durationDays } = req.body;

    // Save to Firestore
    const consentRef = await db.collection('consents').add({
      userId,
      organizationId,
      dataTypes,
      purpose,
      status: 'active',
      grantedAt: new Date(),
      expiresAt: new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000),
      createdAt: new Date()
    });

    res.json({
      success: true,
      data: {
        id: consentRef.id,
        message: 'Consent granted successfully'
      }
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// ✅ GET MY CONSENTS
router.get('/my-consents', async (req, res) => {
  try {
    const token = req.headers.authorization?.split('Bearer ')[1];
    const decodedToken = await auth.verifyIdToken(token);
    const userId = decodedToken.uid;

    const consentsSnapshot = await db.collection('consents')
      .where('userId', '==', userId)
      .get();

    const consents = [];
    consentsSnapshot.forEach(doc => {
      consents.push({ id: doc.id, ...doc.data() });
    });

    res.json({ success: true, data: consents });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// ✅ REVOKE CONSENT
router.put('/:id/revoke', async (req, res) => {
  try {
    const token = req.headers.authorization?.split('Bearer ')[1];
    await auth.verifyIdToken(token);

    await db.collection('consents').doc(req.params.id).update({
      status: 'revoked',
      revokedAt: new Date()
    });

    res.json({ success: true, message: 'Consent revoked' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

module.exports = router;