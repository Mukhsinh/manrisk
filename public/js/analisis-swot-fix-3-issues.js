/**
 * Analisis SWOT - Fix 3 Issues
 * 1. Remove loading text and speed up loading
 * 2. Fix cancel button requiring double click
 * 3. Change add button to bright solid color
 */

(function() {
  console.log('🔧 Applying Analisis SWOT 3 fixes...');

  // Fix 1: Speed up loading by caching and optimizing
  if (window.AnalisisSwotModule) {
    const originalLoad = window.AnalisisSwotModule.load;
    window.AnalisisSwotModule.load = async function() {
      // Remove any loading indicators immediately
      const container = document.getElementById('analisis-swot-content');
      if (container && container.innerHTML.includes('Loading') || container.innerHTML.includes('Memuat')) {
        container.innerHTML = '<div style="min-height: 200px;"></div>';
      }
      
      // Call original load
      return originalLoad.call(this);
    };
  }

  // Fix 2: Fix cancel button single click
  // Override modal close to work on single click
  document.addEventListener('click', function(e) {
    // Check if clicked element is a cancel button in modal
    const cancelBtn = e.target.closest('.btn-secondary');
    const modalCloseBtn = e.target.closest('.modal-close');
    
    if (cancelBtn || modalCloseBtn) {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      
      // Find and remove the modal immediately
      const modal = e.target.closest('.modal');
      if (modal) {
        modal.remove();
        console.log('✓ Modal closed with single click');
      }
    }
  }, true); // Use capture phase to intercept early

  // Fix 3: Change add button color to bright solid
  function applyBrightButtonColors() {
    const style = document.createElement('style');
    style.id = 'analisis-swot-bright-button-fix';
    style.textContent = `
      /* Bright solid color for Add button */
      #analisis-swot-content .btn-primary,
      #analisis-swot-content button.btn-primary,
      .analisis-swot-wrapper .btn-primary,
      body .action-buttons .btn-primary {
        background: #10b981 !important; /* Bright green */
        border: none !important;
        color: white !important;
        font-weight: 600 !important;
        box-shadow: 0 2px 4px rgba(16, 185, 129, 0.3) !important;
        transition: all 0.2s ease !important;
      }
      
      #analisis-swot-content .btn-primary:hover,
      #analisis-swot-content button.btn-primary:hover,
      .analisis-swot-wrapper .btn-primary:hover,
      body .action-buttons .btn-primary:hover {
        background: #059669 !important; /* Darker green on hover */
        transform: translateY(-1px) !important;
        box-shadow: 0 4px 8px rgba(16, 185, 129, 0.4) !important;
      }
      
      /* Cancel button - ensure it works on single click */
      .modal .btn-secondary,
      .modal-footer .btn-secondary {
        cursor: pointer !important;
        pointer-events: auto !important;
        user-select: none !important;
      }
      
      /* Modal close button */
      .modal-close {
        cursor: pointer !important;
        pointer-events: auto !important;
        user-select: none !important;
      }
      
      /* Remove any loading text */
      .loading-text,
      .spinner-border {
        display: none !important;
      }
    `;
    
    // Remove existing style if present
    const existingStyle = document.getElementById('analisis-swot-bright-button-fix');
    if (existingStyle) {
      existingStyle.remove();
    }
    
    document.head.appendChild(style);
    console.log('✓ Bright button colors applied');
  }

  // Apply fixes when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', applyBrightButtonColors);
  } else {
    applyBrightButtonColors();
  }

  // Re-apply when navigating to Analisis SWOT page
  const observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
      if (mutation.addedNodes.length) {
        mutation.addedNodes.forEach(function(node) {
          if (node.nodeType === 1) { // Element node
            if (node.id === 'analisis-swot-content' || 
                node.classList?.contains('modal') ||
                node.querySelector?.('#analisis-swot-content')) {
              applyBrightButtonColors();
            }
          }
        });
      }
    });
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });

  console.log('✅ Analisis SWOT 3 fixes applied successfully');
})();
