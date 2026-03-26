'use strict';

const BaseRepository = require('./Base.repository');
const User = require('../models/User.model');

class UserRepository extends BaseRepository {
  constructor() {
    super(User);
  }

  async findByEmailWithPassword(email) {
    return await this.model.findOne({ email }).select('+password').exec();
  }

  async updateRefreshToken(userId, token) {
    return await this.updateById(userId, { refreshToken: token });
  }
}

module.exports = new UserRepository();
