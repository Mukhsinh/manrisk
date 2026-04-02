/**
 * Button Alert System
 * Mengirim alert jika error rate tinggi atau button tidak berfungsi
 */

class ButtonAlertSystem {
  constructor() {
    this.alerts = [];
    this.alertThresholds = {
      errorRate: 5, // errors per minute
      criticalErrorRate: 10,
      consecutiveErrors: 3,
      buttonFailureRate: 0.5 // 50% failure rate untuk button tertentu
    };
    this.alertHandlers = [];
    this.monitoringInterval = null;
    this.buttonFailures = {}; // Track failures per button
    this.setupMonitoring();
  }

  /**
   * Add alert handler
   */
  addAlertHandler(handler) {
    if (typeof handler === 'function') {
      this.alertHandlers.push(handler);
    }
  }

  /**
   * Trigger alert
   */
  triggerAlert(alert) {
    const alertData = {
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      type: alert.type,
      severity: alert.severity || 'warning',
      title: alert.title,
      message: alert.message,
      data: alert.data || {},
      acknowledged: false
    };

    this.alerts.push(alertData);

    // Log alert
    console.warn('[ButtonAlertSystem]', alertData);

    // Trigger handlers
    this.alertHandlers.forEach(handler => {
      try {
        handler(alertData);
      } catch (error) {
        console.error('[ButtonAlertSystem] Error in alert handler:', error);
      }
    });

    // Show browser notification jika diizinkan
    this.showBrowserNotification(alertData);

    return alertData;
  }

  /**
   * Show browser notification
   */
  async showBrowserNotification(alert) {
    if (!('Notification' in window)) return;

    if (Notification.permission === 'granted') {
      new Notification(alert.title, {
        body: alert.message,
        icon: '/favicon.ico',
        tag: alert.id
      });
    } else if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        new Notification(alert.title, {
          body: alert.message,
          icon: '/favicon.ico',
          tag: alert.id
        });
      }
    }
  }

  /**
   * Setup monitoring
   */
  setupMonitoring() {
    // Monitor setiap 10 detik
    this.monitoringInterval = setInterval(() => {
      this.checkErrorRate();
      this.checkButtonFailures();
      this.checkCriticalErrors();
    }, 10000);

    // Listen untuk button errors
    window.addEventListener('buttonError', (event) => {
      this.handleButtonError(event.detail);
    });
  }

  /**
   * Check error rate
   */
  checkErrorRate() {
    if (!window.buttonErrorLogger) return;

    const errorRate = window.buttonErrorLogger.calculateErrorRate();

    if (errorRate >= this.alertThresholds.criticalErrorRate) {
      this.triggerAlert({
        type: 'HIGH_ERROR_RATE',
        severity: 'critical',
        title: 'Critical: Error Rate Sangat Tinggi',
        message: `Error rate mencapai ${errorRate} errors/minute. Segera periksa aplikasi!`,
        data: { errorRate }
      });
    } else if (errorRate >= this.alertThresholds.errorRate) {
      this.triggerAlert({
        type: 'ELEVATED_ERROR_RATE',
        severity: 'warning',
        title: 'Warning: Error Rate Tinggi',
        message: `Error rate mencapai ${errorRate} errors/minute. Perlu perhatian.`,
        data: { errorRate }
      });
    }
  }

  /**
   * Handle button error
   */
  handleButtonError(error) {
    const buttonKey = error.buttonId || error.buttonText || 'unknown';

    // Track failures per button
    if (!this.buttonFailures[buttonKey]) {
      this.buttonFailures[buttonKey] = {
        total: 0,
        consecutive: 0,
        lastError: null
      };
    }

    this.buttonFailures[buttonKey].total++;
    this.buttonFailures[buttonKey].consecutive++;
    this.buttonFailures[buttonKey].lastError = error;

    // Check consecutive errors
    if (this.buttonFailures[buttonKey].consecutive >= this.alertThresholds.consecutiveErrors) {
      this.triggerAlert({
        type: 'BUTTON_CONSECUTIVE_FAILURES',
        severity: 'error',
        title: 'Error: Button Gagal Berturut-turut',
        message: `Button "${buttonKey}" gagal ${this.buttonFailures[buttonKey].consecutive} kali berturut-turut.`,
        data: {
          buttonKey,
          failures: this.buttonFailures[buttonKey]
        }
      });
    }

    // Check critical errors
    if (error.severity === 'critical') {
      this.triggerAlert({
        type: 'CRITICAL_BUTTON_ERROR',
        severity: 'critical',
        title: 'Critical: Button Error',
        message: `Critical error pada button "${buttonKey}": ${error.errorMessage}`,
        data: { error }
      });
    }
  }

  /**
   * Check button failures
   */
  checkButtonFailures() {
    if (!window.buttonClickLogger) return;

    const clicks = window.buttonClickLogger.getLogs();
    const errors = window.buttonErrorLogger.getErrors();

    // Calculate failure rate per button
    const buttonClicks = {};
    const buttonErrors = {};

    clicks.forEach(click => {
      const key = click.buttonId || click.buttonText || 'unknown';
      buttonClicks[key] = (buttonClicks[key] || 0) + 1;
    });

    errors.forEach(error => {
      const key = error.buttonId || error.buttonText || 'unknown';
      buttonErrors[key] = (buttonErrors[key] || 0) + 1;
    });

    // Check failure rates
    Object.keys(buttonClicks).forEach(buttonKey => {
      const clickCount = buttonClicks[buttonKey];
      const errorCount = buttonErrors[buttonKey] || 0;
      const failureRate = errorCount / clickCount;

      if (failureRate >= this.alertThresholds.buttonFailureRate && clickCount >= 5) {
        this.triggerAlert({
          type: 'HIGH_BUTTON_FAILURE_RATE',
          severity: 'warning',
          title: 'Warning: Button Failure Rate Tinggi',
          message: `Button "${buttonKey}" memiliki failure rate ${(failureRate * 100).toFixed(1)}% (${errorCount}/${clickCount} clicks).`,
          data: {
            buttonKey,
            clickCount,
            errorCount,
            failureRate
          }
        });
      }
    });
  }

  /**
   * Check critical errors
   */
  checkCriticalErrors() {
    if (!window.buttonErrorLogger) return;

    const stats = window.buttonErrorLogger.getStatistics();
    const criticalCount = stats.errorsBySeverity.critical || 0;

    if (criticalCount > 0) {
      const recentCritical = window.buttonErrorLogger.getErrorsByFilter({
        severity: 'critical'
      }).slice(-5);

      if (recentCritical.length > 0) {
        this.triggerAlert({
          type: 'CRITICAL_ERRORS_DETECTED',
          severity: 'critical',
          title: 'Critical: Error Kritis Terdeteksi',
          message: `${criticalCount} critical error terdeteksi. Segera periksa!`,
          data: {
            criticalCount,
            recentErrors: recentCritical
          }
        });
      }
    }
  }

  /**
   * Reset button failure tracking (saat button berhasil)
   */
  resetButtonFailure(buttonKey) {
    if (this.buttonFailures[buttonKey]) {
      this.buttonFailures[buttonKey].consecutive = 0;
    }
  }

  /**
   * Get all alerts
   */
  getAlerts() {
    return [...this.alerts];
  }

  /**
   * Get unacknowledged alerts
   */
  getUnacknowledgedAlerts() {
    return this.alerts.filter(alert => !alert.acknowledged);
  }

  /**
   * Acknowledge alert
   */
  acknowledgeAlert(alertId) {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.acknowledged = true;
      alert.acknowledgedAt = new Date().toISOString();
    }
  }

  /**
   * Clear old alerts
   */
  clearOldAlerts(olderThanHours = 24) {
    const cutoffTime = new Date(Date.now() - olderThanHours * 60 * 60 * 1000);
    this.alerts = this.alerts.filter(alert => 
      new Date(alert.timestamp) > cutoffTime
    );
  }

  /**
   * Stop monitoring
   */
  stopMonitoring() {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
  }

  /**
   * Get alert summary
   */
  getAlertSummary() {
    const unacknowledged = this.getUnacknowledgedAlerts();
    return {
      total: this.alerts.length,
      unacknowledged: unacknowledged.length,
      bySeverity: {
        critical: unacknowledged.filter(a => a.severity === 'critical').length,
        error: unacknowledged.filter(a => a.severity === 'error').length,
        warning: unacknowledged.filter(a => a.severity === 'warning').length
      },
      recent: this.alerts.slice(-5).reverse()
    };
  }
}

// Create global instance
window.buttonAlertSystem = new ButtonAlertSystem();

// Default alert handler: show in console
window.buttonAlertSystem.addAlertHandler((alert) => {
  const style = alert.severity === 'critical' 
    ? 'color: red; font-weight: bold;'
    : alert.severity === 'error'
    ? 'color: orange; font-weight: bold;'
    : 'color: yellow;';
  
  console.log(`%c[ALERT] ${alert.title}`, style);
  console.log(alert.message);
  console.log('Data:', alert.data);
});

// Listen untuk successful button clicks untuk reset failure tracking
document.addEventListener('click', (event) => {
  const button = event.target.closest('button, [role="button"], a.btn');
  if (button) {
    const buttonKey = button.id || button.textContent.trim();
    // Reset akan dilakukan jika tidak ada error
    setTimeout(() => {
      if (window.buttonAlertSystem) {
        window.buttonAlertSystem.resetButtonFailure(buttonKey);
      }
    }, 100);
  }
}, true);

console.log('[ButtonAlertSystem] Initialized');
