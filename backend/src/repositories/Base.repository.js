'use strict';

/**
 * Base Repository Class.
 * Implements common CRUD operations using Mongoose.
 * Ensures data access logic is separated from business logic.
 */
class BaseRepository {
  constructor(model) {
    this.model = model;
  }

  async create(data) {
    const doc = new this.model(data);
    return await doc.save();
  }

  async findById(id, select = '') {
    return await this.model.findById(id).select(select).exec();
  }

  async findOne(filter, select = '') {
    return await this.model.findOne(filter).select(select).exec();
  }

  async find(filter = {}, options = {}) {
    const { sort = '-createdAt', limit = 10, skip = 0, select = '' } = options;
    return await this.model
      .find(filter)
      .select(select)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .exec();
  }

  async count(filter = {}) {
    return await this.model.countDocuments(filter).exec();
  }

  async updateById(id, updateData, options = { new: true, runValidators: true }) {
    return await this.model.findByIdAndUpdate(id, updateData, options).exec();
  }

  async deleteById(id) {
    return await this.model.findByIdAndDelete(id).exec();
  }
}

module.exports = BaseRepository;
