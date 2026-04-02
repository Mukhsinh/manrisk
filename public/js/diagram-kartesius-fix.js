// Diagram Kartesius - Fix Module
const DiagramKartesiusFixModule = (() => {
  const state = {
    allData: [],
    filteredData: [],
    currentFilters: {
      unitKerja: '',
      jenis: '',
      tahun: new Date().getFullYear().toString()
    },
    isLoading: false,
    isCalculating: false
  };

  const api = () => (window.app ? window.app.apiCall : window.apiCall);
  const getEl = (id) => document.getElementById(id);

  /**
   * Initialize module
   */
  async function init() {
    console.log('=== DIAGRAM KARTESIUS FIX MODULE INIT ===');
    
    try {
      // Load CSS
      loadCSS();
      
      // Render UI
      render();
      
      // Load data
      await loadData();
      
      // Attach event listeners
      attachEventListeners();
      
      console.log('✓ Diagram Kartesius Fix Module initialized');
    } catch (error) {
      console.error('❌ Error initializing Diagram Kartesius:', error);
      showError('Gagal memuat halaman: ' + error.message);
    }
  }

  /**
   * Load CSS file
   */
  function loadCSS() {
    const cssId = 'diagram-kartesius-fix-css';
    if (!document.getElementById(cssId)) {
      const link = document.createElement('link');
      link.id = cssId;
      link.rel = 'stylesheet';
      link.href = '/css/diagram-kartesius-fix.css';
      document.head.appendChild(link);
      console.log('✓ Diagram Kartesius Fix CSS loaded');
    }
  }

  /**
   * Render UI
   */
  function render() {
    const container = getEl('diagram-kartesius-content');
    if (!container) {
      console.error('Container diagram-kartesius-content not found!');
      return;
    }

    container.innerHTML = `
      <!-- Header dengan Tombol Utama -->
      <div class="diagram-kartesius-header">
        <h3>Diagram Kartesius SWOT - Auto Calculation</h3>
        <div style="display: flex; gap: 10px; flex-wrap: wrap;">
          <button class="btn-hitung-diagram" id="btnHitungDiagram">
            <i class="fas fa-calculator"></i>
            <span>Hitung Diagram Otomatis</span>
          </button>
          <button class="btn-unduh-laporan" id="btnUnduhLaporan">
            <i class="fas fa-download"></i>
            <span>Unduh Laporan</span>
          </button>
        </div>
      </div>

      <!-- Filter Section -->
      <div class="filter-section">
        <div class="row">
          <div class="col-md-3">
            <label class="form-label">Unit Kerja</label>
            <select id="filterUnitKerja" class="form-select">
              <option value="">Semua Unit Kerja</option>
            </select>
          </div>
          <div class="col-md-3">
            <label class="form-label">Jenis</label>
            <select id="filterJenis" class="form-select">
              <option value="">Semua Jenis</option>
              <option value="Struktural">Struktural</option>
              <option value="Fungsional">Fungsional</option>
            </select>
          </div>
          <div class="col-md-3">
            <label class="form-label">Tahun</label>
            <select id="filterTahun" class="form-select">
              <option value="">Semua Tahun</option>
              <option value="2025" selected>2025</option>
              <option value="2024">2024</option>
              <option value="2023">2023</option>
            </select>
          </div>
          <div class="col-md-3" style="display: flex; align-items: flex-end;">
            <button class="btn-reset-filter" id="btnResetFilter">
              <i class="fas fa-undo"></i>
              <span>Reset Filter</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Alert Container -->
      <div id="alertContainer"></div>

      <!-- Tabel Diagram Kartesius -->
      <div class="diagram-kartesius-table-container card">
        <div class="card-header">
          <h5>Data Diagram Kartesius</h5>
          <small class="text-muted">Hasil perhitungan otomatis dari data SWOT</small>
        </div>
        <div class="card-body p-0">
          <div class="table-responsive">
            <table class="diagram-kartesius-table table">
              <thead>
                <tr>
                  <th>Tahun</th>
                  <th>Kode</th>
                  <th>Unit Kerja</th>
                  <th>X-Axis</th>
                  <th>Y-Axis</th>
                  <th>Kuadran</th>
                  <th>Strategi</th>
                </tr>
              </thead>
              <tbody id="diagramTableBody">
                <tr>
                  <td colspan="7" style="text-align: center; padding: 40px; color: #64748b;">
                    <i class="fas fa-spinner fa-spin" style="font-size: 24px; margin-bottom: 10px; display: block;"></i>
                    Memuat data...
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Attach event listeners
   */
  function attachEventListeners() {
    // Tombol Hitung Diagram
    const btnHitung = getEl('btnHitungDiagram');
    if (btnHitung) {
      btnHitung.addEventListener('click', hitungDiagram);
    }

    // Tombol Unduh Laporan
    const btnUnduh = getEl('btnUnduhLaporan');
    if (btnUnduh) {
      btnUnduh.addEventListener('click', unduhLaporan);
    }

    // Tombol Reset Filter
    const btnReset = getEl('btnResetFilter');
    if (btnReset) {
      btnReset.addEventListener('click', resetFilter);
    }

    // Filter changes
    ['filterUnitKerja', 'filterJenis', 'filterTahun'].forEach(filterId => {
      const filterEl = getEl(filterId);
      if (filterEl) {
        filterEl.addEventListener('change', applyFilters);
      }
    });
  }

  /**
   * Load data from API
   */
  async function loadData() {
    try {
      state.isLoading = true;
      showLoading();

      // Build query params
      const params = new URLSearchParams();
      if (state.currentFilters.unitKerja) {
        params.append('unit_kerja_id', state.currentFilters.unitKerja);
      }
      if (state.currentFilters.jenis) {
        params.append('jenis', state.currentFilters.jenis);
      }
      if (state.currentFilters.tahun) {
        params.append('tahun', state.currentFilters.tahun);
      }

      const data = await api()(`/api/diagram-kartesius?${params.toString()}`);
      state.allData = data || [];
      state.filteredData = [...state.allData];

      console.log('✓ Loaded diagram data:', state.allData.length, 'items');

      // Populate filters
      populateFilters();

      // Render table
      renderTable();

    } catch (error) {
      console.error('❌ Error loading data:', error);
      showError('Gagal memuat data: ' + error.message);
    } finally {
      state.isLoading = false;
    }
  }

  /**
   * Populate filter dropdowns
   */
  function populateFilters() {
    // Populate Unit Kerja filter
    const unitKerjaSelect = getEl('filterUnitKerja');
    if (unitKerjaSelect && state.allData.length > 0) {
      const uniqueUnits = [...new Set(state.allData
        .filter(item => item.master_work_units)
        .map(item => JSON.stringify({
          id: item.unit_kerja_id,
          name: item.master_work_units.name,
          code: item.master_work_units.code
        }))
      )].map(str => JSON.parse(str));

      unitKerjaSelect.innerHTML = '<option value="">Semua Unit Kerja</option>' +
        uniqueUnits.map(unit => 
          `<option value="${unit.id}">${unit.code} - ${unit.name}</option>`
        ).join('');
    }
  }

  /**
   * Apply filters
   */
  function applyFilters() {
    state.currentFilters = {
      unitKerja: getEl('filterUnitKerja')?.value || '',
      jenis: getEl('filterJenis')?.value || '',
      tahun: getEl('filterTahun')?.value || ''
    };

    loadData();
  }

  /**
   * Reset filters
   */
  function resetFilter() {
    getEl('filterUnitKerja').value = '';
    getEl('filterJenis').value = '';
    getEl('filterTahun').value = new Date().getFullYear().toString();
    
    applyFilters();
  }

  /**
   * Render table
   */
  function renderTable() {
    const tbody = getEl('diagramTableBody');
    if (!tbody) return;

    if (state.filteredData.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="7" style="text-align: center; padding: 40px; color: #64748b;">
            <i class="fas fa-info-circle" style="font-size: 24px; margin-bottom: 10px; display: block;"></i>
            Tidak ada data diagram kartesius. Klik "Hitung Diagram Otomatis" untuk membuat diagram.
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = state.filteredData.map(item => {
      const workUnit = item.master_work_units || {};
      const unitName = item.unit_kerja_name || workUnit.name || 'Unknown';
      const unitCode = workUnit.code || '-';
      const tahun = item.tahun || '-';
      const xAxis = (item.x_axis || 0).toFixed(2);
      const yAxis = (item.y_axis || 0).toFixed(2);
      const kuadran = item.kuadran || '-';
      const strategi = item.strategi || '-';

      // Badge classes
      const kuadranClass = `badge-kuadran-${kuadran.toLowerCase()}`;
      const strategiClass = `badge-strategi-${strategi.toLowerCase()}`;

      return `
        <tr>
          <td>${tahun}</td>
          <td><strong>${unitCode}</strong></td>
          <td>${unitName}</td>
          <td style="text-align: center;">${xAxis}</td>
          <td style="text-align: center;">${yAxis}</td>
          <td style="text-align: center;">
            <span class="badge-kuadran ${kuadranClass}">KUADRAN ${kuadran}</span>
          </td>
          <td style="text-align: center;">
            <span class="badge-strategi ${strategiClass}">${strategi}</span>
          </td>
        </tr>
      `;
    }).join('');
  }

  /**
   * Hitung Diagram - Auto calculation
   */
  async function hitungDiagram() {
    if (state.isCalculating) {
      showWarning('Perhitungan sedang berlangsung...');
      return;
    }

    const tahun = getEl('filterTahun')?.value;
    if (!tahun) {
      showError('Pilih tahun terlebih dahulu');
      return;
    }

    if (!confirm(`Hitung diagram kartesius untuk tahun ${tahun}?\n\nProses ini akan menghitung diagram untuk semua unit kerja secara otomatis.`)) {
      return;
    }

    try {
      state.isCalculating = true;
      
      // Update button state
      const btn = getEl('btnHitungDiagram');
      if (btn) {
        btn.disabled = true;
        btn.innerHTML = `
          <span class="loading-spinner"></span>
          <span>Menghitung...</span>
        `;
      }

      showInfo('Menghitung diagram kartesius...');

      // Call API
      const requestBody = {
        tahun: parseInt(tahun),
        unit_kerja_id: state.currentFilters.unitKerja || null,
        jenis: state.currentFilters.jenis || null
      };

      const result = await api()('/api/diagram-kartesius/calculate', {
        method: 'POST',
        body: JSON.stringify(requestBody)
      });

      console.log('✓ Calculation result:', result);

      // Show success message
      const successMsg = result.message || 'Diagram berhasil dihitung';
      const summary = result.summary || {};
      showSuccess(`${successMsg}\n\nBerhasil: ${summary.successful || 0} unit\nGagal: ${summary.failed || 0} unit`);

      // Reload data
      await loadData();

    } catch (error) {
      console.error('❌ Error calculating diagram:', error);
      showError('Gagal menghitung diagram: ' + error.message);
    } finally {
      state.isCalculating = false;
      
      // Restore button state
      const btn = getEl('btnHitungDiagram');
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = `
          <i class="fas fa-calculator"></i>
          <span>Hitung Diagram Otomatis</span>
        `;
      }
    }
  }

  /**
   * Unduh Laporan - Download Excel
   */
  async function unduhLaporan() {
    if (state.filteredData.length === 0) {
      showWarning('Tidak ada data untuk diunduh');
      return;
    }

    try {
      // Check if XLSX library is available
      if (typeof XLSX === 'undefined') {
        showError('Library XLSX belum dimuat. Silakan refresh halaman.');
        return;
      }

      showInfo('Menyiapkan laporan...');

      // Prepare data for Excel
      const excelData = state.filteredData.map((item, index) => {
        const workUnit = item.master_work_units || {};
        return {
          'No': index + 1,
          'Tahun': item.tahun || '-',
          'Kode Unit': workUnit.code || '-',
          'Unit Kerja': item.unit_kerja_name || workUnit.name || 'Unknown',
          'X-Axis (S-W)': (item.x_axis || 0).toFixed(2),
          'Y-Axis (O-T)': (item.y_axis || 0).toFixed(2),
          'Kuadran': item.kuadran || '-',
          'Strategi': item.strategi || '-',
          'Tanggal Update': item.updated_at ? new Date(item.updated_at).toLocaleDateString('id-ID') : '-'
        };
      });

      // Create workbook
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(excelData);

      // Set column widths
      ws['!cols'] = [
        { wch: 5 },   // No
        { wch: 8 },   // Tahun
        { wch: 12 },  // Kode Unit
        { wch: 30 },  // Unit Kerja
        { wch: 15 },  // X-Axis
        { wch: 15 },  // Y-Axis
        { wch: 12 },  // Kuadran
        { wch: 18 },  // Strategi
        { wch: 15 }   // Tanggal Update
      ];

      XLSX.utils.book_append_sheet(wb, ws, 'Diagram Kartesius');

      // Generate filename
      const timestamp = new Date().toISOString().slice(0, 10);
      const filename = `Laporan_Diagram_Kartesius_${timestamp}.xlsx`;

      // Download file
      XLSX.writeFile(wb, filename);

      showSuccess('Laporan berhasil diunduh');

    } catch (error) {
      console.error('❌ Error downloading report:', error);
      showError('Gagal mengunduh laporan: ' + error.message);
    }
  }

  /**
   * Show loading state
   */
  function showLoading() {
    const tbody = getEl('diagramTableBody');
    if (tbody) {
      tbody.innerHTML = `
        <tr>
          <td colspan="7" style="text-align: center; padding: 40px; color: #64748b;">
            <i class="fas fa-spinner fa-spin" style="font-size: 24px; margin-bottom: 10px; display: block;"></i>
            Memuat data...
          </td>
        </tr>
      `;
    }
  }

  /**
   * Show alert messages
   */
  function showAlert(message, type = 'info') {
    const container = getEl('alertContainer');
    if (!container) return;

    const alertClass = type === 'success' ? 'alert-success' : 
                       type === 'error' ? 'alert-error' : 
                       'alert-info';

    const icon = type === 'success' ? 'check-circle' :
                 type === 'error' ? 'exclamation-circle' :
                 'info-circle';

    container.innerHTML = `
      <div class="${alertClass}" style="display: flex; align-items: center; gap: 10px;">
        <i class="fas fa-${icon}"></i>
        <span>${message}</span>
      </div>
    `;

    // Auto hide after 5 seconds
    setTimeout(() => {
      container.innerHTML = '';
    }, 5000);
  }

  function showSuccess(message) {
    showAlert(message, 'success');
  }

  function showError(message) {
    showAlert(message, 'error');
  }

  function showInfo(message) {
    showAlert(message, 'info');
  }

  function showWarning(message) {
    showAlert(message, 'warning');
  }

  // Public API
  return {
    init,
    loadData,
    hitungDiagram,
    unduhLaporan,
    applyFilters,
    resetFilter
  };
})();

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('diagram-kartesius-content')) {
      DiagramKartesiusFixModule.init();
    }
  });
} else {
  if (document.getElementById('diagram-kartesius-content')) {
    DiagramKartesiusFixModule.init();
  }
}

// Export for global access
window.DiagramKartesiusFixModule = DiagramKartesiusFixModule;
window.diagramKartesiusFixModule = DiagramKartesiusFixModule;

console.log('📦 Diagram Kartesius Fix Module loaded');
