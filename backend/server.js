'use strict';

require('dotenv').config();

const app = require('./src/app');
const connectDB = require('./src/config/db');
const logger = require('./src/config/logger');

const PORT = process.env.PORT || 5000;

// 🔍 DEBUG: Check if env is loading
console.log("🔍 ENV CHECK:");
console.log("PORT:", process.env.PORT);
console.log("MONGO_URI:", process.env.MONGO_URI ? "Loaded ✅" : "NOT LOADED ❌");

(async () => {
  try {
    // 🚀 Connect to DB
    await connectDB();


    const server = app.listen(PORT, () => {
      logger.info(`🚀 HireSense API running on port ${PORT} [${process.env.NODE_ENV || "development"}]`);
    });
    // 🛑 Graceful shutdown
    const shutdown = (signal) => {
      logger.warn(`${signal} received — shutting down gracefully`);
      server.close(() => {
        logger.info('HTTP server closed');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

    // ❌ Catch unhandled promise errors
    process.on('unhandledRejection', (err) => {
      logger.error('Unhandled Rejection:', err.message);
      process.exit(1);
    });


  } catch (err) {
    logger.error('❌ Failed to start server:', err.message);
    process.exit(1);
  }
})();
