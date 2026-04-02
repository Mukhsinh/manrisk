/**
 * Common Action Handlers
 * Handler umum untuk action-action yang sering digunakan
 * 
 * Actions:
 * - add: Tambah data baru
 * - edit: Edit data existing
 * - delete: Hapus data
 * - download: Download file
 * - import: Import data
 * - export: Export data
 * - filter: Apply filter
 * - refresh: Refresh data
 * - view: View detail
 * - print: Print document
 */

/**
 * Initialize common action handlers
 * @param {GlobalButtonHandler} buttonHandler - Global button handler instance
 */
function initCommonActionHandlers(buttonHandler) {
  
  // ========================================
  // ADD ACTION
  // ========================================
  buttonHandler.register('add', async (data, button, event) => {
    const { entity, modalId, formId } = data;
    
    console.log(`Add action triggered for entity: ${entity}`);
    
    // Open modal jika ada
    if (modalId) {
      const modal = document.getElementById(modalId);
      if (modal) {
        // Reset form jika ada
        if (formId) {
          const form = document.getElementById(formId);
          if (form) {
            form.reset();
          }
        }
        
        // Show modal
        if (typeof bootstrap !== 'undefined' && bootstrap.Modal) {
          const bsModal = new bootstrap.Modal(modal);
          bsModal.show();
        } else {
          modal.style.display = 'block';
          modal.classList.add('show');
        }
        
        return { message: 'Modal dibuka' };
      }
    }
    
    // Jika tidak ada modal, redirect ke halaman add
    if (data.url) {
      window.location.href = data.url;
      return false; // Prevent success message
    }
    
    throw new Error('Modal atau URL tidak ditemukan');
  }, {
    showLoading: false,
    showSuccess: false
  });

  // ========================================
  // EDIT ACTION
  // ========================================
  buttonHandler.register('edit', async (data, button, event) => {
    const { entity, id, modalId, formId, url } = data;
    
    console.log(`Edit action triggered for entity: ${entity}, id: ${id}`);
    
    if (!id) {
      throw new Error('ID tidak ditemukan');
    }
    
    // Load data jika ada endpoint
    let entityData = null;
    if (url) {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Gagal memuat data');
      }
      entityData = await response.json();
    }
    
    // Open modal jika ada
    if (modalId) {
      const modal = document.getElementById(modalId);
      if (modal) {
        // Populate form dengan data
        if (formId && entityData) {
          const form = document.getElementById(formId);
          if (form) {
            Object.keys(entityData).forEach(key => {
              const input = form.querySelector(`[name="${key}"]`);
              if (input) {
                input.value = entityData[key];
              }
            });
          }
        }
        
        // Show modal
        if (typeof bootstrap !== 'undefined' && bootstrap.Modal) {
          const bsModal = new bootstrap.Modal(modal);
          bsModal.show();
        } else {
          modal.style.display = 'block';
          modal.classList.add('show');
        }
        
        return { message: 'Modal dibuka' };
      }
    }
    
    throw new Error('Modal tidak ditemukan');
  }, {
    showSuccess: false
  });

  // ========================================
  // DELETE ACTION
  // ========================================
  buttonHandler.register('delete', async (data, button, event) => {
    const { entity, id, url, confirmMessage } = data;
    
    console.log(`Delete action triggered for entity: ${entity}, id: ${id}`);
    
    if (!id) {
      throw new Error('ID tidak ditemukan');
    }
    
    // Show confirmation dialog
    const message = confirmMessage || `Apakah Anda yakin ingin menghapus ${entity} ini?`;
    const confirmed = confirm(message);
    
    if (!confirmed) {
      return false; // Cancel operation
    }
    
    // Delete data
    if (url) {
      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Gagal menghapus data');
      }
      
      // Refresh table atau list
      if (typeof window.refreshData === 'function') {
        await window.refreshData();
      } else {
        // Reload page sebagai fallback
        window.location.reload();
      }
      
      return { message: `${entity} berhasil dihapus` };
    }
    
    throw new Error('URL tidak ditemukan');
  }, {
    confirmDelete: true
  });

  // ========================================
  // DOWNLOAD ACTION
  // ========================================
  buttonHandler.register('download', async (data, button, event) => {
    const { url, filename, format } = data;
    
    console.log(`Download action triggered: ${filename}`);
    
    if (!url) {
      throw new Error('URL download tidak ditemukan');
    }
    
    // Download file
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Gagal mengunduh file');
    }
    
    const blob = await response.blob();
    const downloadUrl = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = filename || `download.${format || 'pdf'}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(downloadUrl);
    
    return { message: 'File berhasil diunduh' };
  });

  // ========================================
  // IMPORT ACTION
  // ========================================
  buttonHandler.register('import', async (data, button, event) => {
    const { url, accept, maxSize } = data;
    
    console.log('Import action triggered');
    
    // Create file input
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = accept || '.xlsx,.xls,.csv';
    
    return new Promise((resolve, reject) => {
      input.onchange = async (e) => {
        const file = e.target.files[0];
        
        if (!file) {
          reject(new Error('File tidak dipilih'));
          return;
        }
        
        // Check file size
        if (maxSize && file.size > maxSize * 1024 * 1024) {
          reject(new Error(`Ukuran file maksimal ${maxSize}MB`));
          return;
        }
        
        // Upload file
        if (url) {
          const formData = new FormData();
          formData.append('file', file);
          
          const response = await fetch(url, {
            method: 'POST',
            body: formData
          });
          
          if (!response.ok) {
            reject(new Error('Gagal mengimport file'));
            return;
          }
          
          const result = await response.json();
          
          // Refresh data
          if (typeof window.refreshData === 'function') {
            await window.refreshData();
          }
          
          resolve({ message: result.message || 'File berhasil diimport' });
        } else {
          reject(new Error('URL import tidak ditemukan'));
        }
      };
      
      input.click();
    });
  });

  // ========================================
  // EXPORT ACTION
  // ========================================
  buttonHandler.register('export', async (data, button, event) => {
    const { url, filename, format } = data;
    
    console.log(`Export action triggered: ${format}`);
    
    if (!url) {
      throw new Error('URL export tidak ditemukan');
    }
    
    // Export data
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Gagal mengexport data');
    }
    
    const blob = await response.blob();
    const downloadUrl = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = filename || `export.${format || 'xlsx'}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(downloadUrl);
    
    return { message: 'Data berhasil diexport' };
  });

  // ========================================
  // FILTER ACTION
  // ========================================
  buttonHandler.register('filter', async (data, button, event) => {
    console.log('Filter action triggered', data);
    
    // Get filter values dari form
    const formId = data.formId;
    if (!formId) {
      throw new Error('Form ID tidak ditemukan');
    }
    
    const form = document.getElementById(formId);
    if (!form) {
      throw new Error('Form tidak ditemukan');
    }
    
    const formData = new FormData(form);
    const filters = {};
    
    for (const [key, value] of formData.entries()) {
      if (value) {
        filters[key] = value;
      }
    }
    
    // Update URL dengan filter parameters
    const url = new URL(window.location);
    Object.keys(filters).forEach(key => {
      url.searchParams.set(key, filters[key]);
    });
    window.history.pushState({}, '', url);
    
    // Apply filter
    if (typeof window.applyFilter === 'function') {
      await window.applyFilter(filters);
    } else if (typeof window.refreshData === 'function') {
      await window.refreshData();
    } else {
      window.location.reload();
    }
    
    return { message: 'Filter diterapkan' };
  }, {
    showSuccess: false
  });

  // ========================================
  // REFRESH ACTION
  // ========================================
  buttonHandler.register('refresh', async (data, button, event) => {
    console.log('Refresh action triggered');
    
    // Refresh data
    if (typeof window.refreshData === 'function') {
      await window.refreshData();
    } else {
      window.location.reload();
    }
    
    return { message: 'Data berhasil direfresh' };
  });

  // ========================================
  // VIEW ACTION
  // ========================================
  buttonHandler.register('view', async (data, button, event) => {
    const { entity, id, url, modalId } = data;
    
    console.log(`View action triggered for entity: ${entity}, id: ${id}`);
    
    if (!id) {
      throw new Error('ID tidak ditemukan');
    }
    
    // Load data jika ada endpoint
    let entityData = null;
    if (url) {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Gagal memuat data');
      }
      entityData = await response.json();
    }
    
    // Open modal jika ada
    if (modalId) {
      const modal = document.getElementById(modalId);
      if (modal) {
        // Populate modal dengan data
        if (entityData) {
          Object.keys(entityData).forEach(key => {
            const element = modal.querySelector(`[data-field="${key}"]`);
            if (element) {
              element.textContent = entityData[key];
            }
          });
        }
        
        // Show modal
        if (typeof bootstrap !== 'undefined' && bootstrap.Modal) {
          const bsModal = new bootstrap.Modal(modal);
          bsModal.show();
        } else {
          modal.style.display = 'block';
          modal.classList.add('show');
        }
        
        return { message: 'Detail ditampilkan' };
      }
    }
    
    // Redirect ke halaman detail
    if (data.detailUrl) {
      window.location.href = data.detailUrl;
      return false;
    }
    
    throw new Error('Modal atau URL tidak ditemukan');
  }, {
    showSuccess: false
  });

  // ========================================
  // PRINT ACTION
  // ========================================
  buttonHandler.register('print', async (data, button, event) => {
    console.log('Print action triggered');
    
    // Print page atau element tertentu
    if (data.elementId) {
      const element = document.getElementById(data.elementId);
      if (element) {
        const printWindow = window.open('', '', 'height=600,width=800');
        printWindow.document.write('<html><head><title>Print</title>');
        printWindow.document.write('<link rel="stylesheet" href="/css/style.css">');
        printWindow.document.write('</head><body>');
        printWindow.document.write(element.innerHTML);
        printWindow.document.write('</body></html>');
        printWindow.document.close();
        printWindow.print();
        
        return { message: 'Dokumen dicetak' };
      }
    } else {
      window.print();
      return { message: 'Halaman dicetak' };
    }
  }, {
    showLoading: false
  });

  console.log('Common action handlers registered:', buttonHandler.getRegisteredActions());
}

// Auto-initialize jika globalButtonHandler tersedia
if (typeof globalButtonHandler !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    initCommonActionHandlers(globalButtonHandler);
  });
}

// Export untuk digunakan di module lain
if (typeof module !== 'undefined' && module.exports) {
  module.exports = initCommonActionHandlers;
}
