'use strict';

const jobRepository = require('../repositories/Job.repository');
const resumeRepository = require('../repositories/Resume.repository');
const JobMatchingEngine = require('./JobMatchingEngine');
const ApiError = require('../utils/ApiError');

class JobMatcherService {
  constructor() {
    this.engine = new JobMatchingEngine();
  }

  /**
   * Finds the top matching jobs for a specific resume.
   * @param {String} resumeId 
   * @param {Number} limit 
   */
  async findTopJobsForResume(resumeId, limit = 10) {
    const resume = await resumeRepository.findById(resumeId);
    if (!resume) throw ApiError.notFound('Resume not found.');
    if (resume.parseStatus !== 'completed') {
      throw ApiError.badRequest('Resume parsing must be complete before matching.');
    }

    // 1. Fetch all active jobs (In production, pre-filter by location or generic keywords to avoid loading all jobs)
    const activeJobs = await jobRepository.find({ status: 'active' }, { limit: 1000 });

    if (!activeJobs.length) return [];

    // 2. Score each job against the resume
    const matchResults = activeJobs.map((job) => {
      return this.engine.calculateMatch(resume.parsedData, job);
    });

    // 3. Sort by overallScore descending and take top N
    matchResults.sort((a, b) => b.overallScore - a.overallScore);
    
    return matchResults.slice(0, limit);
  }
}

module.exports = new JobMatcherService();
