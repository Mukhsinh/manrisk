
/* Cache-busted: 2026-04-02T10:03:16.854Z */
/**
 * FORCE FIX - Rencana Strategis
 * Memaksa perubahan diterapkan dengan menghapus cache dan re-render
 * 
 * PERBAIKAN:
 * 1. Hapus tombol Edit dari kolom aksi
 * 2. Tombol Refresh & Unduh dengan warna solid cerah
 * 3. Tidak ada overflow pada kolom aksi
 */

(function() {
  'use strict';
  
  console.log('🔧 FORCE FIX: Applying Rencana Strategis fixes...');
  
  // Wait for DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', applyFixes);
  } else {
    applyFixes();
  }
  
  function applyFixes() {
    // Fix 1: Remove all Edit buttons
    removeEditButtons();
    
    // Fix 2: Apply solid bright colors to header buttons
    fixHeaderButtons();
    
    // Fix 3: Fix action column width
    fixActionColumn();
    
    // Fix 4: Ensure event listeners are working
    ensureEventListeners();
    
    // Fix 5: Monitor for dynamic content changes
    observeChanges();
    
    console.log('✅ FORCE FIX: All fixes applied');
  }
  
  function removeEditButtons() {
    // Remove all edit buttons from action column
    const editButtons = document.querySelectorAll(
      '.btn-action-edit, ' +
      '[data-action="edit"], ' +
      'button[title*="Edit"], ' +
      'button[onclick*="edit"]'
    );
    
    editButtons.forEach(btn => {
      console.log('🗑️ Removing edit button:', btn);
      btn.remove();
    });
    
    console.log(`✅ Removed ${editButtons.length} edit buttons`);
  }
  
  function fixHeaderButtons() {
    // Fix Refresh button - BIRU CERAH SOLID dengan icon dan teks
    const refreshBtn = document.querySelector('#rs-refresh-btn');
    if (refreshBtn) {
      // HANYA perbaiki styling, JANGAN sentuh event listener!
      
      refreshBtn.style.cssText = `
        background: #3b82f6 !important;
        border: none !important;
        color: white !important;
        min-width: 120px !important;
        height: 40px !important;
        border-radius: 8px !important;
        padding: 0.5rem 1rem !important;
        display: inline-flex !important;
        align-items: center !important;
        justify-content: center !important;
        gap: 0.5rem !important;
        box-shadow: 0 2px 4px rgba(59, 130, 246, 0.2) !important;
        cursor: pointer !important;
        font-size: 14px !important;
        font-weight: 600 !important;
        pointer-events: auto !important;
      `;
      
      // Ensure icon is visible
      const icon = refreshBtn.querySelector('i');
      if (icon) {
        icon.style.cssText = `
          font-size: 14px !important;
          color: white !important;
          margin: 0 !important;
          pointer-events: none !important;
        `;
      }
      
      // Ensure text is visible
      const span = refreshBtn.querySelector('span');
      if (span) {
        span.style.cssText = `
          color: white !important;
          font-size: 14px !important;
          font-weight: 600 !important;
          pointer-events: none !important;
        `;
      }
      
      console.log('✅ Fixed Refresh button styling');
    }
    
    // Fix Export button - HIJAU CERAH SOLID dengan icon dan teks
    const exportBtn = document.querySelector('#rs-export-btn');
    if (exportBtn) {
      // HANYA perbaiki styling, JANGAN sentuh event listener!
      
      exportBtn.style.cssText = `
        background: #22c55e !important;
        border: none !important;
        color: white !important;
        min-width: 150px !important;
        height: 40px !important;
        border-radius: 8px !important;
        padding: 0.5rem 1rem !important;
        display: inline-flex !important;
        align-items: center !important;
        justify-content: center !important;
        gap: 0.5rem !important;
        box-shadow: 0 2px 4px rgba(34, 197, 94, 0.2) !important;
        cursor: pointer !important;
        font-size: 14px !important;
        font-weight: 600 !important;
        pointer-events: auto !important;
      `;
      
      // Ensure icon is visible
      const icon = exportBtn.querySelector('i');
      if (icon) {
        icon.style.cssText = `
          font-size: 14px !important;
          color: white !important;
          margin: 0 !important;
          pointer-events: none !important;
        `;
      }
      
      // Ensure text is visible
      const span = exportBtn.querySelector('span');
      if (span) {
        span.style.cssText = `
          color: white !important;
          font-size: 14px !important;
          font-weight: 600 !important;
          pointer-events: none !important;
        `;
      }
      
      console.log('✅ Fixed Export button styling');
    }
  }
  
  function fixActionColumn() {
    // Fix all action columns
    const actionCells = document.querySelectorAll(
      '.rencana-strategis-wrapper table td:last-child, ' +
      'table td:nth-child(6)'
    );
    
    actionCells.forEach(cell => {
      cell.style.cssText = `
        min-width: 100px !important;
        max-width: 120px !important;
        white-space: nowrap !important;
        padding: 0.5rem 0.75rem !important;
        overflow: visible !important;
      `;
    });
    
    // Fix action button containers
    const btnGroups = document.querySelectorAll(
      '.rencana-strategis-wrapper .btn-group, ' +
      '.rencana-strategis-wrapper td:last-child .d-flex'
    );
    
    btnGroups.forEach(group => {
      group.style.cssText = `
        display: inline-flex !important;
        flex-wrap: nowrap !important;
        gap: 0.5rem !important;
        justify-content: center !important;
      `;
    });
    
    // Fix all action buttons - ICON ONLY
    const actionButtons = document.querySelectorAll(
      '.btn-action-view, ' +
      '.btn-action-delete, ' +
      '.rs-action-btn'
    );
    
    actionButtons.forEach(btn => {
      btn.style.cssText = `
        padding: 0.5rem !important;
        border-radius: 8px !important;
        border: none !important;
        min-width: 36px !important;
        min-height: 36px !important;
        max-width: 36px !important;
        max-height: 36px !important;
        display: inline-flex !important;
        align-items: center !important;
        justify-content: center !important;
        cursor: pointer !important;
        transition: all 0.2s ease !important;
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15) !important;
        font-size: 0 !important;
        overflow: hidden !important;
        white-space: nowrap !important;
      `;
      
      // Apply specific colors
      if (btn.classList.contains('btn-action-view') || btn.getAttribute('data-action') === 'view') {
        btn.style.background = 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%) !important';
      } else if (btn.classList.contains('btn-action-delete') || btn.getAttribute('data-action') === 'delete') {
        btn.style.background = 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%) !important';
      }
      
      // Ensure icon is visible
      const icon = btn.querySelector('i');
      if (icon) {
        icon.style.cssText = `
          font-size: 1.1rem !important;
          color: white !important;
          margin: 0 !important;
          display: inline-block !important;
        `;
      }
    });
    
    console.log(`✅ Fixed ${actionCells.length} action columns and ${actionButtons.length} action buttons`);
  }
  
  function ensureEventListeners() {
    console.log('🔗 Ensuring event listeners are working...');
    
    // Tunggu sebentar untuk memastikan module sudah loaded
    setTimeout(() => {
      const refreshBtn = document.getElementById('rs-refresh-btn');
      const exportBtn = document.getElementById('rs-export-btn');
      
      if (refreshBtn && !refreshBtn.getAttribute('data-listener-verified')) {
        console.log('⚠️ Adding backup listener for refresh button');
        
        refreshBtn.addEventListener('click', function(e) {
          e.preventDefault();
          e.stopPropagation();
          console.log('🔄 Refresh button clicked (backup listener)');
          
          const module = window.RencanaStrategisModule || window.RSCore;
          if (module && (module.refresh || module.refreshData)) {
            (module.refresh || module.refreshData)();
          } else {
            console.error('❌ Module refresh function not found, reloading page...');
            location.reload();
          }
        }, { capture: true });
        
        refreshBtn.setAttribute('data-listener-verified', 'true');
        console.log('✅ Refresh button listener verified');
      }
      
      if (exportBtn && !exportBtn.getAttribute('data-listener-verified')) {
        console.log('⚠️ Adding backup listener for export button');
        
        exportBtn.addEventListener('click', function(e) {
          e.preventDefault();
          e.stopPropagation();
          console.log('📥 Export button clicked (backup listener)');
          
          const module = window.RencanaStrategisModule || window.RSCore;
          if (module && module.exportData) {
            module.exportData();
          } else {
            console.error('❌ Module exportData function not found');
            alert('Fungsi export tidak tersedia. Silakan reload halaman.');
          }
        }, { capture: true });
        
        exportBtn.setAttribute('data-listener-verified', 'true');
        console.log('✅ Export button listener verified');
      }
    }, 800);
  }
  
  function observeChanges() {
    // Monitor for dynamic content changes
    const container = document.querySelector('#rencana-strategis-content, .rencana-strategis-wrapper');
    if (!container) return;
    
    const observer = new MutationObserver(function(mutations) {
      let needsFix = false;
      
      mutations.forEach(mutation => {
        if (mutation.addedNodes.length > 0) {
          mutation.addedNodes.forEach(node => {
            if (node.nodeType === 1) { // Element node
              // Check if edit button was added
              if (node.classList && (
                node.classList.contains('btn-action-edit') ||
                node.getAttribute('data-action') === 'edit'
              )) {
                needsFix = true;
              }
              
              // Check if table was re-rendered
              if (node.tagName === 'TABLE' || node.querySelector('table')) {
                needsFix = true;
              }
            }
          });
        }
      });
      
      if (needsFix) {
        console.log('🔄 Content changed, re-applying fixes...');
        setTimeout(() => {
          removeEditButtons();
          fixHeaderButtons();
          fixActionColumn();
        }, 100);
      }
    });
    
    observer.observe(container, {
      childList: true,
      subtree: true
    });
    
    console.log('👁️ Monitoring for content changes...');
  }
  
})();
