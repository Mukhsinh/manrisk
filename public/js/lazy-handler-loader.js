/**
 * Lazy Handler Loader
 * Memuat button handlers secara lazy untuk mengurangi initial bundle size
 */

class LazyHandlerLoader {
  constructor() {
    this.loadedHandlers = new Map();
    this.pendingLoads = new Map();
    this.handlerRegistry = new Map();
  }

  /**
   * Register handler module untuk lazy loading
   * @param {string} handlerName - Nama handler
   * @param {Function} loader - Function yang return Promise untuk load handler
   */
  register(handlerName, loader) {
    if (this.handlerRegistry.has(handlerName)) {
      console.warn(`LazyHandlerLoader: Handler ${handlerName} already registered`);
      return;
    }

    this.handlerRegistry.set(handlerName, loader);
    console.log(`LazyHandlerLoader: Registered handler ${handlerName}`);
  }

  /**
   * Load handler secara lazy
   * @param {string} handlerName - Nama handler
   * @returns {Promise} Promise yang resolve dengan handler module
   */
  async load(handlerName) {
    // Cek apakah sudah loaded
    if (this.loadedHandlers.has(handlerName)) {
      return this.loadedHandlers.get(handlerName);
    }

    // Cek apakah sedang loading
    if (this.pendingLoads.has(handlerName)) {
      return this.pendingLoads.get(handlerName);
    }

    // Get loader function
    const loader = this.handlerRegistry.get(handlerName);
    
    if (!loader) {
      throw new Error(`LazyHandlerLoader: Handler ${handlerName} not registered`);
    }

    // Start loading
    console.log(`LazyHandlerLoader: Loading handler ${handlerName}...`);
    
    const loadPromise = loader()
      .then(module => {
        // Store loaded handler
        this.loadedHandlers.set(handlerName, module);
        this.pendingLoads.delete(handlerName);
        
        console.log(`LazyHandlerLoader: Handler ${handlerName} loaded ✅`);
        return module;
      })
      .catch(error => {
        this.pendingLoads.delete(handlerName);
        console.error(`LazyHandlerLoader: Failed to load handler ${handlerName}`, error);
        throw error;
      });

    // Store pending load
    this.pendingLoads.set(handlerName, loadPromise);
    
    return loadPromise;
  }

  /**
   * Load dan execute handler
   * @param {string} handlerName - Nama handler
   * @param {string} functionName - Nama function di dalam handler module
   * @param {...any} args - Arguments untuk function
   * @returns {Promise} Promise yang resolve dengan hasil execution
   */
  async execute(handlerName, functionName, ...args) {
    try {
      // Load handler module
      const module = await this.load(handlerName);
      
      // Get function dari module
      const func = module[functionName];
      
      if (!func || typeof func !== 'function') {
        throw new Error(`LazyHandlerLoader: Function ${functionName} not found in ${handlerName}`);
      }

      // Execute function
      return await func(...args);
      
    } catch (error) {
      console.error(`LazyHandlerLoader: Error executing ${handlerName}.${functionName}`, error);
      throw error;
    }
  }

  /**
   * Setup lazy loading untuk buttons dengan data-lazy-handler attribute
   */
  setupLazyButtons() {
    const buttons = document.querySelectorAll('[data-lazy-handler]');
    
    buttons.forEach(button => {
      const handlerName = button.dataset.lazyHandler;
      const functionName = button.dataset.lazyFunction || 'handle';
      
      button.addEventListener('click', async (event) => {
        try {
          // Show loading state
          button.disabled = true;
          button.classList.add('loading');
          
          // Load dan execute handler
          await this.execute(handlerName, functionName, event, button);
          
        } catch (error) {
          console.error('LazyHandlerLoader: Error in button handler', error);
          
          // Show error message
          alert(`Error: ${error.message}`);
          
        } finally {
          // Remove loading state
          button.disabled = false;
          button.classList.remove('loading');
        }
      });
    });
    
    console.log(`LazyHandlerLoader: Setup ${buttons.length} lazy buttons`);
  }

  /**
   * Preload handlers untuk improve perceived performance
   * @param {string[]} handlerNames - Array of handler names
   */
  async preload(handlerNames) {
    console.log(`LazyHandlerLoader: Preloading ${handlerNames.length} handlers...`);
    
    const promises = handlerNames.map(name => this.load(name));
    
    try {
      await Promise.all(promises);
      console.log('LazyHandlerLoader: Preload complete ✅');
    } catch (error) {
      console.error('LazyHandlerLoader: Preload failed', error);
    }
  }

  /**
   * Unload handler untuk free memory
   * @param {string} handlerName - Nama handler
   */
  unload(handlerName) {
    if (this.loadedHandlers.has(handlerName)) {
      this.loadedHandlers.delete(handlerName);
      console.log(`LazyHandlerLoader: Unloaded handler ${handlerName}`);
    }
  }

  /**
   * Get loading statistics
   * @returns {Object} Statistics object
   */
  getStats() {
    return {
      registered: this.handlerRegistry.size,
      loaded: this.loadedHandlers.size,
      pending: this.pendingLoads.size,
      handlers: Array.from(this.handlerRegistry.keys())
    };
  }
}

// Export untuk digunakan di module lain
if (typeof module !== 'undefined' && module.exports) {
  module.exports = LazyHandlerLoader;
}

// Global instance
window.LazyHandlerLoader = LazyHandlerLoader;
window.lazyHandlerLoader = new LazyHandlerLoader();

// Register common handlers
window.lazyHandlerLoader.register('edit-handler', () => {
  return import('./edit-button-handler.js').catch(() => {
    // Fallback jika module tidak ada
    return {
      handle: async (event, button) => {
        console.log('Edit handler executed (fallback)');
      }
    };
  });
});

window.lazyHandlerLoader.register('delete-handler', () => {
  return import('./delete-button-handler.js').catch(() => {
    return {
      handle: async (event, button) => {
        console.log('Delete handler executed (fallback)');
      }
    };
  });
});

window.lazyHandlerLoader.register('download-handler', () => {
  return import('./download-button-handler.js').catch(() => {
    return {
      handle: async (event, button) => {
        console.log('Download handler executed (fallback)');
      }
    };
  });
});

window.lazyHandlerLoader.register('import-handler', () => {
  return import('./import-button-handler.js').catch(() => {
    return {
      handle: async (event, button) => {
        console.log('Import handler executed (fallback)');
      }
    };
  });
});

window.lazyHandlerLoader.register('export-handler', () => {
  return import('./export-button-handler.js').catch(() => {
    return {
      handle: async (event, button) => {
        console.log('Export handler executed (fallback)');
      }
    };
  });
});

window.lazyHandlerLoader.register('filter-handler', () => {
  return import('./filter-button-handler.js').catch(() => {
    return {
      handle: async (event, button) => {
        console.log('Filter handler executed (fallback)');
      }
    };
  });
});

// Setup lazy buttons saat page load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.lazyHandlerLoader.setupLazyButtons();
  });
} else {
  window.lazyHandlerLoader.setupLazyButtons();
}

console.log('✅ LazyHandlerLoader loaded');
