// Vercel Serverless Entry Point
require('dotenv').config();

// Verify critical environment variables before loading app
const requiredEnvVars = ['SUPABASE_URL', 'SUPABASE_ANON_KEY'];
const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.error('❌ Missing required environment variables:', missingVars);
  console.error('Please set these in Vercel dashboard: Project Settings > Environment Variables');
  
  // Export error handler
  module.exports = (req, res) => {
    res.status(500).json({
      error: 'Server configuration error',
      message: `Missing environment variables: ${missingVars.join(', ')}`,
      hint: 'Configure environment variables in Vercel dashboard',
      timestamp: new Date().toISOString()
    });
  };
} else {
  try {
    console.log('✅ Environment variables validated');
    
    // Disable puppeteer in serverless environment
    process.env.DISABLE_PUPPETEER = 'true';
    process.env.VERCEL = '1';
    
    console.log('Loading Express app...');
    const app = require('../server');
    
    console.log('✅ Express app loaded successfully');
    module.exports = app;
    
  } catch (error) {
    console.error('❌ Failed to initialize serverless function:', error.message);
    console.error('Stack:', error.stack);
    
    // Export error handler with detailed info
    module.exports = (req, res) => {
      res.status(500).json({
        error: 'Server initialization failed',
        message: error.message,
        code: error.code || 'INIT_ERROR',
        timestamp: new Date().toISOString()
      });
    };
  }
}
