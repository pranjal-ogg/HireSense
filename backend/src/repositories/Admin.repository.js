'use strict';

const BaseRepository = require('./Base.repository');
const Admin = require('../models/Admin.model');

class AdminRepository extends BaseRepository {
  constructor() {
    super(Admin);
  }

  async findByEmailWithPassword(email) {
    return await this.model.findOne({ email }).select('+password').exec();
  }
}

module.exports = new AdminRepository();
