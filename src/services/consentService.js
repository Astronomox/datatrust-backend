const { db } = require('../config/firebase');

class ConsentService {
  /**
   * Grant consent to organization
   */
  static async grantConsent(consentData) {
    try {
      const consentId = db.collection('consents').doc().id;
      
      const consent = {
        id: consentId,
        ...consentData,
        status: 'active',
        grantedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await db.collection('consents').doc(consentId).set(consent);
      
      return consent;
    } catch (error) {
      console.error('Error granting consent:', error);
      throw error;
    }
  }

  /**
   * Revoke consent
   */
  static async revokeConsent(consentId, reason) {
    try {
      await db.collection('consents').doc(consentId).update({
        status: 'revoked',
        revokedAt: new Date(),
        revokeReason: reason,
        updatedAt: new Date()
      });

      return { success: true };
    } catch (error) {
      console.error('Error revoking consent:', error);
      throw error;
    }
  }

  /**
   * Get user's consents
   */
  static async getUserConsents(userId, options = {}) {
    try {
      let query = db.collection('consents').where('userId', '==', userId);

      if (options.status) {
        query = query.where('status', '==', options.status);
      }

      const snapshot = await query.orderBy('createdAt', 'desc').get();
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting user consents:', error);
      throw error;
    }
  }

  /**
   * Get consent by ID
   */
  static async getConsentById(consentId) {
    try {
      const doc = await db.collection('consents').doc(consentId).get();
      
      if (!doc.exists) {
        return null;
      }

      return {
        id: doc.id,
        ...doc.data()
      };
    } catch (error) {
      console.error('Error getting consent:', error);
      throw error;
    }
  }

  /**
   * Check if consent exists and is active
   */
  static async hasActiveConsent(userId, organizationId, dataType) {
    try {
      const snapshot = await db.collection('consents')
        .where('userId', '==', userId)
        .where('organizationId', '==', organizationId)
        .where('dataTypes', 'array-contains', dataType)
        .where('status', '==', 'active')
        .where('expiresAt', '>', new Date())
        .limit(1)
        .get();

      return !snapshot.empty;
    } catch (error) {
      console.error('Error checking consent:', error);
      throw error;
    }
  }
}

module.exports = ConsentService;