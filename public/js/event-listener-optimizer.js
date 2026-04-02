/**
 * Event Listener Optimizer
 * Mengoptimalkan event listeners dengan event delegation dan cleanup
 */

class EventListenerOptimizer {
  constructor() {
    this.delegatedListeners = new Map();
    this.directListeners = new WeakMap();
    this.listenerCount = 0;
  }

  /**
   * Setup event delegation untuk button clicks
   * Menggunakan single event listener di document level
   * @param {string} selector - CSS selector untuk buttons
   * @param {Function} handler - Click handler
   * @param {HTMLElement} container - Container element (default: document)
   */
  delegateButtonClicks(selector, handler, container = document) {
    const delegationKey = `${selector}-${container.tagName || 'document'}`;
    
    // Cek apakah sudah ada delegation untuk selector ini
    if (this.delegatedListeners.has(delegationKey)) {
      console.warn(`EventListenerOptimizer: Delegation already exists for ${selector}`);
      return;
    }

    // Create delegated handler
    const delegatedHandler = (event) => {
      const target = event.target.closest(selector);
      
      if (target) {
        // Call handler dengan context button
        handler.call(target, event);
      }
    };

    // Attach listener ke container
    container.addEventListener('click', delegatedHandler, true);
    
    // Store reference untuk cleanup
    this.delegatedListeners.set(delegationKey, {
      container,
      handler: delegatedHandler,
      selector
    });
    
    this.listenerCount++;
    
    console.log(`EventListenerOptimizer: Delegated clicks for ${selector} (total: ${this.listenerCount})`);
  }

  /**
   * Remove delegated listener
   * @param {string} selector - CSS selector
   * @param {HTMLElement} container - Container element
   */
  removeDelegatedListener(selector, container = document) {
    const delegationKey = `${selector}-${container.tagName || 'document'}`;
    const delegation = this.delegatedListeners.get(delegationKey);
    
    if (delegation) {
      delegation.container.removeEventListener('click', delegation.handler, true);
      this.delegatedListeners.delete(delegationKey);
      this.listenerCount--;
      
      console.log(`EventListenerOptimizer: Removed delegation for ${selector}`);
    }
  }

  /**
   * Attach event listener dengan automatic cleanup
   * @param {HTMLElement} element - Target element
   * @param {string} eventType - Event type (click, submit, etc)
   * @param {Function} handler - Event handler
   * @param {Object} options - Event listener options
   */
  attachListener(element, eventType, handler, options = {}) {
    if (!element || !eventType || !handler) {
      console.warn('EventListenerOptimizer: Invalid parameters');
      return;
    }

    // Store listener info untuk cleanup
    if (!this.directListeners.has(element)) {
      this.directListeners.set(element, []);
    }
    
    const listeners = this.directListeners.get(element);
    listeners.push({ eventType, handler, options });
    
    // Attach listener
    element.addEventListener(eventType, handler, options);
    this.listenerCount++;
    
    console.log(`EventListenerOptimizer: Attached ${eventType} listener (total: ${this.listenerCount})`);
  }

  /**
   * Remove all listeners dari element
   * @param {HTMLElement} element - Target element
   */
  removeAllListeners(element) {
    const listeners = this.directListeners.get(element);
    
    if (listeners) {
      listeners.forEach(({ eventType, handler, options }) => {
        element.removeEventListener(eventType, handler, options);
        this.listenerCount--;
      });
      
      this.directListeners.delete(element);
      console.log(`EventListenerOptimizer: Removed all listeners from element`);
    }
  }

  /**
   * Setup passive event listeners untuk scroll/touch events
   * Meningkatkan performance dengan menandai listener sebagai passive
   * @param {HTMLElement} element - Target element
   * @param {string} eventType - Event type (scroll, touchstart, etc)
   * @param {Function} handler - Event handler
   */
  attachPassiveListener(element, eventType, handler) {
    this.attachListener(element, eventType, handler, { passive: true });
  }

  /**
   * Cleanup unused event listeners
   * Menghapus listeners dari elements yang sudah tidak ada di DOM
   */
  cleanupUnusedListeners() {
    let cleanedCount = 0;
    
    // Cleanup delegated listeners
    for (const [key, delegation] of this.delegatedListeners.entries()) {
      if (!document.contains(delegation.container)) {
        this.removeDelegatedListener(delegation.selector, delegation.container);
        cleanedCount++;
      }
    }
    
    console.log(`EventListenerOptimizer: Cleaned up ${cleanedCount} unused listeners`);
    return cleanedCount;
  }

  /**
   * Get listener statistics
   * @returns {Object} Statistics object
   */
  getStats() {
    return {
      totalListeners: this.listenerCount,
      delegatedListeners: this.delegatedListeners.size,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Setup common button delegations
   * Mengatur delegation untuk button patterns yang umum
   */
  setupCommonDelegations() {
    // Delegation untuk action buttons
    this.delegateButtonClicks('[data-action]', function(event) {
      const action = this.dataset.action;
      console.log(`Action button clicked: ${action}`);
      
      // Trigger custom event
      const customEvent = new CustomEvent('button:action', {
        detail: { action, button: this },
        bubbles: true
      });
      this.dispatchEvent(customEvent);
    });

    // Delegation untuk modal close buttons
    this.delegateButtonClicks('[data-dismiss="modal"]', function(event) {
      const modalId = this.dataset.target || this.closest('.modal')?.id;
      console.log(`Modal close button clicked: ${modalId}`);
      
      // Trigger custom event
      const customEvent = new CustomEvent('modal:close', {
        detail: { modalId, button: this },
        bubbles: true
      });
      this.dispatchEvent(customEvent);
    });

    // Delegation untuk delete buttons
    this.delegateButtonClicks('[data-delete]', function(event) {
      const itemId = this.dataset.delete;
      console.log(`Delete button clicked: ${itemId}`);
      
      // Trigger custom event
      const customEvent = new CustomEvent('button:delete', {
        detail: { itemId, button: this },
        bubbles: true
      });
      this.dispatchEvent(customEvent);
    });

    // Delegation untuk edit buttons
    this.delegateButtonClicks('[data-edit]', function(event) {
      const itemId = this.dataset.edit;
      console.log(`Edit button clicked: ${itemId}`);
      
      // Trigger custom event
      const customEvent = new CustomEvent('button:edit', {
        detail: { itemId, button: this },
        bubbles: true
      });
      this.dispatchEvent(customEvent);
    });

    console.log('✅ Common button delegations setup complete');
  }

  /**
   * Remove all delegations
   */
  removeAllDelegations() {
    for (const [key, delegation] of this.delegatedListeners.entries()) {
      delegation.container.removeEventListener('click', delegation.handler, true);
    }
    
    this.delegatedListeners.clear();
    this.listenerCount = 0;
    
    console.log('EventListenerOptimizer: All delegations removed');
  }
}

// Export untuk digunakan di module lain
if (typeof module !== 'undefined' && module.exports) {
  module.exports = EventListenerOptimizer;
}

// Global instance
window.EventListenerOptimizer = EventListenerOptimizer;
window.eventListenerOptimizer = new EventListenerOptimizer();

// Auto-setup common delegations saat page load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.eventListenerOptimizer.setupCommonDelegations();
  });
} else {
  window.eventListenerOptimizer.setupCommonDelegations();
}

// Cleanup saat page unload
window.addEventListener('beforeunload', () => {
  window.eventListenerOptimizer.cleanupUnusedListeners();
});

console.log('✅ EventListenerOptimizer loaded');
