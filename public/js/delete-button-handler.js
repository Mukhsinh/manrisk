/**
 * Delete Button Handler
 * Menangani semua tombol delete dengan confirmation dan loading state
 */

class DeleteButtonHandler {
  constructor() {
    this.loadingButtons = new Set();
    this.init();
  }

  init() {
    // Event delegation untuk semua tombol delete
    document.addEventListener('click', (e) => {
      const deleteButton = e.target.closest('[data-action="delete"], .btn-delete, button[onclick*="delete"], button[onclick*="hapus"]');
      if (deleteButton && !this.loadingButtons.has(deleteButton)) {
        e.preventDefault();
        this.handleDelete(deleteButton);
      }
    });
  }

  async handleDelete(button) {
    try {
      // Ambil data dari button attributes
      const id = button.dataset.id || button.getAttribute('data-id');
      const type = button.dataset.type || button.getAttribute('data-type') || 'item';
      const name = button.dataset.name || button.getAttribute('data-name') || 'item ini';
      const endpoint = button.dataset.endpoint || button.getAttribute('data-endpoint');

      if (!id) {
        throw new Error('ID tidak ditemukan pada tombol delete');
      }

      // Tampilkan confirmation dialog
      const confirmed = await this.showConfirmation(name, type);
      
      if (!confirmed) {
        return; // User membatalkan
      }

      // Set loading state
      this.setLoading(button, true);

      // Kirim delete request ke server
      await this.deleteData(id, type, endpoint);

      // Tampilkan success message
      this.showSuccess(`${name} berhasil dihapus`);

      // Refresh data atau remove row
      this.refreshData(button, type);

    } catch (error) {
      console.error('Error saat delete:', error);
      this.showError(error.message);
    } finally {
      this.setLoading(button, false);
    }
  }

  async showConfirmation(name, type) {
    // Gunakan SweetAlert2 jika tersedia
    if (typeof Swal !== 'undefined') {
      const result = await Swal.fire({
        title: 'Konfirmasi Hapus',
        html: `Apakah Anda yakin ingin menghapus <strong>${name}</strong>?<br><small class="text-muted">Tindakan ini tidak dapat dibatalkan.</small>`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#dc3545',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Ya, Hapus',
        cancelButtonText: 'Batal',
        reverseButtons: true
      });
      return result.isConfirmed;
    }
    
    // Fallback ke confirm dialog
    return confirm(`Apakah Anda yakin ingin menghapus ${name}?\n\nTindakan ini tidak dapat dibatalkan.`);
  }

  async deleteData(id, type, endpoint) {
    // Tentukan endpoint berdasarkan type jika tidak ada endpoint custom
    const url = endpoint || this.getEndpointByType(type, id);

    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Data tidak ditemukan');
      }
      if (response.status === 403) {
        throw new Error('Anda tidak memiliki izin untuk menghapus data ini');
      }
      if (response.status === 409) {
        throw new Error('Data tidak dapat dihapus karena masih digunakan');
      }
      throw new Error(`Error deleting data: ${response.statusText}`);
    }

    return await response.json();
  }

  getEndpointByType(type, id) {
    const endpoints = {
      'user': `/api/users/${id}`,
      'organization': `/api/organizations/${id}`,
      'risk': `/api/risks/${id}`,
      'kri': `/api/kri/${id}`,
      'residual': `/api/residual-risk/${id}`,
      'swot': `/api/analisis-swot/${id}`,
      'rencana-strategis': `/api/rencana-strategis/${id}`,
      'sasaran': `/api/sasaran-strategi/${id}`,
      'iku': `/api/indikator-kinerja-utama/${id}`,
      'monitoring': `/api/monitoring-evaluasi/${id}`,
      'peluang': `/api/peluang/${id}`,
      'item': `/api/items/${id}`
    };

    return endpoints[type] || `/api/${type}/${id}`;
  }

  refreshData(button, type) {
    // Cari parent row jika button ada di dalam table
    const row = button.closest('tr');
    if (row) {
      // Animate row removal
      row.style.transition = 'opacity 0.3s ease';
      row.style.opacity = '0';
      setTimeout(() => {
        row.remove();
        this.updateRowNumbers();
      }, 300);
      return;
    }

    // Cari parent card jika button ada di dalam card
    const card = button.closest('.card');
    if (card) {
      card.style.transition = 'opacity 0.3s ease';
      card.style.opacity = '0';
      setTimeout(() => {
        card.remove();
      }, 300);
      return;
    }

    // Fallback: reload page atau trigger custom event
    const event = new CustomEvent('dataDeleted', {
      detail: { type: type }
    });
    document.dispatchEvent(event);

    // Jika ada fungsi reload data global
    if (typeof window.loadData === 'function') {
      setTimeout(() => window.loadData(), 500);
    } else if (typeof window.refreshTable === 'function') {
      setTimeout(() => window.refreshTable(), 500);
    }
  }

  updateRowNumbers() {
    // Update nomor urut di tabel jika ada
    const tables = document.querySelectorAll('table');
    tables.forEach(table => {
      const rows = table.querySelectorAll('tbody tr');
      rows.forEach((row, index) => {
        const noCell = row.querySelector('td:first-child');
        if (noCell && !isNaN(noCell.textContent)) {
          noCell.textContent = index + 1;
        }
      });
    });
  }

  setLoading(button, isLoading) {
    if (isLoading) {
      this.loadingButtons.add(button);
      button.disabled = true;
      button.classList.add('loading');
      
      // Simpan konten asli
      if (!button.dataset.originalContent) {
        button.dataset.originalContent = button.innerHTML;
      }
      
      // Tampilkan loading indicator
      const icon = button.querySelector('i');
      if (icon) {
        icon.className = 'fas fa-spinner fa-spin';
      } else {
        button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Menghapus...';
      }
    } else {
      this.loadingButtons.delete(button);
      button.disabled = false;
      button.classList.remove('loading');
      
      // Restore konten asli
      if (button.dataset.originalContent) {
        button.innerHTML = button.dataset.originalContent;
      }
    }
  }

  showSuccess(message) {
    if (typeof Swal !== 'undefined') {
      Swal.fire({
        icon: 'success',
        title: 'Berhasil',
        text: message,
        timer: 2000,
        showConfirmButton: false
      });
    } else if (typeof toastr !== 'undefined') {
      toastr.success(message);
    } else {
      alert(message);
    }
  }

  showError(message) {
    if (typeof Swal !== 'undefined') {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: message
      });
    } else if (typeof toastr !== 'undefined') {
      toastr.error(message);
    } else {
      alert('Error: ' + message);
    }
  }
}

// Initialize handler saat DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.deleteButtonHandler = new DeleteButtonHandler();
  });
} else {
  window.deleteButtonHandler = new DeleteButtonHandler();
}
