/**
 * RENCANA STRATEGIS - ACTION BUTTONS FIX
 * Perbaikan untuk tombol aksi yang tidak berfungsi
 * Updated: 2026-04-02
 */

(function() {
  'use strict';
  
  console.log('🔧 Loading Rencana Strategis Action Buttons Fix...');
  
  // Inject CSS jika belum ada
  function injectCSS() {
    const cssId = 'rs-action-buttons-fix-css';
    if (!document.getElementById(cssId)) {
      const link = document.createElement('link');
      link.id = cssId;
      link.rel = 'stylesheet';
      link.href = '/css/rencana-strategis-action-buttons-fix.css';
      document.head.appendChild(link);
      console.log('✅ CSS injected for action buttons');
    }
  }
  
  // Pastikan event delegation berfungsi
  function setupEventDelegation() {
    const container = document.getElementById('rencana-strategis-content');
    if (!container) {
      console.warn('⚠️ Container not found, retrying...');
      setTimeout(setupEventDelegation, 500);
      return;
    }
    
    // Add event delegation untuk action buttons di tabel
    container.addEventListener('click', function(e) {
      const btn = e.target.closest('.btn-action-view, .btn-action-edit, .btn-action-delete');
      
      if (!btn) return;
      
      e.preventDefault();
      e.stopPropagation();
      
      const action = btn.getAttribute('data-action');
      const id = btn.getAttribute('data-id');
      
      if (!id) {
        console.error('❌ No ID found for button');
        return;
      }
      
      console.log('🔘 Button clicked:', action, 'ID:', id);
      
      // Tambahkan loading state
      btn.classList.add('loading');
      btn.disabled = true;
      
      // Panggil fungsi dari module
      const module = window.RencanaStrategisModule || window.RSCore;
      if (module) {
        switch(action) {
          case 'view':
            if (typeof module.viewDetail === 'function') {
              module.viewDetail(id);
            }
            break;
          case 'edit':
            if (typeof module.edit === 'function') {
              module.edit(id);
            }
            break;
          case 'delete':
            if (typeof module.delete === 'function') {
              module.delete(id);
            }
            break;
        }
      }
      
      // Remove loading state setelah 1 detik
      setTimeout(() => {
        btn.classList.remove('loading');
        btn.disabled = false;
      }, 1000);
    });
    
    console.log('✅ Event delegation setup complete');
  }
  
  // Setup tombol di header - TIDAK menambahkan listener baru
  // Hanya verifikasi bahwa tombol ada
  function setupHeaderButtons() {
    const refreshBtn = document.getElementById('rs-refresh-btn');
    const exportBtn = document.getElementById('rs-export-btn');
    
    if (refreshBtn) {
      console.log('✅ Refresh button ditemukan');
    } else {
      console.warn('⚠️ Refresh button tidak ditemukan');
    }
    
    if (exportBtn) {
      console.log('✅ Export button ditemukan');
    } else {
      console.warn('⚠️ Export button tidak ditemukan');
    }
  }
  
  // Observer untuk mendeteksi perubahan DOM
  function setupMutationObserver() {
    const container = document.getElementById('rencana-strategis-content');
    if (!container) return;
    
    const observer = new MutationObserver(function(mutations) {
      mutations.forEach(function(mutation) {
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
          // Re-setup buttons setelah DOM berubah
          setTimeout(() => {
            setupHeaderButtons();
          }, 100);
        }
      });
    });
    
    observer.observe(container, {
      childList: true,
      subtree: true
    });
    
    console.log('✅ Mutation observer setup');
  }
  
  // Initialize
  function init() {
    console.log('🚀 Initializing Action Buttons Fix...');
    
    injectCSS();
    
    // Wait for DOM ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', function() {
        setTimeout(() => {
          setupEventDelegation();
          setupHeaderButtons();
          setupMutationObserver();
        }, 500);
      });
    } else {
      setTimeout(() => {
        setupEventDelegation();
        setupHeaderButtons();
        setupMutationObserver();
      }, 500);
    }
  }
  
  // Auto-init
  init();
  
  // Export untuk debugging
  window.RencanaStrategisActionButtonsFix = {
    reinit: init,
    setupEventDelegation: setupEventDelegation,
    setupHeaderButtons: setupHeaderButtons
  };
  
  console.log('✅ Rencana Strategis Action Buttons Fix loaded');
})();
