/**
 * Download Format Selector Component
 * Komponen untuk memilih format unduhan (Excel, PDF, CSV)
 */

class DownloadFormatSelector {
  constructor(options = {}) {
    this.options = {
      baseUrl: '',
      defaultFormat: 'excel',
      showIcons: true,
      showLabels: true,
      buttonClass: 'btn btn-primary',
      dropdownClass: 'dropdown',
      ...options
    };
    
    this.formats = {
      excel: {
        label: 'Excel',
        icon: 'fas fa-file-excel',
        color: '#28a745',
        extension: '.xlsx',
        mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      },
      pdf: {
        label: 'PDF',
        icon: 'fas fa-file-pdf',
        color: '#dc3545',
        extension: '.pdf',
        mimeType: 'application/pdf'
      },
      csv: {
        label: 'CSV',
        icon: 'fas fa-file-csv',
        color: '#ffc107',
        extension: '.csv',
        mimeType: 'text/csv'
      }
    };
  }

  // Create single download button with format selector
  createButton(config = {}) {
    const {
      url = '',
      filename = 'laporan',
      text = 'Unduh Laporan',
      formats = ['excel', 'pdf', 'csv'],
      style = 'dropdown' // 'dropdown' or 'buttons'
    } = config;

    if (style === 'buttons') {
      return this.createSeparateButtons(url, filename, text, formats);
    } else {
      return this.createDropdownButton(url, filename, text, formats);
    }
  }

  // Create dropdown style button
  createDropdownButton(url, filename, text, formats) {
    const container = document.createElement('div');
    container.className = 'btn-group';
    
    const mainButton = document.createElement('button');
    mainButton.type = 'button';
    mainButton.className = `${this.options.buttonClass} dropdown-toggle`;
    mainButton.setAttribute('data-bs-toggle', 'dropdown');
    mainButton.setAttribute('aria-expanded', 'false');
    
    const defaultFormat = formats[0] || 'excel';
    const formatInfo = this.formats[defaultFormat];
    
    mainButton.innerHTML = `
      ${this.options.showIcons ? `<i class="${formatInfo.icon}" style="color: ${formatInfo.color}"></i>` : ''}
      ${this.options.showLabels ? text : ''}
      <i class="fas fa-chevron-down ms-1"></i>
    `;

    const dropdown = document.createElement('ul');
    dropdown.className = 'dropdown-menu';

    formats.forEach(format => {
      const formatInfo = this.formats[format];
      if (!formatInfo) return;

      const li = document.createElement('li');
      const link = document.createElement('a');
      link.className = 'dropdown-item';
      link.href = '#';
      link.innerHTML = `
        <i class="${formatInfo.icon}" style="color: ${formatInfo.color}; margin-right: 8px;"></i>
        Unduh ${formatInfo.label}
      `;
      
      link.addEventListener('click', (e) => {
        e.preventDefault();
        this.downloadFile(url, filename, format);
      });

      li.appendChild(link);
      dropdown.appendChild(li);
    });

    container.appendChild(mainButton);
    container.appendChild(dropdown);
    
    return container;
  }

  // Create separate buttons for each format
  createSeparateButtons(url, filename, text, formats) {
    const container = document.createElement('div');
    container.className = 'btn-group';
    container.setAttribute('role', 'group');

    formats.forEach(format => {
      const formatInfo = this.formats[format];
      if (!formatInfo) return;

      const button = document.createElement('button');
      button.type = 'button';
      button.className = this.options.buttonClass;
      button.style.backgroundColor = formatInfo.color;
      button.style.borderColor = formatInfo.color;
      
      button.innerHTML = `
        ${this.options.showIcons ? `<i class="${formatInfo.icon}"></i>` : ''}
        ${this.options.showLabels ? formatInfo.label : ''}
      `;
      
      button.addEventListener('click', () => {
        this.downloadFile(url, filename, format);
      });

      container.appendChild(button);
    });

    return container;
  }

  // Download file with selected format
  async downloadFile(baseUrl, filename, format) {
    try {
      // Show notification
      const downloadId = downloadNotificationManager.startDownload(
        `${filename}.${this.formats[format].extension.replace('.', '')}`, 
        format
      );

      // Construct URL with format parameter
      const url = baseUrl.includes('?') 
        ? `${baseUrl}&format=${format}` 
        : `${baseUrl}?format=${format}`;

      // Use enhanced download handler if available
      if (window.enhancedDownloadHandler) {
        await enhancedDownloadHandler.performDownload(
          url, 
          filename, 
          format, 
          downloadId
        );
      } else {
        // Fallback to simple download
        await this.simpleDownload(url, filename, format, downloadId);
      }

    } catch (error) {
      console.error('Download failed:', error);
      downloadNotificationManager.error(
        downloadId, 
        `Gagal mengunduh file ${format.toUpperCase()}: ${error.message}`
      );
    }
  }

  // Simple download fallback
  async simpleDownload(url, filename, format, downloadId) {
    try {
      // Simulate progress
      let progress = 0;
      const progressInterval = setInterval(() => {
        progress += Math.random() * 20;
        if (progress >= 90) {
          clearInterval(progressInterval);
          return;
        }
        downloadNotificationManager.updateProgress(downloadId, progress);
      }, 200);

      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const blob = await response.blob();
      
      // Clear progress interval
      clearInterval(progressInterval);
      
      // Trigger download
      const downloadUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `${filename}${this.formats[format].extension}`;
      a.style.display = 'none';
      
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      // Clean up
      setTimeout(() => URL.revokeObjectURL(downloadUrl), 1000);
      
      // Show success notification
      downloadNotificationManager.completeDownload(downloadId, a.download, format);

    } catch (error) {
      throw error;
    }
  }

  // Create inline format selector (radio buttons)
  createInlineSelector(config = {}) {
    const {
      url = '',
      filename = 'laporan',
      formats = ['excel', 'pdf', 'csv'],
      selectedFormat = 'excel'
    } = config;

    const container = document.createElement('div');
    container.className = 'download-format-selector';
    container.innerHTML = `
      <style>
        .download-format-selector {
          display: flex;
          align-items: center;
          gap: 15px;
          padding: 15px;
          background: #f8f9fa;
          border-radius: 8px;
          margin: 10px 0;
        }
        .format-option {
          display: flex;
          align-items: center;
          gap: 5px;
          cursor: pointer;
          padding: 8px 12px;
          border-radius: 6px;
          transition: all 0.2s;
        }
        .format-option:hover {
          background: rgba(0,0,0,0.05);
        }
        .format-option input[type="radio"] {
          margin-right: 5px;
        }
        .download-btn-inline {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border: none;
          color: white;
          padding: 10px 20px;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.3s;
        }
        .download-btn-inline:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        }
      </style>
    `;

    const formatsContainer = document.createElement('div');
    formatsContainer.style.display = 'flex';
    formatsContainer.style.gap = '10px';

    formats.forEach(format => {
      const formatInfo = this.formats[format];
      if (!formatInfo) return;

      const option = document.createElement('label');
      option.className = 'format-option';
      option.innerHTML = `
        <input type="radio" name="downloadFormat" value="${format}" ${format === selectedFormat ? 'checked' : ''}>
        <i class="${formatInfo.icon}" style="color: ${formatInfo.color}"></i>
        <span>${formatInfo.label}</span>
      `;

      formatsContainer.appendChild(option);
    });

    const downloadBtn = document.createElement('button');
    downloadBtn.className = 'download-btn-inline';
    downloadBtn.innerHTML = '<i class="fas fa-download"></i> Unduh';
    
    downloadBtn.addEventListener('click', () => {
      const selectedFormat = container.querySelector('input[name="downloadFormat"]:checked')?.value || 'excel';
      this.downloadFile(url, filename, selectedFormat);
    });

    container.appendChild(formatsContainer);
    container.appendChild(downloadBtn);

    return container;
  }

  // Enhance existing download buttons
  enhanceExistingButtons() {
    const downloadButtons = document.querySelectorAll('[data-download-url]');
    
    downloadButtons.forEach(button => {
      const url = button.getAttribute('data-download-url');
      const filename = button.getAttribute('data-filename') || 'laporan';
      const formats = (button.getAttribute('data-formats') || 'excel,pdf,csv').split(',');
      
      // Replace button with format selector
      const selector = this.createButton({
        url,
        filename,
        text: button.textContent.trim(),
        formats,
        style: button.getAttribute('data-style') || 'dropdown'
      });
      
      button.parentNode.replaceChild(selector, button);
    });
  }

  // Initialize format selectors on page
  init() {
    // Auto-enhance existing buttons
    this.enhanceExistingButtons();
    
    // Watch for new buttons
    const observer = new MutationObserver(() => {
      this.enhanceExistingButtons();
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }
}

// Initialize global instance
window.downloadFormatSelector = new DownloadFormatSelector();

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.downloadFormatSelector.init();
  });
} else {
  window.downloadFormatSelector.init();
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = DownloadFormatSelector;
}