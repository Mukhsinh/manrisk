/**
 * Risk Input Form Toggle Enhancement
 * Memastikan form analisis hanya tampil setelah data risiko disimpan
 */

(function() {
  'use strict';
  
  // Fungsi untuk menyembunyikan section analisis
  function hideAnalysisSections() {
    console.log('[Form Toggle] Menyembunyikan section analisis...');
    
    // Cari section berdasarkan heading
    const allSections = document.querySelectorAll('.form-section');
    
    allSections.forEach(section => {
      const heading = section.querySelector('h4');
      if (heading) {
        const headingText = heading.textContent.trim();
        
        // Sembunyikan section Analisis Inherent dan Residual
        if (headingText.includes('Analisis Risiko Inherent') || 
            headingText.includes('Analisis Risiko Residual')) {
          section.style.display = 'none';
          section.setAttribute('data-analysis-section', 'true');
          console.log('[Form Toggle] Menyembunyikan:', headingText);
        }
      }
    });
  }
  
  // Fungsi untuk menampilkan section analisis
  function showAnalysisSections() {
    console.log('[Form Toggle] Menampilkan section analisis...');
    
    const analysisSections = document.querySelectorAll('[data-analysis-section="true"]');
    
    analysisSections.forEach(section => {
      section.style.display = 'block';
      const heading = section.querySelector('h4');
      if (heading) {
        console.log('[Form Toggle] Menampilkan:', heading.textContent.trim());
      }
    });
  }
  
  // Override fungsi di RiskInputModule jika ada
  if (window.RiskInputModule) {
    console.log('[Form Toggle] Mengintegrasikan dengan RiskInputModule...');
    
    // Simpan referensi fungsi asli
    const originalShowForm = window.RiskInputModule.showFormSection;
    const originalHideForm = window.RiskInputModule.hideFormSection;
    
    // Override showFormSection
    if (originalShowForm) {
      window.RiskInputModule.showFormSection = function() {
        originalShowForm.call(this);
        
        // Cek apakah sedang mode edit atau tambah baru
        const currentId = window.RiskInputModule.getCurrentId ? 
                         window.RiskInputModule.getCurrentId() : null;
        
        if (!currentId) {
          // Mode tambah baru - sembunyikan analisis
          hideAnalysisSections();
        } else {
          // Mode edit - tampilkan analisis
          showAnalysisSections();
        }
      };
    }
    
    // Override hideFormSection
    if (originalHideForm) {
      window.RiskInputModule.hideFormSection = function() {
        originalHideForm.call(this);
        // Reset visibility saat form ditutup
        hideAnalysisSections();
      };
    }
  }
  
  // Inisialisasi saat DOM ready
  document.addEventListener('DOMContentLoaded', function() {
    console.log('[Form Toggle] Inisialisasi form toggle...');
    
    // Sembunyikan section analisis saat halaman dimuat
    setTimeout(() => {
      hideAnalysisSections();
    }, 100);
    
    // Monitor tombol "Tambah Risiko"
    const btnTambahRisiko = document.getElementById('btn-tambah-risiko');
    if (btnTambahRisiko) {
      btnTambahRisiko.addEventListener('click', function() {
        console.log('[Form Toggle] Tombol Tambah Risiko diklik');
        setTimeout(() => {
          hideAnalysisSections();
        }, 50);
      });
    }
    
    // Monitor form submit
    const riskForm = document.getElementById('risk-input-form');
    if (riskForm) {
      riskForm.addEventListener('submit', function(e) {
        console.log('[Form Toggle] Form submitted');
        
        // Setelah submit berhasil, tampilkan section analisis
        // (ini akan ditangani oleh handler submit di risk-input.js)
      });
    }
    
    // Monitor tombol reset
    const resetBtn = document.getElementById('reset-form-btn');
    if (resetBtn) {
      resetBtn.addEventListener('click', function() {
        console.log('[Form Toggle] Form direset');
        setTimeout(() => {
          hideAnalysisSections();
        }, 50);
      });
    }
  });
  
  // Export fungsi untuk digunakan oleh modul lain
  window.RiskFormToggle = {
    hideAnalysisSections: hideAnalysisSections,
    showAnalysisSections: showAnalysisSections
  };
  
  console.log('[Form Toggle] Module loaded');
})();
