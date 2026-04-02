/**
 * BUTTON SYSTEM INTEGRATION
 * Menggabungkan semua sistem button handling menjadi satu
 * 
 * Include order:
 * 1. button-stubs.js (stub functions)
 * 2. button-error-handler.js (error handling)
 * 3. async-button-handler.js (async operations)
 * 4. button-system-integration.js (this file)
 */

(function() {
  'use strict';

  console.log('🚀 Initializing Button System Integration...');

  // ============================================
  // SYSTEM CHECK
  // ============================================
  
  function checkDependencies() {
    const required = [
      'ButtonErrorHandler',
      'ButtonStateManager',
      'AsyncButtonWrapper',
      'ErrorDisplay'
    ];

    const missing = required.filter(dep => !window[dep]);
    
    if (missing.length > 0) {
      console.warn('⚠️ Missing dependencies:', missing);
      console.warn('Please include all required scripts:');
      console.warn('- button-stubs.js');
      console.warn('- button-error-handler.js');
      console.warn('- async-button-handler.js');
      return false;
    }

    return true;
  }

  // ============================================
  // INTEGRATION STATISTICS
  // ============================================
  
  class ButtonSystemStats {
    constructor() {
      this.stats = {
        totalButtons: 0,
        wrappedButtons: 0,
        asyncButtons: 0,
        errorsHandled: 0,
        clicksLogged: 0
      };
    }

    increment(key) {
      if (this.stats.hasOwnProperty(key)) {
        this.stats[key]++;
      }
    }

    getStats() {
      return { ...this.stats };
    }

    printStats() {
      console.log('📊 Button System Statistics:');
      console.table(this.stats);
    }
  }

  const stats = new ButtonSystemStats();

  // ============================================
  // BUTTON SYSTEM INTEGRATION CLASS
  // ============================================
  
  class ButtonSystemIntegration {
    static wrapAllButtons() {
      return ComprehensiveButtonWrapper.wrapAll();
    }

    static setupGlobalDelegation() {
      return new GlobalButtonDelegation();
    }

    static registerCommonHandlers(delegation) {
      Object.keys(commonHandlers).forEach(action => {
        delegation.register(action, commonHandlers[action]);
      });
    }
  }

  // ============================================
  // COMPREHENSIVE BUTTON WRAPPER
  // ============================================
  
  class ComprehensiveButtonWrapper {
    static wrapAll() {
      const buttons = document.querySelectorAll('button');
      stats.stats.totalButtons = buttons.length;

      buttons.forEach(button => {
        this.wrapButton(button);
      });

      console.log(`✅ Wrapped ${stats.stats.wrappedButtons} of ${stats.stats.totalButtons} buttons`);
    }

    static wrapButton(button) {
      // Skip if already wrapped
      if (button.dataset.wrapped === 'true') {
        return;
      }

      // Get handler
      const handler = button.onclick;
      if (!handler) {
        // No handler - check if it needs one
        if (!button.disabled && button.type !== 'submit') {
          console.warn('Button without handler:', button);
        }
        return;
      }

      // Determine if async
      const isAsync = window.AsyncOperationDetector?.isAsync(handler) ||
                     window.AsyncOperationDetector?.isAsyncAction(
                       button.dataset.action || button.id || ''
                     );

      // Wrap with appropriate handler
      if (isAsync) {
        button.onclick = window.AsyncButtonWrapper.wrapAsync(
          handler,
          button,
          {
            loadingText: button.dataset.loadingText || 'Loading...',
            successMessage: button.dataset.successMessage,
            errorMessage: button.dataset.errorMessage
          }
        );
        stats.increment('asyncButtons');
      } else {
        button.onclick = window.ButtonErrorHandler.wrapSync(
          handler,
          { button }
        );
      }

      // Mark as wrapped
      button.dataset.wrapped = 'true';
      stats.increment('wrappedButtons');

      // Add click logging
      this.addClickLogging(button);
    }

    static addClickLogging(button) {
      button.addEventListener('click', function(e) {
        const logData = {
          timestamp: new Date().toISOString(),
          buttonId: this.id || 'unnamed',
          buttonText: this.textContent.trim(),
          action: this.dataset.action || 'unknown',
          page: window.location.pathname
        };

        console.log('🖱️ Button clicked:', logData);
        stats.increment('clicksLogged');

        // TODO: Send to analytics service
        // sendToAnalytics(logData);
      });
    }
  }

  // ============================================
  // GLOBAL EVENT DELEGATION
  // ============================================
  
  class GlobalButtonDelegation {
    constructor() {
      this.handlers = new Map();
      this.init();
    }

    init() {
      // Setup global click listener
      document.addEventListener('click', (e) => {
        const button = e.target.closest('button');
        if (!button) return;

        // Handle data-action pattern
        const action = button.dataset.action;
        if (action && this.handlers.has(action)) {
          e.preventDefault();
          const handler = this.handlers.get(action);
          handler.call(button, e);
        }
      });

      console.log('✅ Global button delegation initialized');
    }

    register(action, handler) {
      this.handlers.set(action, handler);
      console.log(`✅ Registered handler for action: ${action}`);
    }

    unregister(action) {
      this.handlers.delete(action);
    }

    getHandler(action) {
      return this.handlers.get(action);
    }
  }

  // ============================================
  // COMMON ACTION HANDLERS
  // ============================================
  
  const commonHandlers = {
    // Modal actions
    closeModal: function(modalId) {
      const modal = document.getElementById(modalId);
      if (modal) {
        modal.style.display = 'none';
        modal.classList.remove('show');
      }
    },

    showModal: function(modalId) {
      const modal = document.getElementById(modalId);
      if (modal) {
        modal.style.display = 'block';
        modal.classList.add('show');
      }
    },

    // Data actions
    refreshData: async function() {
      console.log('Refreshing data...');
      // TODO: Implement actual refresh logic
      await new Promise(resolve => setTimeout(resolve, 1000));
      window.ErrorDisplay?.showSuccess('Data berhasil di-refresh!');
    },

    // Navigation actions
    goBack: function() {
      window.history.back();
    },

    goHome: function() {
      window.location.href = '/';
    },

    // Form actions
    resetForm: function(formId) {
      const form = document.getElementById(formId);
      if (form) {
        form.reset();
      }
    }
  };

  // ============================================
  // INITIALIZATION
  // ============================================
  
  function initialize() {
    // Check dependencies
    if (!checkDependencies()) {
      console.error('❌ Cannot initialize: missing dependencies');
      return;
    }

    // Initialize global delegation
    const delegation = new GlobalButtonDelegation();

    // Register common handlers
    Object.keys(commonHandlers).forEach(action => {
      delegation.register(action, commonHandlers[action]);
    });

    // Wrap all existing buttons
    ComprehensiveButtonWrapper.wrapAll();

    // Setup mutation observer for dynamic buttons
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === 1) {
            if (node.tagName === 'BUTTON') {
              ComprehensiveButtonWrapper.wrapButton(node);
            }
            node.querySelectorAll?.('button').forEach(btn => {
              ComprehensiveButtonWrapper.wrapButton(btn);
            });
          }
        });
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    // Print stats after 2 seconds
    setTimeout(() => {
      stats.printStats();
    }, 2000);

    console.log('✅ Button System Integration complete!');
  }

  // ============================================
  // EXPORT TO GLOBAL SCOPE
  // ============================================
  
  window.ButtonSystemStats = stats;
  window.ButtonSystemIntegration = ButtonSystemIntegration;
  window.GlobalButtonDelegation = GlobalButtonDelegation;
  window.ComprehensiveButtonWrapper = ComprehensiveButtonWrapper;
  window.commonButtonHandlers = commonHandlers;
  window.wrapAllButtons = () => ComprehensiveButtonWrapper.wrapAll();
  window.setupGlobalDelegation = () => new GlobalButtonDelegation();
  window.registerCommonHandlers = (delegation) => {
    Object.keys(commonHandlers).forEach(action => {
      delegation.register(action, commonHandlers[action]);
    });
  };

  // ============================================
  // AUTO-INITIALIZE
  // ============================================
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
  } else {
    initialize();
  }

})();
