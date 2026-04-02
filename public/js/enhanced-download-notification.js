/**
 * Enhanced Download Notification System
 * Sistem notifikasi unduhan yang lebih baik dengan progress tracking
 */

class DownloadNotificationManager {
  constructor() {
    this.notifications = new Map();
    this.initializeStyles();
  }

  initializeStyles() {
    if (document.getElementById('download-notification-styles')) return;

    const styles = document.createElement('style');
    styles.id = 'download-notification-styles';
    styles.textContent = `
      .download-notification-container {
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 10000;
        max-width: 400px;
        pointer-events: none;
      }

      .download-notification {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        border-radius: 12px;
        padding: 16px 20px;
        margin-bottom: 12px;
        box-shadow: 0 8px 32px rgba(0,0,0,0.2);
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255,255,255,0.1);
        transform: translateX(100%);
        transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        pointer-events: auto;
        position: relative;
        overflow: hidden;
      }

      .download-notification.show {
        transform: translateX(0);
      }

      .download-notification.success {
        background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
      }

      .download-notification.error {
        background: linear-gradient(135deg, #ff416c 0%, #ff4b2b 100%);
      }

      .download-notification.warning {
        background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
      }

      .notification-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 8px;
      }

      .notification-title {
        font-weight: 600;
        font-size: 14px;
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .notification-close {
        background: none;
        border: none;
        color: white;
        font-size: 18px;
        cursor: pointer;
        opacity: 0.7;
        transition: opacity 0.2s;
        padding: 0;
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
      }

      .notification-close:hover {
        opacity: 1;
        background: rgba(255,255,255,0.1);
      }

      .notification-message {
        font-size: 13px;
        opacity: 0.9;
        line-height: 1.4;
        margin-bottom: 12px;
      }

      .notification-progress {
        background: rgba(255,255,255,0.2);
        border-radius: 10px;
        height: 6px;
        overflow: hidden;
        margin-bottom: 8px;
      }

      .notification-progress-bar {
        background: white;
        height: 100%;
        border-radius: 10px;
        transition: width 0.3s ease;
        width: 0%;
      }

      .notification-details {
        font-size: 11px;
        opacity: 0.8;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .notification-actions {
        display: flex;
        gap: 8px;
        margin-top: 12px;
      }

      .notification-btn {
        background: rgba(255,255,255,0.2);
        border: 1px solid rgba(255,255,255,0.3);
        color: white;
        padding: 6px 12px;
        border-radius: 6px;
        font-size: 12px;
        cursor: pointer;
        transition: all 0.2s;
      }

      .notification-btn:hover {
        background: rgba(255,255,255,0.3);
        transform: translateY(-1px);
      }

      .notification-icon {
        font-size: 16px;
      }

      .download-shimmer {
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
        animation: shimmer 2s infinite;
      }

      @keyframes shimmer {
        0% { left: -100%; }
        100% { left: 100%; }
      }

      .pulse-animation {
        animation: pulse 2s infinite;
      }

      @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.7; }
      }

      @media (max-width: 480px) {
        .download-notification-container {
          left: 10px;
          right: 10px;
          max-width: none;
        }
        
        .download-notification {
          margin-bottom: 8px;
        }
      }
    `;
    document.head.appendChild(styles);
  }

  createContainer() {
    let container = document.getElementById('download-notification-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'download-notification-container';
      container.className = 'download-notification-container';
      document.body.appendChild(container);
    }
    return container;
  }

  show(options = {}) {
    const {
      id = 'download-' + Date.now(),
      title = 'Mengunduh File',
      message = 'Sedang memproses unduhan...',
      type = 'info', // info, success, error, warning
      progress = 0,
      showProgress = true,
      autoClose = false,
      duration = 5000,
      actions = []
    } = options;

    const container = this.createContainer();
    
    // Remove existing notification with same ID
    this.remove(id);

    const notification = document.createElement('div');
    notification.className = `download-notification ${type}`;
    notification.id = `notification-${id}`;

    const iconMap = {
      info: 'fas fa-download',
      success: 'fas fa-check-circle',
      error: 'fas fa-exclamation-triangle',
      warning: 'fas fa-exclamation-circle'
    };

    notification.innerHTML = `
      <div class="download-shimmer"></div>
      <div class="notification-header">
        <div class="notification-title">
          <i class="${iconMap[type]} notification-icon"></i>
          ${title}
        </div>
        <button class="notification-close" onclick="downloadNotificationManager.remove('${id}')">
          <i class="fas fa-times"></i>
        </button>
      </div>
      <div class="notification-message">${message}</div>
      ${showProgress ? `
        <div class="notification-progress">
          <div class="notification-progress-bar" style="width: ${progress}%"></div>
        </div>
        <div class="notification-details">
          <span class="progress-text">${progress}% selesai</span>
          <span class="file-size"></span>
        </div>
      ` : ''}
      ${actions.length > 0 ? `
        <div class="notification-actions">
          ${actions.map(action => `
            <button class="notification-btn" onclick="${action.onClick}">
              ${action.icon ? `<i class="${action.icon}"></i> ` : ''}${action.text}
            </button>
          `).join('')}
        </div>
      ` : ''}
    `;

    container.appendChild(notification);
    
    // Store notification reference
    this.notifications.set(id, {
      element: notification,
      options,
      startTime: Date.now()
    });

    // Trigger show animation
    setTimeout(() => {
      notification.classList.add('show');
    }, 100);

    // Auto close if specified
    if (autoClose && duration > 0) {
      setTimeout(() => {
        this.remove(id);
      }, duration);
    }

    return id;
  }

  updateProgress(id, progress, message = null) {
    const notification = this.notifications.get(id);
    if (!notification) return;

    const progressBar = notification.element.querySelector('.notification-progress-bar');
    const progressText = notification.element.querySelector('.progress-text');
    const messageElement = notification.element.querySelector('.notification-message');

    if (progressBar) {
      progressBar.style.width = `${Math.min(100, Math.max(0, progress))}%`;
    }

    if (progressText) {
      progressText.textContent = `${Math.round(progress)}% selesai`;
    }

    if (message && messageElement) {
      messageElement.textContent = message;
    }

    // Add pulse animation when near completion
    if (progress > 90) {
      notification.element.classList.add('pulse-animation');
    }
  }

  updateFileSize(id, size) {
    const notification = this.notifications.get(id);
    if (!notification) return;

    const fileSizeElement = notification.element.querySelector('.file-size');
    if (fileSizeElement) {
      fileSizeElement.textContent = this.formatFileSize(size);
    }
  }

  success(id, message = 'File berhasil diunduh!', actions = []) {
    const notification = this.notifications.get(id);
    if (!notification) return;

    notification.element.className = 'download-notification success show';
    
    const titleElement = notification.element.querySelector('.notification-title');
    const messageElement = notification.element.querySelector('.notification-message');
    const iconElement = notification.element.querySelector('.notification-icon');
    
    if (titleElement) titleElement.innerHTML = '<i class="fas fa-check-circle notification-icon"></i> Unduhan Selesai';
    if (messageElement) messageElement.textContent = message;
    if (iconElement) iconElement.className = 'fas fa-check-circle notification-icon';

    // Update progress to 100%
    this.updateProgress(id, 100, message);

    // Add actions if provided
    if (actions.length > 0) {
      let actionsContainer = notification.element.querySelector('.notification-actions');
      if (!actionsContainer) {
        actionsContainer = document.createElement('div');
        actionsContainer.className = 'notification-actions';
        notification.element.appendChild(actionsContainer);
      }
      
      actionsContainer.innerHTML = actions.map(action => `
        <button class="notification-btn" onclick="${action.onClick}">
          ${action.icon ? `<i class="${action.icon}"></i> ` : ''}${action.text}
        </button>
      `).join('');
    }

    // Auto close after 5 seconds
    setTimeout(() => {
      this.remove(id);
    }, 5000);
  }

  error(id, message = 'Gagal mengunduh file', actions = []) {
    const notification = this.notifications.get(id);
    if (!notification) return;

    notification.element.className = 'download-notification error show';
    
    const titleElement = notification.element.querySelector('.notification-title');
    const messageElement = notification.element.querySelector('.notification-message');
    
    if (titleElement) titleElement.innerHTML = '<i class="fas fa-exclamation-triangle notification-icon"></i> Unduhan Gagal';
    if (messageElement) messageElement.textContent = message;

    // Add retry action if not provided
    if (actions.length === 0) {
      actions = [{
        text: 'Coba Lagi',
        icon: 'fas fa-redo',
        onClick: `downloadNotificationManager.remove('${id}')`
      }];
    }

    // Add actions
    let actionsContainer = notification.element.querySelector('.notification-actions');
    if (!actionsContainer) {
      actionsContainer = document.createElement('div');
      actionsContainer.className = 'notification-actions';
      notification.element.appendChild(actionsContainer);
    }
    
    actionsContainer.innerHTML = actions.map(action => `
      <button class="notification-btn" onclick="${action.onClick}">
        ${action.icon ? `<i class="${action.icon}"></i> ` : ''}${action.text}
      </button>
    `).join('');
  }

  remove(id) {
    const notification = this.notifications.get(id);
    if (!notification) return;

    notification.element.style.transform = 'translateX(100%)';
    notification.element.style.opacity = '0';

    setTimeout(() => {
      if (notification.element.parentNode) {
        notification.element.parentNode.removeChild(notification.element);
      }
      this.notifications.delete(id);
    }, 400);
  }

  removeAll() {
    this.notifications.forEach((_, id) => {
      this.remove(id);
    });
  }

  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // Convenience methods for common download scenarios
  startDownload(filename, type = 'excel') {
    const typeMap = {
      excel: { title: 'Mengunduh Excel', message: `Sedang memproses file ${filename}...` },
      pdf: { title: 'Mengunduh PDF', message: `Sedang membuat PDF ${filename}...` },
      csv: { title: 'Mengunduh CSV', message: `Sedang memproses CSV ${filename}...` }
    };

    const config = typeMap[type] || typeMap.excel;
    
    return this.show({
      title: config.title,
      message: config.message,
      showProgress: true,
      type: 'info'
    });
  }

  completeDownload(id, filename, type = 'excel') {
    const typeMap = {
      excel: 'File Excel berhasil diunduh!',
      pdf: 'File PDF berhasil diunduh!',
      csv: 'File CSV berhasil diunduh!'
    };

    const message = typeMap[type] || typeMap.excel;
    
    this.success(id, `${message} (${filename})`, [
      {
        text: 'Buka Folder',
        icon: 'fas fa-folder-open',
        onClick: 'downloadNotificationManager.openDownloadsFolder()'
      }
    ]);
  }

  openDownloadsFolder() {
    // This would typically open the downloads folder
    // For web apps, we can show a helpful message
    this.show({
      title: 'Info',
      message: 'File telah disimpan di folder Downloads Anda',
      type: 'info',
      autoClose: true,
      duration: 3000
    });
  }
}

// Initialize global instance
window.downloadNotificationManager = new DownloadNotificationManager();

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = DownloadNotificationManager;
}