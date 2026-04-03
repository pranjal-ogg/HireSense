'use strict';

const express = require('express');
const authRoutes = require('./auth.routes');
const resumeRoutes = require('./resume.routes');
const jobRoutes = require('./job.routes');
const matchRoutes = require('./match.routes');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/resumes', resumeRoutes);
router.use('/jobs', jobRoutes);
router.use('/matches', matchRoutes);

module.exports = router;
