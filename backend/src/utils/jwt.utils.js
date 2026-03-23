'use strict';

const jwt = require('jsonwebtoken');
const { env } = require('../config/env');

/**
 * JWT utilities — encapsulates all token signing and verification logic.
 * Keeps JWT implementation details away from auth service/middleware.
 */
class JwtUtils {
  /**
   * Signs an access token (short-lived).
   * @param {object} payload - Data to embed (userId, role)
   * @returns {string}
   */
  static signAccessToken(payload) {
    return jwt.sign(payload, env.jwt.secret, { expiresIn: env.jwt.expiresIn });
  }

  /**
   * Signs a refresh token (long-lived).
   * @param {object} payload
   * @returns {string}
   */
  static signRefreshToken(payload) {
    return jwt.sign(payload, env.jwt.refreshSecret, {
      expiresIn: env.jwt.refreshExpiresIn,
    });
  }

  /**
   * Verifies an access token and returns decoded payload.
   * Throws JsonWebTokenError / TokenExpiredError on failure.
   * @param {string} token
   * @returns {object}
   */
  static verifyAccessToken(token) {
    return jwt.verify(token, env.jwt.secret);
  }

  /**
   * Verifies a refresh token and returns decoded payload.
   * @param {string} token
   * @returns {object}
   */
  static verifyRefreshToken(token) {
    return jwt.verify(token, env.jwt.refreshSecret);
  }

  /**
   * Generates both tokens and returns them together.
   * @param {{ userId: string, role: string }} payload
   * @returns {{ accessToken: string, refreshToken: string }}
   */
  static generateTokenPair(payload) {
    return {
      accessToken: JwtUtils.signAccessToken(payload),
      refreshToken: JwtUtils.signRefreshToken(payload),
    };
  }

  /**
   * Extracts Bearer token from Authorization header.
   * @param {string} authHeader
   * @returns {string|null}
   */
  static extractBearerToken(authHeader) {
    if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
    return authHeader.split(' ')[1];
  }
}

module.exports = JwtUtils;
