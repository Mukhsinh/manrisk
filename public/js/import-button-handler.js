/**
 * Import Button Handler
 * Menangani semua tombol import dengan file picker, validasi, dan progress indicator
 */

class ImportButtonHandler {
  constructor() {
    this.activeImports = new Set();
    this.init();
  }

  init() {
    // Event delegation untuk semua tombol import
    document.addEventListener('click', (e) => {
      const importBtn = e.target.closest('[data-action="import"]');
      if (importBtn) {
        e.preventDefault();
        this.handleImport(importBtn);
      }
    });
  }

  async handleImport(button) {
    const importId = button.dataset.importId || Date.now().toString();
    
    // Prevent double import
    if (this.activeImports.has(importId)) {
      console.warn('Import already in progress');
      return;
    }

    try {
      // Buat file input element
      const fileInput = this.createFileInput(button);
      
      // Trigger file picker
      fileInput.click();
      
      // Wait untuk file selection
      const file = await this.waitForFileSelection(fileInput);
      
      if (!file) {
        return; // User cancelled
      }

      this.activeImports.add(importId);
      this.setLoadingState(button, true);

      // Validate file
      this.validateFile(file, button);

      // Upload file
      await this.uploadFile(file, button);

      this.showSuccess(button, 'Import berhasil');
      
      // Refresh data jika ada callback
      if (button.dataset.onSuccess) {
        const callback = window[button.dataset.onSuccess];
        if (typeof callback === 'function') {
          callback();
        }
      }
    } catch (error) {
      console.error('Import error:', error);
      this.showError(button, error.message || 'Import gagal');
    } finally {
      this.activeImports.delete(importId);
      this.setLoadingState(button, false);
    }
  }

  createFileInput(button) {
    const input = document.createElement('input');
    input.type = 'file';
    input.style.display = 'none';
    
    // Set accepted file types
    const accept = button.dataset.accept || '.xlsx,.xls,.csv';
    input.accept = accept;
    
    // Set multiple jika diizinkan
    if (button.dataset.multiple === 'true') {
      input.multiple = true;
    }
    
    document.body.appendChild(input);
    return input;
  }

  waitForFileSelection(fileInput) {
    return new Promise((resolve) => {
      fileInput.addEventListener('change', () => {
        const file = fileInput.files[0];
        document.body.removeChild(fileInput);
        resolve(file);
      });
      
      // Handle cancel
      fileInput.addEventListener('cancel', () => {
        document.body.removeChild(fileInput);
        resolve(null);
      });
      
      // Fallback untuk browser yang tidak support cancel event
      setTimeout(() => {
        if (document.body.contains(fileInput)) {
          document.body.removeChild(fileInput);
          resolve(null);
        }
      }, 60000); // 1 minute timeout
    });
  }

  validateFile(file, button) {
    // Validate file size
    const maxSize = parseInt(button.dataset.maxSize) || 10 * 1024 * 1024; // 10MB default
    if (file.size > maxSize) {
      throw new Error(`File terlalu besar. Maksimal ${this.formatFileSize(maxSize)}`);
    }

    // Validate file type
    const accept = button.dataset.accept || '.xlsx,.xls,.csv';
    const allowedExtensions = accept.split(',').map(ext => ext.trim().toLowerCase());
    const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
    
    if (!allowedExtensions.includes(fileExtension)) {
      throw new Error(`Format file tidak valid. Hanya ${accept} yang diizinkan`);
    }

    // Validate file name
    if (file.name.length > 255) {
      throw new Error('Nama file terlalu panjang');
    }
  }

  async uploadFile(file, button) {
    const url = button.dataset.url;
    if (!url) {
      throw new Error('URL import tidak ditemukan');
    }

    const token = localStorage.getItem('token');
    const formData = new FormData();
    formData.append('file', file);
    
    // Tambahkan parameter tambahan jika ada
    if (button.dataset.params) {
      try {
        const params = JSON.parse(button.dataset.params);
        Object.keys(params).forEach(key => {
          formData.append(key, params[key]);
        });
      } catch (e) {
        console.warn('Failed to parse params:', e);
      }
    }

    // Show progress
    const progressBar = this.createProgressBar(button);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });

    this.removeProgressBar(progressBar);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
    // Show import summary jika ada
    if (result.summary) {
      this.showImportSummary(result.summary);
    }

    return result;
  }

  createProgressBar(button) {
    const container = button.closest('.button-group') || button.parentElement;
    const progressBar = document.createElement('div');
    progressBar.className = 'import-progress';
    progressBar.innerHTML = `
      <div class="progress-bar">
        <div class="progress-fill"></div>
      </div>
      <div class="progress-text">Uploading...</div>
    `;
    container.appendChild(progressBar);
    
    // Animate progress (indeterminate)
    const fill = progressBar.querySelector('.progress-fill');
    fill.style.animation = 'progress-indeterminate 1.5s ease-in-out infinite';
    
    return progressBar;
  }

  removeProgressBar(progressBar) {
    if (progressBar && progressBar.parentElement) {
      progressBar.parentElement.removeChild(progressBar);
    }
  }

  showImportSummary(summary) {
    const message = `
      Import selesai:
      - Total: ${summary.total || 0}
      - Berhasil: ${summary.success || 0}
      - Gagal: ${summary.failed || 0}
    `;
    
    if (window.showNotification) {
      window.showNotification(message, summary.failed > 0 ? 'warning' : 'success');
    } else {
      alert(message);
    }
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
        button.innerHTML = '<i class="lucide lucide-loader-2 animate-spin"></i> Importing...';
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
      alert(message);
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

  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }
}

// Initialize handler saat DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.importButtonHandler = new ImportButtonHandler();
  });
} else {
  window.importButtonHandler = new ImportButtonHandler();
}
