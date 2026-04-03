// Simple test endpoint untuk verifikasi environment variables
module.exports = (req, res) => {
  const envCheck = {
    timestamp: new Date().toISOString(),
    nodeEnv: process.env.NODE_ENV || 'not set',
    isVercel: process.env.VERCEL === '1',
    hasSupabaseUrl: !!process.env.SUPABASE_URL,
    hasSupabaseKey: !!process.env.SUPABASE_ANON_KEY,
    supabaseUrlLength: process.env.SUPABASE_URL?.length || 0,
    supabaseKeyLength: process.env.SUPABASE_ANON_KEY?.length || 0,
    allEnvKeys: Object.keys(process.env).filter(k => 
      k.includes('SUPABASE') || k.includes('NODE') || k.includes('VERCEL')
    )
  };
  
  console.log('🔍 [Test] Environment check:', envCheck);
  
  res.status(200).json({
    status: 'ok',
    message: 'Test endpoint working',
    environment: envCheck
  });
};
