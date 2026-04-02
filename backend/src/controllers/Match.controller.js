'use strict';

const jobMatcherService = require('../services/JobMatcher.service');
const ApiResponse = require('../utils/ApiResponse');

class MatchController {
  async getTopMatchesForResume(req, res) {
    const { resumeId } = req.params;
    const limit = parseInt(req.query.limit, 10) || 10;

    const matches = await jobMatcherService.findTopJobsForResume(resumeId, limit);
    
    ApiResponse.ok(res, 'Top job matches calculated successfully', { 
      resumeId, 
      totalMatches: matches.length,
      matches 
    });
  }
}

module.exports = new MatchController();
