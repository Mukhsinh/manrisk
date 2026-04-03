// Vercel Serverless Entry Point - Ultra Robust Version
process.env.VERCEL = '1';
process.env.DISABLE_PUPPETEER = 'true';
process.env.NODE_ENV = process.env.NODE_ENV || 'production';

console.log('🚀 [Vercel] Starting serverless function...');

// Verify Supabase credentials
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ [Vercel] Missing Supabase credentials');
  console.error('SUPABASE_URL:', supabaseUrl ? 'SET' : 'MISSING');
  console.error('SUPABASE_ANON_KEY:', supabaseKey ? 'SET' : 'MISSING');
  
  module.exports = (req, res) => {
    res.status(500).json({
      error: 'Configuration error',
      message: 'Missing Supabase credentials. Please set SUPABASE_URL and SUPABASE_ANON_KEY in Vercel Environment Variables.',
      path: req.url,
      hint: 'Go to Vercel Dashboard > Project Settings > Environment Variables'
    });
  };
  return;
}

// Try to load Express app with maximum error suppression
let app = null;
let loadError = null;

try {
  console.log('📦 [Vercel] Loading Express app...');
  
  // Suppress ALL non-critical errors during load
  const originalConsoleError = console.error;
  const originalConsoleWarn = console.warn;
  const suppressedErrors = [];
  const suppressedWarnings = [];
  
  console.error = (...args) => {
    const msg = args.join(' ');
    // Suppress known non-critical errors
    if (msg.includes('PUPPETEER') || 
        msg.includes('puppeteer') ||
        msg.includes('chromium') ||
        msg.includes('Failed to load route') ||
        msg.includes('⚠️') ||
        msg.includes('❌ Failed')) {
      suppressedErrors.push(msg);
      return;
    }
    originalConsoleError(...args);
  };
  
  console.warn = (...args) => {
    suppressedWarnings.push(args.join(' '));
  };
  
  app = require('../server');
  
  console.error = originalConsoleError;
  console.warn = originalConsoleWarn;
  
  console.log('✅ [Vercel] Express app loaded successfully');
  console.log(`ℹ️ [Vercel] Suppressed ${suppressedErrors.length} errors and ${suppressedWarnings.length} warnings`);
  
} catch (error) {
  console.error('❌ [Vercel] CRITICAL: Failed to load Express app');
  console.error('Error:', error.message);
  console.error('Stack:', error.stack?.split('\n').slice(0, 3).join('\n'));
  loadError = error;
}

// Export request handler
module.exports = (req, res) => {
  // Handle app load failure
  if (loadError) {
    console.error(`❌ [Vercel] App unavailable for ${req.url}`);
    
    // Provide helpful error response
    return res.status(503).json({
      error: 'Service temporarily unavailable',
      path: req.url,
      message: 'The application failed to initialize in serverless environment',
      details: loadError.message,
      hint: 'Check Vercel logs for more details'
    });
  }
  
  // Set request timeout
  const timeout = setTimeout(() => {
    if (!res.headersSent) {
      console.error(`⏱️ [Vercel] Timeout: ${req.method} ${req.url}`);
      res.status(504).json({
        error: 'Request timeout',
        path: req.url,
        message: 'Request took too long to process'
      });
    }
  }, 25000);
  
  // Wrap response methods to clear timeout
  const originalSend = res.send;
  const originalJson = res.json;
  const originalEnd = res.end;
  
  const clearTimeoutOnce = () => {
    clearTimeout(timeout);
  };
  
  res.send = function(...args) {
    clearTimeoutOnce();
    return originalSend.apply(res, args);
  };
  
  res.json = function(...args) {
    clearTimeoutOnce();
    return originalJson.apply(res, args);
  };
  
  res.end = function(...args) {
    clearTimeoutOnce();
    return originalEnd.apply(res, args);
  };
  
  // Handle request
  try {
    console.log(`📥 [Vercel] ${req.method} ${req.url}`);
    return app(req, res);
  } catch (error) {
    clearTimeoutOnce();
    console.error(`❌ [Vercel] Request error: ${req.url}`, error.message);
    
    if (!res.headersSent) {
      res.status(500).json({
        error: 'Request failed',
        message: error.message,
        path: req.url
      });
    }
  }
};
