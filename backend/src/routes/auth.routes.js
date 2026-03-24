'use strict';

const express = require('express');
const AuthController = require('../controllers/Auth.controller');
const { protect } = require('../middleware/auth.middleware');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

// User Auth Routes
router.post('/register', asyncHandler(AuthController.register));
router.post('/login', asyncHandler(AuthController.login));

// Admin Auth Routes
router.post('/admin/login', asyncHandler(AuthController.adminLogin));

// Protected Profile Route (Works for both Users and Admins)
router.get('/me', protect, asyncHandler(AuthController.getMe));

module.exports = router;
