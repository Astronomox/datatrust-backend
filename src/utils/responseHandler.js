// Success response
exports.successResponse = (res, message, data = null, statusCode = 200) => {
  const response = {
    success: true,
    message,
    data
  };

  return res.status(statusCode).json(response);
};

// Error response
exports.errorResponse = (res, message, statusCode = 500, errors = null) => {
  const response = {
    success: false,
    message,
    errors
  };

  return res.status(statusCode).json(response);
};

// Paginated response
exports.paginatedResponse = (res, message, data, page, limit, total) => {
  const response = {
    success: true,
    message,
    data,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      totalPages: Math.ceil(total / limit)
    }
  };

  return res.status(200).json(response);
};