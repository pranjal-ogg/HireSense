'use strict';

const BaseRepository = require('./Base.repository');
const Resume = require('../models/Resume.model');

class ResumeRepository extends BaseRepository {
  constructor() {
    super(Resume);
  }

  async findByUserId(userId, options = {}) {
    return await this.find({ userId, isActive: true }, options);
  }
}

module.exports = new ResumeRepository();
