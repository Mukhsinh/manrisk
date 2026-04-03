/**
 * API ERROR HANDLER
 * Menangani error 503 dan retry logic
 * Version: 1.0
 */

(function() {
  'use strict';
  
  console.log('🔧 API Error Handler loading...');
  
  // Simpan fetch asli
  const originalFetch = window.fetch;
  
  // Retry configuration
  const MAX_RETRIES = 3;
  const RETRY_DELAY = 1000; // 1 detik
  const RETRY_CODES = [503, 504, 502, 500];
  
  /**
   * Sleep function untuk delay
   */
  function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  /**
   * Enhanced fetch dengan retry logic
   */
  async function enhancedFetch(url, options = {}, retryCount = 0) {
    try {
      console.log(`📡 [API] Fetching: ${url} (attempt ${retryCount + 1}/${MAX_RETRIES + 1})`);
      
      const response = await originalFetch(url, options);
      
      // Jika sukses, return response
      if (response.ok) {
        console.log(`✅ [API] Success: ${url}`);
        return response;
      }
      
      // Jika error yang bisa di-retry dan masih ada kesempatan
      if (RETRY_CODES.includes(response.status) && retryCount < MAX_RETRIES) {
        console.warn(`⚠️ [API] Error ${response.status} on ${url}, retrying in ${RETRY_DELAY}ms...`);
        await sleep(RETRY_DELAY * (retryCount + 1)); // Exponential backoff
        return enhancedFetch(url, options, retryCount + 1);
      }
      
      // Jika error lain atau sudah max retry
      console.error(`❌ [API] Failed: ${url} (${response.status})`);
      return response;
      
    } catch (error) {
      console.error(`❌ [API] Network error on ${url}:`, error.message);
      
      // Retry untuk network error
      if (retryCount < MAX_RETRIES) {
        console.warn(`⚠️ [API] Network error, retrying in ${RETRY_DELAY}ms...`);
        await sleep(RETRY_DELAY * (retryCount + 1));
        return enhancedFetch(url, options, retryCount + 1);
      }
      
      throw error;
    }
  }
  
  // Override window.fetch
  window.fetch = enhancedFetch;
  
  console.log('✅ API Error Handler loaded with retry logic');
  
})();
