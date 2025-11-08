const { db } = require('../config/firebase');

class AuditService {
  /**
   * Log an audit event
   */
  static async logAuditEvent(eventData) {
    try {
      const auditData = {
        ...eventData,
        timestamp: new Date().toISOString(),
        createdAt: new Date()
      };

      // Store in Firestore
      const auditRef = await db.collection('audit_logs').add(auditData);
      
      console.log('Audit event logged:', auditRef.id);
      return auditRef.id;
    } catch (error) {
      console.error('Error logging audit event:', error);
      throw error;
    }
  }

  /**
   * Log data access
   */
  static async logDataAccess(accessData) {
    const eventData = {
      type: 'DATA_ACCESS',
      userId: accessData.userId,
      organizationId: accessData.organizationId,
      dataType: accessData.dataType,
      action: accessData.action,
      wasAuthorized: accessData.wasAuthorized || false,
      ipAddress: accessData.ipAddress,
      userAgent: accessData.userAgent,
      metadata: accessData.metadata || {}
    };

    return this.logAuditEvent(eventData);
  }

  /**
   * Log consent changes
   */
  static async logConsentChange(consentData) {
    const eventData = {
      type: 'CONSENT_CHANGE',
      userId: consentData.userId,
      organizationId: consentData.organizationId,
      action: consentData.action, // 'GRANTED', 'REVOKED', 'MODIFIED'
      dataTypes: consentData.dataTypes,
      duration: consentData.duration,
      metadata: consentData.metadata || {}
    };

    return this.logAuditEvent(eventData);
  }

  /**
   * Log security events
   */
  static async logSecurityEvent(securityData) {
    const eventData = {
      type: 'SECURITY_EVENT',
      userId: securityData.userId,
      event: securityData.event, // 'LOGIN', 'LOGOUT', 'PASSWORD_CHANGE', etc.
      severity: securityData.severity || 'MEDIUM',
      ipAddress: securityData.ipAddress,
      userAgent: securityData.userAgent,
      metadata: securityData.metadata || {}
    };

    return this.logAuditEvent(eventData);
  }

  /**
   * Get audit logs for a user
   */
  static async getUserAuditLogs(userId, limit = 50) {
    try {
      const snapshot = await db.collection('audit_logs')
        .where('userId', '==', userId)
        .orderBy('timestamp', 'desc')
        .limit(limit)
        .get();

      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting user audit logs:', error);
      throw error;
    }
  }
}

module.exports = AuditService;