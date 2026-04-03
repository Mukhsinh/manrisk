/**
 * SERVERLESS ERROR HANDLER
 * Menangani error di environment serverless (Vercel)
 */

const logger = require('../utils/logger');

/**
 * Setup global error handling untuk serverless
 */
function setupServerlessErrorHandling() {
  // Tangkap uncaught exceptions
  process.on('uncaughtException', (error) => {
    logger.error('❌ Uncaught Exception:', error);
    // Jangan exit di serverless
    if (process.env.VERCEL !== '1') {
      process.exit(1);
    }
  });

  // Tangkap unhandled rejections
  process.on('unhandledRejection', (reason, promise) => {
    logger.error('❌ Unhandled Rejection:', reason);
    // Jangan exit di serverless
  });

  logger.info('✅ Serverless error handling setup complete');
}

/**
 * Middleware untuk menangani route yang gagal dimuat
 */
function routeErrorHandler(routePath) {
  return (req, res, next) => {
    try {
      next();
    } catch (error) {
      logger.error(`❌ Error in route ${routePath}:`, error);
      
      if (!res.headersSent) {
        res.status(503).json({
          error: 'Route temporarily unavailable',
          path: routePath,
          message: error.message,
          hint: 'This route encountered an error. Please try again later.'
        });
      }
    }
  };
}

/**
 * Middleware untuk memberikan fallback data jika route gagal
 */
function fallbackDataMiddleware(req, res, next) {
  const originalJson = res.json.bind(res);
  
  res.json = function(data) {
    // Jika response adalah error 503, coba berikan fallback data
    if (res.statusCode === 503) {
      logger.warn(`⚠️ Providing fallback for ${req.path}`);
      
      // Fallback data berdasarkan endpoint
      const fallbackData = getFallbackData(req.path);
      if (fallbackData !== null) {
        res.status(200);
        return originalJson(fallbackData);
      }
    }
    
    return originalJson(data);
  };
  
  next();
}

/**
 * Dapatkan fallback data untuk endpoint tertentu
 */
function getFallbackData(path) {
  // Dashboard
  if (path.includes('/dashboard')) {
    return {
      totalRisks: 0,
      highRisks: 0,
      mediumRisks: 0,
      lowRisks: 0,
      recentActivities: [],
      message: 'Data tidak tersedia saat ini'
    };
  }
  
  // Rencana Strategis
  if (path.includes('/rencana-strategis')) {
    return [];
  }
  
  // Master Data
  if (path.includes('/master-data')) {
    return [];
  }
  
  // IKU
  if (path.includes('/indikator-kinerja-utama')) {
    return [];
  }
  
  // Evaluasi IKU
  if (path.includes('/evaluasi-iku')) {
    return {
      data: [],
      summary: {
        total: 0,
        tercapai: 0,
        tidakTercapai: 0
      }
    };
  }
  
  // Risks
  if (path.includes('/risks')) {
    return [];
  }
  
  // Default: return empty array
  return [];
}

/**
 * Middleware timeout untuk mencegah hanging request
 */
function timeoutMiddleware(timeoutMs = 25000) {
  return (req, res, next) => {
    const timeout = setTimeout(() => {
      if (!res.headersSent) {
        logger.error(`⏱️ Request timeout: ${req.method} ${req.path}`);
        res.status(504).json({
          error: 'Request timeout',
          message: 'Request took too long to process',
          path: req.path
        });
      }
    }, timeoutMs);
    
    // Clear timeout ketika response selesai
    res.on('finish', () => clearTimeout(timeout));
    res.on('close', () => clearTimeout(timeout));
    
    next();
  };
}

module.exports = {
  setupServerlessErrorHandling,
  routeErrorHandler,
  fallbackDataMiddleware,
  timeoutMiddleware
};
