/**
 * RESILIENT PAGE LOADER
 * Memastikan halaman tetap bisa dimuat meskipun ada error
 * Version: 1.0
 */

(function() {
  'use strict';
  
  console.log('💪 Resilient Page Loader initializing...');
  
  // Track module loading status
  const moduleStatus = new Map();
  
  /**
   * Load module dengan error handling
   */
  async function loadModuleSafely(moduleName, loadFunction) {
    try {
      console.log(`📦 Loading module: ${moduleName}`);
      await loadFunction();
      moduleStatus.set(moduleName, 'loaded');
      console.log(`✅ Module loaded: ${moduleName}`);
      return true;
    } catch (error) {
      console.error(`❌ Failed to load module ${moduleName}:`, error);
      moduleStatus.set(moduleName, 'failed');
      return false;
    }
  }
  
  /**
   * Ensure page content is visible
   */
  function ensurePageVisible() {
    // Pastikan app screen visible
    const appScreen = document.getElementById('app-screen');
    if (appScreen) {
      appScreen.style.display = 'block';
      appScreen.style.visibility = 'visible';
      appScreen.style.opacity = '1';
    }
    
    // Pastikan loading screen hidden
    const loginScreen = document.getElementById('login-screen');
    if (loginScreen && window.currentUser) {
      loginScreen.style.display = 'none';
    }
    
    // Pastikan current page visible
    const activePage = document.querySelector('.page-content.active');
    if (activePage) {
      activePage.style.display = 'block';
      activePage.style.visibility = 'visible';
      activePage.style.opacity = '1';
    }
  }
  
  /**
   * Load page data dengan fallback
   */
  async function loadPageDataSafely(pageName) {
    console.log(`📄 Loading page data: ${pageName}`);
    
    // Cek apakah module untuk page ini ada
    const moduleMap = {
      'dashboard': 'DashboardModule',
      'rencana-strategis': 'RencanaStrategisModule',
      'analisis-swot': 'AnalisisSWOTModule',
      'risk-profile': 'RiskProfileModule',
      'monitoring-evaluasi': 'MonitoringEvaluasiModule',
      'evaluasi-iku': 'EvaluasiIKUV3'
    };
    
    const moduleName = moduleMap[pageName];
    if (!moduleName) {
      console.log(`ℹ️ No specific module for page: ${pageName}`);
      return;
    }
    
    const module = window[moduleName];
    if (!module || !module.load) {
      console.warn(`⚠️ Module not found or no load function: ${moduleName}`);
      return;
    }
    
    try {
      await module.load();
      console.log(`✅ Page data loaded: ${pageName}`);
    } catch (error) {
      console.error(`❌ Failed to load page data for ${pageName}:`, error);
      
      // Show fallback content
      showFallbackContent(pageName);
    }
  }
  
  /**
   * Show fallback content jika loading gagal
   */
  function showFallbackContent(pageName) {
    const pageContent = document.getElementById(`${pageName}-content`);
    if (!pageContent) return;
    
    pageContent.innerHTML = `
      <div style="padding: 40px; text-align: center;">
        <div style="max-width: 500px; margin: 0 auto;">
          <div style="width: 80px; height: 80px; margin: 0 auto 20px; background: linear-gradient(135deg, #667eea, #764ba2); border-radius: 50%; display: flex; align-items: center; justify-content: center;">
            <i class="fas fa-exclamation-triangle" style="color: white; font-size: 32px;"></i>
          </div>
          <h3 style="color: #1f2937; margin-bottom: 12px;">Data Tidak Tersedia</h3>
          <p style="color: #6b7280; margin-bottom: 24px;">
            Maaf, data untuk halaman ini sedang tidak dapat dimuat. 
            Silakan coba refresh halaman atau hubungi administrator jika masalah berlanjut.
          </p>
          <button onclick="window.location.reload()" class="btn btn-primary">
            <i class="fas fa-sync-alt me-2"></i>Refresh Halaman
          </button>
        </div>
      </div>
    `;
  }
  
  /**
   * Monitor page changes
   */
  function monitorPageChanges() {
    // Listen untuk page navigation
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
          const target = mutation.target;
          if (target.classList.contains('page-content') && target.classList.contains('active')) {
            const pageName = target.id;
            console.log(`📄 Page changed to: ${pageName}`);
            
            // Ensure page visible
            ensurePageVisible();
            
            // Load page data
            setTimeout(() => {
              loadPageDataSafely(pageName);
            }, 100);
          }
        }
      });
    });
    
    // Observe all page-content elements
    document.querySelectorAll('.page-content').forEach(page => {
      observer.observe(page, {
        attributes: true,
        attributeFilter: ['class']
      });
    });
  }
  
  /**
   * Initialize
   */
  function init() {
    console.log('💪 Initializing Resilient Page Loader...');
    
    // Ensure page visible on load
    ensurePageVisible();
    
    // Monitor page changes
    monitorPageChanges();
    
    // Check current active page
    const activePage = document.querySelector('.page-content.active');
    if (activePage) {
      const pageName = activePage.id;
      loadPageDataSafely(pageName);
    }
    
    console.log('✅ Resilient Page Loader ready');
  }
  
  // Auto-init when DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
  
  // Export
  window.ResilientPageLoader = {
    loadModuleSafely,
    loadPageDataSafely,
    ensurePageVisible,
    getModuleStatus: () => Array.from(moduleStatus.entries())
  };
  
})();
