/**
 * ENHANCED ACTION BUTTONS HANDLER
 * Meningkatkan interaktivitas dan visual feedback untuk tombol aksi
 * Updated: 2026-01-29
 */

(function() {
  'use strict';

  // Inisialisasi saat DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  function init() {
    console.log('🎨 Enhanced Action Buttons initialized');
    enhanceActionButtons();
    
    // Re-enhance setelah tabel di-render ulang
    observeTableChanges();
  }

  function enhanceActionButtons() {
    const actionButtons = document.querySelectorAll('.rs-action-btn');
    
    actionButtons.forEach(btn => {
      // Tambahkan ripple effect
      addRippleEffect(btn);
      
      // Tambahkan visual feedback
      addVisualFeedback(btn);
      
      // Tambahkan keyboard accessibility
      addKeyboardSupport(btn);
    });
    
    console.log(`✅ Enhanced ${actionButtons.length} action buttons`);
  }

  function addRippleEffect(button) {
    button.addEventListener('click', function(e) {
      const ripple = document.createElement('span');
      const rect = button.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const x = e.clientX - rect.left - size / 2;
      const y = e.clientY - rect.top - size / 2;
      
      ripple.style.cssText = `
        position: absolute;
        width: ${size}px;
        height: ${size}px;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.6);
        left: ${x}px;
        top: ${y}px;
        pointer-events: none;
        animation: ripple-animation 0.6s ease-out;
      `;
      
      button.style.position = 'relative';
      button.style.overflow = 'hidden';
      button.appendChild(ripple);
      
      setTimeout(() => ripple.remove(), 600);
    });
    
    // Tambahkan CSS animation jika belum ada
    if (!document.getElementById('ripple-animation-style')) {
      const style = document.createElement('style');
      style.id = 'ripple-animation-style';
      style.textContent = `
        @keyframes ripple-animation {
          from {
            transform: scale(0);
            opacity: 1;
          }
          to {
            transform: scale(2);
            opacity: 0;
          }
        }
      `;
      document.head.appendChild(style);
    }
  }

  function addVisualFeedback(button) {
    const action = button.getAttribute('data-action');
    
    // Tambahkan icon yang lebih jelas
    const icon = button.querySelector('i');
    if (icon) {
      // Pastikan icon terlihat dengan jelas
      icon.style.display = 'block';
      icon.style.lineHeight = '1';
      
      // Tambahkan label text untuk clarity (opsional, bisa di-comment jika tidak diinginkan)
      if (button.offsetWidth > 60) {
        const label = document.createElement('span');
        label.style.cssText = 'margin-left: 6px; font-size: 0.75rem; font-weight: 600;';
        
        switch(action) {
          case 'view':
            label.textContent = 'Detail';
            break;
          case 'edit':
            label.textContent = 'Edit';
            break;
          case 'delete':
            label.textContent = 'Hapus';
            break;
        }
        
        if (!button.querySelector('span')) {
          button.appendChild(label);
        }
      }
    }
    
    // Tambahkan hover sound effect (opsional)
    button.addEventListener('mouseenter', function() {
      // Bisa ditambahkan sound effect di sini jika diinginkan
      this.style.transform = 'translateY(-3px) scale(1.05)';
    });
    
    button.addEventListener('mouseleave', function() {
      this.style.transform = '';
    });
  }

  function addKeyboardSupport(button) {
    // Pastikan button bisa diakses dengan keyboard
    if (!button.hasAttribute('tabindex')) {
      button.setAttribute('tabindex', '0');
    }
    
    button.addEventListener('keydown', function(e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        this.click();
      }
    });
  }

  function observeTableChanges() {
    const container = document.getElementById('rencana-strategis-content');
    if (!container) return;
    
    const observer = new MutationObserver(function(mutations) {
      mutations.forEach(function(mutation) {
        if (mutation.addedNodes.length > 0) {
          // Re-enhance buttons setelah tabel di-render ulang
          setTimeout(enhanceActionButtons, 100);
        }
      });
    });
    
    observer.observe(container, {
      childList: true,
      subtree: true
    });
    
    console.log('👀 Observing table changes for action buttons');
  }

  // Export untuk digunakan di module lain
  window.ActionButtonsEnhancer = {
    enhance: enhanceActionButtons,
    init: init
  };

})();
