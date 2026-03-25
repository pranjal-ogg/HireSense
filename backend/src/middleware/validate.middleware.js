'use strict';

const { validationResult } = require('express-validator');
const ApiError = require('../utils/ApiError');

/**
 * Middleware to evaluate express-validator rules.
 * If validation fails, throws an Unprocessable Entity error with details.
 */
const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // Format errors for client
    const formattedErrors = errors.array().map((err) => ({
      field: err.path,
      message: err.msg,
    }));
    throw ApiError.unprocessable('Validation failed', formattedErrors);
  }
  next();
};

module.exports = validateRequest;
