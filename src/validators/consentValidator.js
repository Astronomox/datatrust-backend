const { body, param } = require('express-validator');
const { DATA_TYPES, NDPR_PURPOSES } = require('../config/constants');

exports.grantConsentValidator = [
  body('organizationId')
    .notEmpty()
    .withMessage('Organization ID is required')
    .isUUID()
    .withMessage('Invalid organization ID format'),
  body('dataTypes')
    .isArray({ min: 1 })
    .withMessage('Data types must be an array with at least one item')
    .custom((value) => {
      const validTypes = Object.values(DATA_TYPES);
      return value.every(type => validTypes.includes(type));
    })
    .withMessage('Invalid data type provided'),
  body('purpose')
    .notEmpty()
    .withMessage('Purpose is required')
    .isIn(NDPR_PURPOSES)
    .withMessage('Invalid purpose'),
  body('purposeDescription')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Purpose description must not exceed 500 characters'),
  body('durationDays')
    .optional()
    .isInt({ min: 1, max: 3650 })
    .withMessage('Duration must be between 1 and 3650 days (10 years)')
];

exports.revokeConsentValidator = [
  param('id')
    .isUUID()
    .withMessage('Invalid consent ID format'),
  body('reason')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Reason must not exceed 500 characters')
];

exports.consentIdValidator = [
  param('id')
    .isUUID()
    .withMessage('Invalid consent ID format')
];