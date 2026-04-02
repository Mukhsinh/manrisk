// Enhanced Download Handler untuk Risk Profile
// Mendukung format Excel dan PDF dengan modal selector

const RiskProfileDownloadHandler = (() => {
  let modalInstance = null;

  function showFormatSelector() {
    // Hapus modal lama jika ada
    if (modalInstance) {
      modalInstance.remove();
    }

    // Buat modal baru
    const modal = document.createElement('div');
    modal.id = 'download-format-modal';
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10000;
      animation: fadeIn 0.2s ease-in-out;
    `;

    modal.innerHTML = `
      <div style="
        background: white;
        border-radius: 12px;
        padding: 2rem;
        max-width: 400px;
        width: 90%;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
        animation: slideUp 0.3s ease-out;
      ">
        <h3 style="margin: 0 0 1.5rem 0; color: #1f2937; font-size: 1.25rem; font-weight: 600;">
          <i class="fas fa-download" style="color: #0066cc; margin-right: 0.5rem;"></i>
          Pilih Format Unduhan
        </h3>
        
        <div style="display: flex; flex-direction: column; gap: 1rem;">
          <button onclick="RiskProfileDownloadHandler.downloadExcel()" style="
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            color: white;
            border: none;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            font-size: 1rem;
            font-weight: 600;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.75rem;
            transition: transform 0.2s, box-shadow 0.2s;
          " onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 4px 12px rgba(16, 185, 129, 0.3)'" onmouseout="this.style.transform=''; this.style.boxShadow=''">
            <i class="fas fa-file-excel" style="font-size: 1.25rem;"></i>
            <span>Download Excel (.xlsx)</span>
          </button>

          <button onclick="RiskProfileDownloadHandler.downloadPDF()" style="
            background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
            color: white;
            border: none;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            font-size: 1rem;
            font-weight: 600;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.75rem;
            transition: transform 0.2s, box-shadow 0.2s;
          " onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 4px 12px rgba(239, 68, 68, 0.3)'" onmouseout="this.style.transform=''; this.style.boxShadow=''">
            <i class="fas fa-file-pdf" style="font-size: 1.25rem;"></i>
            <span>Download PDF (.pdf)</span>
          </button>

          <button onclick="RiskProfileDownloadHandler.closeModal()" style="
            background: #f3f4f6;
            color: #6b7280;
            border: none;
            padding: 0.75rem 1.5rem;
            border-radius: 8px;
            font-size: 0.875rem;
            font-weight: 600;
            cursor: pointer;
            transition: background 0.2s;
          " onmouseover="this.style.background='#e5e7eb'" onmouseout="this.style.background='#f3f4f6'">
            Batal
          </button>
        </div>
      </div>
    `;

    // Tambahkan animasi CSS
    const style = document.createElement('style');
    style.textContent = `
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      @keyframes slideUp {
        from { transform: translateY(20px); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
      }
    `;
    document.head.appendChild(style);

    // Tutup modal saat klik di luar
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeModal();
      }
    });

    document.body.appendChild(modal);
    modalInstance = modal;
  }

  function closeModal() {
    if (modalInstance) {
      modalInstance.style.animation = 'fadeOut 0.2s ease-in-out';
      setTimeout(() => {
        modalInstance.remove();
        modalInstance = null;
      }, 200);
    }
  }


  async function downloadExcel() {
    closeModal();
    
    try {
      // Ambil data dari RiskProfileModule
      const data = window.RiskProfileModule?.state?.data || [];
      
      if (data.length === 0) {
        showNotification('Tidak ada data untuk diunduh', 'warning');
        return;
      }

      showNotification('Memproses unduhan Excel...', 'info');

      // Kirim request ke backend untuk generate Excel
      const token = localStorage.getItem('authToken') || localStorage.getItem('token') || '';
      const response = await fetch('/api/risk-profile/export/excel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ data })
      });

      if (!response.ok) {
        throw new Error('Gagal mengunduh file Excel');
      }

      // Download file
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `risk-profile-${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      showNotification('File Excel berhasil diunduh!', 'success');
    } catch (error) {
      console.error('Error downloading Excel:', error);
      showNotification('Gagal mengunduh file Excel: ' + error.message, 'error');
    }
  }

  async function downloadPDF() {
    closeModal();
    
    try {
      // Ambil data dari RiskProfileModule
      const data = window.RiskProfileModule?.state?.data || [];
      
      if (data.length === 0) {
        showNotification('Tidak ada data untuk diunduh', 'warning');
        return;
      }

      showNotification('Memproses unduhan PDF...', 'info');

      // Kirim request ke backend untuk generate PDF
      const token = localStorage.getItem('authToken') || localStorage.getItem('token') || '';
      const response = await fetch('/api/risk-profile/export/pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ data })
      });

      if (!response.ok) {
        throw new Error('Gagal mengunduh file PDF');
      }

      // Download file
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `risk-profile-${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      showNotification('File PDF berhasil diunduh!', 'success');
    } catch (error) {
      console.error('Error downloading PDF:', error);
      showNotification('Gagal mengunduh file PDF: ' + error.message, 'error');
    }
  }

  function showNotification(message, type = 'info') {
    const colors = {
      success: '#10b981',
      error: '#ef4444',
      warning: '#f59e0b',
      info: '#3b82f6'
    };

    const icons = {
      success: 'fa-check-circle',
      error: 'fa-exclamation-circle',
      warning: 'fa-exclamation-triangle',
      info: 'fa-info-circle'
    };

    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${colors[type]};
      color: white;
      padding: 1rem 1.5rem;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      z-index: 10001;
      display: flex;
      align-items: center;
      gap: 0.75rem;
      animation: slideInRight 0.3s ease-out;
    `;
    notification.innerHTML = `
      <i class="fas ${icons[type]}"></i>
      <span>${message}</span>
    `;

    document.body.appendChild(notification);
    setTimeout(() => {
      notification.style.animation = 'slideOutRight 0.3s ease-in';
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }

  return {
    showFormatSelector,
    closeModal,
    downloadExcel,
    downloadPDF
  };
})();

// Export untuk digunakan di window
window.RiskProfileDownloadHandler = RiskProfileDownloadHandler;
