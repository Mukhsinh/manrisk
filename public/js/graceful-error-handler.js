/**
 * GRACEFUL ERROR HANDLER
 * Menangani error loading dengan baik dan memberikan feedback ke user
 * Version: 1.0
 */

(function() {
  'use strict';
  
  console.log('🛡️ Graceful Error Handler initializing...');
  
  // Track failed requests
  const failedRequests = new Map();
  const MAX_RETRIES = 2;
  
  /**
   * Show user-friendly error notification
   */
  function showErrorNotification(message, type = 'warning') {
    // Cek apakah sudah ada notifikasi
    const existingNotif = document.getElementById('graceful-error-notif');
    if (existingNotif) {
      existingNotif.remove();
    }
    
    const colors = {
      warning: { bg: '#fef3c7', border: '#f59e0b', text: '#92400e', icon: 'exclamation-triangle' },
      error: { bg: '#fee2e2', border: '#ef4444', text: '#991b1b', icon: 'times-circle' },
      info: { bg: '#dbeafe', border: '#3b82f6', text: '#1e40af', icon: 'info-circle' }
    };
    
    const color = colors[type] || colors.warning;
    
    const notif = document.createElement('div');
    notif.id = 'graceful-error-notif';
    notif.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      max-width: 400px;
      background: ${color.bg};
      border-left: 4px solid ${color.border};
      padding: 16px 20px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 10000;
      animation: slideInRight 0.3s ease-out;
    `;
    
    notif.innerHTML = `
      <div style="display: flex; align-items: start; gap: 12px;">
        <i class="fas fa-${color.icon}" style="color: ${color.border}; font-size: 20px; margin-top: 2px;"></i>
        <div style="flex: 1;">
          <div style="color: ${color.text}; font-weight: 600; margin-bottom: 4px;">
            ${type === 'error' ? 'Terjadi Kesalahan' : type === 'warning' ? 'Perhatian' : 'Informasi'}
          </div>
          <div style="color: ${color.text}; font-size: 14px; line-height: 1.5;">
            ${message}
          </div>
        </div>
        <button onclick="this.parentElement.parentElement.remove()" 
                style="background: none; border: none; color: ${color.text}; cursor: pointer; font-size: 18px; padding: 0; line-height: 1;">
          ×
        </button>
      </div>
    `;
    
    document.body.appendChild(notif);
    
    // Auto remove setelah 8 detik
    setTimeout(() => {
      if (notif.parentElement) {
        notif.style.animation = 'slideOutRight 0.3s ease-out';
        setTimeout(() => notif.remove(), 300);
      }
    }, 8000);
  }
  
  /**
   * Add CSS animations
   */
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideInRight {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
    
    @keyframes slideOutRight {
      from {
        transform: translateX(0);
        opacity: 1;
      }
      to {
        transform: translateX(100%);
        opacity: 0;
      }
    }
  `;
  document.head.appendChild(style);
  
  /**
   * Intercept fetch untuk menangani error
   */
  const originalFetch = window.fetch;
  window.fetch = async function(...args) {
    const url = args[0];
    
    try {
      const response = await originalFetch.apply(this, args);
      
      // Jika error 503, track dan show notification
      if (response.status === 503) {
        const requestKey = `${url}`;
        const failCount = (failedRequests.get(requestKey) || 0) + 1;
        failedRequests.set(requestKey, failCount);
        
        // Hanya show notification untuk request pertama kali gagal
        if (failCount === 1) {
          console.warn(`⚠️ Service unavailable: ${url}`);
          
          // Jangan show notification untuk setiap request, hanya yang penting
          const importantEndpoints = ['/api/dashboard', '/api/rencana-strategis', '/api/auth/me'];
          if (importantEndpoints.some(endpoint => url.includes(endpoint))) {
            showErrorNotification(
              'Beberapa data sedang tidak tersedia. Aplikasi akan mencoba memuat ulang secara otomatis.',
              'warning'
            );
          }
        }
      } else if (response.ok) {
        // Reset fail count jika sukses
        failedRequests.delete(`${url}`);
      }
      
      return response;
      
    } catch (error) {
      console.error(`❌ Network error: ${url}`, error);
      
      // Show notification untuk network error
      const requestKey = `${url}`;
      const failCount = (failedRequests.get(requestKey) || 0) + 1;
      failedRequests.set(requestKey, failCount);
      
      if (failCount === 1) {
        showErrorNotification(
          'Koneksi ke server terputus. Mohon periksa koneksi internet Anda.',
          'error'
        );
      }
      
      throw error;
    }
  };
  
  /**
   * Handle global errors
   */
  window.addEventListener('error', (event) => {
    // Jangan handle error dari script eksternal
    if (event.filename && !event.filename.includes(window.location.origin)) {
      return;
    }
    
    console.error('❌ Global error:', event.error);
    
    // Hanya show notification untuk error yang benar-benar mengganggu
    if (event.error && event.error.message && !event.error.message.includes('ResizeObserver')) {
      showErrorNotification(
        'Terjadi kesalahan pada aplikasi. Halaman akan dimuat ulang otomatis.',
        'error'
      );
      
      // Auto reload setelah 3 detik
      setTimeout(() => {
        window.location.reload();
      }, 3000);
    }
  });
  
  /**
   * Handle unhandled promise rejections
   */
  window.addEventListener('unhandledrejection', (event) => {
    console.error('❌ Unhandled rejection:', event.reason);
    
    // Jangan show notification untuk setiap rejection
    // Hanya yang benar-benar penting
    if (event.reason && event.reason.message && event.reason.message.includes('Failed to fetch')) {
      // Sudah ditangani oleh fetch interceptor
      return;
    }
  });
  
  /**
   * Monitor page load errors
   */
  let pageLoadErrors = 0;
  const MAX_PAGE_LOAD_ERRORS = 5;
  
  window.addEventListener('load', () => {
    // Check jika ada banyak error saat page load
    if (pageLoadErrors > MAX_PAGE_LOAD_ERRORS) {
      showErrorNotification(
        'Beberapa komponen gagal dimuat. Silakan refresh halaman atau hubungi administrator.',
        'error'
      );
    }
  });
  
  // Export untuk manual use
  window.GracefulErrorHandler = {
    showNotification: showErrorNotification,
    getFailedRequests: () => Array.from(failedRequests.entries())
  };
  
  console.log('✅ Graceful Error Handler ready');
  
})();
