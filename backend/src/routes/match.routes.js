'use strict';

const express = require('express');
const MatchController = require('../controllers/Match.controller');
const { protect } = require('../middleware/auth.middleware');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

router.use(protect); // Only authenticated users can generate matches

// Get top matched jobs for a specific resume
router.get('/resumes/:resumeId', asyncHandler(MatchController.getTopMatchesForResume));

module.exports = router;
