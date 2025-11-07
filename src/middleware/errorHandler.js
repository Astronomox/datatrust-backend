const { errorResponse } = require('../utils/responseHandler');

const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error for debugging
  console.error('Error:', err);

  // Sequelize validation error
  if (err.name === 'SequelizeValidationError') {
    const message = err.errors.map(e => e.message).join(', ');
    return errorResponse(res, message, 400);
  }

  // Sequelize unique constraint error
  if (err.name === 'SequelizeUniqueConstraintError') {
    const message = 'Duplicate field value entered';
    return errorResponse(res, message, 400);
  }

  // Sequelize foreign key constraint error
  if (err.name === 'SequelizeForeignKeyConstraintError') {
    const message = 'Invalid reference to related resource';
    return errorResponse(res, message, 400);
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    const message = 'Invalid token';
    return errorResponse(res, message, 401);
  }

  if (err.name === 'TokenExpiredError') {
    const message = 'Token expired';
    return errorResponse(res, message, 401);
  }

  // Default error
  return errorResponse(
    res,
    error.message || 'Server Error',
    error.statusCode || 500
  );
};

module.exports = errorHandler;