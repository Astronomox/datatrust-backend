const { db } = require('../config/firebase');

class ConsentController {
  /**
   * Grant new consent
   */
  static async grantConsent(req, res) {
    try {
      const userId = req.user.uid;
      const { organizationId, purpose, dataTypes, expiryDate } = req.body;

      const consentData = {
        userId,
        organizationId,
        purpose,
        dataTypes: dataTypes || [],
        status: 'active',
        grantedAt: new Date(),
        expiryDate: expiryDate ? new Date(expiryDate) : null,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const consentRef = await db.collection('consents').add(consentData);

      res.status(201).json({
        success: true,
        message: 'Consent granted successfully',
        data: {
          id: consentRef.id,
          ...consentData
        }
      });
    } catch (error) {
      console.error('Grant consent error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to grant consent'
      });
    }
  }

  /**
   * Get user's consents
   */
  static async getMyConsents(req, res) {
    try {
      const userId = req.user.uid;
      const { page = 1, limit = 20 } = req.query;

      const consentsSnapshot = await db.collection('consents')
        .where('userId', '==', userId)
        .orderBy('createdAt', 'desc')
        .limit(parseInt(limit))
        .get();

      const consents = consentsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      res.json({
        success: true,
        data: consents,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: consents.length
        }
      });
    } catch (error) {
      console.error('Get consents error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get consents'
      });
    }
  }

  /**
   * Get specific consent
   */
  static async getConsent(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.uid;

      const consentDoc = await db.collection('consents').doc(id).get();

      if (!consentDoc.exists) {
        return res.status(404).json({
          success: false,
          message: 'Consent not found'
        });
      }

      const consent = consentDoc.data();

      // Check if user owns this consent
      if (consent.userId !== userId) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }

      res.json({
        success: true,
        data: {
          id: consentDoc.id,
          ...consent
        }
      });
    } catch (error) {
      console.error('Get consent error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get consent'
      });
    }
  }

  /**
   * Revoke consent
   */
  static async revokeConsent(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.uid;
      const { reason } = req.body;

      const consentDoc = await db.collection('consents').doc(id).get();

      if (!consentDoc.exists) {
        return res.status(404).json({
          success: false,
          message: 'Consent not found'
        });
      }

      const consent = consentDoc.data();

      if (consent.userId !== userId) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }

      await db.collection('consents').doc(id).update({
        status: 'revoked',
        revokedAt: new Date(),
        revocationReason: reason,
        updatedAt: new Date()
      });

      res.json({
        success: true,
        message: 'Consent revoked successfully'
      });
    } catch (error) {
      console.error('Revoke consent error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to revoke consent'
      });
    }
  }
}

module.exports = ConsentController;
