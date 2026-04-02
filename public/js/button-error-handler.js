/**
 * BUTTON ERROR HANDLER SYSTEM
 * Provides comprehensive error handling for all button operations
 */

(function() {
  'use strict';

  // ============================================
  // ERROR TYPES
  // ============================================
  
  const ErrorTypes = {
    HANDLER_NOT_FOUND: 'HANDLER_NOT_FOUND',
    API_ERROR: 'API_ERROR',
    VALIDATION_ERROR: 'VALIDATION_ERROR',
    NETWORK_ERROR: 'NETWORK_ERROR',
    PERMISSION_ERROR: 'PERMISSION_ERROR',
    UNKNOWN_ERROR: 'UNKNOWN_ERROR'
  };

  // ============================================
  // ERROR MESSAGES
  // ============================================
  
  const ErrorMessages = {
    [ErrorTypes.HANDLER_NOT_FOUND]: 'Fungsi tidak ditemukan. Silakan hubungi administrator.',
    [ErrorTypes.API_ERROR]: 'Terjadi kesalahan pada server. Silakan coba lagi.',
    [ErrorTypes.VALIDATION_ERROR]: 'Data tidak valid. Silakan periksa kembali input Anda.',
    [ErrorTypes.NETWORK_ERROR]: 'Koneksi internet bermasalah. Silakan periksa koneksi Anda.',
    [ErrorTypes.PERMISSION_ERROR]: 'Anda tidak memiliki izin untuk melakukan aksi ini.',
    [ErrorTypes.UNKNOWN_ERROR]: 'Terjadi kesalahan. Silakan coba lagi.'
  };

  // ============================================
  // ERROR LOGGER
  // ============================================
  
  class ErrorLogger {
    static log(error, context = {}) {
      const errorLog = {
        timestamp: new Date().toISOString(),
        type: error.type || ErrorTypes.UNKNOWN_ERROR,
        message: error.message,
        stack: error.stack,
        context: {
          button: context.button?.id || context.button?.className || 'unknown',
          action: context.action || 'unknown',
          user: context.user || 'unknown',
          ...context
        }
      };

      // Log to console
      console.error('❌ Button Error:', errorLog);

      // TODO: Send to logging service
      // this.sendToLoggingService(errorLog);

      return errorLog;
    }

    static sendToLoggingService(errorLog) {
      // TODO: Implement logging service integration
      // Example: Send to Sentry, LogRocket, etc.
    }
  }

  // ============================================
  // ERROR CATEGORIZER
  // ============================================
  
  class ErrorCategorizer {
    static categorize(error) {
      if (!error) return ErrorTypes.UNKNOWN_ERROR;

      const message = error.message?.toLowerCase() || '';
      const name = error.name?.toLowerCase() || '';

      // Handler not found
      if (message.includes('is not defined') || 
          message.includes('is not a function')) {
        return ErrorTypes.HANDLER_NOT_FOUND;
      }

      // Network errors
      if (message.includes('network') || 
          message.includes('fetch') ||
          name === 'networkerror') {
        return ErrorTypes.NETWORK_ERROR;
      }

      // API errors
      if (error.status >= 400 && error.status < 600) {
        if (error.status === 403 || error.status === 401) {
          return ErrorTypes.PERMISSION_ERROR;
        }
        return ErrorTypes.API_ERROR;
      }

      // Validation errors
      if (message.includes('validation') || 
          message.includes('invalid')) {
        return ErrorTypes.VALIDATION_ERROR;
      }

      return ErrorTypes.UNKNOWN_ERROR;
    }

    static getUserMessage(error) {
      const type = this.categorize(error);
      return ErrorMessages[type] || ErrorMessages[ErrorTypes.UNKNOWN_ERROR];
    }
  }

  // ============================================
  // ERROR DISPLAY
  // ============================================
  
  class ErrorDisplay {
    static show(message, options = {}) {
      const {
        type = 'error',
        duration = 5000,
        showRetry = false,
        onRetry = null
      } = options;

      // TODO: Implement proper error display (modal, toast, etc)
      // For now, use alert
      console.error('Error Display:', message);
      
      if (showRetry && onRetry) {
        const retry = confirm(`${message}\n\nApakah Anda ingin mencoba lagi?`);
        if (retry) {
          onRetry();
        }
      } else {
        alert(message);
      }
    }

    static showSuccess(message, duration = 3000) {
      // TODO: Implement proper success display
      console.log('Success:', message);
      alert(message);
    }
  }

  // ============================================
  // BUTTON STATE MANAGER
  // ============================================
  
  class ButtonStateManager {
    static setLoading(button, isLoading) {
      if (!button) return;

      if (isLoading) {
        button.disabled = true;
        button.classList.add('loading', 'btn-loading');
        button.dataset.originalText = button.textContent;
        button.dataset.originalHTML = button.innerHTML;
        
        // Add loading spinner
        button.innerHTML = `
          <span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
          Loading...
        `;
      } else {
        button.disabled = false;
        button.classList.remove('loading', 'btn-loading');
        
        // Restore original content
        if (button.dataset.originalHTML) {
          button.innerHTML = button.dataset.originalHTML;
          delete button.dataset.originalHTML;
        } else if (button.dataset.originalText) {
          button.textContent = button.dataset.originalText;
          delete button.dataset.originalText;
        }
      }
    }

    static setDisabled(button, isDisabled, reason = '') {
      if (!button) return;

      button.disabled = isDisabled;
      
      if (isDisabled) {
        button.classList.add('disabled');
        if (reason) {
          button.title = reason;
        }
      } else {
        button.classList.remove('disabled');
        button.title = '';
      }
    }
  }

  // ============================================
  // ERROR HANDLER WRAPPER
  // ============================================
  
  class ButtonErrorHandler {
    /**
     * Wrap synchronous function with error handling
     */
    static wrapSync(fn, context = {}) {
      return function(...args) {
        try {
          return fn.apply(this, args);
        } catch (error) {
          ButtonErrorHandler.handleError(error, context);
        }
      };
    }

    /**
     * Wrap asynchronous function with error handling and loading state
     */
    static wrapAsync(fn, context = {}) {
      return async function(...args) {
        const button = context.button || this;
        
        try {
          ButtonStateManager.setLoading(button, true);
          const result = await fn.apply(this, args);
          return result;
        } catch (error) {
          ButtonErrorHandler.handleError(error, { ...context, button });
          throw error; // Re-throw for caller to handle if needed
        } finally {
          ButtonStateManager.setLoading(button, false);
        }
      };
    }

    /**
     * Handle error with logging, categorization, and user feedback
     */
    static handleError(error, context = {}) {
      // Log error
      ErrorLogger.log(error, context);

      // Categorize error
      const errorType = ErrorCategorizer.categorize(error);
      const userMessage = ErrorCategorizer.getUserMessage(error);

      // Determine if retryable
      const isRetryable = [
        ErrorTypes.NETWORK_ERROR,
        ErrorTypes.API_ERROR
      ].includes(errorType);

      // Show error to user
      ErrorDisplay.show(userMessage, {
        type: 'error',
        showRetry: isRetryable && context.onRetry,
        onRetry: context.onRetry
      });
    }

    /**
     * Wrap button click handler with comprehensive error handling
     */
    static wrapButtonHandler(button, handler, options = {}) {
      const {
        isAsync = false,
        showLoading = true,
        onSuccess = null,
        onError = null,
        retryable = true
      } = options;

      const context = {
        button,
        action: button.dataset.action || button.onclick?.toString() || 'unknown',
        onRetry: retryable ? () => handler.call(button) : null
      };

      if (isAsync) {
        return ButtonErrorHandler.wrapAsync(async function() {
          try {
            const result = await handler.call(this);
            if (onSuccess) {
              onSuccess(result);
            }
            return result;
          } catch (error) {
            if (onError) {
              onError(error);
            }
            throw error;
          }
        }, context);
      } else {
        return ButtonErrorHandler.wrapSync(function() {
          try {
            const result = handler.call(this);
            if (onSuccess) {
              onSuccess(result);
            }
            return result;
          } catch (error) {
            if (onError) {
              onError(error);
            }
            throw error;
          }
        }, context);
      }
    }
  }

  // ============================================
  // GLOBAL BUTTON HANDLER WRAPPER
  // ============================================
  
  /**
   * Automatically wrap all button onclick handlers with error handling
   */
  function wrapAllButtonHandlers() {
    document.querySelectorAll('button[onclick]').forEach(button => {
      const originalOnclick = button.onclick;
      if (originalOnclick) {
        button.onclick = ButtonErrorHandler.wrapButtonHandler(
          button,
          originalOnclick,
          { isAsync: false }
        );
      }
    });

    console.log('✅ All button handlers wrapped with error handling');
  }

  // ============================================
  // EXPORT TO GLOBAL SCOPE
  // ============================================
  
  window.ButtonErrorHandler = ButtonErrorHandler;
  window.ButtonStateManager = ButtonStateManager;
  window.ErrorDisplay = ErrorDisplay;
  window.ErrorLogger = ErrorLogger;
  window.ErrorCategorizer = ErrorCategorizer;
  window.ErrorTypes = ErrorTypes;

  // ============================================
  // AUTO-INITIALIZE
  // ============================================
  
  // Wrap all handlers when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', wrapAllButtonHandlers);
  } else {
    wrapAllButtonHandlers();
  }

  console.log('✅ Button Error Handler System initialized');

})();
