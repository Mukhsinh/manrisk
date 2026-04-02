/**
 * ASYNC BUTTON HANDLER
 * Automatically detect and handle async button operations with loading states
 */

(function() {
  'use strict';

  // ============================================
  // ASYNC OPERATION DETECTOR
  // ============================================
  
  class AsyncOperationDetector {
    /**
     * Check if a function is async or returns a Promise
     */
    static isAsync(fn) {
      if (!fn) return false;
      
      // Check if it's an async function
      if (fn.constructor.name === 'AsyncFunction') {
        return true;
      }
      
      // Check if function name suggests async operation
      const fnString = fn.toString();
      if (fnString.includes('async ') || 
          fnString.includes('await ') ||
          fnString.includes('.then(') ||
          fnString.includes('Promise')) {
        return true;
      }
      
      return false;
    }

    /**
     * Check if button action is likely async based on name
     */
    static isAsyncAction(actionName) {
      const asyncKeywords = [
        'save', 'submit', 'send', 'post', 'put', 'delete',
        'load', 'fetch', 'get', 'download', 'upload',
        'import', 'export', 'generate', 'process',
        'login', 'logout', 'register', 'authenticate'
      ];
      
      const lowerAction = actionName.toLowerCase();
      return asyncKeywords.some(keyword => lowerAction.includes(keyword));
    }
  }

  // ============================================
  // ASYNC BUTTON WRAPPER
  // ============================================
  
  class AsyncButtonWrapper {
    /**
     * Wrap async function with loading state management
     */
    static wrapAsync(fn, button, options = {}) {
      const {
        loadingText = 'Loading...',
        successMessage = null,
        errorMessage = null,
        onSuccess = null,
        onError = null,
        disableOnLoad = true,
        showSpinner = true
      } = options;

      return async function(...args) {
        // Store original state
        const originalText = button.textContent;
        const originalHTML = button.innerHTML;
        const originalDisabled = button.disabled;

        try {
          // Set loading state
          if (disableOnLoad) {
            button.disabled = true;
          }
          
          button.classList.add('loading', 'btn-loading');
          
          if (showSpinner) {
            button.innerHTML = `
              <span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              ${loadingText}
            `;
          } else {
            button.textContent = loadingText;
          }

          // Execute async function
          const result = await fn.apply(this, args);

          // Success handling
          if (successMessage) {
            window.ErrorDisplay?.showSuccess(successMessage);
          }
          
          if (onSuccess) {
            onSuccess(result);
          }

          return result;

        } catch (error) {
          // Error handling
          console.error('Async button error:', error);
          
          if (errorMessage) {
            window.ErrorDisplay?.show(errorMessage);
          } else {
            window.ButtonErrorHandler?.handleError(error, { button });
          }
          
          if (onError) {
            onError(error);
          }

          throw error;

        } finally {
          // Restore original state
          button.classList.remove('loading', 'btn-loading');
          button.innerHTML = originalHTML;
          button.disabled = originalDisabled;
        }
      };
    }

    /**
     * Auto-wrap button handler if it's async
     */
    static autoWrap(button, handler, options = {}) {
      if (AsyncOperationDetector.isAsync(handler)) {
        return this.wrapAsync(handler, button, options);
      }
      
      // Check if action name suggests async
      const actionName = button.dataset.action || 
                        button.getAttribute('onclick') || 
                        button.id || 
                        '';
      
      if (AsyncOperationDetector.isAsyncAction(actionName)) {
        return this.wrapAsync(handler, button, options);
      }
      
      return handler;
    }
  }

  // ============================================
  // GLOBAL ASYNC BUTTON MANAGER
  // ============================================
  
  class AsyncButtonManager {
    constructor() {
      this.buttons = new Map();
      this.init();
    }

    init() {
      // Auto-detect and wrap async buttons
      this.detectAsyncButtons();
      
      // Setup mutation observer for dynamically added buttons
      this.setupMutationObserver();
      
      console.log('✅ Async Button Manager initialized');
    }

    detectAsyncButtons() {
      // Find all buttons with data-async attribute
      document.querySelectorAll('button[data-async="true"]').forEach(button => {
        this.wrapButton(button);
      });

      // Find buttons with async-looking actions
      document.querySelectorAll('button[data-action]').forEach(button => {
        const action = button.dataset.action;
        if (AsyncOperationDetector.isAsyncAction(action)) {
          this.wrapButton(button);
        }
      });

      // Find buttons with async-looking onclick
      document.querySelectorAll('button[onclick]').forEach(button => {
        const onclick = button.getAttribute('onclick');
        if (AsyncOperationDetector.isAsyncAction(onclick)) {
          this.wrapButton(button);
        }
      });
    }

    wrapButton(button) {
      if (this.buttons.has(button)) {
        return; // Already wrapped
      }

      const originalHandler = button.onclick;
      if (originalHandler) {
        button.onclick = AsyncButtonWrapper.autoWrap(button, originalHandler, {
          loadingText: button.dataset.loadingText || 'Loading...',
          successMessage: button.dataset.successMessage || null,
          errorMessage: button.dataset.errorMessage || null
        });
        
        this.buttons.set(button, true);
      }
    }

    setupMutationObserver() {
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === 1) { // Element node
              if (node.tagName === 'BUTTON') {
                this.wrapButton(node);
              }
              // Check children
              node.querySelectorAll?.('button').forEach(btn => {
                this.wrapButton(btn);
              });
            }
          });
        });
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true
      });
    }
  }

  // ============================================
  // HELPER FUNCTIONS
  // ============================================
  
  /**
   * Manually wrap a button with async handling
   */
  function wrapAsyncButton(button, handler, options = {}) {
    return AsyncButtonWrapper.wrapAsync(handler, button, options);
  }

  /**
   * Mark button as async (will be auto-wrapped)
   */
  function markAsAsync(button) {
    button.dataset.async = 'true';
  }

  // ============================================
  // EXPORT TO GLOBAL SCOPE
  // ============================================
  
  window.AsyncButtonWrapper = AsyncButtonWrapper;
  window.AsyncOperationDetector = AsyncOperationDetector;
  window.wrapAsyncButton = wrapAsyncButton;
  window.markAsAsync = markAsAsync;

  // ============================================
  // AUTO-INITIALIZE
  // ============================================
  
  let asyncButtonManager;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      asyncButtonManager = new AsyncButtonManager();
    });
  } else {
    asyncButtonManager = new AsyncButtonManager();
  }

  window.AsyncButtonManager = asyncButtonManager;

})();

// ============================================
// USAGE EXAMPLES
// ============================================

/*

// Example 1: Manually wrap async function
const saveButton = document.getElementById('saveBtn');
saveButton.onclick = wrapAsyncButton(saveButton, async function() {
  await saveData();
}, {
  loadingText: 'Menyimpan...',
  successMessage: 'Data berhasil disimpan!',
  errorMessage: 'Gagal menyimpan data'
});

// Example 2: Mark button as async (auto-wrapped)
const submitButton = document.getElementById('submitBtn');
markAsAsync(submitButton);
submitButton.onclick = async function() {
  await submitForm();
};

// Example 3: Use data attributes in HTML
<button 
  data-async="true"
  data-loading-text="Mengirim..."
  data-success-message="Berhasil dikirim!"
  data-error-message="Gagal mengirim"
  onclick="sendData()">
  Kirim
</button>

// Example 4: Use with data-action pattern
<button 
  data-action="saveData"
  data-async="true">
  Simpan
</button>

*/
