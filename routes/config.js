// Public configuration endpoint (no secrets)
const express = require('express');
const router = express.Router();

// Get public configuration
router.get('/', (req, res) => {
  try {
    // Get environment variables
    const supabaseUrl = process.env.SUPABASE_URL || '';
    const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || '';
    
    // Validate that required config is present
    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('❌ Missing Supabase configuration in environment variables');
      return res.status(500).json({
        error: 'Server configuration incomplete. Missing SUPABASE_URL or SUPABASE_ANON_KEY.',
        code: 'CONFIG_ERROR'
      });
    }
    
    // Validate Supabase URL format
    try {
      const url = new URL(supabaseUrl);
      if (!url.hostname || !url.protocol.startsWith('http')) {
        throw new Error('Invalid URL format');
      }
      console.log('✅ Supabase URL validated:', url.hostname);
    } catch (urlError) {
      console.error('❌ Invalid Supabase URL format:', supabaseUrl);
      return res.status(500).json({
        error: `Invalid Supabase URL format: ${supabaseUrl}. Please check your .env file.`,
        code: 'INVALID_URL'
      });
    }
    
    // Only return public configuration
    const config = {
      supabaseUrl: supabaseUrl,
      supabaseAnonKey: supabaseAnonKey,
      apiBaseUrl: process.env.API_BASE_URL || req.protocol + '://' + req.get('host')
    };

    res.json(config);
  } catch (error) {
    console.error('Config endpoint error:', error);
    res.status(500).json({
      error: 'Failed to load configuration',
      code: 'CONFIG_ERROR'
    });
  }
});

module.exports = router;

