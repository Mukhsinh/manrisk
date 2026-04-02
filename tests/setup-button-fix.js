/**
 * Setup file untuk button functionality fix tests
 */

// Mock console methods untuk cleaner test output
global.console = {
  ...console,
  warn: jest.fn(),
  error: jest.fn(),
  log: jest.fn()
};

// Setup DOM environment
if (typeof document !== 'undefined') {
  // Add custom matchers
  expect.extend({
    toHaveEventHandler(button) {
      const hasOnclick = button.onclick !== null;
      const hasDataAction = button.dataset && button.dataset.action;
      const hasEventListener = button._eventListeners && button._eventListeners.length > 0;
      
      const pass = hasOnclick || hasDataAction || hasEventListener;
      
      if (pass) {
        return {
          message: () => `expected button not to have event handler`,
          pass: true
        };
      } else {
        return {
          message: () => `expected button to have event handler (onclick, data-action, or event listener)`,
          pass: false
        };
      }
    },
    
    toBeClickable(button) {
      const isDisabled = button.disabled;
      const hasPointerEvents = window.getComputedStyle(button).pointerEvents !== 'none';
      
      const pass = !isDisabled && hasPointerEvents;
      
      if (pass) {
        return {
          message: () => `expected button not to be clickable`,
          pass: true
        };
      } else {
        return {
          message: () => `expected button to be clickable (not disabled and pointer-events not none)`,
          pass: false
        };
      }
    },
    
    toHaveLoadingState(button) {
      const hasLoadingClass = button.classList.contains('loading');
      const isDisabled = button.disabled;
      
      const pass = hasLoadingClass && isDisabled;
      
      if (pass) {
        return {
          message: () => `expected button not to have loading state`,
          pass: true
        };
      } else {
        return {
          message: () => `expected button to have loading state (loading class and disabled)`,
          pass: false
        };
      }
    }
  });
}

// Mock common global functions
global.showErrorMessage = jest.fn();
global.showSuccessMessage = jest.fn();
global.showLoadingIndicator = jest.fn();
global.hideLoadingIndicator = jest.fn();

// Setup fetch mock
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({}),
  })
);

// Track event listeners for memory leak detection
if (typeof EventTarget !== 'undefined') {
  const originalAddEventListener = EventTarget.prototype.addEventListener;
  const originalRemoveEventListener = EventTarget.prototype.removeEventListener;
  
  EventTarget.prototype.addEventListener = function(type, listener, options) {
    if (!this._eventListeners) {
      this._eventListeners = [];
    }
    this._eventListeners.push({ type, listener, options });
    return originalAddEventListener.call(this, type, listener, options);
  };
  
  EventTarget.prototype.removeEventListener = function(type, listener, options) {
    if (this._eventListeners) {
      this._eventListeners = this._eventListeners.filter(
        l => !(l.type === type && l.listener === listener)
      );
    }
    return originalRemoveEventListener.call(this, type, listener, options);
  };
}

// Cleanup after each test
afterEach(() => {
  // Clear all mocks
  jest.clearAllMocks();
  
  // Clear DOM
  if (typeof document !== 'undefined') {
    document.body.innerHTML = '';
  }
  
  // Clear timers
  jest.clearAllTimers();
});
