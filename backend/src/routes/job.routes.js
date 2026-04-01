'use strict';

const express = require('express');
const JobController = require('../controllers/Job.controller');
const { protect, restrictTo } = require('../middleware/auth.middleware');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

// Public route (if candidates need to view jobs)
router.get('/', asyncHandler(JobController.getAllJobs));
router.get('/:id', asyncHandler(JobController.getJobById));

// ─── ADMIN ONLY ROUTES ──────────────────────────────────────────────
router.use(protect); // Require valid JWT
router.use(restrictTo('superadmin', 'moderator')); // Must be an Admin role

router.post('/', asyncHandler(JobController.createJob));
router.patch('/:id', asyncHandler(JobController.updateJob));
router.delete('/:id', asyncHandler(JobController.deleteJob));

module.exports = router;
