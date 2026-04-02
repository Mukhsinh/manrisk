/**
 * Debug helper untuk Rencana Strategis
 * Membantu troubleshoot masalah tombol edit
 */

(function() {
  console.log('🔧 Rencana Strategis Debug Helper loaded');
  
  // Monitor modal creation
  const observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
      mutation.addedNodes.forEach(function(node) {
        if (node.id === 'rs-detail-modal') {
          console.log('🎯 Modal detected!');
          
          setTimeout(function() {
            const editBtn = node.querySelector('.rs-modal-edit-btn');
            console.log('🔍 Edit button check:', editBtn ? 'FOUND' : 'NOT FOUND');
            
            if (editBtn) {
              console.log('📋 Edit button attributes:', {
                'data-id': editBtn.getAttribute('data-id'),
                'class': editBtn.className,
                'onclick': editBtn.onclick ? 'BOUND' : 'NOT BOUND'
              });
              
              // Add backup click handler
              if (!editBtn.onclick) {
                console.warn('⚠️ No onclick found, adding backup handler');
                editBtn.addEventListener('click', function(e) {
                  e.preventDefault();
                  const id = this.getAttribute('data-id');
                  console.log('🔥 BACKUP HANDLER TRIGGERED! ID:', id);
                  
                  // Close modal
                  const modal = bootstrap.Modal.getInstance(node);
                  if (modal) modal.hide();
                  
                  // Call startEdit
                  setTimeout(function() {
                    if (window.RencanaStrategisModule && window.RencanaStrategisModule.startEdit) {
                      window.RencanaStrategisModule.startEdit(id);
                    }
                  }, 300);
                });
              }
            }
          }, 100);
        }
      });
    });
  });
  
  observer.observe(document.body, { childList: true, subtree: true });
  
  console.log('✅ Debug observer active');
})();
