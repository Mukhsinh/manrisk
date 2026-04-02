/**
 * Download Button Handler
 * Menangani semua tombol download dengan loading state dan error handling
 */

class DownloadButtonHandler {
  constructor() {
    this.activeDownloads = new Set();
    this.init();
  }

  init() {
    // Event delegation untuk semua tombol download
    document.addEventListener('click', (e) => {
      const downloadBtn = e.target.closest('[data-action="download"]');
      if (downloadBtn) {
        e.preventDefault();
        this.handleDownload(downloadBtn);
      }
    });
  }

  async handleDownload(button) {
    const downloadId = button.dataset.downloadId || Date.now().toString();
    
    // Prevent double download
    if (this.activeDownloads.has(downloadId)) {
      console.warn('Download already in progress');
      return;
    }

    try {
      this.activeDownloads.add(downloadId);
      this.setLoadingState(button, true);

      const url = button.dataset.url;
      const filename = button.dataset.filename || 'download';
      const type = button.dataset.type || 'file';

      if (!url) {
        throw new Error('URL download tidak ditemukan');
      }

      // Trigger download berdasarkan type
      if (type === 'api') {
        await this.downloadFromAPI(url, filename, button);
      } else {
        await this.downloadDirect(url, filename);
      }

      this.showSuccess(button, 'Download berhasil');
    } catch (error) {
      console.error('Download error:', error);
      this.showError(button, error.message || 'Download gagal');
    } finally {
      this.activeDownloads.delete(downloadId);
      this.setLoadingState(button, false);
    }
  }

  async downloadFromAPI(url, filename, button) {
    const token = localStorage.getItem('token');
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const blob = await response.blob();
    const contentType = response.headers.get('content-type');
    
    // Dapatkan filename dari header jika ada
    const contentDisposition = response.headers.get('content-disposition');
    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename="?(.+)"?/i);
      if (filenameMatch) {
        filename = filenameMatch[1];
      }
    }

    this.triggerDownload(blob, filename, contentType);
  }

  async downloadDirect(url, filename) {
    // Untuk direct download, buat link dan trigger click
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  triggerDownload(blob, filename, contentType) {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }

  setLoadingState(button, isLoading) {
    if (isLoading) {
      button.disabled = true;
      button.classList.add('loading');
      
      // Simpan konten asli
      button.dataset.originalContent = button.innerHTML;
      
      // Tampilkan loading indicator
      const icon = button.querySelector('i');
      if (icon) {
        icon.className = 'lucide lucide-loader-2 animate-spin';
      } else {
        button.innerHTML = '<i class="lucide lucide-loader-2 animate-spin"></i> Downloading...';
      }
    } else {
      button.disabled = false;
      button.classList.remove('loading');
      
      // Restore konten asli
      if (button.dataset.originalContent) {
        button.innerHTML = button.dataset.originalContent;
        delete button.dataset.originalContent;
      }
    }
  }

  showSuccess(button, message) {
    // Tampilkan notifikasi sukses
    if (window.showNotification) {
      window.showNotification(message, 'success');
    } else {
      console.log('Success:', message);
    }

    // Tambah visual feedback pada button
    button.classList.add('success-flash');
    setTimeout(() => {
      button.classList.remove('success-flash');
    }, 1000);
  }

  showError(button, message) {
    // Tampilkan notifikasi error
    if (window.showNotification) {
      window.showNotification(message, 'error');
    } else {
      alert(message);
    }

    // Tambah visual feedback pada button
    button.classList.add('error-flash');
    setTimeout(() => {
      button.classList.remove('error-flash');
    }, 1000);
  }
}

// Initialize handler saat DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.downloadButtonHandler = new DownloadButtonHandler();
  });
} else {
  window.downloadButtonHandler = new DownloadButtonHandler();
}
