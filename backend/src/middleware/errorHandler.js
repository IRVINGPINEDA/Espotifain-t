const env = require('../config/env');
const ApiError = require('../utils/apiError');

const errorHandler = (error, req, res, next) => {
  const statusCode = error.statusCode || 500;

  if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError') {
    res.status(422).json({
      message: 'Validation failed.',
      details: error.errors?.map((item) => item.message) || [],
    });
    return;
  }

  if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
    res.status(401).json({ message: 'Invalid or expired token.' });
    return;
  }

  const response = {
    message: error.message || 'Internal server error.',
  };

  if (error instanceof ApiError && error.details) {
    response.details = error.details;
  }

  if (env.nodeEnv !== 'production' && error.stack) {
    response.stack = error.stack;
  }

  res.status(statusCode).json(response);
};

module.exports = errorHandler;
