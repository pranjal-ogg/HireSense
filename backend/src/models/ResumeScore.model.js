'use strict';

const mongoose = require('mongoose');

const scoreBreakdownSchema = new mongoose.Schema(
  {
    skillScore: { type: Number, default: 0 },       // 0–100
    experienceScore: { type: Number, default: 0 },  // 0–100
    educationScore: { type: Number, default: 0 },   // 0–100
    keywordScore: { type: Number, default: 0 },     // 0–100
  },
  { _id: false }
);

const resumeScoreSchema = new mongoose.Schema(
  {
    resumeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Resume',
      required: true,
      index: true,
    },
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    overallScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    breakdown: scoreBreakdownSchema,
    matchedSkills: [{ type: String }],
    missingSkills: [{ type: String }],
    strengthAreas: [{ type: String }],
    improvementAreas: [{ type: String }],
    scoringVersion: { type: String, default: 'v1.0' },
  },
  {
    timestamps: true,
  }
);

resumeScoreSchema.index({ resumeId: 1, jobId: 1 }, { unique: true });
resumeScoreSchema.index({ overallScore: -1 });

module.exports = mongoose.model('ResumeScore', resumeScoreSchema);
