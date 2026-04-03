/**
 * Safe Puppeteer Loader
 * Mencegah error saat puppeteer tidak tersedia di Vercel
 */

let puppeteer = null;

function getPuppeteer() {
  if (process.env.VERCEL === '1' || process.env.DISABLE_PUPPETEER === 'true') {
    console.log('ℹ️ Puppeteer disabled in serverless environment');
    return null;
  }
  
  if (!puppeteer) {
    try {
      puppeteer = require('puppeteer');
      console.log('✅ Puppeteer loaded successfully');
    } catch (error) {
      console.warn('⚠️ Puppeteer not available:', error.message);
      puppeteer = null;
    }
  }
  
  return puppeteer;
}

function isPuppeteerAvailable() {
  return getPuppeteer() !== null;
}

module.exports = {
  getPuppeteer,
  isPuppeteerAvailable
};
