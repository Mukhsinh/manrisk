/**
 * Modal Button Handler
 * Menangani semua tombol di dalam modal dengan konsisten
 */

class ModalButtonHandler {
  constructor() {
    this.activeModals = new Map();
    this.init();
  }

  init() {
    // Setup global event delegation untuk modal buttons
    document.addEventListener('click', (e) => {
      const closeBtn = e.target.closest('[data-dismiss="modal"], .modal-close, .btn-close');
      if (closeBtn) {
        e.preventDefault();
        this.handleCloseButton(closeBtn);
      }

      const saveBtn = e.target.closest('[data-action="modal-save"]');
      if (saveBtn) {
        e.preventDefault();
        this.handleSaveButton(saveBtn);
      }
    });

    // Setup backdrop click handler
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('modal') && e.target.style.display !== 'none') {
        this.closeModal(e.target);
      }
    });

    // Setup ESC key handler
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        const topModal = this.getTopModal();
        if (topModal) {
          this.closeModal(topModal);
        }
      }
    });
  }

  /**
   * Handle close button click
   */
  handleCloseButton(button) {
    try {
      const modal = button.closest('.modal');
      if (modal) {
        this.closeModal(modal);
      }
    } catch (error) {
      console.error('Error closing modal:', error);
      this.showError('Gagal menutup modal');
    }
  }

  /**
   * Handle save button click
   */
  handleSaveButton(button) {
    try {
      const modal = button.closest('.modal');
      if (!modal) return;

      const form = modal.querySelector('form');
      if (form) {
        // Trigger form validation
        if (!form.checkValidity()) {
          form.reportValidity();
          return;
        }

        // Get save handler from button data attribute
        const saveHandler = button.dataset.saveHandler;
        if (saveHandler && typeof window[saveHandler] === 'function') {
          this.executeSaveHandler(button, modal, window[saveHandler]);
        } else {
          console.warn('No save handler found for modal');
          this.closeModal(modal);
        }
      } else {
        this.closeModal(modal);
      }
    } catch (error) {
      console.error('Error saving modal:', error);
      this.showError('Gagal menyimpan data');
    }
  }

  /**
   * Save modal (alias for handleSaveButton)
   */
  saveModal(modal) {
    const saveButton = modal.querySelector('[data-action="modal-save"]');
    if (saveButton) {
      this.handleSaveButton(saveButton);
    }
  }

  /**
   * Execute save handler with loading state
   */
  async executeSaveHandler(button, modal, handler) {
    // Set loading state
    button.disabled = true;
    button.classList.add('loading');
    const originalText = button.textContent;
    button.textContent = 'Menyimpan...';

    try {
      const form = modal.querySelector('form');
      const formData = form ? new FormData(form) : null;
      
      // Execute handler
      const result = await handler(formData);
      
      if (result && result.success !== false) {
        this.showSuccess('Data berhasil disimpan');
        this.closeModal(modal);
        
        // Trigger refresh if needed
        if (typeof window.refreshData === 'function') {
          window.refreshData();
        }
      } else {
        this.showError(result?.message || 'Gagal menyimpan data');
      }
    } catch (error) {
      console.error('Save handler error:', error);
      this.showError('Terjadi kesalahan saat menyimpan data');
    } finally {
      // Reset button state
      button.disabled = false;
      button.classList.remove('loading');
      button.textContent = originalText;
    }
  }

  /**
   * Close modal
   */
  closeModal(modal) {
    if (!modal) return;

    try {
      // Trigger beforeClose event
      const beforeCloseEvent = new CustomEvent('modal:beforeClose', {
        detail: { modal },
        cancelable: true
      });
      
      if (!modal.dispatchEvent(beforeCloseEvent)) {
        return; // Cancelled
      }

      // Hide modal
      modal.style.display = 'none';
      modal.classList.remove('show');
      
      // Remove backdrop
      const backdrop = document.querySelector('.modal-backdrop');
      if (backdrop) {
        backdrop.remove();
      }

      // Remove from active modals
      this.activeModals.delete(modal);

      // Cleanup
      this.cleanupModal(modal);

      // Trigger afterClose event
      modal.dispatchEvent(new CustomEvent('modal:afterClose', {
        detail: { modal }
      }));

      // Restore body scroll if no more modals
      if (this.activeModals.size === 0) {
        document.body.classList.remove('modal-open');
        document.body.style.overflow = '';
      }
    } catch (error) {
      console.error('Error closing modal:', error);
    }
  }

  /**
   * Open modal
   */
  openModal(modal) {
    if (!modal) return;

    try {
      // Add to active modals
      this.activeModals.set(modal, {
        openedAt: Date.now()
      });

      // Show modal
      modal.style.display = 'block';
      modal.classList.add('show');

      // Add backdrop
      if (!document.querySelector('.modal-backdrop')) {
        const backdrop = document.createElement('div');
        backdrop.className = 'modal-backdrop fade show';
        document.body.appendChild(backdrop);
      }

      // Prevent body scroll
      document.body.classList.add('modal-open');
      document.body.style.overflow = 'hidden';

      // Focus first input
      setTimeout(() => {
        const firstInput = modal.querySelector('input:not([type="hidden"]), textarea, select');
        if (firstInput) {
          firstInput.focus();
        }
      }, 100);

      // Trigger opened event
      modal.dispatchEvent(new CustomEvent('modal:opened', {
        detail: { modal }
      }));
    } catch (error) {
      console.error('Error opening modal:', error);
    }
  }

  /**
   * Cleanup modal to prevent memory leaks
   */
  cleanupModal(modal) {
    try {
      // Clear form data
      const form = modal.querySelector('form');
      if (form) {
        form.reset();
        
        // Remove event listeners from form
        const clonedForm = form.cloneNode(true);
        form.parentNode.replaceChild(clonedForm, form);
      }

      // Clear any dynamic content
      const dynamicContent = modal.querySelectorAll('[data-dynamic]');
      dynamicContent.forEach(el => {
        el.innerHTML = '';
      });

      // Remove any temporary event listeners by cloning and replacing
      const buttons = modal.querySelectorAll('button[data-temp-listener]');
      buttons.forEach(button => {
        const clonedButton = button.cloneNode(true);
        button.parentNode.replaceChild(clonedButton, button);
      });
    } catch (error) {
      console.error('Error cleaning up modal:', error);
    }
  }

  /**
   * Remove event listener (helper for cleanup)
   */
  removeEventListener(element, eventType, handler) {
    if (element && eventType && handler) {
      element.removeEventListener(eventType, handler);
    }
  }

  /**
   * Get top-most modal
   */
  getTopModal() {
    const modals = Array.from(this.activeModals.keys());
    return modals[modals.length - 1];
  }

  /**
   * Show success message
   */
  showSuccess(message) {
    if (typeof window.showNotification === 'function') {
      window.showNotification(message, 'success');
    } else {
      alert(message);
    }
  }

  /**
   * Show error message
   */
  showError(message) {
    if (typeof window.showNotification === 'function') {
      window.showNotification(message, 'error');
    } else {
      alert(message);
    }
  }
}

// Initialize modal button handler
if (typeof window !== 'undefined') {
  window.modalButtonHandler = new ModalButtonHandler();
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ModalButtonHandler;
}
