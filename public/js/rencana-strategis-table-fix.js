/**
 * RENCANA STRATEGIS - TABLE FIX
 * Memastikan kolom kode dan badge status tampil dengan benar
 * Version: 1.0
 */

(function() {
  'use strict';
  
  console.log('🔧 Rencana Strategis Table Fix loaded');
  
  // Function to fix table display
  function fixTableDisplay() {
    var table = document.querySelector('#rencana-strategis .table, .rencana-strategis-wrapper .table');
    
    if (!table) {
      return;
    }
    
    console.log('🔍 Memeriksa tabel rencana strategis...');
    
    // Check all rows
    var rows = table.querySelectorAll('tbody tr');
    var fixedCount = 0;
    
    rows.forEach(function(row, index) {
      // Fix kolom kode (kolom 1)
      var kodeCell = row.querySelector('td:nth-child(1)');
      if (kodeCell) {
        var kodeBadge = kodeCell.querySelector('.badge');
        if (kodeBadge) {
          // Ensure badge is visible
          kodeBadge.style.display = 'inline-block';
          kodeBadge.style.visibility = 'visible';
          kodeBadge.style.opacity = '1';
          
          if (!kodeBadge.textContent.trim()) {
            console.warn('⚠️ Row ' + index + ': Kode kosong!');
          }
        } else {
          console.warn('⚠️ Row ' + index + ': Badge kode tidak ditemukan!');
        }
      }
      
      // Fix badge status (kolom 5)
      var statusCell = row.querySelector('td:nth-child(5)');
      if (statusCell) {
        var statusBadge = statusCell.querySelector('.badge');
        if (statusBadge) {
          // Ensure badge stays inside cell
          statusBadge.style.display = 'inline-block';
          statusBadge.style.visibility = 'visible';
          statusBadge.style.opacity = '1';
          statusBadge.style.position = 'relative';
          statusBadge.style.zIndex = '1';
          statusBadge.style.maxWidth = '100%';
          
          // Ensure cell contains badge properly
          statusCell.style.overflow = 'visible';
          statusCell.style.position = 'relative';
          
          fixedCount++;
        }
      }
      
      // Fix tombol edit (kolom 6)
      var actionCell = row.querySelector('td:nth-child(6)');
      if (actionCell) {
        var editBtn = actionCell.querySelector('.btn-action-edit, .rs-action-btn[data-action="edit"]');
        if (editBtn) {
          // Ensure edit button is visible and clickable
          editBtn.style.display = 'inline-flex';
          editBtn.style.visibility = 'visible';
          editBtn.style.opacity = '1';
          editBtn.style.pointerEvents = 'auto';
          editBtn.style.cursor = 'pointer';
          
          // Verify data-id exists
          var dataId = editBtn.getAttribute('data-id');
          if (!dataId) {
            console.error('❌ Row ' + index + ': Tombol edit tidak memiliki data-id!');
          }
        }
      }
    });
    
    console.log('✅ Table fix selesai, ' + fixedCount + ' badge status diperbaiki');
  }
  
  // Run fix when table is rendered
  function observeTable() {
    var container = document.getElementById('rencana-strategis-content');
    if (!container) {
      setTimeout(observeTable, 100);
      return;
    }
    
    // Initial fix
    setTimeout(fixTableDisplay, 200);
    
    // Watch for table changes
    var observer = new MutationObserver(function(mutations) {
      var tableChanged = false;
      
      mutations.forEach(function(mutation) {
        if (mutation.type === 'childList') {
          var hasTable = Array.from(mutation.addedNodes).some(function(node) {
            return node.nodeType === 1 && (node.matches && node.matches('table') || node.querySelector && node.querySelector('table'));
          });
          
          if (hasTable) {
            tableChanged = true;
          }
        }
      });
      
      if (tableChanged) {
        console.log('🔄 Tabel berubah, menjalankan fix...');
        setTimeout(fixTableDisplay, 100);
      }
    });
    
    observer.observe(container, {
      childList: true,
      subtree: true
    });
    
    console.log('👀 Observer terpasang untuk memantau perubahan tabel');
  }
  
  // Start when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', observeTable);
  } else {
    observeTable();
  }
  
})();
