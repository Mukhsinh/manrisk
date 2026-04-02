/**
 * Button Click Logger
 * Mencatat setiap klik tombol untuk analisis dan monitoring
 */

class ButtonClickLogger {
  constructor() {
    this.logs = [];
    this.maxLogs = 1000; // Maksimal log yang disimpan di memory
    this.storageKey = 'button_click_logs';
    this.sessionId = this.generateSessionId();
    this.userId = null;
    this.loadLogsFromStorage();
    this.setupAutoSave();
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
   * Log button click
   */
  logClick(buttonInfo) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      sessionId: this.sessionId,
      userId: this.userId,
      buttonId: buttonInfo.id || null,
      buttonText: buttonInfo.text || null,
      buttonClass: buttonInfo.className || null,
      action: buttonInfo.action || null,
      page: window.location.pathname,
      url: window.location.href,
      userAgent: navigator.userAgent,
      screenResolution: `${window.screen.width}x${window.screen.height}`,
      viewportSize: `${window.innerWidth}x${window.innerHeight}`,
      clickPosition: buttonInfo.clickPosition || null
    };

    this.logs.push(logEntry);

    // Batasi jumlah log di memory
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }

    // Log ke console untuk debugging
    if (window.DEBUG_MODE) {
      console.log('[ButtonClickLogger]', logEntry);
    }

    return logEntry;
  }

  /**
   * Get all logs
   */
  getLogs() {
    return [...this.logs];
  }

  /**
   * Get logs by filter
   */
  getLogsByFilter(filter) {
    return this.logs.filter(log => {
      if (filter.userId && log.userId !== filter.userId) return false;
      if (filter.action && log.action !== filter.action) return false;
      if (filter.page && log.page !== filter.page) return false;
      if (filter.startDate && new Date(log.timestamp) < new Date(filter.startDate)) return false;
      if (filter.endDate && new Date(log.timestamp) > new Date(filter.endDate)) return false;
      return true;
    });
  }

  /**
   * Get statistics
   */
  getStatistics() {
    const stats = {
      totalClicks: this.logs.length,
      uniqueButtons: new Set(this.logs.map(log => log.buttonId || log.buttonText)).size,
      uniquePages: new Set(this.logs.map(log => log.page)).size,
      clicksByAction: {},
      clicksByPage: {},
      clicksByHour: {}
    };

    this.logs.forEach(log => {
      // Count by action
      const action = log.action || 'unknown';
      stats.clicksByAction[action] = (stats.clicksByAction[action] || 0) + 1;

      // Count by page
      stats.clicksByPage[log.page] = (stats.clicksByPage[log.page] || 0) + 1;

      // Count by hour
      const hour = new Date(log.timestamp).getHours();
      stats.clicksByHour[hour] = (stats.clicksByHour[hour] || 0) + 1;
    });

    return stats;
  }

  /**
   * Save logs to localStorage
   */
  saveToStorage() {
    try {
      const data = {
        logs: this.logs,
        sessionId: this.sessionId,
        savedAt: new Date().toISOString()
      };
      localStorage.setItem(this.storageKey, JSON.stringify(data));
    } catch (error) {
      console.error('[ButtonClickLogger] Error saving to storage:', error);
    }
  }

  /**
   * Load logs from localStorage
   */
  loadLogsFromStorage() {
    try {
      const data = localStorage.getItem(this.storageKey);
      if (data) {
        const parsed = JSON.parse(data);
        this.logs = parsed.logs || [];
      }
    } catch (error) {
      console.error('[ButtonClickLogger] Error loading from storage:', error);
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
   * Clear all logs
   */
  clearLogs() {
    this.logs = [];
    this.saveToStorage();
  }

  /**
   * Export logs as JSON
   */
  exportLogs() {
    const data = {
      exportedAt: new Date().toISOString(),
      sessionId: this.sessionId,
      userId: this.userId,
      logs: this.logs,
      statistics: this.getStatistics()
    };
    return JSON.stringify(data, null, 2);
  }

  /**
   * Download logs as file
   */
  downloadLogs() {
    const data = this.exportLogs();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `button-clicks-${this.sessionId}-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  /**
   * Send logs to server
   */
  async sendLogsToServer(endpoint = '/api/logs/button-clicks') {
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: this.exportLogs()
      });

      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('[ButtonClickLogger] Error sending logs to server:', error);
      throw error;
    }
  }
}

// Create global instance
window.buttonClickLogger = new ButtonClickLogger();

// Auto-log all button clicks
document.addEventListener('click', (event) => {
  const button = event.target.closest('button, [role="button"], a.btn');
  if (button) {
    const buttonInfo = {
      id: button.id,
      text: button.textContent.trim(),
      className: button.className,
      action: button.dataset.action || button.getAttribute('onclick'),
      clickPosition: {
        x: event.clientX,
        y: event.clientY
      }
    };
    window.buttonClickLogger.logClick(buttonInfo);
  }
}, true);

console.log('[ButtonClickLogger] Initialized');
