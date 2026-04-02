/**
 * RENCANA STRATEGIS - BUTTON FIX
 * Perbaikan rendering tombol aksi (icon only)
 */

(function() {
  'use strict';
  
  console.log('🔧 Rencana Strategis Button Fix loaded');
  
  // Override renderTableRows function untuk menggunakan icon only
  if (window.RencanaStrategisModule) {
    const originalModule = window.RencanaStrategisModule;
    
    // Simpan fungsi asli
    const originalRenderTableRows = originalModule.renderTableRows;
    
    // Override dengan versi icon only
    originalModule.renderTableRows = function() {
      const state = originalModule.getState ? originalModule.getState() : { data: [] };
      
      if (!state.data || state.data.length === 0) {
        return '<tr><td colspan="6" class="text-center py-5 border-0">' +
          '<div class="py-4">' +
            '<div class="mb-3" style="width: 80px; height: 80px; margin: 0 auto; background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center;">' +
              '<i class="fas fa-inbox fa-2x text-muted"></i>' +
            '</div>' +
            '<h5 class="text-muted mb-2">Belum Ada Data</h5>' +
            '<p class="text-muted mb-3">Silakan isi form di atas untuk menambahkan rencana strategis baru</p>' +
          '</div>' +
        '</td></tr>';
      }
      
      return state.data.map(function(item, index) {
        const statusBadge = getStatusBadge(item.status);
        const periode = formatPeriode(item.periode_mulai, item.periode_selesai);
        const rowBg = index % 2 === 0 ? '' : 'style="background-color: #fafbfc;"';
        const kodeDisplay = item.kode || generateFallbackKode(index);
        const itemId = item.id || '';
        
        let row = '<tr ' + rowBg + ' data-id="' + itemId + '">';
        
        // Column 1: Kode
        row += '<td class="align-middle">';
        row += '<span class="badge bg-light text-dark border">' + escapeHtml(kodeDisplay) + '</span>';
        row += '</td>';
        
        // Column 2: Nama Rencana
        row += '<td class="align-middle">';
        row += '<div class="fw-semibold text-dark">' + escapeHtml(item.nama_rencana || '-') + '</div>';
        if (item.deskripsi) {
          row += '<small class="text-muted d-block mt-1">' + escapeHtml(truncateText(item.deskripsi, 80)) + '</small>';
        }
        row += '</td>';
        
        // Column 3: Target
        row += '<td class="align-middle">';
        row += '<small class="text-muted">' + escapeHtml(item.target || '-') + '</small>';
        row += '</td>';
        
        // Column 4: Periode
        row += '<td class="align-middle">';
        row += '<small class="text-muted">' + periode + '</small>';
        row += '</td>';
        
        // Column 5: Status
        row += '<td class="align-middle">';
        row += statusBadge;
        row += '</td>';
        
        // Column 6: Action Buttons - ICON ONLY
        row += '<td class="align-middle text-center">';
        row += '<div class="d-flex justify-content-center gap-2" role="group">';
        
        // View Button - Icon Only
        row += '<button type="button" class="btn-action-view" ';
        row += 'data-action="view" data-id="' + itemId + '" ';
        row += 'title="Lihat Detail">';
        row += '<i class="fas fa-eye"></i>'; // Icon only, no text
        row += '</button>';
        
        // Edit Button - Icon Only
        row += '<button type="button" class="btn-action-edit" ';
        row += 'data-action="edit" data-id="' + itemId + '" ';
        row += 'title="Edit">';
        row += '<i class="fas fa-edit"></i>'; // Icon only, no text
        row += '</button>';
        
        // Delete Button - Icon Only
        row += '<button type="button" class="btn-action-delete" ';
        row += 'data-action="delete" data-id="' + itemId + '" ';
        row += 'title="Hapus">';
        row += '<i class="fas fa-trash-alt"></i>'; // Icon only, no text
        row += '</button>';
        
        row += '</div>';
        row += '</td>';
        row += '</tr>';
        
        return row;
      }).join('');
    };
    
    console.log('✅ renderTableRows overridden with icon-only buttons');
  }
  
  // Helper functions
  function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
  
  function truncateText(text, maxLength) {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  }
  
  function generateFallbackKode(index) {
    const year = new Date().getFullYear();
    return 'RS-' + year + '-' + String(index + 1).padStart(3, '0');
  }
  
  function getStatusBadge(status) {
    const statusText = status || 'Draft';
    const badgeStyle = 'display: inline-block; font-size: 0.75rem; padding: 0.4rem 0.75rem; border-radius: 6px; white-space: nowrap; font-weight: 600; box-shadow: 0 2px 4px rgba(0,0,0,0.15);';
    
    if (statusText === 'Aktif') {
      return '<span class="badge" style="' + badgeStyle + ' background: #22c55e; color: white;"><i class="fas fa-check-circle me-1"></i>Aktif</span>';
    }
    if (statusText === 'Draft') {
      return '<span class="badge" style="' + badgeStyle + ' background: #f59e0b; color: white;"><i class="fas fa-edit me-1"></i>Draft</span>';
    }
    if (statusText === 'Selesai') {
      return '<span class="badge" style="' + badgeStyle + ' background: #3b82f6; color: white;"><i class="fas fa-flag-checkered me-1"></i>Selesai</span>';
    }
    return '<span class="badge" style="' + badgeStyle + ' background: #6b7280; color: white;">' + escapeHtml(statusText) + '</span>';
  }
  
  function formatPeriode(mulai, selesai) {
    if (!mulai && !selesai) return '-';
    const formatDate = function(d) {
      if (!d) return '';
      return new Date(d).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
    };
    return formatDate(mulai) + ' - ' + formatDate(selesai);
  }
  
  // Apply fix when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', applyButtonFix);
  } else {
    applyButtonFix();
  }
  
  function applyButtonFix() {
    console.log('🎨 Applying button fix to existing elements...');
    
    // Fix existing action buttons to icon only
    const actionButtons = document.querySelectorAll('.btn-action-view, .btn-action-edit, .btn-action-delete');
    actionButtons.forEach(btn => {
      // Remove text nodes, keep only icon
      Array.from(btn.childNodes).forEach(node => {
        if (node.nodeType === Node.TEXT_NODE) {
          node.remove();
        }
      });
    });
    
    console.log('✅ Button fix applied to ' + actionButtons.length + ' buttons');
  }
  
  // Watch for dynamic content changes
  const observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
      if (mutation.addedNodes.length) {
        mutation.addedNodes.forEach(function(node) {
          if (node.nodeType === Node.ELEMENT_NODE) {
            if (node.classList && (node.classList.contains('btn-action-view') || 
                node.classList.contains('btn-action-edit') || 
                node.classList.contains('btn-action-delete'))) {
              // Remove text from newly added buttons
              Array.from(node.childNodes).forEach(child => {
                if (child.nodeType === Node.TEXT_NODE) {
                  child.remove();
                }
              });
            }
            
            // Check children
            const buttons = node.querySelectorAll('.btn-action-view, .btn-action-edit, .btn-action-delete');
            buttons.forEach(btn => {
              Array.from(btn.childNodes).forEach(child => {
                if (child.nodeType === Node.TEXT_NODE) {
                  child.remove();
                }
              });
            });
          }
        });
      }
    });
  });
  
  // Start observing
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
  
  console.log('✅ Button fix observer started');
  
})();
