'use strict';

const userRepository = require('../repositories/User.repository');
const adminRepository = require('../repositories/Admin.repository');
const JwtUtils = require('../utils/jwt.utils');
const ApiError = require('../utils/ApiError');

/**
 * Auth Service
 * Handles business logic for User and Admin authentication.
 */
class AuthService {
  // ─── USER AUTHENTICATION ──────────────────────────────────────────────
  
  async register({ name, email, password, role }) {
    // Check if user exists
    const existingUser = await userRepository.findOne({ email });
    if (existingUser) {
      throw ApiError.conflict('Email is already registered.');
    }

    // Create user
    const user = await userRepository.create({ name, email, password, role });

    // Generate tokens with context
    const tokens = JwtUtils.generateTokenPair({ 
      id: user._id, 
      role: user.role,
      type: 'user' 
    });
    
    await userRepository.updateRefreshToken(user._id, tokens.refreshToken);

    return { user: user.toSafeObject(), tokens };
  }

  async login({ email, password }) {
    const user = await userRepository.findByEmailWithPassword(email);
    if (!user) {
      throw ApiError.unauthorized('Invalid email or password.');
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw ApiError.unauthorized('Invalid email or password.');
    }

    const tokens = JwtUtils.generateTokenPair({ 
      id: user._id, 
      role: user.role,
      type: 'user' 
    });
    
    await userRepository.updateRefreshToken(user._id, tokens.refreshToken);

    return { user: user.toSafeObject(), tokens };
  }

  // ─── ADMIN AUTHENTICATION ─────────────────────────────────────────────

  async adminLogin({ email, password }) {
    const admin = await adminRepository.findByEmailWithPassword(email);
    if (!admin) {
      throw ApiError.unauthorized('Invalid admin credentials.');
    }

    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      throw ApiError.unauthorized('Invalid admin credentials.');
    }

    const tokens = JwtUtils.generateTokenPair({ 
      id: admin._id, 
      role: admin.role,
      type: 'admin' 
    });

    // Strip password from returned admin object
    const adminObj = admin.toObject();
    delete adminObj.password;

    return { admin: adminObj, tokens };
  }
}

module.exports = new AuthService();
