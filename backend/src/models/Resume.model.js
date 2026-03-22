'use strict';

const mongoose = require('mongoose');

const skillSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, lowercase: true, trim: true },
    level: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced', 'expert'],
      default: 'intermediate',
    },
    yearsOfExperience: { type: Number, default: 0 },
  },
  { _id: false }
);

const experienceSchema = new mongoose.Schema(
  {
    company: { type: String, trim: true },
    title: { type: String, trim: true },
    location: { type: String, trim: true },
    startDate: { type: Date },
    endDate: { type: Date, default: null }, // null = current
    isCurrent: { type: Boolean, default: false },
    description: { type: String, trim: true },
    technologies: [{ type: String, lowercase: true, trim: true }],
  },
  { _id: false }
);

const educationSchema = new mongoose.Schema(
  {
    institution: { type: String, trim: true },
    degree: { type: String, trim: true },
    fieldOfStudy: { type: String, trim: true },
    startYear: { type: Number },
    endYear: { type: Number },
    gpa: { type: Number, min: 0, max: 10 },
  },
  { _id: false }
);

const resumeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      trim: true,
      default: 'My Resume',
    },
    originalFileName: { type: String, required: true },
    filePath: { type: String, required: true },
    fileSize: { type: Number },
    mimeType: { type: String },
    rawText: { type: String }, // Extracted plain text from PDF
    parsedData: {
      skills: [skillSchema],
      experience: [experienceSchema],
      education: [educationSchema],
      certifications: [{ type: String }],
      languages: [{ type: String }],
      summary: { type: String },
      contactInfo: {
        phone: { type: String },
        linkedin: { type: String },
        github: { type: String },
        portfolio: { type: String },
      },
    },
    parseStatus: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed'],
      default: 'pending',
    },
    isActive: { type: Boolean, default: true },
    lastScoreDate: { type: Date },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

resumeSchema.index({ userId: 1, isActive: 1 });
resumeSchema.index({ parseStatus: 1 });
resumeSchema.index({ 'parsedData.skills.name': 1 });

module.exports = mongoose.model('Resume', resumeSchema);
