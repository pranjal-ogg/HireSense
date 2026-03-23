'use strict';

/**
 * Wraps an async route handler to catch rejections and forward to next().
 * Eliminates boilerplate try/catch in every controller method.
 *
 * @param {Function} fn - Async express route handler
 * @returns {Function}  - Express-compatible middleware
 *
 * @example
 * router.get('/me', asyncHandler(UserController.getMe));
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
