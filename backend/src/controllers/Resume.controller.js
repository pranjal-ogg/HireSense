'use strict';

const resumeService = require('../services/Resume.service');
const scoringService = require('../services/Scoring.service');
const suggestionEngine = require('../services/SuggestionEngine');
const resumeRepository = require('../repositories/Resume.repository');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');

class ResumeController {
  async uploadResume(req, res) {
    const resume = await resumeService.uploadAndParse(req.user._id, req.file);
    ApiResponse.created(res, 'Resume uploaded and processing started', { resume });
  }

  async getMyResumes(req, res) {
    const resumes = await resumeService.getMyResumes(req.user._id);
    ApiResponse.ok(res, 'Resumes retrieved successfully', { resumes });
  }

  async scoreResume(req, res) {
    const { resumeId, jobId } = req.body;
    const score = await scoringService.scoreResumeForJob(resumeId, jobId);
    ApiResponse.ok(res, 'Resume scored against job successfully', { score });
  }

  async getSuggestions(req, res) {
    const { id } = req.params;
    const resume = await resumeRepository.findById(id);
    
    if (!resume) throw ApiError.notFound('Resume not found');
    if (resume.parseStatus !== 'completed') {
      throw ApiError.badRequest('Resume must be parsed before generating suggestions.');
    }

    const suggestions = suggestionEngine.generateSuggestions(resume.parsedData);
    ApiResponse.ok(res, 'Suggestions generated successfully', { resumeId: id, suggestions });
  }
}

module.exports = new ResumeController();
