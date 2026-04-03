// Vercel Debug Helper - Untuk troubleshooting di production
(function() {
  'use strict';
  
  console.log('🔍 [Vercel Debug] Starting diagnostic...');
  
  // Test 1: Check if we can reach test endpoint
  async function testSimpleEndpoint() {
    try {
      console.log('🔍 [Vercel Debug] Testing /api/test-simple...');
      const response = await fetch('/api/test-simple');
      const data = await response.json();
      
      console.log('✅ [Vercel Debug] Test endpoint response:', data);
      
      if (!data.environment.hasSupabaseUrl || !data.environment.hasSupabaseKey) {
        console.error('❌ [Vercel Debug] CRITICAL: Environment variables not set!');
        console.error('❌ [Vercel Debug] Please set SUPABASE_URL and SUPABASE_ANON_KEY in Vercel Dashboard');
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('❌ [Vercel Debug] Test endpoint failed:', error);
      return false;
    }
  }
  
  // Test 2: Check config endpoint
  async function testConfigEndpoint() {
    try {
      console.log('🔍 [Vercel Debug] Testing /api/config...');
      const response = await fetch('/api/config');
      
      if (!response.ok) {
        console.error('❌ [Vercel Debug] Config endpoint returned:', response.status);
        const text = await response.text();
        console.error('❌ [Vercel Debug] Response:', text);
        return false;
      }
      
      const data = await response.json();
      console.log('✅ [Vercel Debug] Config endpoint response:', {
        hasUrl: !!data.supabaseUrl,
        hasKey: !!data.supabaseAnonKey,
        urlLength: data.supabaseUrl?.length,
        keyLength: data.supabaseAnonKey?.length
      });
      
      return true;
    } catch (error) {
      console.error('❌ [Vercel Debug] Config endpoint failed:', error);
      return false;
    }
  }
  
  // Test 3: Check Supabase library
  function testSupabaseLibrary() {
    console.log('🔍 [Vercel Debug] Checking Supabase library...');
    
    if (typeof window.supabase === 'undefined') {
      console.error('❌ [Vercel Debug] Supabase library not loaded!');
      return false;
    }
    
    console.log('✅ [Vercel Debug] Supabase library loaded');
    return true;
  }
  
  // Run all tests
  async function runDiagnostics() {
    console.log('🔍 [Vercel Debug] ========================================');
    console.log('🔍 [Vercel Debug] Starting Full Diagnostic');
    console.log('🔍 [Vercel Debug] ========================================');
    
    const results = {
      simpleEndpoint: await testSimpleEndpoint(),
      configEndpoint: await testConfigEndpoint(),
      supabaseLibrary: testSupabaseLibrary()
    };
    
    console.log('🔍 [Vercel Debug] ========================================');
    console.log('🔍 [Vercel Debug] Diagnostic Results:');
    console.log('🔍 [Vercel Debug] - Simple Endpoint:', results.simpleEndpoint ? '✅' : '❌');
    console.log('🔍 [Vercel Debug] - Config Endpoint:', results.configEndpoint ? '✅' : '❌');
    console.log('🔍 [Vercel Debug] - Supabase Library:', results.supabaseLibrary ? '✅' : '❌');
    console.log('🔍 [Vercel Debug] ========================================');
    
    const allPassed = Object.values(results).every(r => r === true);
    
    if (!allPassed) {
      console.error('❌ [Vercel Debug] DIAGNOSTIC FAILED!');
      console.error('❌ [Vercel Debug] Please check the errors above and follow VERCEL_DEPLOYMENT_FIX.md');
      
      // Show user-friendly error
      if (!results.simpleEndpoint || !results.configEndpoint) {
        showErrorMessage(
          'Konfigurasi Server Tidak Lengkap',
          'Environment variables belum di-set di Vercel. Silakan hubungi administrator untuk mengatur SUPABASE_URL dan SUPABASE_ANON_KEY.'
        );
      }
    } else {
      console.log('✅ [Vercel Debug] All diagnostics passed!');
    }
    
    return allPassed;
  }
  
  // Show error message to user
  function showErrorMessage(title, message) {
    // Only show if on login page or if auth is failing
    if (window.location.pathname === '/login' || window.location.pathname === '/') {
      const existingError = document.querySelector('.vercel-debug-error');
      if (existingError) return; // Don't show duplicate
      
      const errorDiv = document.createElement('div');
      errorDiv.className = 'vercel-debug-error';
      errorDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #fee;
        border: 2px solid #c00;
        border-radius: 8px;
        padding: 16px;
        max-width: 400px;
        z-index: 10000;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      `;
      
      errorDiv.innerHTML = `
        <div style="display: flex; align-items: start; gap: 12px;">
          <div style="color: #c00; font-size: 24px;">⚠️</div>
          <div style="flex: 1;">
            <div style="font-weight: bold; color: #c00; margin-bottom: 8px;">${title}</div>
            <div style="color: #666; font-size: 14px;">${message}</div>
            <button onclick="this.parentElement.parentElement.parentElement.remove()" 
                    style="margin-top: 12px; padding: 6px 12px; background: #c00; color: white; border: none; border-radius: 4px; cursor: pointer;">
              Tutup
            </button>
          </div>
        </div>
      `;
      
      document.body.appendChild(errorDiv);
    }
  }
  
  // Auto-run on page load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', runDiagnostics);
  } else {
    runDiagnostics();
  }
  
  // Export for manual testing
  window.vercelDebug = {
    runDiagnostics,
    testSimpleEndpoint,
    testConfigEndpoint,
    testSupabaseLibrary
  };
  
  console.log('💡 [Vercel Debug] Manual test available: window.vercelDebug.runDiagnostics()');
})();
