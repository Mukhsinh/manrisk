// Puppeteer configuration for serverless environments
const isVercel = process.env.VERCEL === '1';
const isProduction = process.env.NODE_ENV === 'production';

/**
 * Get Puppeteer launch configuration based on environment
 */
function getPuppeteerConfig() {
  const baseConfig = {
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--disable-software-rasterizer',
      '--disable-extensions',
      '--disable-background-networking',
      '--disable-default-apps',
      '--disable-sync',
      '--disable-translate',
      '--hide-scrollbars',
      '--metrics-recording-only',
      '--mute-audio',
      '--no-first-run',
      '--safebrowsing-disable-auto-update',
      '--single-process'
    ]
  };

  // Vercel-specific configuration
  if (isVercel) {
    return {
      ...baseConfig,
      executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || '/usr/bin/chromium-browser'
    };
  }

  return baseConfig;
}

/**
 * Check if Puppeteer is available in current environment
 */
async function isPuppeteerAvailable() {
  // Di Vercel atau jika explicitly disabled, return false tanpa mencoba load puppeteer
  if (isVercel || process.env.DISABLE_PUPPETEER === 'true') {
    return false;
  }
  
  try {
    const puppeteer = require('puppeteer');
    
    // Try to launch browser to verify it works
    const browser = await puppeteer.launch(getPuppeteerConfig());
    await browser.close();
    
    return true;
  } catch (error) {
    console.error('Puppeteer not available:', error.message);
    return false;
  }
}

/**
 * Safe wrapper for Puppeteer operations
 */
async function withPuppeteer(callback) {
  // Check if puppeteer is disabled
  if (isVercel || process.env.DISABLE_PUPPETEER === 'true') {
    throw new Error('Puppeteer tidak tersedia di serverless environment');
  }
  
  let browser = null;
  
  try {
    const puppeteer = require('puppeteer');
    const config = getPuppeteerConfig();
    
    browser = await puppeteer.launch(config);
    const result = await callback(browser);
    
    return result;
  } catch (error) {
    console.error('Puppeteer operation failed:', error);
    throw error;
  } finally {
    if (browser) {
      try {
        await browser.close();
      } catch (closeError) {
        console.error('Error closing browser:', closeError);
      }
    }
  }
}

module.exports = {
  getPuppeteerConfig,
  isPuppeteerAvailable,
  withPuppeteer,
  isVercel
};
