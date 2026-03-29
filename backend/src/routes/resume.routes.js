'use strict';

const express = require('express');
const ResumeController = require('../controllers/Resume.controller');
const { protect } = require('../middleware/auth.middleware');
const uploadResume = require('../middleware/upload.middleware');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

router.use(protect); // All resume routes require authentication

router.post('/upload', uploadResume.single('resume'), asyncHandler(ResumeController.uploadResume));
router.get('/', asyncHandler(ResumeController.getMyResumes));
router.post('/score', asyncHandler(ResumeController.scoreResume));
router.get('/:id/suggestions', asyncHandler(ResumeController.getSuggestions));

module.exports = router;
