/**
 * PAGE LOAD OPTIMIZER
 * Mengoptimalkan loading halaman dan mengatasi masalah 503
 * Version: 1.0
 */

(function() {
  'use strict';
  
  console.log('⚡ Page Load Optimizer initializing...');
  
  // Cache untuk data yang sudah di-load
  const dataCache = new Map();
  const CACHE_DURATION = 5 * 60 * 1000; // 5 menit
  
  /**
   * Get cached data atau fetch baru
   */
  async function getCachedData(key, fetchFn) {
    const cached = dataCache.get(key);
    
    if (cached && (Date.now() - cached.timestamp < CACHE_DURATION)) {
      console.log(`📦 [Cache] Using cached data for: ${key}`);
      return cached.data;
    }
    
    console.log(`🔄 [Cache] Fetching fresh data for: ${key}`);
    try {
      const data = await fetchFn();
      dataCache.set(key, {
        data,
        timestamp: Date.now()
      });
      return data;
    } catch (error) {
      // Jika fetch gagal dan ada cache lama, gunakan cache lama
      if (cached) {
        console.warn(`⚠️ [Cache] Fetch failed, using stale cache for: ${key}`);
        return cached.data;
      }
      throw error;
    }
  }
  
  /**
   * Clear cache untuk key tertentu
   */
  function clearCache(key) {
    if (key) {
      dataCache.delete(key);
      console.log(`🗑️ [Cache] Cleared cache for: ${key}`);
    } else {
      dataCache.clear();
      console.log(`🗑️ [Cache] Cleared all cache`);
    }
  }
  
  /**
   * Preload critical resources
   */
  function preloadCriticalResources() {
    const criticalEndpoints = [
      '/api/auth/me',
      '/api/pengaturan'
    ];
    
    criticalEndpoints.forEach(endpoint => {
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = endpoint;
      document.head.appendChild(link);
    });
    
    console.log('🚀 [Preload] Critical resources preloaded');
  }
  
  /**
   * Lazy load non-critical scripts
   */
  function lazyLoadScripts() {
    // Daftar script yang bisa di-lazy load
    const lazyScripts = [
      '/js/chart.js',
      '/js/lucide.min.js'
    ];
    
    // Load setelah page load
    window.addEventListener('load', () => {
      setTimeout(() => {
        lazyScripts.forEach(src => {
          const script = document.createElement('script');
          script.src = src;
          script.async = true;
          document.body.appendChild(script);
        });
        console.log('📦 [Lazy] Non-critical scripts loaded');
      }, 1000);
    });
  }
  
  // Export functions
  window.PageLoadOptimizer = {
    getCachedData,
    clearCache,
    preloadCriticalResources,
    lazyLoadScripts
  };
  
  // Auto-initialize
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      preloadCriticalResources();
      lazyLoadScripts();
    });
  } else {
    preloadCriticalResources();
    lazyLoadScripts();
  }
  
  console.log('✅ Page Load Optimizer ready');
  
})();
