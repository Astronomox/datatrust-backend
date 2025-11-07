const auditService = require('../services/auditService');
const { successResponse, errorResponse, paginatedResponse } = require('../utils/responseHandler');

// @desc    Log data access
// @route   POST /api/v1/access-logs
// @access  Private (Organization)
exports.logAccess = async (req, res, next) => {
  try {
    const { userId, dataType, action, purpose, consentId } = req.body;
    const { Organization } = require('../models');

    // Get organization
    const organization = await Organization.findOne({
      where: { userId: req.user.id }
    });

    if (!organization) {
      return errorResponse(res, 'Organization not found for this user', 404);
    }

    const log = await auditService.logAccess({
      userId,
      organizationId: organization.id,
      accessedBy: req.user.email,
      dataType,
      action,
      purpose,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      consentId
    });

    return successResponse(
      res,
      'Access logged successfully',
      { log },
      201
    );
  } catch (error) {
    next(error);
  }
};

// @desc    Get my access logs (citizen view)
// @route   GET /api/v1/access-logs/my-data
// @access  Private (Citizen)
exports.getMyAccessLogs = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, startDate, endDate } = req.query;

    const result = await auditService.getUserAccessLogs(req.user.id, {
      page,
      limit,
      startDate,
      endDate
    });

    return paginatedResponse(
      res,
      'Access logs retrieved successfully',
      result.logs,
      result.page,
      limit,
      result.total
    );
  } catch (error) {
    next(error);
  }
};

// @desc    Get organization's access logs
// @route   GET /api/v1/access-logs/organization/:orgId
// @access  Private (Organization/Admin)
exports.getOrganizationLogs = async (req, res, next) => {
  try {
    const { orgId } = req.params;
    const { page = 1, limit = 20, startDate, endDate } = req.query;
    const { Organization } = require('../models');

    // Authorization check
    const organization = await Organization.findByPk(orgId);

    if (!organization) {
      return errorResponse(res, 'Organization not found', 404);
    }

    if (req.user.role !== 'admin' && organization.userId !== req.user.id) {
      return errorResponse(res, 'Not authorized to view these logs', 403);
    }

    const result = await auditService.getOrganizationAccessLogs(orgId, {
      page,
      limit,
      startDate,
      endDate
    });

    return paginatedResponse(
      res,
      'Access logs retrieved successfully',
      result.logs,
      result.page,
      limit,
      result.total
    );
  } catch (error) {
    next(error);
  }
};

// @desc    Get unauthorized access attempts
// @route   GET /api/v1/access-logs/unauthorized
// @access  Private (Admin)
exports.getUnauthorizedAccess = async (req, res, next) => {
  try {
    const { organizationId } = req.query;

    const logs = await auditService.getUnauthorizedAccess(organizationId);

    return successResponse(
      res,
      'Unauthorized access logs retrieved successfully',
      { logs }
    );
  } catch (error) {
    next(error);
  }
};