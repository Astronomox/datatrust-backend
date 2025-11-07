const { Consent, AccessLog, Organization } = require('../models');
const { successResponse, errorResponse } = require('../utils/responseHandler');
const { Sequelize } = require('sequelize');

// @desc    Get citizen dashboard overview
// @route   GET /api/v1/dashboard/citizen
// @access  Private (Citizen)
exports.getCitizenDashboard = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Get consent statistics
    const totalConsents = await Consent.count({ where: { userId } });
    const activeConsents = await Consent.count({
      where: { userId, status: 'active' }
    });
    const revokedConsents = await Consent.count({
      where: { userId, status: 'revoked' }
    });

    // Get recent access logs
    const recentAccesses = await AccessLog.findAll({
      where: { userId },
      include: [
        {
          association: 'organization',
          attributes: ['id', 'name', 'sector']
        }
      ],
      order: [['accessedAt', 'DESC']],
      limit: 10
    });

    // Get unauthorized access count
    const unauthorizedAccess = await AccessLog.count({
      where: { userId, wasAuthorized: false }
    });

    // Get organizations that have accessed data
    const organizationsWithAccess = await AccessLog.findAll({
      where: { userId },
      attributes: [
        'organizationId',
        [Sequelize.fn('COUNT', Sequelize.col('id')), 'accessCount']
      ],
      include: [
        {
          association: 'organization',
          attributes: ['name', 'sector']
        }
      ],
      group: ['organizationId', 'organization.id'],
      order: [[Sequelize.literal('accessCount'), 'DESC']],
      limit: 5
    });

    // Get data type access breakdown
    const dataTypeBreakdown = await AccessLog.findAll({
      where: { userId },
      attributes: [
        'dataType',
        [Sequelize.fn('COUNT', Sequelize.col('id')), 'count']
      ],
      group: ['dataType'],
      order: [[Sequelize.literal('count'), 'DESC']]
    });

    return successResponse(
      res,
      'Dashboard data retrieved successfully',
      {
        consentStats: {
          total: totalConsents,
          active: activeConsents,
          revoked: revokedConsents
        },
        accessStats: {
          totalAccesses: recentAccesses.length,
          unauthorizedAccesses: unauthorizedAccess
        },
        recentAccesses,
        topOrganizations: organizationsWithAccess,
        dataTypeBreakdown
      }
    );
  } catch (error) {
    next(error);
  }
};

// @desc    Get organization dashboard overview
// @route   GET /api/v1/dashboard/organization/:orgId
// @access  Private (Organization/Admin)
exports.getOrganizationDashboard = async (req, res, next) => {
  try {
    const { orgId } = req.params;

    // Authorization check
    const organization = await Organization.findByPk(orgId);

    if (!organization) {
      return errorResponse(res, 'Organization not found', 404);
    }

    if (req.user.role !== 'admin' && organization.userId !== req.user.id) {
      return errorResponse(res, 'Not authorized to view this dashboard', 403);
    }

    // Get consent statistics
    const totalConsents = await Consent.count({
      where: { organizationId: orgId }
    });
    const activeConsents = await Consent.count({
      where: { organizationId: orgId, status: 'active' }
    });
    const expiringSoon = await Consent.count({
      where: {
        organizationId: orgId,
        status: 'active',
        expiresAt: {
          $between: [new Date(), new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)]
        }
      }
    });

    // Get access statistics
    const totalAccesses = await AccessLog.count({
      where: { organizationId: orgId }
    });
    const authorizedAccesses = await AccessLog.count({
      where: { organizationId: orgId, wasAuthorized: true }
    });

    // Get recent accesses
    const recentAccesses = await AccessLog.findAll({
      where: { organizationId: orgId },
      include: [
        {
          association: 'user',
          attributes: ['id', 'firstName', 'lastName', 'email']
        }
      ],
      order: [['accessedAt', 'DESC']],
      limit: 10
    });

    // Get compliance info
    const complianceService = require('../services/complianceService');
    const complianceSummary = await complianceService.getComplianceSummary(orgId);

    return successResponse(
      res,
      'Organization dashboard retrieved successfully',
      {
        organization: {
          name: organization.name,
          complianceScore: organization.complianceScore,
          ndprStatus: organization.ndprStatus
        },
        consentStats: {
          total: totalConsents,
          active: activeConsents,
          expiringSoon
        },
        accessStats: {
          total: totalAccesses,
          authorized: authorizedAccesses,
          authorizationRate: totalAccesses > 0 ? ((authorizedAccesses / totalAccesses) * 100).toFixed(2) : 0
        },
        recentAccesses,
        compliance: complianceSummary
      }
    );
  } catch (error) {
    next(error);
  }
};