// Simple health check endpoint
module.exports = (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: 'production',
    platform: 'vercel'
  });
};
