/**
 * RENCANA STRATEGIS - ACTION BUTTONS FIX
 * Perbaikan untuk tombol aksi yang tidak berfungsi
 * Updated: 2026-03-31
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
    
    // Remove existing listeners
    const oldContainer = container.cloneNode(false);
    container.parentNode.replaceChild(oldContainer, container);
    
    // Add new listener with event delegation
    oldContainer.addEventListener('click', function(e) {
      // Cari tombol yang diklik (bisa icon atau button)
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
      if (window.RencanaStrategisModule) {
        switch(action) {
          case 'view':
            if (typeof window.RencanaStrategisModule.viewDetail === 'function') {
              window.RencanaStrategisModule.viewDetail(id);
            }
            break;
          case 'edit':
            if (typeof window.RencanaStrategisModule.startEdit === 'function') {
              window.RencanaStrategisModule.startEdit(id);
            }
            break;
          case 'delete':
            if (typeof window.RencanaStrategisModule.deleteRencana === 'function') {
              window.RencanaStrategisModule.deleteRencana(id);
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
  
  // Setup tombol di header
  function setupHeaderButtons() {
    const refreshBtn = document.getElementById('rs-refresh-btn');
    const exportBtn = document.getElementById('rs-export-btn');
    
    if (refreshBtn) {
      refreshBtn.addEventListener('click', function(e) {
        e.preventDefault();
        console.log('🔄 Refresh button clicked');
        if (window.RencanaStrategisModule && typeof window.RencanaStrategisModule.refreshData === 'function') {
          window.RencanaStrategisModule.refreshData();
        }
      });
    }
    
    if (exportBtn) {
      exportBtn.addEventListener('click', function(e) {
        e.preventDefault();
        console.log('📥 Export button clicked');
        if (window.RencanaStrategisModule && typeof window.RencanaStrategisModule.exportData === 'function') {
          window.RencanaStrategisModule.exportData();
        }
      });
    }
  }
  
  // Setup tombol di form
  function setupFormButtons() {
    const toggleBtn = document.getElementById('rs-toggle-form');
    const resetBtn = document.getElementById('rs-reset-btn');
    const cancelBtn = document.getElementById('rs-cancel-edit');
    
    if (toggleBtn) {
      toggleBtn.addEventListener('click', function(e) {
        e.preventDefault();
        console.log('🔽 Toggle form clicked');
        if (window.RencanaStrategisModule && typeof window.RencanaStrategisModule.toggleForm === 'function') {
          window.RencanaStrategisModule.toggleForm();
        }
      });
    }
    
    if (resetBtn) {
      resetBtn.addEventListener('click', function(e) {
        e.preventDefault();
        console.log('🔄 Reset form clicked');
        if (window.RencanaStrategisModule && typeof window.RencanaStrategisModule.resetForm === 'function') {
          window.RencanaStrategisModule.resetForm();
        }
      });
    }
    
    if (cancelBtn) {
      cancelBtn.addEventListener('click', function(e) {
        e.preventDefault();
        console.log('❌ Cancel edit clicked');
        if (window.RencanaStrategisModule && typeof window.RencanaStrategisModule.cancelEdit === 'function') {
          window.RencanaStrategisModule.cancelEdit();
        }
      });
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
            setupFormButtons();
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
          setupFormButtons();
          setupMutationObserver();
        }, 500);
      });
    } else {
      setTimeout(() => {
        setupEventDelegation();
        setupHeaderButtons();
        setupFormButtons();
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
    setupHeaderButtons: setupHeaderButtons,
    setupFormButtons: setupFormButtons
  };
  
  console.log('✅ Rencana Strategis Action Buttons Fix loaded');
})();
