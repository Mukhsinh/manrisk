/**
 * Enhanced Download Handler dengan notifikasi dan progress tracking
 */

class EnhancedDownloadHandler {
  constructor() {
    this.activeDownloads = new Map();
    this.initializeGlobalHandler();
  }

  initializeGlobalHandler() {
    // Override default download behavior
    this.interceptDownloadLinks();
    this.setupGlobalErrorHandler();
  }

  interceptDownloadLinks() {
    // Intercept clicks on download buttons/links
    document.addEventListener('click', (e) => {
      const target = e.target.closest('[data-download]');
      if (target) {
        e.preventDefault();
        this.handleDownload(target);
      }
    });
  }

  setupGlobalErrorHandler() {
    // Handle download errors globally
    window.addEventListener('unhandledrejection', (e) => {
      if (e.reason && e.reason.message && e.reason.message.includes('download')) {
        console.error('Download error:', e.reason);
        this.showErrorNotification('Gagal mengunduh file. Silakan coba lagi.');
      }
    });
  }

  async handleDownload(element) {
    const url = element.getAttribute('data-download') || element.href;
    const filename = element.getAttribute('data-filename') || 'download';
    const type = element.getAttribute('data-type') || 'excel';
    
    if (!url) {
      this.showErrorNotification('URL unduhan tidak valid');
      return;
    }

    const downloadId = this.startDownload(filename, type);
    
    try {
      await this.performDownload(url, filename, type, downloadId);
    } catch (error) {
      console.error('Download failed:', error);
      this.handleDownloadError(downloadId, error.message);
    }
  }

  startDownload(filename, type) {
    const downloadId = downloadNotificationManager.startDownload(filename, type);
    
    this.activeDownloads.set(downloadId, {
      filename,
      type,
      startTime: Date.now(),
      status: 'downloading'
    });

    return downloadId;
  }

  async performDownload(url, filename, type, downloadId) {
    // Simulate progress for better UX
    this.simulateProgress(downloadId);

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': this.getAcceptHeader(type),
          'Cache-Control': 'no-cache'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      // Get content length for real progress tracking
      const contentLength = response.headers.get('content-length');
      const total = contentLength ? parseInt(contentLength, 10) : 0;

      let loaded = 0;
      const reader = response.body.getReader();
      const chunks = [];

      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;
        
        chunks.push(value);
        loaded += value.length;

        if (total > 0) {
          const progress = Math.round((loaded / total) * 100);
          downloadNotificationManager.updateProgress(downloadId, progress);
          downloadNotificationManager.updateFileSize(downloadId, loaded);
        }
      }

      // Combine chunks
      const blob = new Blob(chunks, { 
        type: this.getMimeType(type) 
      });

      // Trigger download
      this.triggerBrowserDownload(blob, filename, type);
      
      // Update notification
      downloadNotificationManager.completeDownload(downloadId, filename, type);
      
      // Update status
      const download = this.activeDownloads.get(downloadId);
      if (download) {
        download.status = 'completed';
        download.endTime = Date.now();
      }

    } catch (error) {
      throw error;
    }
  }

  simulateProgress(downloadId) {
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 15;
      if (progress >= 90) {
        clearInterval(interval);
        return;
      }
      downloadNotificationManager.updateProgress(downloadId, progress);
    }, 200);

    // Store interval for cleanup
    const download = this.activeDownloads.get(downloadId);
    if (download) {
      download.progressInterval = interval;
    }
  }

  triggerBrowserDownload(blob, filename, type) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = this.ensureFileExtension(filename, type);
    a.style.display = 'none';
    
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    // Clean up object URL
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  handleDownloadError(downloadId, errorMessage) {
    // Clear progress interval
    const download = this.activeDownloads.get(downloadId);
    if (download && download.progressInterval) {
      clearInterval(download.progressInterval);
    }

    // Show error notification
    downloadNotificationManager.error(downloadId, errorMessage, [
      {
        text: 'Coba Lagi',
        icon: 'fas fa-redo',
        onClick: `enhancedDownloadHandler.retryDownload('${downloadId}')`
      }
    ]);

    // Update status
    if (download) {
      download.status = 'error';
      download.error = errorMessage;
    }
  }

  retryDownload(downloadId) {
    const download = this.activeDownloads.get(downloadId);
    if (!download) return;

    // Remove error notification
    downloadNotificationManager.remove(downloadId);
    
    // Find original element and retry
    const elements = document.querySelectorAll('[data-download]');
    for (const element of elements) {
      const filename = element.getAttribute('data-filename');
      if (filename === download.filename) {
        this.handleDownload(element);
        break;
      }
    }
  }

  getAcceptHeader(type) {
    const headers = {
      excel: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      pdf: 'application/pdf',
      csv: 'text/csv'
    };
    return headers[type] || headers.excel;
  }

  getMimeType(type) {
    const mimeTypes = {
      excel: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      pdf: 'application/pdf',
      csv: 'text/csv'
    };
    return mimeTypes[type] || mimeTypes.excel;
  }

  ensureFileExtension(filename, type) {
    const extensions = {
      excel: '.xlsx',
      pdf: '.pdf',
      csv: '.csv'
    };
    
    const ext = extensions[type] || extensions.excel;
    
    if (!filename.toLowerCase().endsWith(ext)) {
      return filename + ext;
    }
    
    return filename;
  }

  showErrorNotification(message) {
    downloadNotificationManager.show({
      title: 'Error Unduhan',
      message: message,
      type: 'error',
      autoClose: true,
      duration: 5000
    });
  }

  // Utility methods for manual download triggering
  downloadExcel(url, filename = 'laporan') {
    return this.performDownload(url, filename, 'excel', this.startDownload(filename, 'excel'));
  }

  downloadPDF(url, filename = 'laporan') {
    return this.performDownload(url, filename, 'pdf', this.startDownload(filename, 'pdf'));
  }

  downloadCSV(url, filename = 'laporan') {
    return this.performDownload(url, filename, 'csv', this.startDownload(filename, 'csv'));
  }

  // Get download statistics
  getDownloadStats() {
    const stats = {
      total: this.activeDownloads.size,
      completed: 0,
      failed: 0,
      inProgress: 0
    };

    this.activeDownloads.forEach(download => {
      switch (download.status) {
        case 'completed':
          stats.completed++;
          break;
        case 'error':
          stats.failed++;
          break;
        case 'downloading':
          stats.inProgress++;
          break;
      }
    });

    return stats;
  }

  // Clean up old downloads
  cleanup() {
    const now = Date.now();
    const maxAge = 5 * 60 * 1000; // 5 minutes

    this.activeDownloads.forEach((download, id) => {
      if (download.endTime && (now - download.endTime) > maxAge) {
        this.activeDownloads.delete(id);
      }
    });
  }
}

// Initialize global instance
window.enhancedDownloadHandler = new EnhancedDownloadHandler();

// Auto cleanup every 5 minutes
setInterval(() => {
  window.enhancedDownloadHandler.cleanup();
}, 5 * 60 * 1000);

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = EnhancedDownloadHandler;
}