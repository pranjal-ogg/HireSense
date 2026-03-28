'use strict';

const multer = require('multer');
const path = require('path');
const fs = require('fs');
const ApiError = require('../utils/ApiError');
const { env } = require('../config/env');

// Ensure upload directory exists
const uploadDir = path.resolve(process.cwd(), env.upload.dir);
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename: userId-timestamp-originalExt
    const ext = path.extname(file.originalname);
    const userId = req.user ? req.user._id.toString() : 'guest';
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `resume-${userId}-${uniqueSuffix}${ext}`);
  },
});

// File filter (Only allow PDFs for resumes initially)
const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(ApiError.badRequest('Not a PDF! Please upload only PDF files.'), false);
  }
};

const uploadResume = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: env.upload.maxFileSizeMB * 1024 * 1024, // MB to Bytes
  },
});

module.exports = uploadResume;
