const complianceService = require('../services/complianceService');
const { successResponse, errorResponse, paginatedResponse } = require('../utils/responseHandler');

// @desc    Run compliance scan
// @route   POST /api/v1/compliance/scan/:orgId
// @access  Private (Organization/Admin)
exports.scanOrganization = async (req, res, next) => {
  try {
    const { orgId } = req.params;
    const { Organization } = require('../models');

    // Authorization check
    const organization = await Organization.findByPk(orgId);

    if (!organization) {
      return errorResponse(res, 'Organization not found', 404);
    }

    if (req.user.role !== 'admin' && organization.userId !== req.user.id) {
      return errorResponse(res, 'Not authorized to scan this organization', 403);
    }

    const result = await complianceService.scanOrganization(orgId);

    return successResponse(
      res,
      'Compliance scan completed successfully',
      result
    );
  } catch (error) {
    next(error);
  }
};

// @desc    Get compliance summary
// @route   GET /api/v1/compliance/summary/:orgId
// @access  Private (Organization/Admin)
exports.getComplianceSummary = async (req, res, next) => {
  try {
    const { orgId } = req.params;
    const { Organization } = require('../models');

    // Authorization check
    const organization = await Organization.findByPk(orgId);

    if (!organization) {
      return errorResponse(res, 'Organization not found', 404);
    }

    if (req.user.role !== 'admin' && organization.userId !== req.user.id) {
      return errorResponse(res, 'Not authorized to view this summary', 403);
    }

    const summary = await complianceService.getComplianceSummary(orgId);

    return successResponse(
      res,
      'Compliance summary retrieved successfully',
      { summary }
    );
  } catch (error) {
    next(error);
  }
};

// @desc    Get violations
// @route   GET /api/v1/compliance/violations/:orgId
// @access  Private (Organization/Admin)
exports.getViolations = async (req, res, next) => {
  try {
    const { orgId } = req.params;
    const { status, severity, page = 1, limit = 20 } = req.query;
    const { Organization } = require('../models');

    // Authorization check
    const organization = await Organization.findByPk(orgId);

    if (!organization) {
      return errorResponse(res, 'Organization not found', 404);
    }

    if (req.user.role !== 'admin' && organization.userId !== req.user.id) {
      return errorResponse(res, 'Not authorized to view violations', 403);
    }

    const result = await complianceService.getViolations(orgId, {
      status,
      severity,
      page,
      limit
    });

    return paginatedResponse(
      res,
      'Violations retrieved successfully',
      result.violations,
      result.page,
      limit,
      result.total
    );
  } catch (error) {
    next(error);
  }
};

// @desc    Resolve violation
// @route   PUT /api/v1/compliance/violations/:violationId/resolve
// @access  Private (Organization/Admin)
exports.resolveViolation = async (req, res, next) => {
  try {
    const { violationId } = req.params;
    const { resolutionNotes } = req.body;
    const { Violation, Organization } = require('../models');

    // Get violation and check authorization
    const violation = await Violation.findByPk(violationId);

    if (!violation) {
      return errorResponse(res, 'Violation not found', 404);
    }

    const organization = await Organization.findByPk(violation.organizationId);

    if (req.user.role !== 'admin' && organization.userId !== req.user.id) {
      return errorResponse(res, 'Not authorized to resolve this violation', 403);
    }

    const resolvedViolation = await complianceService.resolveViolation(
      violationId,
      resolutionNotes
    );

    return successResponse(
      res,
      'Violation resolved successfully',
      { violation: resolvedViolation }
    );
  } catch (error) {
    next(error);
  }
};

// @desc    Get all compliance rules
// @route   GET /api/v1/compliance/rules
// @access  Private
exports.getComplianceRules = async (req, res, next) => {
  try {
    const { ComplianceRule } = require('../models');

    const rules = await ComplianceRule.findAll({
      where: { isActive: true },
      order: [['severity', 'DESC']]
    });

    return successResponse(
      res,
      'Compliance rules retrieved successfully',
      { rules }
    );
  } catch (error) {
    next(error);
  }
};