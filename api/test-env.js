// Simple test endpoint untuk verifikasi environment variables
module.exports = (req, res) => {
  const envCheck = {
    supabaseUrl: !!process.env.SUPABASE_URL,
    supabaseAnonKey: !!process.env.SUPABASE_ANON_KEY,
    supabaseServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    nodeEnv: process.env.NODE_ENV || 'development',
    isVercel: process.env.VERCEL === '1',
    disablePuppeteer: process.env.DISABLE_PUPPETEER === 'true'
  };
  
  const allGood = envCheck.supabaseUrl && envCheck.supabaseAnonKey;
  
  res.status(allGood ? 200 : 500).json({
    status: allGood ? 'ok' : 'error',
    message: allGood ? 'Environment variables configured correctly' : 'Missing required environment variables',
    timestamp: new Date().toISOString(),
    environment: envCheck.nodeEnv,
    platform: envCheck.isVercel ? 'vercel' : 'local',
    checks: envCheck,
    missing: [
      !envCheck.supabaseUrl && 'SUPABASE_URL',
      !envCheck.supabaseAnonKey && 'SUPABASE_ANON_KEY'
    ].filter(Boolean)
  });
};
