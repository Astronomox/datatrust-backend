const { ComplianceRule, Violation, AccessLog, Organization } = require('../models');
const { COMPLIANCE_SEVERITY, VIOLATION_STATUS } = require('../config/constants');
const { calculateComplianceScore } = require('../utils/helpers');
const { logger } = require('../middleware/logger');

class ComplianceService {
  // Run compliance scan for organization
  async scanOrganization(organizationId) {
    try {
      const violations = [];
      
      // Get all compliance rules
      const rules = await ComplianceRule.findAll({
        where: { isActive: true }
      });

      // Get organization's access logs (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const accessLogs = await AccessLog.findAll({
        where: {
          organizationId,
          accessedAt: {
            $gte: thirtyDaysAgo
          }
        }
      });

      // Check each rule
      for (const rule of rules) {
        const ruleViolations = await this.checkRule(rule, accessLogs, organizationId);
        violations.push(...ruleViolations);
      }

      // Update organization compliance score
      await this.updateComplianceScore(organizationId);

      logger.info(`Compliance scan completed for org ${organizationId}`, {
        violationsFound: violations.length
      });

      return {
        totalViolations: violations.length,
        violations,
        scannedAt: new Date()
      };
    } catch (error) {
      logger.error('Error scanning organization:', error);
      throw error;
    }
  }

  // Check specific rule against access logs
  async checkRule(rule, accessLogs, organizationId) {
    const violations = [];

    try {
      const { ruleType, validationLogic } = rule;

      switch (ruleType) {
        case 'consent_required':
          // Check if all accesses had valid consent
          const unauthorizedAccesses = accessLogs.filter(log => !log.wasAuthorized);
          
          for (const log of unauthorizedAccesses) {
            violations.push({
              organizationId,
              ruleId: rule.id,
              accessLogId: log.id,
              severity: rule.severity,
              description: `Unauthorized access to ${log.dataType} without valid consent`,
              status: VIOLATION_STATUS.DETECTED,
              detectedAt: new Date(),
              impactScore: this.calculateImpactScore(rule.severity)
            });
          }
          break;

        case 'purpose_limitation':
          // Check if data was used for stated purpose
          // This is a simplified check - in production, you'd have more complex logic
          break;

        case 'data_retention':
          // Check if data is being retained longer than consented
          break;

        default:
          logger.warn(`Unknown rule type: ${ruleType}`);
      }

      // Save violations to database
      if (violations.length > 0) {
        await Violation.bulkCreate(violations);
      }

      return violations;
    } catch (error) {
      logger.error('Error checking rule:', error);
      return violations;
    }
  }

  // Calculate impact score based on severity
  calculateImpactScore(severity) {
    const scores = {
      [COMPLIANCE_SEVERITY.CRITICAL]: 20,
      [COMPLIANCE_SEVERITY.HIGH]: 10,
      [COMPLIANCE_SEVERITY.MEDIUM]: 5,
      [COMPLIANCE_SEVERITY.LOW]: 2
    };
    return scores[severity] || 0;
  }

  // Update organization's compliance score
  async updateComplianceScore(organizationId) {
    try {
      // Get all violations for organization
      const violations = await Violation.findAll({
        where: {
          organizationId,
          status: {
            $ne: VIOLATION_STATUS.RESOLVED
          }
        }
      });

      // Get total access count
      const totalAccesses = await AccessLog.count({
        where: { organizationId }
      });

      // Calculate score
      const score = calculateComplianceScore(violations, totalAccesses);

      // Update organization
      await Organization.update(
        { complianceScore: score },
        { where: { id: organizationId } }
      );

      logger.info(`Updated compliance score for org ${organizationId}: ${score}`);

      return score;
    } catch (error) {
      logger.error('Error updating compliance score:', error);
      throw error;
    }
  }

  // Get violations for organization
  async getViolations(organizationId, options = {}) {
    try {
      const { status, severity, page = 1, limit = 20 } = options;
      
      const whereClause = { organizationId };
      
      if (status) whereClause.status = status;
      if (severity) whereClause.severity = severity;

      const { count, rows } = await Violation.findAndCountAll({
        where: whereClause,
        include: [
          {
            association: 'rule',
            attributes: ['ruleName', 'description', 'ndprReference']
          },
          {
            association: 'accessLog',
            attributes: ['accessedAt', 'dataType', 'action']
          }
        ],
        order: [['detectedAt', 'DESC']],
        limit: parseInt(limit),
        offset: (parseInt(page) - 1) * parseInt(limit)
      });

      return {
        violations: rows,
        total: count,
        page: parseInt(page),
        totalPages: Math.ceil(count / limit)
      };
    } catch (error) {
      logger.error('Error getting violations:', error);
      throw error;
    }
  }

  // Resolve violation
  async resolveViolation(violationId, resolutionNotes) {
    try {
      const violation = await Violation.findByPk(violationId);

      if (!violation) {
        throw new Error('Violation not found');
      }

      violation.status = VIOLATION_STATUS.RESOLVED;
      violation.resolvedAt = new Date();
      violation.resolutionNotes = resolutionNotes;
      await violation.save();

      // Recalculate compliance score
      await this.updateComplianceScore(violation.organizationId);

      logger.info(`Violation ${violationId} resolved`);

      return violation;
    } catch (error) {
      logger.error('Error resolving violation:', error);
      throw error;
    }
  }

  // Get compliance summary for organization
  async getComplianceSummary(organizationId) {
    try {
      const organization = await Organization.findByPk(organizationId);

      if (!organization) {
        throw new Error('Organization not found');
      }

      // Get violation counts by severity
      const violationCounts = await Violation.findAll({
        where: {
          organizationId,
          status: { $ne: VIOLATION_STATUS.RESOLVED }
        },
        attributes: [
          'severity',
          [require('sequelize').fn('COUNT', 'id'), 'count']
        ],
        group: ['severity']
      });

      // Get total access count
      const totalAccesses = await AccessLog.count({
        where: { organizationId }
      });

      // Get authorized access count
      const authorizedAccesses = await AccessLog.count({
        where: {
          organizationId,
          wasAuthorized: true
        }
      });

      return {
        organizationName: organization.name,
        complianceScore: organization.complianceScore,
        ndprStatus: organization.ndprStatus,
        totalAccesses,
        authorizedAccesses,
        authorizationRate: totalAccesses > 0 ? ((authorizedAccesses / totalAccesses) * 100).toFixed(2) : 0,
        violations: violationCounts.reduce((acc, v) => {
          acc[v.severity] = parseInt(v.dataValues.count);
          return acc;
        }, {})
      };
    } catch (error) {
      logger.error('Error getting compliance summary:', error);
      throw error;
    }
  }
}

module.exports = new ComplianceService();