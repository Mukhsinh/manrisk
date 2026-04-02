/**
 * GlobalButtonHandler
 * Sistem global untuk handle button clicks menggunakan event delegation
 * 
 * Features:
 * - Event delegation untuk efisiensi memory
 * - Handler registration system
 * - Error handling otomatis
 * - Loading state management
 * - Action-based routing
 * - Modal integration
 * - Form integration
 * 
 * @class GlobalButtonHandler
 */
class GlobalButtonHandler {
  constructor() {
    this.handlers = new Map();
    this.isInitialized = false;
    this.defaultOptions = {
      showLoading: true,
      showSuccess: true,
      showError: true,
      confirmDelete: true
    };
    
    // References to modal and form handlers
    this.modalHandler = null;
    this.formHandler = null;
  }

  /**
   * Initialize global button handler
   */
  init() {
    if (this.isInitialized) {
      console.warn('GlobalButtonHandler already initialized');
      return;
    }

    // Add global click listener
    document.addEventListener('click', this._handleClick.bind(this));
    
    // Add keyboard listener untuk accessibility
    document.addEventListener('keydown', this._handleKeydown.bind(this));
    
    // Initialize modal and form handlers
    this._initializeModalHandler();
    this._initializeFormHandler();
    
    this.isInitialized = true;
    console.log('GlobalButtonHandler initialized with modal and form support');
  }

  /**
   * Initialize modal handler
   * @private
   */
  _initializeModalHandler() {
    if (typeof window.modalButtonHandler !== 'undefined') {
      this.modalHandler = window.modalButtonHandler;
      console.log('Modal handler integrated');
    } else if (typeof window.ModalButtonHandler !== 'undefined') {
      this.modalHandler = new window.ModalButtonHandler();
      window.modalButtonHandler = this.modalHandler;
      console.log('Modal handler created and integrated');
    }
  }

  /**
   * Initialize form handler
   * @private
   */
  _initializeFormHandler() {
    if (typeof window.formButtonHandler !== 'undefined') {
      this.formHandler = window.formButtonHandler;
      console.log('Form handler integrated');
    } else if (typeof window.FormButtonHandler !== 'undefined') {
      this.formHandler = new window.FormButtonHandler();
      window.formButtonHandler = this.formHandler;
      console.log('Form handler created and integrated');
    }
  }

  /**
   * Register action handler
   * @param {string} action - Action name (e.g., 'add', 'edit', 'delete')
   * @param {Function} handler - Handler function
   * @param {Object} options - Handler options
   */
  register(action, handler, options = {}) {
    if (typeof handler !== 'function') {
      throw new Error(`Handler for action "${action}" must be a function`);
    }

    this.handlers.set(action, {
      handler,
      options: { ...this.defaultOptions, ...options }
    });

    console.log(`Handler registered for action: ${action}`);
  }

  /**
   * Unregister action handler
   * @param {string} action - Action name
   */
  unregister(action) {
    if (this.handlers.has(action)) {
      this.handlers.delete(action);
      console.log(`Handler unregistered for action: ${action}`);
    }
  }

  /**
   * Handle click event
   * @private
   * @param {Event} event - Click event
   */
  async _handleClick(event) {
    const button = event.target.closest('[data-action]');
    
    if (!button) return;
    
    // Prevent default jika button dalam form
    if (button.tagName === 'BUTTON' && button.type === 'submit') {
      event.preventDefault();
    }
    
    // Check jika button disabled atau loading
    if (button.disabled || button.classList.contains('loading')) {
      return;
    }
    
    const action = button.getAttribute('data-action');
    const data = this._extractButtonData(button);
    
    await this._executeHandler(action, button, data, event);
  }

  /**
   * Handle keydown event untuk accessibility
   * @private
   * @param {Event} event - Keydown event
   */
  async _handleKeydown(event) {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    
    const button = event.target.closest('[data-action]');
    
    if (!button) return;
    
    // Prevent default scroll untuk Space key
    if (event.key === ' ') {
      event.preventDefault();
    }
    
    // Check jika button disabled atau loading
    if (button.disabled || button.classList.contains('loading')) {
      return;
    }
    
    const action = button.getAttribute('data-action');
    const data = this._extractButtonData(button);
    
    await this._executeHandler(action, button, data, event);
  }

  /**
   * Extract data dari button attributes
   * @private
   * @param {HTMLElement} button - Button element
   * @returns {Object} Button data
   */
  _extractButtonData(button) {
    const data = {};
    
    // Extract semua data-* attributes
    Array.from(button.attributes).forEach(attr => {
      if (attr.name.startsWith('data-') && attr.name !== 'data-action') {
        const key = attr.name.replace('data-', '').replace(/-([a-z])/g, (g) => g[1].toUpperCase());
        data[key] = attr.value;
      }
    });
    
    return data;
  }

  /**
   * Execute handler untuk action
   * @private
   * @param {string} action - Action name
   * @param {HTMLElement} button - Button element
   * @param {Object} data - Button data
   * @param {Event} event - Original event
   */
  async _executeHandler(action, button, data, event) {
    const handlerConfig = this.handlers.get(action);
    
    if (!handlerConfig) {
      console.warn(`No handler registered for action: ${action}`);
      this._showError(button, `Handler tidak ditemukan untuk action: ${action}`);
      return;
    }
    
    const { handler, options } = handlerConfig;
    
    try {
      // Show loading state
      if (options.showLoading) {
        this._setLoading(button, true);
      }
      
      // Execute handler
      const result = await handler(data, button, event);
      
      // Show success message
      if (options.showSuccess && result !== false) {
        this._showSuccess(button, result?.message || 'Operasi berhasil');
      }
      
      return result;
      
    } catch (error) {
      console.error(`Error executing handler for action "${action}":`, error);
      
      // Show error message
      if (options.showError) {
        this._showError(button, error.message || 'Terjadi kesalahan');
      }
      
      throw error;
      
    } finally {
      // Remove loading state
      if (options.showLoading) {
        this._setLoading(button, false);
      }
    }
  }

  /**
   * Set loading state pada button
   * @private
   * @param {HTMLElement} button - Button element
   * @param {boolean} loading - Loading state
   */
  _setLoading(button, loading) {
    if (loading) {
      button.disabled = true;
      button.classList.add('loading');
      
      // Save original content
      if (!button.dataset.originalContent) {
        button.dataset.originalContent = button.innerHTML;
      }
      
      // Add loading spinner
      const spinner = '<i data-lucide="loader-2" class="animate-spin"></i>';
      const text = button.textContent.trim();
      button.innerHTML = text ? `${spinner} ${text}` : spinner;
      
      // Initialize lucide icons
      if (typeof lucide !== 'undefined') {
        lucide.createIcons();
      }
    } else {
      button.disabled = false;
      button.classList.remove('loading');
      
      // Restore original content
      if (button.dataset.originalContent) {
        button.innerHTML = button.dataset.originalContent;
        delete button.dataset.originalContent;
        
        // Re-initialize lucide icons
        if (typeof lucide !== 'undefined') {
          lucide.createIcons();
        }
      }
    }
  }

  /**
   * Show success message
   * @private
   * @param {HTMLElement} button - Button element
   * @param {string} message - Success message
   */
  _showSuccess(button, message) {
    // Check jika ada notification system
    if (typeof window.showNotification === 'function') {
      window.showNotification(message, 'success');
    } else {
      // Fallback ke alert
      console.log('Success:', message);
      
      // Bisa juga show toast notification
      this._showToast(message, 'success');
    }
  }

  /**
   * Show error message
   * @private
   * @param {HTMLElement} button - Button element
   * @param {string} message - Error message
   */
  _showError(button, message) {
    // Check jika ada notification system
    if (typeof window.showNotification === 'function') {
      window.showNotification(message, 'error');
    } else {
      // Fallback ke alert
      console.error('Error:', message);
      
      // Bisa juga show toast notification
      this._showToast(message, 'error');
    }
  }

  /**
   * Show toast notification
   * @private
   * @param {string} message - Message
   * @param {string} type - Type (success, error, info, warning)
   */
  _showToast(message, type = 'info') {
    // Simple toast implementation
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    toast.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      padding: 12px 20px;
      background-color: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
      color: white;
      border-radius: 6px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      z-index: 9999;
      animation: slideIn 0.3s ease-out;
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.style.animation = 'slideOut 0.3s ease-out';
      setTimeout(() => {
        document.body.removeChild(toast);
      }, 300);
    }, 3000);
  }

  /**
   * Get registered handlers
   * @returns {Array} List of registered actions
   */
  getRegisteredActions() {
    return Array.from(this.handlers.keys());
  }

  /**
   * Check if action is registered
   * @param {string} action - Action name
   * @returns {boolean}
   */
  isRegistered(action) {
    return this.handlers.has(action);
  }

  /**
   * Destroy global button handler
   */
  destroy() {
    document.removeEventListener('click', this._handleClick);
    document.removeEventListener('keydown', this._handleKeydown);
    this.handlers.clear();
    this.isInitialized = false;
    console.log('GlobalButtonHandler destroyed');
  }
}

// Create global instance
const globalButtonHandler = new GlobalButtonHandler();

// Export untuk digunakan di module lain
if (typeof module !== 'undefined' && module.exports) {
  module.exports = GlobalButtonHandler;
}

// Add CSS untuk toast animation
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideIn {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
    
    @keyframes slideOut {
      from {
        transform: translateX(0);
        opacity: 1;
      }
      to {
        transform: translateX(100%);
        opacity: 0;
      }
    }
  `;
  document.head.appendChild(style);
}
