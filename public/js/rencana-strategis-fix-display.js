/**
 * RENCANA STRATEGIS - PERBAIKAN TAMPILAN
 * Memastikan halaman dimuat dengan sempurna
 */

(function() {
  'use strict';
  
  console.log('🔧 Rencana Strategis Display Fix loaded');
  
  /**
   * Fungsi untuk memastikan modul dimuat dengan benar
   */
  function ensureModuleLoaded() {
    const container = document.getElementById('rencana-strategis-content');
    const page = document.getElementById('rencana-strategis');
    
    // Pastikan halaman aktif
    if (!page || !page.classList.contains('active')) {
      console.log('⏭️ Halaman tidak aktif, skip loading');
      return;
    }
    
    if (!container) {
      console.error('❌ Container rencana-strategis-content tidak ditemukan!');
      return;
    }
    
    // Cek apakah konten sudah dimuat
    const hasContent = container.querySelector('.rencana-strategis-wrapper');
    if (hasContent) {
      console.log('✅ Konten sudah dimuat');
      return;
    }
    
    // Tampilkan loading
    container.innerHTML = `
      <div class="text-center py-5">
        <div class="spinner-border text-primary mb-3" role="status" style="width: 3rem; height: 3rem;">
          <span class="visually-hidden">Loading...</span>
        </div>
        <p class="text-muted">Memuat data rencana strategis...</p>
      </div>
    `;
    
    // Coba muat modul
    console.log('🔄 Mencoba memuat modul...');
    
    // Tunggu sebentar untuk memastikan semua script dimuat
    setTimeout(() => {
      if (window.RencanaStrategisModule && typeof window.RencanaStrategisModule.load === 'function') {
        console.log('✅ Memanggil RencanaStrategisModule.load()');
        window.RencanaStrategisModule.load().catch(err => {
          console.error('❌ Error loading module:', err);
          showError(container, err.message);
        });
      } else if (window.loadRencanaStrategis && typeof window.loadRencanaStrategis === 'function') {
        console.log('✅ Memanggil loadRencanaStrategis()');
        window.loadRencanaStrategis().catch(err => {
          console.error('❌ Error loading module:', err);
          showError(container, err.message);
        });
      } else {
        console.error('❌ Modul tidak ditemukan!');
        showError(container, 'Modul Rencana Strategis tidak tersedia. Silakan refresh halaman.');
      }
    }, 100);
  }
  
  /**
   * Tampilkan error
   */
  function showError(container, message) {
    container.innerHTML = `
      <div class="alert alert-danger m-4">
        <h5><i class="fas fa-exclamation-triangle me-2"></i>Error</h5>
        <p class="mb-3">${escapeHtml(message)}</p>
        <button onclick="location.reload()" class="btn btn-primary">
          <i class="fas fa-sync me-1"></i> Refresh Halaman
        </button>
      </div>
    `;
  }
  
  /**
   * Escape HTML
   */
  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
  
  /**
   * Observer untuk mendeteksi perubahan halaman
   */
  function setupPageObserver() {
    const page = document.getElementById('rencana-strategis');
    if (!page) return;
    
    // Observer untuk class changes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
          if (page.classList.contains('active')) {
            console.log('📄 Halaman Rencana Strategis aktif');
            setTimeout(ensureModuleLoaded, 100);
          }
        }
      });
    });
    
    observer.observe(page, {
      attributes: true,
      attributeFilter: ['class']
    });
    
    // Cek langsung jika sudah aktif
    if (page.classList.contains('active')) {
      console.log('📄 Halaman Rencana Strategis sudah aktif');
      setTimeout(ensureModuleLoaded, 100);
    }
  }
  
  /**
   * Inisialisasi
   */
  function init() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        setupPageObserver();
      });
    } else {
      setupPageObserver();
    }
  }
  
  // Jalankan inisialisasi
  init();
  
  // Export untuk debugging
  window.RencanaStrategisDisplayFix = {
    ensureModuleLoaded,
    setupPageObserver
  };
  
})();
