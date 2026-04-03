/**
 * API ERROR HANDLER
 * Menangani error 503 dan retry logic - FIXED untuk mencegah infinite loop
 * Version: 1.1
 */

(function() {
  'use strict';
  
  console.log('🔧 API Error Handler loading...');
  
  // Simpan fetch asli
  const originalFetch = window.fetch;
  
  // Retry configuration - DIKURANGI untuk mencegah loop berlebihan
  const MAX_RETRIES = 2; // Dikurangi dari 3 ke 2
  const RETRY_DELAY = 2000; // Ditingkatkan dari 1000ms ke 2000ms
  const RETRY_CODES = [503, 504, 502]; // Hapus 500 karena biasanya permanent error
  
  // Track failed URLs untuk mencegah retry berlebihan
  const failedUrls = new Map();
  const MAX_TOTAL_FAILURES = 3;
  
  /**
   * Sleep function untuk delay
   */
  function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  /**
   * Enhanced fetch dengan retry logic yang lebih aman
   */
  async function enhancedFetch(url, options = {}, retryCount = 0) {
    try {
      // Cek apakah URL ini sudah terlalu banyak gagal
      const urlKey = typeof url === 'string' ? url : url.toString();
      const failCount = failedUrls.get(urlKey) || 0;
      
      if (failCount >= MAX_TOTAL_FAILURES) {
        console.warn(`⚠️ [API] URL ${urlKey} sudah gagal ${failCount}x, skip retry`);
        // Return response kosong untuk mencegah error
        return new Response(JSON.stringify({ error: 'Service unavailable' }), {
          status: 503,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      
      console.log(`📡 [API] Fetching: ${urlKey} (attempt ${retryCount + 1}/${MAX_RETRIES + 1})`);
      
      const response = await originalFetch(url, options);
      
      // Jika sukses, reset fail count
      if (response.ok) {
        console.log(`✅ [API] Success: ${urlKey}`);
        failedUrls.delete(urlKey);
        return response;
      }
      
      // Jika error yang bisa di-retry dan masih ada kesempatan
      if (RETRY_CODES.includes(response.status) && retryCount < MAX_RETRIES) {
        console.warn(`⚠️ [API] Error ${response.status} on ${urlKey}, retrying in ${RETRY_DELAY}ms...`);
        await sleep(RETRY_DELAY * (retryCount + 1)); // Exponential backoff
        return enhancedFetch(url, options, retryCount + 1);
      }
      
      // Jika error lain atau sudah max retry, track failure
      console.error(`❌ [API] Failed: ${urlKey} (${response.status})`);
      failedUrls.set(urlKey, failCount + 1);
      return response;
      
    } catch (error) {
      console.error(`❌ [API] Network error on ${url}:`, error.message);
      
      const urlKey = typeof url === 'string' ? url : url.toString();
      const failCount = failedUrls.get(urlKey) || 0;
      
      // Hanya retry jika belum terlalu banyak gagal
      if (retryCount < MAX_RETRIES && failCount < MAX_TOTAL_FAILURES) {
        console.warn(`⚠️ [API] Network error, retrying in ${RETRY_DELAY}ms...`);
        await sleep(RETRY_DELAY * (retryCount + 1));
        return enhancedFetch(url, options, retryCount + 1);
      }
      
      // Track failure
      failedUrls.set(urlKey, failCount + 1);
      throw error;
    }
  }
  
  // Override window.fetch
  window.fetch = enhancedFetch;
  
  console.log('✅ API Error Handler loaded with retry logic (v1.1 - safe mode)');
  
})();
