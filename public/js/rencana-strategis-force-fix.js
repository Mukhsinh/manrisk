
/* Cache-busted: 2026-03-31T02:15:20.498Z */
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
    
    // Fix 4: Monitor for dynamic content changes
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
    // Fix Refresh button - BIRU CERAH SOLID
    const refreshBtn = document.querySelector('#rs-refresh-btn, .btn-primary[title*="Refresh"]');
    if (refreshBtn) {
      refreshBtn.style.cssText = `
        background: #3b82f6 !important;
        border: none !important;
        color: white !important;
        min-width: 48px !important;
        min-height: 48px !important;
        max-width: 48px !important;
        max-height: 48px !important;
        border-radius: 12px !important;
        padding: 0 !important;
        font-size: 0 !important;
        display: inline-flex !important;
        align-items: center !important;
        justify-content: center !important;
        box-shadow: 0 6px 16px rgba(59, 130, 246, 0.4) !important;
        transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1) !important;
        cursor: pointer !important;
      `;
      
      // Ensure icon is visible
      const icon = refreshBtn.querySelector('i');
      if (icon) {
        icon.style.cssText = `
          font-size: 1.3rem !important;
          color: white !important;
          margin: 0 !important;
        `;
      }
      
      // Add hover effect
      refreshBtn.addEventListener('mouseenter', function() {
        this.style.background = '#2563eb !important';
        this.style.transform = 'translateY(-3px) scale(1.08) !important';
        this.style.boxShadow = '0 8px 20px rgba(59, 130, 246, 0.5) !important';
      });
      
      refreshBtn.addEventListener('mouseleave', function() {
        this.style.background = '#3b82f6 !important';
        this.style.transform = 'translateY(0) scale(1) !important';
        this.style.boxShadow = '0 6px 16px rgba(59, 130, 246, 0.4) !important';
      });
      
      console.log('✅ Fixed Refresh button - BIRU CERAH SOLID');
    }
    
    // Fix Export button - HIJAU CERAH SOLID
    const exportBtn = document.querySelector('#rs-export-btn, .btn-success[title*="Unduh"]');
    if (exportBtn) {
      exportBtn.style.cssText = `
        background: #10b981 !important;
        border: none !important;
        color: white !important;
        min-width: 48px !important;
        min-height: 48px !important;
        max-width: 48px !important;
        max-height: 48px !important;
        border-radius: 12px !important;
        padding: 0 !important;
        font-size: 0 !important;
        display: inline-flex !important;
        align-items: center !important;
        justify-content: center !important;
        box-shadow: 0 6px 16px rgba(16, 185, 129, 0.4) !important;
        transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1) !important;
        cursor: pointer !important;
      `;
      
      // Ensure icon is visible
      const icon = exportBtn.querySelector('i');
      if (icon) {
        icon.style.cssText = `
          font-size: 1.3rem !important;
          color: white !important;
          margin: 0 !important;
        `;
      }
      
      // Add hover effect
      exportBtn.addEventListener('mouseenter', function() {
        this.style.background = '#059669 !important';
        this.style.transform = 'translateY(-3px) scale(1.08) !important';
        this.style.boxShadow = '0 8px 20px rgba(16, 185, 129, 0.5) !important';
      });
      
      exportBtn.addEventListener('mouseleave', function() {
        this.style.background = '#10b981 !important';
        this.style.transform = 'translateY(0) scale(1) !important';
        this.style.boxShadow = '0 6px 16px rgba(16, 185, 129, 0.4) !important';
      });
      
      console.log('✅ Fixed Export button - HIJAU CERAH SOLID');
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
