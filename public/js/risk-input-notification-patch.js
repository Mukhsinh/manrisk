// Patch untuk menambahkan notifikasi pada RiskInputModule
(function() {
  'use strict';

  // Tunggu sampai RiskInputModule tersedia
  function patchRiskInputModule() {
    if (!window.RiskInputModule) {
      setTimeout(patchRiskInputModule, 100);
      return;
    }

    console.log('Patching RiskInputModule dengan notifikasi...');

    // Expose fungsi edit agar bisa dipanggil dari luar
    if (window.RiskInputModule.edit) {
      const originalEdit = window.RiskInputModule.edit;
      window.RiskInputModule.edit = function(id) {
        // Tampilkan form
        if (window.showRiskInputForm) {
          window.showRiskInputForm();
        }
        
        // Panggil fungsi asli
        return originalEdit.call(this, id);
      };
    }

    console.log('RiskInputModule berhasil di-patch dengan notifikasi');
  }

  // Mulai patching
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', patchRiskInputModule);
  } else {
    patchRiskInputModule();
  }

  // Intercept alert untuk menggunakan notifikasi custom
  const originalAlert = window.alert;
  window.alert = function(message) {
    // Cek apakah pesan dari risk input
    if (message && typeof message === 'string') {
      const isSuccess = message.toLowerCase().includes('berhasil') || 
                       message.toLowerCase().includes('sukses');
      const isError = message.toLowerCase().includes('gagal') || 
                     message.toLowerCase().includes('error');
      
      if (isSuccess || isError) {
        if (window.showRiskNotification) {
          window.showRiskNotification(message, isSuccess ? 'success' : 'error');
          return;
        }
      }
    }
    
    // Fallback ke alert asli
    originalAlert.call(window, message);
  };
})();

