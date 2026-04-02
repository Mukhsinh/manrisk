/**
 * RENCANA STRATEGIS DISPLAY FIX v1.0
 * 
 * Memperbaiki masalah tampilan halaman yang tidak muncul
 * 
 * MASALAH:
 * - Halaman hanya menampilkan header tapi konten kosong
 * - Modul tidak ter-load atau tidak ter-trigger dengan benar
 * 
 * SOLUSI:
 * - Force load modul saat halaman aktif
 * - Pastikan container terisi dengan konten
 * - Retry mechanism jika gagal
 */

(function() {
  'use strict';
  
  console.log('[RS Display Fix] Initializing...');
  
  // Fungsi untuk memaksa load modul
  function forceLoadRSModule() {
    const container = document.getElementById('rencana-strategis-content');
    const page = document.getElementById('rencana-strategis');
    
    // Cek apakah halaman aktif
    if (!page || !page.classList.contains('active')) {
      console.log('[RS Display Fix] Page not active, skipping');
      return false;
    }
    
    if (!container) {
      console.error('[RS Display Fix] Container not found!');
      return false;
    }
    
    // Cek apakah konten sudah ada
    const hasContent = container.querySelector('.rencana-strategis-wrapper') || 
                      container.querySelector('.rs-v7-wrapper') ||
                      container.querySelector('table');
    
    if (hasContent) {
      console.log('[RS Display Fix] Content already loaded');
      return true;
    }
    
    console.log('[RS Display Fix] No content found, forcing load...');
    
    // Coba load modul dengan berbagai alias
    if (window.RencanaStrategisModule?.load) {
      console.log('[RS Display Fix] Loading via RencanaStrategisModule');
      window.RencanaStrategisModule.load();
      return true;
    }
    
    if (window.RencanaStrategisUnified?.load) {
      console.log('[RS Display Fix] Loading via RencanaStrategisUnified');
      window.RencanaStrategisUnified.load();
      return true;
    }
    
    if (window.RSCore?.load) {
      console.log('[RS Display Fix] Loading via RSCore');
      window.RSCore.load();
      return true;
    }
    
    console.error('[RS Display Fix] No module found to load!');
    
    // Tampilkan pesan error di container
    container.innerHTML = `
      <div class="alert alert-warning m-4" role="alert">
        <i class="fas fa-exclamation-triangle me-2"></i>
        <strong>Modul belum dimuat.</strong> Silakan refresh halaman atau hubungi administrator.
        <button class="btn btn-sm btn-primary ms-3" onclick="location.reload()">
          <i class="fas fa-sync-alt me-1"></i>Refresh Halaman
        </button>
      </div>
    `;
    
    return false;
  }
  
  // Coba load saat script ini dijalankan
  setTimeout(() => {
    forceLoadRSModule();
  }, 500);
  
  // Monitor perubahan halaman
  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
        const page = document.getElementById('rencana-strategis');
        if (page && page.classList.contains('active')) {
          console.log('[RS Display Fix] Page became active, checking content...');
          setTimeout(() => {
            forceLoadRSModule();
          }, 300);
        }
      }
    }
  });
  
  // Observe page activation
  const page = document.getElementById('rencana-strategis');
  if (page) {
    observer.observe(page, { attributes: true, attributeFilter: ['class'] });
  }
  
  // Cleanup saat halaman tidak aktif
  window.addEventListener('beforeunload', () => {
    observer.disconnect();
  });
  
  console.log('[RS Display Fix] Initialized successfully');
  
})();
