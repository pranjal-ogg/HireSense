'use strict';

const jobRepository = require('../repositories/Job.repository');
const ApiError = require('../utils/ApiError');

/**
 * Job Service
 * Handles business logic for job posting and retrieval.
 */
class JobService {
  async createJob(adminId, jobData) {
    // Map simplified payload to our robust schema
    const newJobPayload = {
      title: jobData.title,
      company: jobData.company,
      description: jobData.description,
      requirements: {
        requiredSkills: jobData.skillsRequired || [],
        minExperienceYears: jobData.experienceRequired || 0,
      },
      postedBy: adminId, // The admin creating the job
    };
    
    return await jobRepository.create(newJobPayload);
  }

  async getAllJobs() {
    return await jobRepository.find({}, { sort: '-createdAt', limit: 500 });
  }

  async getJobById(jobId) {
    const job = await jobRepository.findById(jobId);
    if (!job) throw ApiError.notFound('Job not found.');
    return job;
  }

  async updateJob(jobId, updateData) {
    const job = await jobRepository.findById(jobId);
    if (!job) throw ApiError.notFound('Job not found.');

    // Flatten simplified payload into schema structure if provided
    const payload = { ...updateData };
    if (updateData.skillsRequired || updateData.experienceRequired !== undefined) {
      payload.requirements = {
        ...job.requirements,
        requiredSkills: updateData.skillsRequired || job.requirements.requiredSkills,
        minExperienceYears: updateData.experienceRequired !== undefined ? updateData.experienceRequired : job.requirements.minExperienceYears,
      };
    }

    return await jobRepository.updateById(jobId, payload);
  }

  async deleteJob(jobId) {
    const job = await jobRepository.deleteById(jobId);
    if (!job) throw ApiError.notFound('Job not found.');
    return true;
  }

  async searchJobs(query) {
    return await jobRepository.searchJobs(query);
  }
}

module.exports = new JobService();
