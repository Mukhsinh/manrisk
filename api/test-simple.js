// Endpoint test paling sederhana untuk memastikan Vercel berfungsi
module.exports = (req, res) => {
  res.json({
    status: 'ok',
    message: 'Vercel serverless function is working',
    timestamp: new Date().toISOString(),
    path: req.url,
    method: req.method
  });
};
