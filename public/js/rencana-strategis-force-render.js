/**
 * RENCANA STRATEGIS FORCE RENDER
 * Memastikan halaman selalu ter-render dengan benar
 * 
 * Masalah: Halaman hanya menampilkan header tanpa konten
 * Solusi: Force render dengan retry mechanism
 */

(function() {
  'use strict';
  
  console.log('🔧 RS Force Render loaded');
  
  // Check if we're on rencana-strategis page
  function isOnRSPage() {
    const path = window.location.pathname;
    const hash = window.location.hash;
    const activePage = document.querySelector('#rencana-strategis.active');
    return path === '/rencana-strategis' || 
           path.includes('/rencana-strategis') ||
           hash === '#rencana-strategis' ||
           activePage !== null;
  }
  
  // Force render function
  function forceRender() {
    if (!isOnRSPage()) return;
    
    const container = document.getElementById('rencana-strategis-content');
    if (!container) {
      console.warn('⚠️ Container not found');
      return;
    }
    
    // Check if content is already rendered
    const hasContent = container.querySelector('.rs-v7-wrapper') || 
                      container.querySelector('.rencana-strategis-wrapper') ||
                      container.querySelector('table');
    
    if (hasContent) {
      console.log('✅ Content already rendered');
      return;
    }
    
    // Check if loading spinner is shown
    const hasSpinner = container.querySelector('.spinner-border');
    if (hasSpinner) {
      console.log('⏳ Loading in progress...');
      return;
    }
    
    // Content is missing - force load
    console.warn('⚠️ Content missing, forcing load...');
    
    if (window.RencanaStrategisModule?.load) {
      window.RencanaStrategisModule.load();
    } else if (window.RencanaStrategisUnified?.load) {
      window.RencanaStrategisUnified.load();
    } else if (window.RSCore?.load) {
      window.RSCore.load();
    } else {
      console.error('❌ No RS module found');
    }
  }
  
  // Setup observer to detect when page becomes active
  function setupPageObserver() {
    const rsPage = document.getElementById('rencana-strategis');
    if (!rsPage) return;
    
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
          if (rsPage.classList.contains('active')) {
            console.log('📄 RS page became active');
            setTimeout(forceRender, 100);
          }
        }
      });
    });
    
    observer.observe(rsPage, { attributes: true });
    
    // Initial check
    if (rsPage.classList.contains('active')) {
      setTimeout(forceRender, 100);
    }
  }
  
  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(setupPageObserver, 500);
    });
  } else {
    setTimeout(setupPageObserver, 500);
  }
  
  // Also check periodically for first 10 seconds after page load
  let checkCount = 0;
  const checkInterval = setInterval(() => {
    checkCount++;
    forceRender();
    
    if (checkCount >= 20) { // 20 checks * 500ms = 10 seconds
      clearInterval(checkInterval);
      console.log('🛑 Force render checks completed');
    }
  }, 500);
  
  // Export for manual trigger
  window.forceRenderRencanaStrategis = forceRender;
  
})();
