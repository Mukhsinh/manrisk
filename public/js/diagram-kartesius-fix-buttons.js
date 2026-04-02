// Fix untuk tombol Hitung Diagram dan Unduh Diagram
// File ini memperbaiki masalah event handler dan library dependencies

(function() {
  console.log('🔧 Loading diagram kartesius button fixes...');

  // Load jsPDF library jika belum ada
  function loadJsPDF() {
    return new Promise((resolve, reject) => {
      if (typeof window.jspdf !== 'undefined') {
        console.log('✓ jsPDF already loaded');
        resolve();
        return;
      }

      console.log('📦 Loading jsPDF library...');
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
      script.onload = () => {
        console.log('✓ jsPDF loaded successfully');
        resolve();
      };
      script.onerror = () => {
        console.error('❌ Failed to load jsPDF');
        reject(new Error('Failed to load jsPDF library'));
      };
      document.head.appendChild(script);
    });
  }

  // Perbaiki fungsi calculate untuk menangani event dengan benar
  if (window.DiagramKartesiusModule) {
    const originalCalculate = window.DiagramKartesiusModule.calculate;
    
    window.DiagramKartesiusModule.calculate = async function(event) {
      const unit_kerja_id = document.getElementById('filter-unit-kerja')?.value || '';
      const jenis = document.getElementById('filter-jenis')?.value || '';
      const tahun = parseInt(document.getElementById('filter-tahun')?.value || new Date().getFullYear());

      const message = `Hitung diagram kartesius otomatis untuk tahun ${tahun}?\n\nSistem akan menghitung diagram untuk unit kerja yang dipilih secara otomatis.`;
      
      if (!confirm(message)) return;

      // Get button reference dengan cara yang lebih robust
      let button = null;
      if (event && event.target) {
        button = event.target.closest('button');
      }
      if (!button) {
        button = document.querySelector('button[onclick*="calculate"]');
      }
      
      let originalText = '';
      if (button) {
        originalText = button.innerHTML;
        button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Menghitung...';
        button.disabled = true;
      }

      try {
        const api = window.app ? window.app.apiCall : window.apiCall;
        
        console.log('🔄 Calculating diagram for:', { unit_kerja_id, jenis, tahun });

        const response = await api('/api/diagram-kartesius/calculate', {
          method: 'POST',
          body: {
            unit_kerja_id: unit_kerja_id || null,
            jenis: jenis || null,
            tahun
          }
        });
        
        console.log('✅ Calculation response:', response);
        
        // Reload data
        if (window.DiagramKartesiusModule && window.DiagramKartesiusModule.load) {
          await window.DiagramKartesiusModule.load();
        }
        
        const successMessage = `Diagram berhasil dihitung!\n\n` +
          `✅ Berhasil: ${response.summary?.successful || 0} unit\n` +
          `❌ Gagal: ${response.summary?.failed || 0} unit\n\n` +
          `Total unit diproses: ${response.summary?.total_processed || 0}`;
        
        alert(successMessage);
        
      } catch (error) {
        console.error('❌ Calculate error:', error);
        alert('Error: ' + (error.message || 'Terjadi kesalahan saat menghitung diagram'));
      } finally {
        // Restore button
        if (button) {
          button.innerHTML = originalText;
          button.disabled = false;
        }
      }
    };

    console.log('✓ Calculate function fixed');
  }

  // Perbaiki fungsi downloadChart untuk memastikan jsPDF dimuat
  if (window.DiagramKartesiusModule) {
    const originalDownloadChart = window.DiagramKartesiusModule.downloadChart;
    
    window.DiagramKartesiusModule.downloadChart = async function() {
      // Pastikan ada chart untuk diunduh
      const canvas = document.getElementById('diagram-chart');
      if (!canvas) {
        alert('Tidak ada diagram untuk diunduh');
        return;
      }

      try {
        // Load jsPDF terlebih dahulu
        await loadJsPDF();

        // Tampilkan modal download
        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.style.display = 'flex';
        modal.innerHTML = `
          <div class="modal-content" style="max-width: 400px;">
            <div class="modal-header">
              <h3 class="modal-title">Unduh Diagram Kartesius</h3>
              <button class="modal-close" onclick="this.closest('.modal').remove()">&times;</button>
            </div>
            <div class="modal-body">
              <div class="form-group">
                <label class="form-label">Format File</label>
                <select class="form-control" id="download-format">
                  <option value="png">PNG (Gambar)</option>
                  <option value="jpg">JPG (Gambar)</option>
                  <option value="pdf">PDF (Dokumen)</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Nama File</label>
                <input type="text" class="form-control" id="download-filename" 
                       value="diagram-kartesius-${new Date().getFullYear()}" 
                       placeholder="Nama file tanpa ekstensi">
              </div>
              <div class="form-group">
                <label class="form-label">Kualitas</label>
                <select class="form-control" id="download-quality">
                  <option value="1">Tinggi (1x)</option>
                  <option value="2" selected>Sangat Tinggi (2x)</option>
                  <option value="3">Ultra Tinggi (3x)</option>
                </select>
              </div>
            </div>
            <div class="modal-footer" style="display: flex; gap: 0.5rem; justify-content: flex-end; padding: 1rem;">
              <button type="button" class="btn btn-secondary" onclick="this.closest('.modal').remove()">Batal</button>
              <button type="button" class="btn btn-primary" onclick="window.executeDownloadDiagram()">
                <i class="fas fa-download"></i> Unduh
              </button>
            </div>
          </div>
        `;
        document.body.appendChild(modal);

        console.log('✓ Download modal opened');
      } catch (error) {
        console.error('❌ Download error:', error);
        alert('Error: ' + error.message);
      }
    };

    console.log('✓ DownloadChart function fixed');
  }

  // Fungsi untuk execute download
  window.executeDownloadDiagram = function() {
    try {
      const format = document.getElementById('download-format').value;
      const filename = document.getElementById('download-filename').value || 'diagram-kartesius';
      const quality = parseFloat(document.getElementById('download-quality').value);

      console.log('📥 Downloading:', { format, filename, quality });

      if (format === 'pdf') {
        downloadDiagramAsPDF(filename);
      } else {
        downloadDiagramAsImage(format, filename, quality);
      }

      // Close modal
      document.querySelector('.modal')?.remove();
    } catch (error) {
      console.error('❌ Execute download error:', error);
      alert('Error saat mengunduh: ' + error.message);
    }
  };

  // Download sebagai gambar
  function downloadDiagramAsImage(format, filename, quality) {
    const canvas = document.getElementById('diagram-chart');
    if (!canvas) {
      alert('Canvas tidak ditemukan');
      return;
    }

    try {
      // Create high-resolution canvas
      const tempCanvas = document.createElement('canvas');
      const tempCtx = tempCanvas.getContext('2d');
      
      // Set high resolution
      const width = canvas.width * quality;
      const height = canvas.height * quality;
      tempCanvas.width = width;
      tempCanvas.height = height;
      
      // Scale context for high resolution
      tempCtx.scale(quality, quality);
      tempCtx.drawImage(canvas, 0, 0);

      // Convert to blob and download
      tempCanvas.toBlob(function(blob) {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${filename}.${format}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        console.log('✓ Image downloaded:', filename);
      }, `image/${format}`, 0.95);
    } catch (error) {
      console.error('❌ Image download error:', error);
      alert('Error saat mengunduh gambar: ' + error.message);
    }
  }

  // Download sebagai PDF
  function downloadDiagramAsPDF(filename) {
    const canvas = document.getElementById('diagram-chart');
    if (!canvas) {
      alert('Canvas tidak ditemukan');
      return;
    }

    try {
      if (typeof window.jspdf === 'undefined') {
        alert('Library PDF belum dimuat. Silakan coba lagi.');
        return;
      }

      const { jsPDF } = window.jspdf;
      const pdf = new jsPDF('landscape', 'mm', 'a4');
      
      // Add title
      pdf.setFontSize(16);
      pdf.text('Diagram Kartesius SWOT Analysis', 20, 20);
      
      // Add metadata
      pdf.setFontSize(10);
      const currentDate = new Date().toLocaleDateString('id-ID');
      pdf.text(`Tanggal: ${currentDate}`, 20, 30);
      pdf.text(`Tahun: ${new Date().getFullYear()}`, 20, 35);

      // Convert canvas to image and add to PDF
      const imgData = canvas.toDataURL('image/png', 0.95);
      const imgWidth = 250;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 20, 45, imgWidth, imgHeight);

      // Save PDF
      pdf.save(`${filename}.pdf`);
      
      console.log('✓ PDF downloaded:', filename);
    } catch (error) {
      console.error('❌ PDF generation error:', error);
      alert('Error saat membuat PDF: ' + error.message);
    }
  }

  console.log('✓ Diagram kartesius button fixes loaded');
})();
