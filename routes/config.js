// Public configuration endpoint (no secrets)
const express = require('express');
const router = express.Router();

// Get public configuration
router.get('/', (req, res) => {
  try {
    console.log('📡 [Config] Request received from:', req.get('host'));
    console.log('📡 [Config] Environment check:', {
      hasSupabaseUrl: !!process.env.SUPABASE_URL,
      hasSupabaseKey: !!process.env.SUPABASE_ANON_KEY,
      nodeEnv: process.env.NODE_ENV,
      isVercel: process.env.VERCEL
    });
    
    // Get environment variables
    const supabaseUrl = process.env.SUPABASE_URL || '';
    const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || '';
    
    // Validate that required config is present
    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('❌ [Config] Missing Supabase configuration in environment variables');
      console.error('❌ [Config] Available env vars:', Object.keys(process.env).filter(k => k.includes('SUPABASE')));
      
      return res.status(500).json({
        error: 'Server configuration incomplete',
        message: 'Missing SUPABASE_URL or SUPABASE_ANON_KEY',
        code: 'CONFIG_ERROR',
        hint: 'Please set environment variables in Vercel dashboard',
        timestamp: new Date().toISOString()
      });
    }
    
    // Validate Supabase URL format
    try {
      const url = new URL(supabaseUrl);
      if (!url.hostname || !url.protocol.startsWith('http')) {
        throw new Error('Invalid URL format');
      }
      console.log('✅ [Config] Supabase URL validated:', url.hostname);
    } catch (urlError) {
      console.error('❌ [Config] Invalid Supabase URL format:', supabaseUrl);
      return res.status(500).json({
        error: 'Invalid Supabase URL format',
        message: `URL: ${supabaseUrl}`,
        code: 'INVALID_URL',
        hint: 'Check SUPABASE_URL format in environment variables',
        timestamp: new Date().toISOString()
      });
    }
    
    // Only return public configuration
    const config = {
      supabaseUrl: supabaseUrl,
      supabaseAnonKey: supabaseAnonKey,
      apiBaseUrl: process.env.API_BASE_URL || req.protocol + '://' + req.get('host')
    };

    console.log('✅ [Config] Configuration sent successfully');
    res.json(config);
  } catch (error) {
    console.error('❌ [Config] Endpoint error:', error);
    res.status(500).json({
      error: 'Failed to load configuration',
      message: error.message,
      code: 'CONFIG_ERROR',
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;
