/**
 * RENCANA STRATEGIS REFRESH FIX
 * Memperbaiki masalah icon dan status yang hilang setelah refresh
 * 
 * Masalah: Icon di kolom aksi dan status badge hilang (menjadi kotak putih) setelah refresh
 * Solusi: Memastikan Font Awesome ter-load dan data ter-render dengan benar
 */

(function() {
  'use strict';
  
  console.log('🔧 Rencana Strategis Refresh Fix v1.0 loaded');
  
  let isFixing = false;
  
  // Fungsi untuk memastikan Font Awesome ter-load
  function ensureFontAwesomeLoaded() {
    return new Promise((resolve) => {
      // Cek apakah Font Awesome sudah ter-load
      if (document.querySelector('link[href*="font-awesome"]')) {
        // Tunggu sampai font benar-benar ter-load
        if (document.fonts && document.fonts.ready) {
          document.fonts.ready.then(() => {
            console.log('✅ Font Awesome ready');
            resolve();
          });
        } else {
          // Fallback jika document.fonts tidak tersedia
          setTimeout(resolve, 300);
        }
      } else {
        console.warn('⚠️ Font Awesome link not found');
        resolve();
      }
    });
  }
  
  // Fungsi untuk memaksa re-render icon
  function forceIconRerender() {
    // Cari semua elemen dengan class fa-* (Font Awesome icons)
    const icons = document.querySelectorAll('[class*="fa-"]');
    
    if (icons.length === 0) {
      return;
    }
    
    console.log('🔄 Re-rendering', icons.length, 'icons');
    
    // Force browser to repaint icons
    icons.forEach(icon => {
      // Simpan class asli
      const originalClass = icon.className;
      
      // Hapus dan tambahkan kembali class untuk trigger repaint
      icon.className = '';
      icon.offsetHeight; // Trigger reflow
      icon.className = originalClass;
    });
    
    console.log('✅ Icons re-rendered');
  }
  
  // Fungsi untuk memaksa re-render status badges
  function forceStatusBadgeRerender() {
    const badges = document.querySelectorAll('.badge, [class*="badge"]');
    
    if (badges.length === 0) {
      return;
    }
    
    console.log('🔄 Re-rendering', badges.length, 'status badges');
    
    // Force browser to repaint badges
    badges.forEach(badge => {
      // Simpan style asli
      const originalDisplay = badge.style.display;
      
      // Force repaint
      badge.style.display = 'none';
      badge.offsetHeight; // Trigger reflow
      badge.style.display = originalDisplay || '';
    });
    
    console.log('✅ Status badges re-rendered');
  }
  
  // Fungsi untuk fix tombol aksi
  function fixActionButtons() {
    const actionButtons = document.querySelectorAll('.rs-action-btn, .btn-icon');
    
    if (actionButtons.length === 0) {
      return;
    }
    
    console.log('🔄 Fixing', actionButtons.length, 'action buttons');
    
    actionButtons.forEach(btn => {
      // Pastikan icon di dalam button ter-render
      const icon = btn.querySelector('[class*="fa-"]');
      if (icon) {
        const originalClass = icon.className;
        icon.className = '';
        icon.offsetHeight;
        icon.className = originalClass;
      }
    });
    
    console.log('✅ Action buttons fixed');
  }
  
  // Fungsi utama untuk fix refresh
  async function fixAfterRefresh() {
    if (isFixing) {
      console.log('⏳ Fix already in progress, skipping...');
      return;
    }
    
    isFixing = true;
    console.log('🔧 Applying refresh fix...');
    
    try {
      // Tunggu Font Awesome ter-load
      await ensureFontAwesomeLoaded();
      
      // Tunggu sebentar untuk memastikan DOM ready
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Force re-render icon, status badges, dan action buttons
      forceIconRerender();
      forceStatusBadgeRerender();
      fixActionButtons();
      
      console.log('✅ Refresh fix applied successfully');
    } catch (error) {
      console.error('❌ Error applying refresh fix:', error);
    } finally {
      isFixing = false;
    }
  }
  
  // Observer untuk mendeteksi perubahan pada tabel
  function setupTableObserver() {
    const container = document.getElementById('rencana-strategis-content');
    if (!container) {
      return;
    }
    
    const observer = new MutationObserver((mutations) => {
      // Cek apakah ada perubahan pada tabel
      const hasTableChange = mutations.some(mutation => {
        return Array.from(mutation.addedNodes).some(node => {
          return node.nodeType === 1 && (
            node.tagName === 'TABLE' || 
            node.querySelector && node.querySelector('table')
          );
        });
      });
      
      if (hasTableChange) {
        console.log('📊 Table change detected, applying fix...');
        setTimeout(fixAfterRefresh, 100);
      }
    });
    
    observer.observe(container, {
      childList: true,
      subtree: true
    });
    
    console.log('👁️ Table observer setup complete');
  }
  
  // Hook ke RencanaStrategisModule jika ada
  function hookIntoModule() {
    if (!window.RencanaStrategisModule) {
      return;
    }
    
    // Hook ke fungsi load
    const originalLoad = window.RencanaStrategisModule.load;
    if (originalLoad) {
      window.RencanaStrategisModule.load = async function() {
        await originalLoad.call(this);
        await fixAfterRefresh();
      };
    }
    
    // Hook ke fungsi refreshData
    const originalRefreshData = window.RencanaStrategisModule.refreshData;
    if (originalRefreshData) {
      window.RencanaStrategisModule.refreshData = async function() {
        await originalRefreshData.call(this);
        await fixAfterRefresh();
      };
    }
    
    console.log('✅ Hooked into RencanaStrategisModule');
  }
  
  // Inisialisasi
  function init() {
    console.log('🚀 Initializing Rencana Strategis Refresh Fix...');
    
    // Setup observer
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        setupTableObserver();
        hookIntoModule();
        fixAfterRefresh();
      });
    } else {
      setupTableObserver();
      hookIntoModule();
      fixAfterRefresh();
    }
    
    // Jalankan fix saat halaman di-refresh (visibilitychange)
    document.addEventListener('visibilitychange', function() {
      if (!document.hidden) {
        console.log('🔄 Page became visible, applying fix...');
        setTimeout(fixAfterRefresh, 200);
      }
    });
  }
  
  // Jalankan inisialisasi
  init();
  
  // Export untuk debugging
  window.RencanaStrategisRefreshFix = {
    fixAfterRefresh,
    forceIconRerender,
    forceStatusBadgeRerender,
    fixActionButtons,
    ensureFontAwesomeLoaded
  };
  
})();
