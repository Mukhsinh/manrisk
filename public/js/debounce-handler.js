/**
 * Debounce Handler
 * Mencegah double-click dan multiple executions pada button handlers
 */

class DebounceHandler {
  constructor() {
    this.pendingOperations = new Map();
    this.defaultDelay = 300; // 300ms default delay
  }

  /**
   * Debounce function wrapper
   * @param {Function} func - Function yang akan di-debounce
   * @param {number} delay - Delay dalam milliseconds
   * @returns {Function} Debounced function
   */
  debounce(func, delay = this.defaultDelay) {
    let timeoutId;
    
    return function debounced(...args) {
      const context = this;
      
      // Clear timeout sebelumnya
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      
      // Set timeout baru
      timeoutId = setTimeout(() => {
        func.apply(context, args);
      }, delay);
    };
  }

  /**
   * Throttle function wrapper
   * Membatasi eksekusi function ke maksimal 1x per delay period
   * @param {Function} func - Function yang akan di-throttle
   * @param {number} delay - Delay dalam milliseconds
   * @returns {Function} Throttled function
   */
  throttle(func, delay = this.defaultDelay) {
    let lastCall = 0;
    
    return function throttled(...args) {
      const now = Date.now();
      
      if (now - lastCall >= delay) {
        lastCall = now;
        return func.apply(this, args);
      }
    };
  }

  /**
   * Prevent double-click pada button
   * @param {HTMLElement} button - Button element
   * @param {Function} handler - Click handler
   * @param {number} delay - Delay dalam milliseconds
   */
  preventDoubleClick(button, handler, delay = this.defaultDelay) {
    if (!button || !handler) {
      console.warn('DebounceHandler: Invalid button or handler');
      return;
    }

    const buttonId = button.id || button.dataset.action || 'button-' + Math.random();
    
    // Wrap handler dengan debounce
    const debouncedHandler = this.debounce(async (event) => {
      // Cek apakah button sedang dalam proses
      if (this.pendingOperations.has(buttonId)) {
        console.log(`DebounceHandler: Operation already in progress for ${buttonId}`);
        return;
      }

      try {
        // Tandai operation sebagai pending
        this.pendingOperations.set(buttonId, true);
        
        // Disable button
        button.disabled = true;
        button.classList.add('processing');
        
        // Execute handler
        await handler.call(button, event);
        
      } catch (error) {
        console.error('DebounceHandler: Error in handler', error);
        throw error;
        
      } finally {
        // Cleanup
        this.pendingOperations.delete(buttonId);
        button.disabled = false;
        button.classList.remove('processing');
      }
    }, delay);

    // Attach debounced handler
    button.addEventListener('click', debouncedHandler);
    
    return debouncedHandler;
  }

  /**
   * Prevent multiple submissions pada form
   * @param {HTMLFormElement} form - Form element
   * @param {Function} handler - Submit handler
   * @param {number} delay - Delay dalam milliseconds
   */
  preventMultipleSubmit(form, handler, delay = this.defaultDelay) {
    if (!form || !handler) {
      console.warn('DebounceHandler: Invalid form or handler');
      return;
    }

    const formId = form.id || 'form-' + Math.random();
    
    const debouncedHandler = this.debounce(async (event) => {
      event.preventDefault();
      
      // Cek apakah form sedang dalam proses
      if (this.pendingOperations.has(formId)) {
        console.log(`DebounceHandler: Form submission already in progress for ${formId}`);
        return;
      }

      try {
        // Tandai operation sebagai pending
        this.pendingOperations.set(formId, true);
        
        // Disable submit button
        const submitButton = form.querySelector('[type="submit"]');
        if (submitButton) {
          submitButton.disabled = true;
          submitButton.classList.add('processing');
        }
        
        // Execute handler
        await handler.call(form, event);
        
      } catch (error) {
        console.error('DebounceHandler: Error in form handler', error);
        throw error;
        
      } finally {
        // Cleanup
        this.pendingOperations.delete(formId);
        
        const submitButton = form.querySelector('[type="submit"]');
        if (submitButton) {
          submitButton.disabled = false;
          submitButton.classList.remove('processing');
        }
      }
    }, delay);

    // Attach debounced handler
    form.addEventListener('submit', debouncedHandler);
    
    return debouncedHandler;
  }

  /**
   * Apply debouncing ke semua buttons dengan selector tertentu
   * @param {string} selector - CSS selector untuk buttons
   * @param {number} delay - Delay dalam milliseconds
   */
  applyToButtons(selector = 'button[data-debounce="true"]', delay = this.defaultDelay) {
    const buttons = document.querySelectorAll(selector);
    
    buttons.forEach(button => {
      // Skip jika sudah di-debounce
      if (button.dataset.debounced === 'true') {
        return;
      }

      // Get existing click handler
      const existingHandler = button.onclick;
      
      if (existingHandler) {
        // Remove existing handler
        button.onclick = null;
        
        // Apply debounced handler
        this.preventDoubleClick(button, existingHandler, delay);
        
        // Mark as debounced
        button.dataset.debounced = 'true';
      }
    });
    
    console.log(`DebounceHandler: Applied debouncing to ${buttons.length} buttons`);
  }

  /**
   * Clear pending operation
   * @param {string} operationId - Operation ID
   */
  clearPendingOperation(operationId) {
    this.pendingOperations.delete(operationId);
  }

  /**
   * Clear all pending operations
   */
  clearAllPendingOperations() {
    this.pendingOperations.clear();
  }

  /**
   * Check if operation is pending
   * @param {string} operationId - Operation ID
   * @returns {boolean}
   */
  isPending(operationId) {
    return this.pendingOperations.has(operationId);
  }
}

// Export untuk digunakan di module lain
if (typeof module !== 'undefined' && module.exports) {
  module.exports = DebounceHandler;
}

// Global instance
window.DebounceHandler = DebounceHandler;
window.debounceHandler = new DebounceHandler();

console.log('✅ DebounceHandler loaded');
