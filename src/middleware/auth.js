const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { errorResponse } = require('../utils/responseHandler');

// Protect routes - require authentication
exports.protect = async (req, res, next) => {
  try {
    let token;

    // Check for token in headers
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return errorResponse(res, 'Not authorized to access this route', 401);
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from token
      req.user = await User.findByPk(decoded.id, {
        attributes: { exclude: ['password'] }
      });

      if (!req.user) {
        return errorResponse(res, 'User not found', 404);
      }

      if (!req.user.isActive) {
        return errorResponse(res, 'User account is deactivated', 403);
      }

      next();
    } catch (error) {
      return errorResponse(res, 'Not authorized to access this route', 401);
    }
  } catch (error) {
    return errorResponse(res, 'Authentication error', 500);
  }
};

// Authorize specific roles
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return errorResponse(
        res,
        `Role ${req.user.role} is not authorized to access this route`,
        403
      );
    }
    next();
  };
};

// Optional auth - attach user if token exists but don't require it
exports.optionalAuth = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findByPk(decoded.id, {
          attributes: { exclude: ['password'] }
        });
      } catch (error) {
        // Token invalid, but that's okay for optional auth
      }
    }

    next();
  } catch (error) {
    next();
  }
};