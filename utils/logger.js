// Centralized logging utility

const isDevelopment = process.env.NODE_ENV === 'development';
const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL;

const logger = {
  info: (...args) => {
    if (isDevelopment) {
      console.log('[INFO]', ...args);
    }
  },
  
  error: (...args) => {
    // Always log errors, even in production
    console.error('[ERROR]', ...args);
  },
  
  warn: (...args) => {
    if (!isProduction) {
      console.warn('[WARN]', ...args);
    }
  },
  
  debug: (...args) => {
    if (isDevelopment) {
      console.debug('[DEBUG]', ...args);
    }
  }
};

module.exports = logger;
