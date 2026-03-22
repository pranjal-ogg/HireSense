'use strict';

const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema(
  {
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Job title is required'],
      trim: true,
      maxlength: [120, 'Title cannot exceed 120 characters'],
    },
    company: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
    },
    location: {
      city: { type: String, trim: true },
      state: { type: String, trim: true },
      country: { type: String, trim: true, default: 'India' },
      isRemote: { type: Boolean, default: false },
    },
    description: {
      type: String,
      required: [true, 'Job description is required'],
    },
    requirements: {
      requiredSkills: [{ type: String, lowercase: true, trim: true }],
      preferredSkills: [{ type: String, lowercase: true, trim: true }],
      minExperienceYears: { type: Number, default: 0 },
      maxExperienceYears: { type: Number, default: 20 },
      educationLevel: {
        type: String,
        enum: ['high_school', 'associate', 'bachelor', 'master', 'phd', 'any'],
        default: 'any',
      },
    },
    salary: {
      min: { type: Number },
      max: { type: Number },
      currency: { type: String, default: 'INR' },
      isNegotiable: { type: Boolean, default: true },
    },
    employmentType: {
      type: String,
      enum: ['full_time', 'part_time', 'contract', 'internship', 'freelance'],
      default: 'full_time',
    },
    status: {
      type: String,
      enum: ['draft', 'active', 'paused', 'closed'],
      default: 'active',
    },
    deadline: { type: Date },
    tags: [{ type: String, lowercase: true, trim: true }],
    applicantCount: { type: Number, default: 0 },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
  }
);

jobSchema.index({ status: 1, createdAt: -1 });
jobSchema.index({ 'requirements.requiredSkills': 1 });
jobSchema.index({ title: 'text', description: 'text', 'location.city': 'text' });

module.exports = mongoose.model('Job', jobSchema);
