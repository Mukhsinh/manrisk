/**
 * Button Error Logger
 * Mencatat semua error yang terjadi pada button handlers
 */

class ButtonErrorLogger {
  constructor() {
    this.errors = [];
    this.maxErrors = 500; // Maksimal error yang disimpan di memory
    this.storageKey = 'button_error_logs';
    this.sessionId = this.generateSessionId();
    this.userId = null;
    this.loadErrorsFromStorage();
    this.setupAutoSave();
    this.setupGlobalErrorHandler();
  }

  /**
   * Generate unique session ID
   */
  generateSessionId() {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Set user ID untuk logging
   */
  setUserId(userId) {
    this.userId = userId;
  }

  /**
   * Log error
   */
  logError(errorInfo) {
    const errorEntry = {
      timestamp: new Date().toISOString(),
      sessionId: this.sessionId,
      userId: this.userId,
      errorType: errorInfo.type || 'unknown',
      errorMessage: errorInfo.message || 'Unknown error',
      errorStack: errorInfo.stack || null,
      buttonId: errorInfo.buttonId || null,
      buttonText: errorInfo.buttonText || null,
      buttonAction: errorInfo.buttonAction || null,
      page: window.location.pathname,
      url: window.location.href,
      userAgent: navigator.userAgent,
      browserInfo: this.getBrowserInfo(),
      severity: errorInfo.severity || 'error', // error, warning, critical
      context: errorInfo.context || {}
    };

    this.errors.push(errorEntry);

    // Batasi jumlah error di memory
    if (this.errors.length > this.maxErrors) {
      this.errors.shift();
    }

    // Log ke console
    console.error('[ButtonErrorLogger]', errorEntry);

    // Trigger event untuk monitoring
    window.dispatchEvent(new CustomEvent('buttonError', { detail: errorEntry }));

    return errorEntry;
  }

  /**
   * Get browser info
   */
  getBrowserInfo() {
    const ua = navigator.userAgent;
    let browserName = 'Unknown';
    let browserVersion = 'Unknown';

    if (ua.indexOf('Firefox') > -1) {
      browserName = 'Firefox';
      browserVersion = ua.match(/Firefox\/(\d+)/)?.[1] || 'Unknown';
    } else if (ua.indexOf('Chrome') > -1) {
      browserName = 'Chrome';
      browserVersion = ua.match(/Chrome\/(\d+)/)?.[1] || 'Unknown';
    } else if (ua.indexOf('Safari') > -1) {
      browserName = 'Safari';
      browserVersion = ua.match(/Version\/(\d+)/)?.[1] || 'Unknown';
    } else if (ua.indexOf('Edge') > -1) {
      browserName = 'Edge';
      browserVersion = ua.match(/Edge\/(\d+)/)?.[1] || 'Unknown';
    }

    return {
      name: browserName,
      version: browserVersion,
      platform: navigator.platform,
      language: navigator.language
    };
  }

  /**
   * Get all errors
   */
  getErrors() {
    return [...this.errors];
  }

  /**
   * Get errors by filter
   */
  getErrorsByFilter(filter) {
    return this.errors.filter(error => {
      if (filter.userId && error.userId !== filter.userId) return false;
      if (filter.errorType && error.errorType !== filter.errorType) return false;
      if (filter.severity && error.severity !== filter.severity) return false;
      if (filter.page && error.page !== filter.page) return false;
      if (filter.startDate && new Date(error.timestamp) < new Date(filter.startDate)) return false;
      if (filter.endDate && new Date(error.timestamp) > new Date(filter.endDate)) return false;
      return true;
    });
  }

  /**
   * Get error statistics
   */
  getStatistics() {
    const stats = {
      totalErrors: this.errors.length,
      errorsByType: {},
      errorsBySeverity: {},
      errorsByPage: {},
      errorsByBrowser: {},
      errorRate: this.calculateErrorRate(),
      mostCommonErrors: this.getMostCommonErrors(5)
    };

    this.errors.forEach(error => {
      // Count by type
      stats.errorsByType[error.errorType] = (stats.errorsByType[error.errorType] || 0) + 1;

      // Count by severity
      stats.errorsBySeverity[error.severity] = (stats.errorsBySeverity[error.severity] || 0) + 1;

      // Count by page
      stats.errorsByPage[error.page] = (stats.errorsByPage[error.page] || 0) + 1;

      // Count by browser
      const browser = error.browserInfo?.name || 'Unknown';
      stats.errorsByBrowser[browser] = (stats.errorsByBrowser[browser] || 0) + 1;
    });

    return stats;
  }

  /**
   * Calculate error rate (errors per minute)
   */
  calculateErrorRate() {
    if (this.errors.length === 0) return 0;

    const now = new Date();
    const oneMinuteAgo = new Date(now.getTime() - 60000);
    const recentErrors = this.errors.filter(error => 
      new Date(error.timestamp) > oneMinuteAgo
    );

    return recentErrors.length;
  }

  /**
   * Get most common errors
   */
  getMostCommonErrors(limit = 5) {
    const errorCounts = {};

    this.errors.forEach(error => {
      const key = `${error.errorType}: ${error.errorMessage}`;
      errorCounts[key] = (errorCounts[key] || 0) + 1;
    });

    return Object.entries(errorCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([error, count]) => ({ error, count }));
  }

  /**
   * Setup global error handler
   */
  setupGlobalErrorHandler() {
    // Catch unhandled errors
    window.addEventListener('error', (event) => {
      if (event.target.tagName === 'BUTTON' || event.target.closest('button')) {
        const button = event.target.tagName === 'BUTTON' ? event.target : event.target.closest('button');
        this.logError({
          type: 'UnhandledError',
          message: event.message || 'Unhandled error',
          stack: event.error?.stack,
          buttonId: button.id,
          buttonText: button.textContent.trim(),
          buttonAction: button.dataset.action,
          severity: 'critical'
        });
      }
    });

    // Catch unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.logError({
        type: 'UnhandledPromiseRejection',
        message: event.reason?.message || 'Unhandled promise rejection',
        stack: event.reason?.stack,
        severity: 'error'
      });
    });
  }

  /**
   * Save errors to localStorage
   */
  saveToStorage() {
    try {
      const data = {
        errors: this.errors,
        sessionId: this.sessionId,
        savedAt: new Date().toISOString()
      };
      localStorage.setItem(this.storageKey, JSON.stringify(data));
    } catch (error) {
      console.error('[ButtonErrorLogger] Error saving to storage:', error);
    }
  }

  /**
   * Load errors from localStorage
   */
  loadErrorsFromStorage() {
    try {
      const data = localStorage.getItem(this.storageKey);
      if (data) {
        const parsed = JSON.parse(data);
        this.errors = parsed.errors || [];
      }
    } catch (error) {
      console.error('[ButtonErrorLogger] Error loading from storage:', error);
    }
  }

  /**
   * Setup auto-save setiap 30 detik
   */
  setupAutoSave() {
    setInterval(() => {
      this.saveToStorage();
    }, 30000);

    // Save saat page unload
    window.addEventListener('beforeunload', () => {
      this.saveToStorage();
    });
  }

  /**
   * Clear all errors
   */
  clearErrors() {
    this.errors = [];
    this.saveToStorage();
  }

  /**
   * Export errors as JSON
   */
  exportErrors() {
    const data = {
      exportedAt: new Date().toISOString(),
      sessionId: this.sessionId,
      userId: this.userId,
      errors: this.errors,
      statistics: this.getStatistics()
    };
    return JSON.stringify(data, null, 2);
  }

  /**
   * Download errors as file
   */
  downloadErrors() {
    const data = this.exportErrors();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `button-errors-${this.sessionId}-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  /**
   * Send errors to server
   */
  async sendErrorsToServer(endpoint = '/api/logs/button-errors') {
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: this.exportErrors()
      });

      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('[ButtonErrorLogger] Error sending errors to server:', error);
      throw error;
    }
  }

  /**
   * Check if error rate is high
   */
  isErrorRateHigh(threshold = 5) {
    return this.calculateErrorRate() > threshold;
  }

  /**
   * Get error report
   */
  getErrorReport() {
    const stats = this.getStatistics();
    return {
      summary: {
        totalErrors: stats.totalErrors,
        errorRate: stats.errorRate,
        isHighErrorRate: this.isErrorRateHigh(),
        criticalErrors: stats.errorsBySeverity.critical || 0
      },
      breakdown: {
        byType: stats.errorsByType,
        bySeverity: stats.errorsBySeverity,
        byPage: stats.errorsByPage,
        byBrowser: stats.errorsByBrowser
      },
      topErrors: stats.mostCommonErrors,
      recentErrors: this.errors.slice(-10).reverse()
    };
  }
}

// Create global instance
window.buttonErrorLogger = new ButtonErrorLogger();

// Integrate dengan button error handler yang sudah ada
if (window.buttonErrorHandler) {
  const originalHandleError = window.buttonErrorHandler.handleError;
  window.buttonErrorHandler.handleError = function(error, button) {
    // Log error
    window.buttonErrorLogger.logError({
      type: error.name || 'ButtonError',
      message: error.message,
      stack: error.stack,
      buttonId: button?.id,
      buttonText: button?.textContent?.trim(),
      buttonAction: button?.dataset?.action,
      severity: error.severity || 'error',
      context: error.context || {}
    });

    // Call original handler
    return originalHandleError.call(this, error, button);
  };
}

console.log('[ButtonErrorLogger] Initialized');
