'use strict';

const ApiError = require('../utils/ApiError');
const logger = require('../config/logger');
const { env } = require('../config/env');

/**
 * Global Error Handler Middleware
 * Intercepts all thrown ApiErrors and unhandled exceptions.
 */
const errorHandler = (err, req, res, next) => {
  let { statusCode, message } = err;

  // If it's not our custom ApiError, treat it as an unexpected 500
  if (!err.isOperational) {
    statusCode = 500;
    message = env.isProduction ? 'Internal Server Error' : err.message;
    logger.error(`[UNEXPECTED ERROR] ${err.stack}`);
  } else {
    // Log operational errors at warn level unless they are 500s
    if (statusCode >= 500) {
      logger.error(`[API ERROR] ${err.message}\n${err.stack}`);
    } else {
      logger.warn(`[API ERROR ${statusCode}] ${err.message}`);
    }
  }

  // Mongoose validation error parsing
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors).map((val) => val.message).join(', ');
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue)[0];
    message = `Duplicate value for field: ${field}. Please use another value.`;
  }

  // JWT Errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token. Please log in again.';
  }
  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Your token has expired. Please log in again.';
  }

  const response = {
    success: false,
    statusCode: statusCode || 500,
    message,
    ...(err.errors && err.errors.length > 0 && { errors: err.errors }),
    ...(!env.isProduction && { stack: err.stack }), // Send stack trace only in dev
  };

  res.status(response.statusCode).json(response);
};

/**
 * 404 Not Found Middleware
 */
const notFoundHandler = (req, res, next) => {
  next(ApiError.notFound(`Route not found - ${req.originalUrl}`));
};

module.exports = {
  errorHandler,
  notFoundHandler,
};
