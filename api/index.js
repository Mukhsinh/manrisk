// Vercel Serverless Entry Point - Enhanced Error Handling
// Set environment SEBELUM require apapun
process.env.VERCEL = '1';
process.env.DISABLE_PUPPETEER = 'true';
process.env.NODE_ENV = process.env.NODE_ENV || 'production';

console.log('🚀 [Vercel] Initializing serverless function...');

// Load dotenv dengan error handling
try {
  require('dotenv').config();
  console.log('✅ [Vercel] dotenv loaded');
} catch (err) {
  console.error('⚠️ [Vercel] dotenv load failed:', err.message);
}

// Verify environment variables
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

console.log('🔍 [Vercel] Environment check:', {
  hasSupabaseUrl: !!supabaseUrl,
  hasSupabaseKey: !!supabaseKey,
  urlLength: supabaseUrl?.length || 0,
  keyLength: supabaseKey?.length || 0
});

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ [Vercel] Missing Supabase credentials');
  
  module.exports = (req, res) => {
    res.status(500).json({
      error: 'Server configuration error',
      message: 'Missing Supabase credentials',
      hint: 'Set SUPABASE_URL dan SUPABASE_ANON_KEY di Vercel Environment Variables',
      timestamp: new Date().toISOString()
    });
  };
} else {
  // Load Express app
  let app;
  
  try {
    console.log('📦 [Vercel] Loading Express app...');
    app = require('../server');
    console.log('✅ [Vercel] Express app loaded successfully');
    
    // Export dengan error wrapper
    module.exports = (req, res) => {
      // Set timeout untuk prevent hanging
      const timeout = setTimeout(() => {
        if (!res.headersSent) {
          console.error('⏱️ [Vercel] Request timeout:', req.url);
          res.status(504).json({
            error: 'Request timeout',
            message: 'Request took too long to process',
            path: req.url,
            timestamp: new Date().toISOString()
          });
        }
      }, 25000); // 25 detik (sebelum Vercel timeout 30 detik)
      
      // Clear timeout jika response sudah dikirim
      const originalSend = res.send;
      const originalJson = res.json;
      
      res.send = function(...args) {
        clearTimeout(timeout);
        return originalSend.apply(res, args);
      };
      
      res.json = function(...args) {
        clearTimeout(timeout);
        return originalJson.apply(res, args);
      };
      
      try {
        return app(req, res);
      } catch (error) {
        clearTimeout(timeout);
        console.error('❌ [Vercel] Request error:', error);
        
        if (!res.headersSent) {
          res.status(500).json({
            error: 'Request handling failed',
            message: error.message,
            path: req.url,
            timestamp: new Date().toISOString()
          });
        }
      }
    };
    
  } catch (error) {
    console.error('❌ [Vercel] App initialization failed');
    console.error('Error:', error.message);
    console.error('Code:', error.code);
    console.error('Stack:', error.stack?.split('\n').slice(0, 10).join('\n'));
    
    // Export fallback handler
    module.exports = (req, res) => {
      res.status(500).json({
        error: 'Server initialization failed',
        message: error.message,
        code: error.code || 'INIT_ERROR',
        details: error.stack?.split('\n').slice(0, 5),
        timestamp: new Date().toISOString()
      });
    };
  }
}
