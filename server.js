require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const { securityHeaders } = require('./middleware/security');
const { errorHandler } = require('./utils/errors');
const logger = require('./utils/logger');

const app = express();

// Security middleware (must be first)
app.use(securityHeaders);

// CORS configuration
const corsOptions = {
  origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : '*',
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Body parsing middleware
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

// Cache control middleware for dynamic JS files
const noCacheFiles = [
  '/js/page-initialization-system-fixed.js',
  '/js/rencana-strategis-fixed.js',
  '/js/rencana-strategis.js',
  '/js/startup-script.js'
];

app.use((req, res, next) => {
  if (noCacheFiles.some(file => req.path === file)) {
    res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
  }
  next();
});

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/api/config', require('./routes/config'));
app.use('/api/test', require('./routes/test'));
app.use('/api/test-data', require('./routes/test-data'));
app.use('/api/simple', require('./routes/simple-data'));
app.use('/api/debug-data', require('./routes/debug-data'));
app.use('/api/debug-monitoring', require('./routes/debug-monitoring'));
app.use('/api/debug-risk-profile', require('./routes/debug-risk-profile'));
app.use('/api/risk-profile-simple', require('./routes/risk-profile-simple'));

// Export endpoints moved to routes/risk-profile-export.js for better organization
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/user-management', require('./routes/user-management'));
app.use('/api/risks', require('./routes/risks'));
app.use('/api/risk-profile', require('./routes/risk-profile'));
app.use('/api/risk-profile/export', require('./routes/risk-profile-export'));
app.use('/api/master-data', require('./routes/master-data'));
// Residual risk reports endpoint
app.use('/api/reports/residual-risk', require('./routes/residual-risk-reports'));
app.use('/api/reports', require('./routes/reports'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/visi-misi', require('./routes/visi-misi'));
app.use('/api/rencana-strategis', require('./routes/rencana-strategis'));
app.use('/api/renstra', require('./routes/renstra'));
app.use('/api/monitoring-evaluasi', require('./routes/monitoring-evaluasi'));
app.use('/api/peluang', require('./routes/peluang'));
app.use('/api/kri', require('./routes/kri'));
// app.use('/api/loss-event', require('./routes/loss-event'));
app.use('/api/ews', require('./routes/ews'));
app.use('/api/organizations', require('./routes/organizations'));
app.use('/api/pengaturan', require('./routes/pengaturan'));
// app.use('/api/chat', require('./routes/chat'));
app.use('/api/ai-assistant', require('./routes/ai-assistant-direct'));
app.use('/api/analisis-swot', require('./routes/analisis-swot'));
app.use('/api/diagram-kartesius', require('./routes/diagram-kartesius'));
app.use('/api/matriks-tows', require('./routes/matriks-tows'));
app.use('/api/sasaran-strategi', require('./routes/sasaran-strategi'));
app.use('/api/strategic-map', require('./routes/strategic-map'));
app.use('/api/indikator-kinerja-utama', require('./routes/indikator-kinerja-utama'));
app.use('/api/evaluasi-iku', require('./routes/evaluasi-iku'));
app.use('/api/evaluasi-iku-bulanan', require('./routes/evaluasi-iku-bulanan'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/test-org-filter', require('./routes/test-org-filter'));
app.use('/api/buku-pedoman', require('./routes/buku-pedoman'));

// SPA routes
const spaRoutes = ['/rencana-strategis', '/renstra', '/residual-risk', '/risk-residual'];
spaRoutes.forEach(route => {
  app.get(route, (_req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
  });
});

app.get('*', (req, res) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'API endpoint not found' });
  }
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Error handling middleware (must be last)
app.use(errorHandler);

// Start server (only if not running in serverless environment)
if (require.main === module) {
  const { findAvailablePort, getPort } = require('./config/port');
  
  (async () => {
    try {
      const PORT = await findAvailablePort(getPort());
      
      const server = app.listen(PORT, () => {
        logger.info(`========================================`);
        logger.info(`Server running on port ${PORT}`);
        logger.info(`Access: http://localhost:${PORT}`);
        logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
        logger.info(`========================================`);
      });
      
      server.on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
          logger.error(`Port ${PORT} is already in use. Trying another port...`);
        } else {
          logger.error('Server error:', err);
          process.exit(1);
        }
      });
      
    } catch (error) {
      logger.error('Failed to start server:', error.message);
      process.exit(1);
    }
  })();
}

// Error handling (only in non-serverless environment)
if (require.main === module) {
  process.on('uncaughtException', (err) => {
    logger.error('Uncaught Exception:', err);
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
  });

  process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  });
}

// Export for Vercel serverless
module.exports = app;

