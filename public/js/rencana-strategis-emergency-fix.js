/**
 * EMERGENCY FIX - RENCANA STRATEGIS
 * Perbaikan cepat untuk memastikan halaman dimuat
 */

(function() {
  'use strict';
  
  console.log('🚨 Emergency Fix untuk Rencana Strategis dimuat');
  
  // Tunggu DOM ready
  function waitForDOM() {
    return new Promise(resolve => {
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', resolve);
      } else {
        resolve();
      }
    });
  }
  
  // Fungsi utama untuk memuat halaman
  async function forceLoadPage() {
    await waitForDOM();
    
    // Cek apakah di halaman yang benar
    const page = document.getElementById('rencana-strategis');
    if (!page || !page.classList.contains('active')) {
      return;
    }
    
    const container = document.getElementById('rencana-strategis-content');
    if (!container) {
      console.error('❌ Container tidak ditemukan');
      return;
    }
    
    // Cek apakah sudah ada konten
    if (container.querySelector('.rencana-strategis-wrapper') || 
        container.querySelector('.rs-v7-wrapper')) {
      console.log('✅ Konten sudah ada');
      return;
    }
    
    console.log('🔄 Memuat konten...');
    
    // Tampilkan loading
    container.innerHTML = `
      <div class="text-center py-5">
        <div class="spinner-border text-primary mb-3" style="width: 3rem; height: 3rem;">
          <span class="visually-hidden">Loading...</span>
        </div>
        <p class="text-muted">Memuat Rencana Strategis...</p>
      </div>
    `;
    
    // Tunggu modul tersedia
    let attempts = 0;
    const maxAttempts = 20;
    
    const tryLoad = () => {
      attempts++;
      
      if (window.RencanaStrategisModule && typeof window.RencanaStrategisModule.load === 'function') {
        console.log('✅ Modul ditemukan, memuat...');
        window.RencanaStrategisModule.load().catch(err => {
          console.error('❌ Error:', err);
          container.innerHTML = `
            <div class="alert alert-danger m-4">
              <h5><i class="fas fa-exclamation-triangle me-2"></i>Error</h5>
              <p>${escapeHtml(err.message)}</p>
              <button onclick="location.reload()" class="btn btn-primary">
                <i class="fas fa-sync me-1"></i> Refresh Halaman
              </button>
            </div>
          `;
        });
        return true;
      }
      
      if (attempts >= maxAttempts) {
        console.error('❌ Modul tidak tersedia setelah ' + maxAttempts + ' percobaan');
        container.innerHTML = `
          <div class="alert alert-warning m-4">
            <h5><i class="fas fa-exclamation-triangle me-2"></i>Modul Tidak Tersedia</h5>
            <p>Modul Rencana Strategis tidak dapat dimuat. Silakan refresh halaman.</p>
            <button onclick="location.reload()" class="btn btn-primary">
              <i class="fas fa-sync me-1"></i> Refresh Halaman
            </button>
          </div>
        `;
        return true;
      }
      
      // Coba lagi
      setTimeout(tryLoad, 100);
      return false;
    };
    
    tryLoad();
  }
  
  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
  
  // Jalankan saat halaman dimuat
  forceLoadPage();
  
  // Export
  window.RencanaStrategisEmergencyFix = {
    forceLoadPage
  };
  
})();
