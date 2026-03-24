'use strict';

const authService = require('../services/Auth.service');
const ApiResponse = require('../utils/ApiResponse');

class AuthController {
  // ─── User Handlers ───
  async register(req, res) {
    const { name, email, password, role } = req.body;
    const { user, tokens } = await authService.register({ name, email, password, role });
    ApiResponse.created(res, 'User registered successfully', { user, tokens });
  }

  async login(req, res) {
    const { email, password } = req.body;
    const { user, tokens } = await authService.login({ email, password });
    ApiResponse.ok(res, 'Login successful', { user, tokens });
  }

  async getMe(req, res) {
    const profile = req.user.toSafeObject ? req.user.toSafeObject() : req.user;
    ApiResponse.ok(res, 'Profile retrieved', { user: profile });
  }

  // ─── Admin Handlers ───
  async adminLogin(req, res) {
    const { email, password } = req.body;
    const { admin, tokens } = await authService.adminLogin({ email, password });
    ApiResponse.ok(res, 'Admin login successful', { admin, tokens });
  }
}

module.exports = new AuthController();
