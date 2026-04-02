/**
 * Edit Button Handler
 * Menangani semua tombol edit dengan loading state dan error handling
 */

class EditButtonHandler {
  constructor() {
    this.loadingButtons = new Set();
    this.init();
  }

  init() {
    // Event delegation untuk semua tombol edit
    document.addEventListener('click', (e) => {
      const editButton = e.target.closest('[data-action="edit"], .btn-edit, button[onclick*="edit"]');
      if (editButton && !this.loadingButtons.has(editButton)) {
        e.preventDefault();
        this.handleEdit(editButton);
      }
    });
  }

  async handleEdit(button) {
    try {
      // Ambil data dari button attributes
      const id = button.dataset.id || button.getAttribute('data-id');
      const type = button.dataset.type || button.getAttribute('data-type') || 'item';
      const endpoint = button.dataset.endpoint || button.getAttribute('data-endpoint');

      if (!id) {
        throw new Error('ID tidak ditemukan pada tombol edit');
      }

      // Set loading state
      this.setLoading(button, true);

      // Load data dari server
      const data = await this.loadData(id, type, endpoint);

      if (!data) {
        throw new Error('Data tidak ditemukan');
      }

      // Buka form edit dengan data
      this.openEditForm(data, type);

    } catch (error) {
      console.error('Error saat edit:', error);
      this.showError(error.message);
    } finally {
      this.setLoading(button, false);
    }
  }

  async loadData(id, type, endpoint) {
    // Tentukan endpoint berdasarkan type jika tidak ada endpoint custom
    const url = endpoint || this.getEndpointByType(type, id);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Data tidak ditemukan');
      }
      throw new Error(`Error loading data: ${response.statusText}`);
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

  openEditForm(data, type) {
    // Cari modal edit yang sesuai
    const modalId = this.getModalIdByType(type);
    const modal = document.getElementById(modalId);

    if (!modal) {
      console.warn(`Modal ${modalId} tidak ditemukan, mencoba modal generik`);
      this.openGenericEditModal(data, type);
      return;
    }

    // Populate form dengan data
    this.populateForm(modal, data);

    // Tampilkan modal
    if (typeof bootstrap !== 'undefined' && bootstrap.Modal) {
      const bsModal = new bootstrap.Modal(modal);
      bsModal.show();
    } else if (typeof $ !== 'undefined' && $.fn.modal) {
      $(modal).modal('show');
    } else {
      modal.style.display = 'block';
      modal.classList.add('show');
    }
  }

  getModalIdByType(type) {
    const modalIds = {
      'user': 'modalEditUser',
      'organization': 'modalEditOrganization',
      'risk': 'modalEditRisk',
      'kri': 'modalEditKRI',
      'residual': 'modalEditResidual',
      'swot': 'modalEditSWOT',
      'rencana-strategis': 'modalEditRencanaStrategis',
      'sasaran': 'modalEditSasaran',
      'iku': 'modalEditIKU',
      'monitoring': 'modalEditMonitoring',
      'peluang': 'modalEditPeluang',
      'item': 'modalEdit'
    };

    return modalIds[type] || 'modalEdit';
  }

  populateForm(modal, data) {
    // Populate semua input field dengan data
    const form = modal.querySelector('form');
    if (!form) return;

    Object.keys(data).forEach(key => {
      const input = form.querySelector(`[name="${key}"], #${key}`);
      if (input) {
        if (input.type === 'checkbox') {
          input.checked = !!data[key];
        } else if (input.type === 'radio') {
          const radio = form.querySelector(`[name="${key}"][value="${data[key]}"]`);
          if (radio) radio.checked = true;
        } else if (input.tagName === 'SELECT') {
          input.value = data[key];
          // Trigger change event untuk select2 atau custom select
          const event = new Event('change', { bubbles: true });
          input.dispatchEvent(event);
        } else {
          input.value = data[key];
        }
      }
    });

    // Set data-id pada form untuk update
    form.dataset.id = data.id;
  }

  openGenericEditModal(data, type) {
    // Fallback: buat modal sederhana jika modal spesifik tidak ada
    console.log('Opening generic edit modal for:', type, data);
    alert('Form edit akan dibuka. Data: ' + JSON.stringify(data, null, 2));
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
        button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';
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

  showError(message) {
    // Tampilkan error message
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
    window.editButtonHandler = new EditButtonHandler();
  });
} else {
  window.editButtonHandler = new EditButtonHandler();
}
