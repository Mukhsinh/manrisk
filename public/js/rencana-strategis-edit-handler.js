/**
 * RENCANA STRATEGIS - EDIT HANDLER
 * Memastikan tombol edit berfungsi dengan sempurna
 * Version: 1.0
 */

(function() {
  'use strict';
  
  console.log('🔧 Rencana Strategis Edit Handler loaded');
  
  // Wait for DOM and module to be ready
  function init() {
    if (!window.RencanaStrategisModule) {
      console.log('⏳ Menunggu RencanaStrategisModule...');
      setTimeout(init, 100);
      return;
    }
    
    console.log('✅ RencanaStrategisModule ditemukan, menambahkan handler edit...');
    
    // Add global click handler untuk tombol edit
    document.addEventListener('click', function(e) {
      // Cek apakah yang diklik adalah tombol edit
      var editBtn = e.target.closest('.btn-action-edit, .rs-action-btn[data-action="edit"]');
      
      if (editBtn) {
        e.preventDefault();
        e.stopPropagation();
        
        var id = editBtn.getAttribute('data-id');
        console.log('✏️ Tombol EDIT diklik! ID:', id);
        
        if (!id) {
          console.error('❌ Tombol edit tidak memiliki data-id');
          return;
        }
        
        // Panggil fungsi startEdit dari module
        if (window.RencanaStrategisModule && window.RencanaStrategisModule.startEdit) {
          console.log('🚀 Memanggil RencanaStrategisModule.startEdit(' + id + ')');
          window.RencanaStrategisModule.startEdit(id);
        } else {
          console.error('❌ RencanaStrategisModule.startEdit tidak tersedia');
        }
      }
      
      // Cek tombol edit di modal
      var modalEditBtn = e.target.closest('.rs-modal-edit-btn');
      if (modalEditBtn) {
        e.preventDefault();
        e.stopPropagation();
        
        var editId = modalEditBtn.getAttribute('data-edit-id');
        console.log('✏️ Tombol EDIT di modal diklik! ID:', editId);
        
        if (!editId) {
          console.error('❌ Tombol edit modal tidak memiliki data-edit-id');
          return;
        }
        
        // Tutup modal terlebih dahulu
        var modal = bootstrap.Modal.getInstance(document.getElementById('rs-detail-modal'));
        if (modal) {
          modal.hide();
        }
        
        // Tunggu modal tertutup, lalu panggil edit
        setTimeout(function() {
          if (window.RencanaStrategisModule && window.RencanaStrategisModule.startEdit) {
            console.log('🚀 Memanggil RencanaStrategisModule.startEdit(' + editId + ') dari modal');
            window.RencanaStrategisModule.startEdit(editId);
          }
        }, 400);
      }
    }, true); // Use capture phase untuk memastikan handler dipanggil
    
    console.log('✅ Edit handler terpasang dengan event delegation');
  }
  
  // Start initialization
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
