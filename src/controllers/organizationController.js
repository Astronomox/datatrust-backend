const { Organization } = require('../models');
const { successResponse, errorResponse } = require('../utils/responseHandler');
const { generateApiKey } = require('../utils/helpers');

// @desc    Create organization
// @route   POST /api/v1/organizations
// @access  Private (Organization role)
exports.createOrganization = async (req, res, next) => {
  try {
    const {
      name,
      email,
      phone,
      address,
      sector,
      size,
      registrationNumber,
      website
    } = req.body;

    // Check if user already has an organization
    const existingOrg = await Organization.findOne({
      where: { userId: req.user.id }
    });

    if (existingOrg) {
      return errorResponse(res, 'User already has an organization', 400);
    }

    // Check if email is already used
    const emailExists = await Organization.findOne({ where: { email } });
    if (emailExists) {
      return errorResponse(res, 'Organization email already registered', 400);
    }

    // Generate API key
    const apiKey = generateApiKey();

    const organization = await Organization.create({
      name,
      email,
      phone,
      address,
      sector,
      size,
      registrationNumber,
      website,
      userId: req.user.id,
      apiKey
    });

    return successResponse(
      res,
      'Organization created successfully',
      { organization },
      201
    );
  } catch (error) {
    next(error);
  }
};

// @desc    Get my organization
// @route   GET /api/v1/organizations/my-organization
// @access  Private (Organization role)
exports.getMyOrganization = async (req, res, next) => {
  try {
    const organization = await Organization.findOne({
      where: { userId: req.user.id }
    });

    if (!organization) {
      return errorResponse(res, 'Organization not found', 404);
    }

    return successResponse(
      res,
      'Organization retrieved successfully',
      { organization }
    );
  } catch (error) {
    next(error);
  }
};

// @desc    Get organization by ID
// @route   GET /api/v1/organizations/:id
// @access  Public
exports.getOrganizationById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const organization = await Organization.findByPk(id, {
      attributes: { exclude: ['apiKey'] }
    });

    if (!organization) {
      return errorResponse(res, 'Organization not found', 404);
    }

    return successResponse(
      res,
      'Organization retrieved successfully',
      { organization }
    );
  } catch (error) {
    next(error);
  }
};

// @desc    Update organization
// @route   PUT /api/v1/organizations/:id
// @access  Private (Organization owner)
exports.updateOrganization = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      name,
      email,
      phone,
      address,
      website
    } = req.body;

    const organization = await Organization.findByPk(id);

    if (!organization) {
      return errorResponse(res, 'Organization not found', 404);
    }

    // Authorization check
    if (organization.userId !== req.user.id && req.user.role !== 'admin') {
      return errorResponse(res, 'Not authorized to update this organization', 403);
    }

    // Update fields
    if (name) organization.name = name;
    if (email) organization.email = email;
    if (phone) organization.phone = phone;
    if (address) organization.address = address;
    if (website) organization.website = website;

    await organization.save();

    return successResponse(
      res,
      'Organization updated successfully',
      { organization }
    );
  } catch (error) {
    next(error);
  }
};

// @desc    Get all organizations
// @route   GET /api/v1/organizations
// @access  Public
exports.getAllOrganizations = async (req, res, next) => {
  try {
    const { sector, size, page = 1, limit = 20 } = req.query;

    const whereClause = { isActive: true };

    if (sector) whereClause.sector = sector;
    if (size) whereClause.size = size;

    const { count, rows } = await Organization.findAndCountAll({
      where: whereClause,
      attributes: { exclude: ['apiKey'] },
      order: [['complianceScore', 'DESC']],
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit)
    });

    return successResponse(
      res,
      'Organizations retrieved successfully',
      {
        organizations: rows,
        pagination: {
          total: count,
          page: parseInt(page),
          totalPages: Math.ceil(count / limit)
        }
      }
    );
  } catch (error) {
    next(error);
  }
};

// @desc    Regenerate API key
// @route   POST /api/v1/organizations/:id/regenerate-key
// @access  Private (Organization owner)
exports.regenerateApiKey = async (req, res, next) => {
  try {
    const { id } = req.params;

    const organization = await Organization.findByPk(id);

    if (!organization) {
      return errorResponse(res, 'Organization not found', 404);
    }

    // Authorization check
    if (organization.userId !== req.user.id && req.user.role !== 'admin') {
      return errorResponse(res, 'Not authorized', 403);
    }

    // Generate new API key
    organization.apiKey = generateApiKey();
    await organization.save();

    return successResponse(
      res,
      'API key regenerated successfully',
      { apiKey: organization.apiKey }
    );
  } catch (error) {
    next(error);
  }
};