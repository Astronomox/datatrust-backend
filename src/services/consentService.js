const { Consent, User, Organization } = require('../models');
const { CONSENT_STATUS } = require('../config/constants');
const { addDays } = require('../utils/helpers');
const { logger } = require('../middleware/logger');
const notificationService = require('./notificationService');

class ConsentService {
  // Create new consent
  async grantConsent(consentData) {
    try {
      const {
        userId,
        organizationId,
        dataTypes,
        purpose,
        purposeDescription,
        durationDays
      } = consentData;

      // Verify user and organization exist
      const user = await User.findByPk(userId);
      const organization = await Organization.findByPk(organizationId);

      if (!user || !organization) {
        throw new Error('User or organization not found');
      }

      // Calculate expiry date
      const expiresAt = durationDays ? addDays(new Date(), durationDays) : null;

      const consent = await Consent.create({
        userId,
        organizationId,
        dataTypes,
        purpose,
        purposeDescription,
        status: CONSENT_STATUS.ACTIVE,
        grantedAt: new Date(),
        expiresAt,
        consentVersion: '1.0'
      });

      // Notify organization
      await notificationService.notifyConsentGranted(consent, user, organization);

      logger.info('Consent granted', { consentId: consent.id });

      return consent;
    } catch (error) {
      logger.error('Error granting consent:', error);
      throw error;
    }
  }

  // Revoke consent
  async revokeConsent(consentId, userId, reason = null) {
    try {
      const consent = await Consent.findByPk(consentId);

      if (!consent) {
        throw new Error('Consent not found');
      }

      if (consent.userId !== userId) {
        throw new Error('Not authorized to revoke this consent');
      }

      if (consent.status === CONSENT_STATUS.REVOKED) {
        throw new Error('Consent already revoked');
      }

      consent.status = CONSENT_STATUS.REVOKED;
      consent.revokedAt = new Date();
      consent.revokeReason = reason;
      await consent.save();

      // Notify organization
      const user = await User.findByPk(userId);
      const organization = await Organization.findByPk(consent.organizationId);
      await notificationService.notifyConsentRevoked(consent, user, organization);

      logger.info('Consent revoked', { consentId: consent.id });

      return consent;
    } catch (error) {
      logger.error('Error revoking consent:', error);
      throw error;
    }
  }

  // Get user's consents
  async getUserConsents(userId, options = {}) {
    try {
      const { status, page = 1, limit = 20 } = options;
      
      const whereClause = { userId };
      
      if (status) {
        whereClause.status = status;
      }

      const { count, rows } = await Consent.findAndCountAll({
        where: whereClause,
        include: [
          {
            association: 'organization',
            attributes: ['id', 'name', 'sector', 'email']
          }
        ],
        order: [['grantedAt', 'DESC']],
        limit: parseInt(limit),
        offset: (parseInt(page) - 1) * parseInt(limit)
      });

      return {
        consents: rows,
        total: count,
        page: parseInt(page),
        totalPages: Math.ceil(count / limit)
      };
    } catch (error) {
      logger.error('Error getting user consents:', error);
      throw error;
    }
  }

  // Get organization's consents
  async getOrganizationConsents(organizationId, options = {}) {
    try {
      const { status, page = 1, limit = 20 } = options;
      
      const whereClause = { organizationId };
      
      if (status) {
        whereClause.status = status;
      }

      const { count, rows } = await Consent.findAndCountAll({
        where: whereClause,
        include: [
          {
            association: 'user',
            attributes: ['id', 'firstName', 'lastName', 'email']
          }
        ],
        order: [['grantedAt', 'DESC']],
        limit: parseInt(limit),
        offset: (parseInt(page) - 1) * parseInt(limit)
      });

      return {
        consents: rows,
        total: count,
        page: parseInt(page),
        totalPages: Math.ceil(count / limit)
      };
    } catch (error) {
      logger.error('Error getting organization consents:', error);
      throw error;
    }
  }

  // Check if valid consent exists
  async checkConsent(userId, organizationId, dataType) {
    try {
      const consent = await Consent.findOne({
        where: {
          userId,
          organizationId,
          status: CONSENT_STATUS.ACTIVE
        }
      });

      if (!consent) {
        return { valid: false, reason: 'No consent found' };
      }

      if (!consent.isValid()) {
        return { valid: false, reason: 'Consent expired or revoked' };
      }

      if (!consent.dataTypes.includes(dataType)) {
        return { valid: false, reason: 'Data type not included in consent' };
      }

      return { valid: true, consent };
    } catch (error) {
      logger.error('Error checking consent:', error);
      throw error;
    }
  }

  // Expire old consents (cron job function)
  async expireOldConsents() {
    try {
      const expiredConsents = await Consent.update(
        { status: CONSENT_STATUS.EXPIRED },
        {
          where: {
            status: CONSENT_STATUS.ACTIVE,
            expiresAt: {
              $lt: new Date()
            }
          }
        }
      );

      logger.info(`Expired ${expiredConsents[0]} consents`);
      return expiredConsents[0];
    } catch (error) {
      logger.error('Error expiring consents:', error);
      throw error;
    }
  }
}

module.exports = new ConsentService();