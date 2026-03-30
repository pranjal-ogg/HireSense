'use strict';

const resumeRepository = require('../repositories/Resume.repository');
const jobRepository = require('../repositories/Job.repository');
const scoreRepository = require('../repositories/ResumeScore.repository');
const Match = require('../models/Match.model');
const ResumeScoringEngine = require('./ScoringEngine');
const { env } = require('../config/env');
const ApiError = require('../utils/ApiError');

class ScoringService {
  constructor() {
    this.matchRepo = new (require('../repositories/Base.repository'))(Match);
    // Initialize the new, highly reusable Scoring Engine
    this.engine = new ResumeScoringEngine({
      // We can inject custom weights here from env if needed
      skillsPresence: env.scoring.skillWeight * 100 || 25,
      experience: env.scoring.experienceWeight * 100 || 25,
      completeness: env.scoring.educationWeight * 100 || 20,
    });
  }

  /**
   * Scores a resume against a job utilizing the standalone Scoring Engine.
   */
  async scoreResumeForJob(resumeId, jobId) {
    const resume = await resumeRepository.findById(resumeId);
    const job = await jobRepository.findById(jobId);

    if (!resume || !job) {
      throw ApiError.notFound('Resume or Job not found.');
    }

    if (resume.parseStatus !== 'completed') {
      throw ApiError.badRequest('Resume parsing is not complete yet.');
    }

    // Run the engine
    const result = this.engine.evaluate(resume.parsedData, job.requirements);

    // Save or update the score record
    const scoreRecord = await scoreRepository.model.findOneAndUpdate(
      { resumeId, jobId },
      {
        userId: resume.userId,
        overallScore: result.score,
        breakdown: {
          skillScore: result.breakdown.skillsPresence,
          experienceScore: result.breakdown.experience,
          educationScore: result.breakdown.completeness,
          keywordScore: result.breakdown.toolsAndTech,
        },
        // We capture engine feedback here (we could add a feedback array to schema later)
        strengthAreas: result.feedback.filter((f) => f.includes('Great') || f.includes('Excellent')),
        improvementAreas: result.feedback.filter((f) => !f.includes('Great') && !f.includes('Excellent')),
      },
      { new: true, upsert: true }
    );

    // Save or update the match record
    await this.matchRepo.model.findOneAndUpdate(
      { resumeId, jobId },
      {
        userId: resume.userId,
        matchScore: result.score,
      },
      { new: true, upsert: true }
    );

    return { scoreRecord, feedback: result.feedback };
  }
}

module.exports = new ScoringService();
