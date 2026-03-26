'use strict';

const BaseRepository = require('./Base.repository');
const Job = require('../models/Job.model');

class JobRepository extends BaseRepository {
  constructor() {
    super(Job);
  }

  async searchJobs(queryText, options = {}) {
    const filter = { status: 'active' };
    if (queryText) {
      filter.$text = { $search: queryText };
    }
    return await this.find(filter, options);
  }
}

module.exports = new JobRepository();
