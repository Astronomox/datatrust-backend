const { AccessLog, Consent } = require('../models');
const { logger } = require('../middleware/logger');

class AuditService {
  // Log data access
  async logAccess(accessData) {
    try {
      const {
        userId,
        organizationId,
        accessedBy,
        dataType,
        action,
        purpose,
        ipAddress,
        userAgent,
        consentId
      } = accessData;

      // Check if consent exists and is valid
      let wasAuthorized = false;
      if (consentId) {
        const consent = await Consent.findByPk(consentId);
        if (consent && consent.isValid()) {
          wasAuthorized = true;
        }
      }

      const log = await AccessLog.create({
        userId,
        organizationId,
        consentId,
        accessedBy,
        accessedAt: new Date(),
        dataType,
        action,
        purpose,
        ipAddress,
        userAgent,
        wasAuthorized
      });

      logger.info('Access logged', { logId: log.id, wasAuthorized });

      return log;
    } catch (error) {
      logger.error('Error logging access:', error);
      throw error;
    }
  }

  // Get access logs for a user
  async getUserAccessLogs(userId, options = {}) {
    try {
      const { page = 1, limit = 20, startDate, endDate } = options;
      
      const whereClause = { userId };
      
      if (startDate || endDate) {
        whereClause.accessedAt = {};
        if (startDate) whereClause.accessedAt.$gte = new Date(startDate);
        if (endDate) whereClause.accessedAt.$lte = new Date(endDate);
      }

      const { count, rows } = await AccessLog.findAndCountAll({
        where: whereClause,
        include: [
          {
            association: 'organization',
            attributes: ['id', 'name', 'sector']
          },
          {
            association: 'consent',
            attributes: ['id', 'purpose', 'status']
          }
        ],
        order: [['accessedAt', 'DESC']],
        limit: parseInt(limit),
        offset: (parseInt(page) - 1) * parseInt(limit)
      });

      return {
        logs: rows,
        total: count,
        page: parseInt(page),
        totalPages: Math.ceil(count / limit)
      };
    } catch (error) {
      logger.error('Error getting user access logs:', error);
      throw error;
    }
  }

  // Get access logs for an organization
  async getOrganizationAccessLogs(organizationId, options = {}) {
    try {
      const { page = 1, limit = 20, startDate, endDate } = options;
      
      const whereClause = { organizationId };
      
      if (startDate || endDate) {
        whereClause.accessedAt = {};
        if (startDate) whereClause.accessedAt.$gte = new Date(startDate);
        if (endDate) whereClause.accessedAt.$lte = new Date(endDate);
      }

      const { count, rows } = await AccessLog.findAndCountAll({
        where: whereClause,
        include: [
          {
            association: 'user',
            attributes: ['id', 'firstName', 'lastName', 'email']
          }
        ],
        order: [['accessedAt', 'DESC']],
        limit: parseInt(limit),
        offset: (parseInt(page) - 1) * parseInt(limit)
      });

      return {
        logs: rows,
        total: count,
        page: parseInt(page),
        totalPages: Math.ceil(count / limit)
      };
    } catch (error) {
      logger.error('Error getting organization access logs:', error);
      throw error;
    }
  }

  // Get unauthorized access attempts
  async getUnauthorizedAccess(organizationId = null) {
    try {
      const whereClause = { wasAuthorized: false };
      
      if (organizationId) {
        whereClause.organizationId = organizationId;
      }

      const logs = await AccessLog.findAll({
        where: whereClause,
        include: [
          {
            association: 'organization',
            attributes: ['id', 'name']
          },
          {
            association: 'user',
            attributes: ['id', 'firstName', 'lastName', 'email']
          }
        ],
        order: [['accessedAt', 'DESC']],
        limit: 100
      });

      return logs;
    } catch (error) {
      logger.error('Error getting unauthorized access:', error);
      throw error;
    }
  }
}

module.exports = new AuditService();