/**
 * Export Button Handler
 * Menangani semua tombol export dengan loading state dan error handling
 */

class ExportButtonHandler {
  constructor() {
    this.activeExports = new Set();
    this.init();
  }

  init() {
    // Event delegation untuk semua tombol export
    document.addEventListener('click', (e) => {
      const exportBtn = e.target.closest('[data-action="export"]');
      if (exportBtn) {
        e.preventDefault();
        this.handleExport(exportBtn);
      }
    });
  }

  async handleExport(button) {
    const exportId = button.dataset.exportId || Date.now().toString();
    
    // Prevent double export
    if (this.activeExports.has(exportId)) {
      console.warn('Export already in progress');
      return;
    }

    try {
      this.activeExports.add(exportId);
      this.setLoadingState(button, true);

      const url = button.dataset.url;
      const format = button.dataset.format || 'xlsx';
      const filename = button.dataset.filename || `export-${Date.now()}`;

      if (!url) {
        throw new Error('URL export tidak ditemukan');
      }

      // Generate export file
      const blob = await this.generateExport(url, format, button);

      // Trigger download
      this.triggerDownload(blob, filename, format);

      this.showSuccess(button, 'Export berhasil');
    } catch (error) {
      console.error('Export error:', error);
      this.showError(button, error.message || 'Export gagal');
    } finally {
      this.activeExports.delete(exportId);
      this.setLoadingState(button, false);
    }
  }

  async generateExport(url, format, button) {
    const token = localStorage.getItem('token');
    
    // Build query parameters
    const params = new URLSearchParams();
    params.append('format', format);
    
    // Tambahkan filter parameters jika ada
    if (button.dataset.filters) {
      try {
        const filters = JSON.parse(button.dataset.filters);
        Object.keys(filters).forEach(key => {
          params.append(key, filters[key]);
        });
      } catch (e) {
        console.warn('Failed to parse filters:', e);
      }
    }

    const fullUrl = `${url}?${params.toString()}`;
    
    const response = await fetch(fullUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return await response.blob();
  }

  triggerDownload(blob, filename, format) {
    // Tambahkan extension jika belum ada
    if (!filename.includes('.')) {
      const extensions = {
        'xlsx': '.xlsx',
        'xls': '.xls',
        'csv': '.csv',
        'pdf': '.pdf',
        'json': '.json'
      };
      filename += extensions[format] || '.xlsx';
    }

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
        button.innerHTML = '<i class="lucide lucide-loader-2 animate-spin"></i> Exporting...';
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
    window.exportButtonHandler = new ExportButtonHandler();
  });
} else {
  window.exportButtonHandler = new ExportButtonHandler();
}
