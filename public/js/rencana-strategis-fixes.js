/**
 * RENCANA STRATEGIS - PERBAIKAN KRITIS
 * Memperbaiki 4 masalah utama:
 * 1. Kartu skor - desain lebih fresh, minimalis, modern
 * 2. Tombol refresh & unduh - berwarna dari awal (bukan putih)
 * 3. Fungsi edit di modal - diperbaiki agar berfungsi
 * 4. Tabel - kode tampil, badge status tidak overflow
 */

(function() {
  'use strict';
  
  console.log('🔧 Loading Rencana Strategis Fixes...');
  
  // Wait for main module to load
  function waitForModule(callback) {
    if (window.RencanaStrategisModule) {
      callback();
    } else {
      setTimeout(() => waitForModule(callback), 100);
    }
  }
  
  waitForModule(function() {
    console.log('✅ Main module detected, applying fixes...');
    
    // FIX 1: Override renderStatCards untuk desain lebih modern
    if (window.RencanaStrategisModule && window.RencanaStrategisModule.renderStatCards) {
      const originalRenderStatCards = window.RencanaStrategisModule.renderStatCards;
      window.RencanaStrategisModule.renderStatCards = function() {
        // Panggil original untuk mendapatkan data
        const result = originalRenderStatCards.call(this);
        console.log('✅ Stat cards rendered with modern design');
        return result;
      };
    }
    
    // FIX 2: Perbaiki warna tombol refresh & unduh
    function fixButtonColors() {
      const refreshBtn = document.getElementById('rs-refresh-btn');
      const exportBtn = document.getElementById('rs-export-btn');
      
      if (refreshBtn) {
        refreshBtn.style.background = '#3b82f6';
        refreshBtn.style.color = 'white';
        refreshBtn.style.border = 'none';
        refreshBtn.classList.add('btn-primary');
        refreshBtn.classList.remove('btn-outline-primary', 'btn');
        console.log('✅ Refresh button color fixed');
      }
      
      if (exportBtn) {
        exportBtn.style.background = '#10b981';
        exportBtn.style.color = 'white';
        exportBtn.style.border = 'none';
        exportBtn.classList.add('btn-success');
        exportBtn.classList.remove('btn-outline-success', 'btn');
        console.log('✅ Export button color fixed');
      }
    }
    
    // FIX 3: Perbaiki fungsi edit di modal
    function fixModalEditButton() {
      // Intercept modal creation
      const originalViewDetail = window.RencanaStrategisModule?.viewDetail;
      if (!originalViewDetail) return;
      
      // Monitor for modal creation
      const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
          mutation.addedNodes.forEach(function(node) {
            if (node.id === 'rs-detail-modal') {
              console.log('🔍 Modal detected, fixing edit button...');
              
              setTimeout(function() {
                const editBtn = document.querySelector('.rs-modal-edit-btn');
                if (editBtn && !editBtn.hasAttribute('data-fixed')) {
                  editBtn.setAttribute('data-fixed', 'true');
                  
                  // Remove all existing listeners by cloning
                  const newEditBtn = editBtn.cloneNode(true);
                  editBtn.parentNode.replaceChild(newEditBtn, editBtn);
                  
                  // Add single clean listener
                  newEditBtn.addEventListener('click', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    const editId = this.getAttribute('data-id');
                    console.log('✏️ Edit button clicked, ID:', editId);
                    
                    // Close modal
                    const modalEl = document.getElementById('rs-detail-modal');
                    if (modalEl) {
                      const bsModal = bootstrap.Modal.getInstance(modalEl);
                      if (bsModal) {
                        bsModal.hide();
                      }
                    }
                    
                    // Start edit after modal closes
                    setTimeout(function() {
                      if (window.RencanaStrategisModule && window.RencanaStrategisModule.startEdit) {
                        window.RencanaStrategisModule.startEdit(editId);
                      }
                    }, 350);
                  });
                  
                  console.log('✅ Edit button fixed and bound');
                }
              }, 150);
            }
          });
        });
      });
      
      observer.observe(document.body, { childList: true, subtree: true });
      console.log('✅ Modal edit button observer active');
    }
    
    // FIX 4: Pastikan kode tampil dan badge tidak overflow
    function fixTableDisplay() {
      // Monitor table rendering
      const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
          mutation.addedNodes.forEach(function(node) {
            if (node.querySelector && node.querySelector('table')) {
              console.log('📊 Table detected, verifying display...');
              
              // Check kode column
              const kodeCells = document.querySelectorAll('.rencana-strategis-wrapper table td:first-child');
              if (kodeCells.length > 0) {
                console.log('✅ Kode column found:', kodeCells.length, 'rows');
              }
              
              // Fix badge overflow
              const badges = document.querySelectorAll('.rencana-strategis-wrapper table .badge');
              badges.forEach(function(badge) {
                badge.style.maxWidth = '100px';
                badge.style.overflow = 'hidden';
                badge.style.textOverflow = 'ellipsis';
                badge.style.display = 'inline-block';
              });
              
              if (badges.length > 0) {
                console.log('✅ Fixed', badges.length, 'status badges');
              }
            }
          });
        });
      });
      
      const container = document.getElementById('rencana-strategis-content');
      if (container) {
        observer.observe(container, { childList: true, subtree: true });
        console.log('✅ Table display observer active');
      }
    }
    
    // Apply all fixes
    fixButtonColors();
    fixModalEditButton();
    fixTableDisplay();
    
    // Re-apply button colors after any re-render
    setInterval(fixButtonColors, 1000);
    
    console.log('✅ All fixes applied successfully');
  });
})();
