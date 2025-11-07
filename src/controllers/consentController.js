const consentService = require('../services/consentService');
const { successResponse, errorResponse, paginatedResponse } = require('../utils/responseHandler');

// @desc    Grant consent
// @route   POST /api/v1/consent/grant
// @access  Private (Citizen)
exports.grantConsent = async (req, res, next) => {
  try {
    const { organizationId, dataTypes, purpose, purposeDescription, durationDays } = req.body;

    const consent = await consentService.grantConsent({
      userId: req.user.id,
      organizationId,
      dataTypes,
      purpose,
      purposeDescription,
      durationDays: durationDays || parseInt(process.env.CONSENT_DEFAULT_DURATION_DAYS || 365)
    });

    return successResponse(
      res,
      'Consent granted successfully',
      { consent },
      201
    );
  } catch (error) {
    next(error);
  }
};

// @desc    Revoke consent
// @route   PUT /api/v1/consent/:id/revoke
// @access  Private (Citizen)
exports.revokeConsent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const consent = await consentService.revokeConsent(id, req.user.id, reason);

    return successResponse(res, 'Consent revoked successfully', { consent });
  } catch (error) {
    if (error.message.includes('not found')) {
      return errorResponse(res, error.message, 404);
    }
    if (error.message.includes('not authorized')) {
      return errorResponse(res, error.message, 403);
    }
    next(error);
  }
};

// @desc    Get my consents
// @route   GET /api/v1/consent/my-consents
// @access  Private (Citizen)
exports.getMyConsents = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;

    const result = await consentService.getUserConsents(req.user.id, {
      status,
      page,
      limit
    });

    return paginatedResponse(
      res,
      'Consents retrieved successfully',
      result.consents,
      result.page,
      limit,
      result.total
    );
  } catch (error) {
    next(error);
  }
};

// @desc    Get consent by ID
// @route   GET /api/v1/consent/:id
// @access  Private
exports.getConsentById = async (req, res, next) => {
  try {
    const { Consent } = require('../models');
    const { id } = req.params;

    const consent = await Consent.findByPk(id, {
      include: [
        {
          association: 'organization',
          attributes: ['id', 'name', 'sector']
        },
        {
          association: 'user',
          attributes: ['id', 'firstName', 'lastName', 'email']
        }
      ]
    });

    if (!consent) {
      return errorResponse(res, 'Consent not found', 404);
    }

    // Check authorization
    if (req.user.role === 'citizen' && consent.userId !== req.user.id) {
      return errorResponse(res, 'Not authorized to view this consent', 403);
    }

    return successResponse(res, 'Consent retrieved successfully', { consent });
  } catch (error) {
    next(error);
  }
};

// @desc    Check consent validity
// @route   POST /api/v1/consent/check
// @access  Private (Organization)
exports.checkConsent = async (req, res, next) => {
  try {
    const { userId, dataType } = req.body;
    const { Organization } = require('../models');

    // Get organization ID from user
    const organization = await Organization.findOne({
      where: { userId: req.user.id }
    });

    if (!organization) {
      return errorResponse(res, 'Organization not found for this user', 404);
    }

    const result = await consentService.checkConsent(
      userId,
      organization.id,
      dataType
    );

    return successResponse(
      res,
      result.valid ? 'Valid consent found' : 'No valid consent',
      result
    );
  } catch (error) {
    next(error);
  }
};

// @desc    Get organization's consents
// @route   GET /api/v1/consent/organization/:orgId
// @access  Private (Organization/Admin)
exports.getOrganizationConsents = async (req, res, next) => {
  try {
    const { orgId } = req.params;
    const { status, page = 1, limit = 20 } = req.query;

    // Authorization check
    const { Organization } = require('../models');
    const organization = await Organization.findByPk(orgId);

    if (!organization) {
      return errorResponse(res, 'Organization not found', 404);
    }

    if (req.user.role !== 'admin' && organization.userId !== req.user.id) {
      return errorResponse(res, 'Not authorized to view these consents', 403);
    }

    const result = await consentService.getOrganizationConsents(orgId, {
      status,
      page,
      limit
    });

    return paginatedResponse(
      res,
      'Consents retrieved successfully',
      result.consents,
      result.page,
      limit,
      result.total
    );
  } catch (error) {
    next(error);
  }
};