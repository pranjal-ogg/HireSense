'use strict';

const mongoose = require('mongoose');

const matchSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    resumeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Resume',
      required: true,
    },
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      required: true,
    },
    matchScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    matchCategory: {
      type: String,
      enum: ['excellent', 'good', 'fair', 'poor'],
      // Computed on save
    },
    status: {
      type: String,
      enum: ['suggested', 'applied', 'shortlisted', 'rejected', 'hired'],
      default: 'suggested',
    },
    appliedAt: { type: Date },
    notes: { type: String },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
  }
);

// ─── Auto-compute matchCategory before save ───────────────────────────────────
matchSchema.pre('save', function (next) {
  if (this.matchScore >= 80) this.matchCategory = 'excellent';
  else if (this.matchScore >= 60) this.matchCategory = 'good';
  else if (this.matchScore >= 40) this.matchCategory = 'fair';
  else this.matchCategory = 'poor';
  next();
});

matchSchema.index({ userId: 1, matchScore: -1 });
matchSchema.index({ jobId: 1, matchScore: -1 });
matchSchema.index({ resumeId: 1, jobId: 1 }, { unique: true });

module.exports = mongoose.model('Match', matchSchema);
