// Test endpoint untuk verifikasi environment variables di Vercel
module.exports = (req, res) => {
  console.log('🔍 [Test-Env] Checking environment variables...');
  
  const envCheck = {
    hasSupabaseUrl: !!process.env.SUPABASE_URL,
    hasSupabaseKey: !!process.env.SUPABASE_ANON_KEY,
    nodeEnv: process.env.NODE_ENV,
    isVercel: !!process.env.VERCEL,
    vercelEnv: process.env.VERCEL_ENV,
    availableEnvVars: Object.keys(process.env).filter(k => 
      k.includes('SUPABASE') || k.includes('VERCEL') || k.includes('NODE')
    )
  };
  
  console.log('🔍 [Test-Env] Environment check:', envCheck);
  
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: envCheck,
    message: envCheck.hasSupabaseUrl && envCheck.hasSupabaseKey 
      ? 'Environment variables configured correctly' 
      : 'Missing required environment variables'
  });
};
