'use strict';

const BaseRepository = require('./Base.repository');
const ResumeScore = require('../models/ResumeScore.model');

class ResumeScoreRepository extends BaseRepository {
  constructor() {
    super(ResumeScore);
  }

  async findTopScoresForJob(jobId, limit = 10) {
    return await this.model
      .find({ jobId })
      .sort({ overallScore: -1 })
      .limit(limit)
      .populate('resumeId', 'title parsedData.skills parsedData.experience')
      .populate('userId', 'name email')
      .exec();
  }
}

module.exports = new ResumeScoreRepository();
