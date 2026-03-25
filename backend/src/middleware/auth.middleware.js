'use strict';

const JwtUtils = require('../utils/jwt.utils');
const ApiError = require('../utils/ApiError');
const User = require('../models/User.model');
const Admin = require('../models/Admin.model');
const asyncHandler = require('../utils/asyncHandler');

/**
 * Protects routes ensuring the user is authenticated.
 * Attaches the user or admin object to req.user.
 */
const protect = asyncHandler(async (req, res, next) => {
  const token = JwtUtils.extractBearerToken(req.headers.authorization);

  if (!token) {
    throw ApiError.unauthorized('You are not logged in. Please provide a token.');
  }

  // Verify token (throws error if invalid/expired which is caught by global handler)
  const decoded = JwtUtils.verifyAccessToken(token);

  let currentUser;

  // Check which collection to query based on token payload
  if (decoded.type === 'admin') {
    currentUser = await Admin.findById(decoded.id).select('+password');
  } else {
    currentUser = await User.findById(decoded.id).select('+password');
  }

  if (!currentUser) {
    throw ApiError.unauthorized('The user belonging to this token no longer exists.');
  }

  // Check if account is active
  if (!currentUser.isActive) {
    throw ApiError.forbidden('Your account has been deactivated.');
  }

  // Grant access to protected route. Attach the payload type so we know if it's admin/user.
  req.user = currentUser;
  req.userType = decoded.type;
  next();
});

/**
 * Role-based access control middleware.
 * @param  {...string} roles - Allowed roles (e.g., 'admin', 'recruiter', 'superadmin')
 */
const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      throw ApiError.forbidden('You do not have permission to perform this action');
    }
    next();
  };
};

module.exports = {
  protect,
  restrictTo,
};
