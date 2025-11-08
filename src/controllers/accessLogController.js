const { db } = require('../config/firebase');
const AuditService = require('../services/auditService');

class AccessLogController {
  /**
   * Log data access
   */
  static async logAccess(req, res) {
    try {
      const {
        organizationId,
        dataType,
        action,
        purpose,
        wasAuthorized = false,
        metadata = {}
      } = req.body;

      const userId = req.user?.uid || req.user?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'User authentication required'
        });
      }

      // Log the access
      const logId = await AuditService.logDataAccess({
        userId,
        organizationId,
        dataType,
        action,
        wasAuthorized,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        metadata: {
          purpose,
          ...metadata
        }
      });

      // Also store in access_logs collection for easy querying
      const accessLogData = {
        userId,
        organizationId,
        dataType,
        action,
        purpose,
        wasAuthorized,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        timestamp: new Date().toISOString(),
        metadata,
        logId // Reference to audit log
      };

      await db.collection('access_logs').add(accessLogData);

      res.status(201).json({
        success: true,
        message: 'Access logged successfully',
        data: { logId }
      });
    } catch (error) {
      console.error('Error logging access:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to log access'
      });
    }
  }

  /**
   * Get user's access logs
   */
  static async getUserAccessLogs(req, res) {
    try {
      const userId = req.user?.uid || req.user?.id;
      const { limit = 50, offset = 0 } = req.query;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'User authentication required'
        });
      }

      let query = db.collection('access_logs')
        .where('userId', '==', userId)
        .orderBy('timestamp', 'desc')
        .limit(parseInt(limit));

      const snapshot = await query.get();
      
      const logs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      res.json({
        success: true,
        data: logs,
        pagination: {
          limit: parseInt(limit),
          offset: parseInt(offset),
          total: logs.length
        }
      });
    } catch (error) {
      console.error('Error getting access logs:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get access logs'
      });
    }
  }

  /**
   * Get organization access logs (for organizations)
   */
  static async getOrganizationAccessLogs(req, res) {
    try {
      const organizationId = req.params.organizationId;
      const { limit = 50, offset = 0 } = req.query;

      let query = db.collection('access_logs')
        .where('organizationId', '==', organizationId)
        .orderBy('timestamp', 'desc')
        .limit(parseInt(limit));

      const snapshot = await query.get();
      
      const logs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      res.json({
        success: true,
        data: logs,
        pagination: {
          limit: parseInt(limit),
          offset: parseInt(offset),
          total: logs.length
        }
      });
    } catch (error) {
      console.error('Error getting organization access logs:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get organization access logs'
      });
    }
  }
}

module.exports = AccessLogController;