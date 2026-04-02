require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const { securityHeaders } = require('./middleware/security');
const { errorHandler } = require('./utils/errors');
const { setupServerlessErrorHandling } = require('./middleware/serverless-error-handler');
const logger = require('./utils/logger');

// Setup error handling untuk serverless
setupServerlessErrorHandling();

const app = express();

// Security middleware (must be first)
app.use(securityHeaders);

// CORS configuration
const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim())
  : ['http://localhost:3001', 'http://localhost:3000'];

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    // In production, check against allowed origins
    if (process.env.NODE_ENV === 'production' || process.env.VERCEL) {
      if (allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    } else {
      // In development, allow all origins
      callback(null, true);
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
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

// Health check endpoint
app.get('/api/health', (req, res) => {
  const envCheck = {
    supabaseUrl: !!process.env.SUPABASE_URL,
    supabaseAnonKey: !!process.env.SUPABASE_ANON_KEY,
    supabaseServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    nodeEnv: process.env.NODE_ENV || 'development',
    isVercel: process.env.VERCEL === '1'
  };
  
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: require('./package.json').version,
    platform: process.env.VERCEL ? 'vercel' : 'local',
    config: envCheck
  });
});

// Routes
const routesToLoad = [
  ['/api/config', './routes/config'],
  ['/api/test', './routes/test'],
  ['/api/test-data', './routes/test-data'],
  ['/api/simple', './routes/simple-data'],
  ['/api/debug-data', './routes/debug-data'],
  ['/api/debug-monitoring', './routes/debug-monitoring'],
  ['/api/debug-risk-profile', './routes/debug-risk-profile'],
  ['/api/risk-profile-simple', './routes/risk-profile-simple'],
  ['/api/auth', './routes/auth'],
  ['/api/users', './routes/users'],
  ['/api/user-management', './routes/user-management'],
  ['/api/risks', './routes/risks'],
  ['/api/risk-profile', './routes/risk-profile'],
  ['/api/risk-profile/export', './routes/risk-profile-export'],
  ['/api/master-data', './routes/master-data'],
  ['/api/reports/residual-risk', './routes/residual-risk-reports'],
  ['/api/reports', './routes/reports'],
  ['/api/dashboard', './routes/dashboard'],
  ['/api/visi-misi', './routes/visi-misi'],
  ['/api/rencana-strategis', './routes/rencana-strategis'],
  ['/api/renstra', './routes/renstra'],
  ['/api/monitoring-evaluasi', './routes/monitoring-evaluasi'],
  ['/api/peluang', './routes/peluang'],
  ['/api/kri', './routes/kri'],
  ['/api/ews', './routes/ews'],
  ['/api/organizations', './routes/organizations'],
  ['/api/pengaturan', './routes/pengaturan'],
  ['/api/ai-assistant', './routes/ai-assistant-direct'],
  ['/api/analisis-swot', './routes/analisis-swot'],
  ['/api/diagram-kartesius', './routes/diagram-kartesius'],
  ['/api/matriks-tows', './routes/matriks-tows'],
  ['/api/sasaran-strategi', './routes/sasaran-strategi'],
  ['/api/strategic-map', './routes/strategic-map'],
  ['/api/indikator-kinerja-utama', './routes/indikator-kinerja-utama'],
  ['/api/evaluasi-iku', './routes/evaluasi-iku'],
  ['/api/evaluasi-iku-bulanan', './routes/evaluasi-iku-bulanan'],
  ['/api/notifications', './routes/notifications'],
  ['/api/test-org-filter', './routes/test-org-filter'],
  ['/api/buku-pedoman', './routes/buku-pedoman']
];

let loadedCount = 0;
let failedRoutes = [];

routesToLoad.forEach(([path, modulePath]) => {
  try {
    const route = require(modulePath);
    app.use(path, route);
    loadedCount++;
  } catch (error) {
    logger.error(`❌ Failed to load route ${path}:`, error.message);
    failedRoutes.push({ path, error: error.message });
    
    // Buat fallback route untuk route yang gagal
    app.use(path, (req, res) => {
      res.status(503).json({
        error: 'Route temporarily unavailable',
        path: path,
        message: 'This route failed to load in serverless environment',
        hint: 'Some features may not be available'
      });
    });
  }
});

logger.info(`✅ Loaded ${loadedCount}/${routesToLoad.length} routes successfully`);
if (failedRoutes.length > 0) {
  logger.warn(`⚠️ Failed routes:`, failedRoutes.map(r => r.path).join(', '));
}

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
if (require.main === module && process.env.VERCEL !== '1') {
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
if (require.main === module && process.env.VERCEL !== '1') {
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

