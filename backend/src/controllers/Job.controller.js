'use strict';

const jobService = require('../services/Job.service');
const ApiResponse = require('../utils/ApiResponse');

class JobController {
  async createJob(req, res) {
    const job = await jobService.createJob(req.user._id, req.body);
    ApiResponse.created(res, 'Job created successfully', { job });
  }

  async getAllJobs(req, res) {
    const jobs = await jobService.getAllJobs();
    ApiResponse.ok(res, 'Jobs retrieved successfully', { jobs, count: jobs.length });
  }

  async getJobById(req, res) {
    const job = await jobService.getJobById(req.params.id);
    ApiResponse.ok(res, 'Job retrieved successfully', { job });
  }

  async updateJob(req, res) {
    const job = await jobService.updateJob(req.params.id, req.body);
    ApiResponse.ok(res, 'Job updated successfully', { job });
  }

  async deleteJob(req, res) {
    await jobService.deleteJob(req.params.id);
    ApiResponse.ok(res, 'Job deleted successfully');
  }
}

module.exports = new JobController();
