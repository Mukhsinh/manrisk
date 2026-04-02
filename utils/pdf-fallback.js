// PDF Generation Fallback untuk Serverless Environment
const { isPuppeteerAvailable } = require('./puppeteer-config');

/**
 * Cek apakah PDF generation tersedia
 */
async function isPdfGenerationAvailable() {
  // Di Vercel, puppeteer tidak tersedia
  if (process.env.VERCEL === '1') {
    return false;
  }
  
  return await isPuppeteerAvailable();
}

/**
 * Response fallback jika PDF tidak tersedia
 */
function sendPdfNotAvailableResponse(res, format = 'pdf') {
  return res.status(503).json({
    error: `${format.toUpperCase()} generation tidak tersedia di serverless environment`,
    message: 'Silakan gunakan format Excel sebagai alternatif',
    alternatives: ['excel', 'json'],
    suggestion: 'Ganti parameter ?format=pdf menjadi ?format=excel'
  });
}

module.exports = {
  isPdfGenerationAvailable,
  sendPdfNotAvailableResponse
};
