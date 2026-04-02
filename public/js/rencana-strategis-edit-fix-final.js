/**
 * RENCANA STRATEGIS - PERBAIKAN FINAL TOMBOL EDIT
 * Memastikan tombol edit berfungsi 100% di tabel dan modal
 */

(function() {
  'use strict';
  
  console.log('🔧 Loading Edit Fix Final...');
  
  // Wait for module
  function waitForModule(callback) {
    if (window.RencanaStrategisModule) {
      callback();
    } else {
      setTimeout(() => waitForModule(callback), 50);
    }
  }
  
  waitForModule(function() {
    console.log('✅ Module ready, applying edit fixes...');
    
    // PATCH 1: Pastikan handleActionClick menangani tombol edit
    const container = document.getElementById('rencana-strategis-content');
    if (container) {
      container.addEventListener('click', function(e) {
        const editBtn = e.target.closest('.btn-action-edit');
        if (editBtn) {
          e.preventDefault();
          e.stopPropagation();
          
          const id = editBtn.getAttribute('data-id');
          console.log('✏️ EDIT BUTTON CLICKED! ID:', id);
          
          if (id && window.RencanaStrategisModule && window.RencanaStrategisModule.startEdit) {
            window.RencanaStrategisModule.startEdit(id);
          } else {
            console.error('❌ Cannot start edit - missing ID or startEdit function');
          }
        }
      });
      
      console.log('✅ Edit button handler patched');
    }
    
    // PATCH 2: Monitor modal dan fix tombol edit di modal
    const modalObserver = new MutationObserver(function(mutations) {
      mutations.forEach(function(mutation) {
        mutation.addedNodes.forEach(function(node) {
          if (node.id === 'rs-detail-modal') {
            console.log('🎯 Modal created, fixing edit button...');
            
            setTimeout(function() {
              const editBtn = node.querySelector('.rs-modal-edit-btn');
              if (editBtn && !editBtn.hasAttribute('data-patched')) {
                editBtn.setAttribute('data-patched', 'true');
                
                const id = editBtn.getAttribute('data-edit-id') || editBtn.getAttribute('data-id');
                console.log('📋 Modal edit button ID:', id);
                
                // Clone untuk remove semua listener lama
                const newBtn = editBtn.cloneNode(true);
                editBtn.parentNode.replaceChild(newBtn, editBtn);
                
                // Add clean listener
                newBtn.addEventListener('click', function(e) {
                  e.preventDefault();
                  e.stopPropagation();
                  
                  const editId = this.getAttribute('data-edit-id') || this.getAttribute('data-id');
                  console.log('🔥 MODAL EDIT CLICKED! ID:', editId);
                  
                  // Close modal
                  const modal = bootstrap.Modal.getInstance(node);
                  if (modal) {
                    modal.hide();
                  }
                  
                  // Start edit
                  setTimeout(function() {
                    if (window.RencanaStrategisModule && window.RencanaStrategisModule.startEdit) {
                      console.log('🚀 Calling startEdit with ID:', editId);
                      window.RencanaStrategisModule.startEdit(editId);
                    }
                  }, 350);
                });
                
                console.log('✅ Modal edit button patched');
              }
            }, 100);
          }
        });
      });
    });
    
    modalObserver.observe(document.body, { childList: true, subtree: true });
    console.log('✅ Modal observer active');
    
    // PATCH 3: Pastikan form values ter-populate setelah startEdit
    const originalStartEdit = window.RencanaStrategisModule.startEdit;
    if (originalStartEdit) {
      window.RencanaStrategisModule.startEdit = function(id) {
        console.log('🎯 startEdit intercepted, ID:', id);
        
        // Call original
        originalStartEdit.call(window.RencanaStrategisModule, id);
        
        // Double-check form population after 500ms
        setTimeout(function() {
          const namaInput = document.getElementById('rs-nama');
          if (namaInput && !namaInput.value) {
            console.warn('⚠️ Form masih kosong, mencoba populate ulang...');
            
            const state = window.RencanaStrategisModule.state;
            if (state && state.formValues) {
              const kodeInput = document.getElementById('rs-kode');
              const deskripsiInput = document.getElementById('rs-deskripsi');
              const targetInput = document.getElementById('rs-target');
              const statusSelect = document.getElementById('rs-status');
              const misiSelect = document.getElementById('rs-misi');
              const mulaiInput = document.getElementById('rs-mulai');
              const selesaiInput = document.getElementById('rs-selesai');
              
              if (kodeInput) kodeInput.value = state.formValues.kode || '';
              if (namaInput) namaInput.value = state.formValues.nama_rencana || '';
              if (deskripsiInput) deskripsiInput.value = state.formValues.deskripsi || '';
              if (targetInput) targetInput.value = state.formValues.target || '';
              if (statusSelect) statusSelect.value = state.formValues.status || 'Draft';
              if (misiSelect) misiSelect.value = state.formValues.visi_misi_id || '';
              if (mulaiInput) mulaiInput.value = state.formValues.periode_mulai || '';
              if (selesaiInput) selesaiInput.value = state.formValues.periode_selesai || '';
              
              console.log('✅ Form manually populated');
            }
          } else {
            console.log('✅ Form already populated');
          }
        }, 500);
      };
      
      console.log('✅ startEdit function patched');
    }
    
    console.log('✅ All edit fixes applied');
  });
})();
