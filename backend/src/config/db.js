'use strict';

const mongoose = require('mongoose');
const logger = require('./logger');

const connectDB = async () => {
  try {
    // 🔍 HARD DEBUG
    console.log("🔍 DEBUG MONGO_URI:", process.env.MONGO_URI);


    // ❌ Fail immediately if missing
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is NOT defined in .env");
    }

    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
    });

    logger.info(`✅ MongoDB connected: ${conn.connection.host}`);

  } catch (err) {
    console.error("❌ FULL ERROR:", err);
    process.exit(1); // stop retry loop — show real issue
  }
};

// Connection events
mongoose.connection.on('disconnected', () => logger.warn('⚠️ MongoDB disconnected'));
mongoose.connection.on('reconnected', () => logger.info('🔄 MongoDB reconnected'));

module.exports = connectDB;
