// Simple test endpoint untuk debugging Vercel
module.exports = (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'Vercel serverless function is working',
    timestamp: new Date().toISOString(),
    env: {
      NODE_ENV: process.env.NODE_ENV,
      VERCEL: process.env.VERCEL,
      hasSupabaseUrl: !!process.env.SUPABASE_URL,
      hasSupabaseKey: !!process.env.SUPABASE_ANON_KEY
    }
  });
};
