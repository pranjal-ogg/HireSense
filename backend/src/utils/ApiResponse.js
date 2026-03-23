'use strict';

/**
 * Standardised API success response envelope.
 * Ensures every successful response has a consistent shape:
 * { success, statusCode, message, data, meta? }
 */
class ApiResponse {
  /**
   * @param {number} statusCode
   * @param {string} message
   * @param {*}      data
   * @param {object} [meta]     - Optional pagination / aggregation metadata
   */
  constructor(statusCode, message, data = null, meta = null) {
    this.success = statusCode < 400;
    this.statusCode = statusCode;
    this.message = message;
    this.data = data;
    if (meta) this.meta = meta;
  }

  /**
   * Sends the response via an Express res object.
   * @param {import('express').Response} res
   */
  send(res) {
    return res.status(this.statusCode).json(this);
  }

  // ─── Named Constructors ───────────────────────────────────────────────────
  static ok(res, message, data, meta) {
    return new ApiResponse(200, message, data, meta).send(res);
  }

  static created(res, message, data) {
    return new ApiResponse(201, message, data).send(res);
  }

  static noContent(res) {
    return res.status(204).send();
  }
}

module.exports = ApiResponse;
