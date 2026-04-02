// Middleware untuk menangani error di serverless environment
const logger = require('../utils/logger');

/**
 * Wrapper untuk route handler yang menangkap semua error
 */
function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch((error) => {
      logger.error('Route error:', error);
      
      // Jangan expose stack trace di production
      const isDev = process.env.NODE_ENV === 'development';
      
      res.status(error.statusCode || 500).json({
        error: error.message || 'Internal server error',
        code: error.code || 'INTERNAL_ERROR',
        ...(isDev && { stack: error.stack })
      });
    });
  };
}

/**
 * Global error handler untuk uncaught errors di serverless
 */
function setupServerlessErrorHandling() {
  if (process.env.VERCEL === '1') {
    // Di Vercel, tangkap error tapi jangan exit process
    process.on('uncaughtException', (err) => {
      logger.error('Uncaught Exception (serverless):', err);
      // Jangan exit di serverless
    });

    process.on('unhandledRejection', (reason, promise) => {
      logger.error('Unhandled Rejection (serverless):', reason);
      // Jangan exit di serverless
    });
  }
}

module.exports = {
  asyncHandler,
  setupServerlessErrorHandling
};
