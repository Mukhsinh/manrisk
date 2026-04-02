// Enhanced UI untuk Residual Risk - Sesuai Gambar
// File ini meng-override render function dari residual-risk.js

(function() {
  'use strict';

  // Wait for ResidualRiskModule to be available
  const waitForModule = setInterval(() => {
    if (window.ResidualRiskModule) {
      clearInterval(waitForModule);
      enhanceResidualRiskUI();
    }
  }, 100);

  function enhanceResidualRiskUI() {
    console.log('🎨 Enhancing Residual Risk UI...');

    // Override render function
    const originalRender = window.ResidualRiskModule.render;
    
    window.ResidualRiskModule.render = function() {
      const container = document.getElementById('residual-risk-content');
      if (!container) {
        console.error('Container not found');
        return;
      }

      // Ensure CSS is loaded
      if (!document.getElementById('residual-risk-ui-fix-css')) {
        const link = document.createElement('link');
        link.id = 'residual-risk-ui-fix-css';
        link.rel = 'stylesheet';
        link.href = '/css/residual-risk-ui-fix.css';
        document.head.appendChild(link);
      }

      const state = window.ResidualRiskModule.state || { data: [], rencanaStrategis: [], unitKerja: [], categories: [] };

      // Calculate statistics
      const stats = calculateStats(state.data);

      container.innerHTML = `
        <!-- Page Header dengan Gradient Biru -->
        <div class="page-header">
          <h1>Residual Risk Analysis</h1>
        </div>

        <!-- Button Group -->
        <div class="button-group">
          <button class="btn-refresh" onclick="ResidualRiskModule.refresh()">
            <i class="fas fa-sync"></i> Refresh
          </button>
          <button class="btn-download" onclick="ResidualRiskModule.downloadExcel()">
            <i class="fas fa-download"></i> Download Excel
          </button>
          <button class="btn-add" onclick="alert('Fitur tambah data akan segera tersedia')">
            <i class="fas fa-plus"></i> Tambah Data
          </button>
          <button class="btn-settings" onclick="alert('Fitur pengaturan akan segera tersedia')">
            <i class="fas fa-cog"></i> Pengaturan
          </button>
        </div>

        <!-- Filter Section - 3 Kolom -->
        <div class="filter-section">
          <div class="filter-grid">
            <div class="filter-item">
              <label>Rencana Strategis</label>
              <select id="filter-residual-rencana" onchange="ResidualRiskModule.applyFilter()">
                <option value="">Semua</option>
                ${state.rencanaStrategis.map(r => `<option value="${r.id}">${r.nama_rencana}</option>`).join('')}
              </select>
            </div>
            <div class="filter-item">
              <label>Unit Kerja</label>
              <select id="filter-residual-unit" onchange="ResidualRiskModule.applyFilter()">
                <option value="">Semua</option>
                ${state.unitKerja.map(u => `<option value="${u.id}">${u.name}</option>`).join('')}
              </select>
            </div>
            <div class="filter-item">
              <label>Kategori Risiko</label>
              <select id="filter-residual-kategori" onchange="ResidualRiskModule.applyFilter()">
                <option value="">Semua</option>
                ${state.categories.map(c => `<option value="${c.id}">${c.name}</option>`).join('')}
              </select>
            </div>
          </div>
        </div>

        <!-- Statistics -->
        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; margin-bottom: 1.5rem;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 1.5rem; border-radius: 12px; color: white;">
            <div style="font-size: 2rem; font-weight: bold;">${stats.total}</div>
            <div style="font-size: 0.875rem;">Total Residual Risk</div>
          </div>
          <div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 1.5rem; border-radius: 12px; color: white;">
            <div style="font-size: 2rem; font-weight: bold;">${stats.avgInherent.toFixed(2)}</div>
            <div style="font-size: 0.875rem;">Avg Inherent Value</div>
          </div>
          <div style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); padding: 1.5rem; border-radius: 12px; color: white;">
            <div style="font-size: 2rem; font-weight: bold;">${stats.avgResidual.toFixed(2)}</div>
            <div style="font-size: 0.875rem;">Avg Residual Value</div>
          </div>
          <div style="background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%); padding: 1.5rem; border-radius: 12px; color: white;">
            <div style="font-size: 2rem; font-weight: bold;">${stats.reduction}%</div>
            <div style="font-size: 0.875rem;">Risk Reduction</div>
          </div>
        </div>

        <!-- Charts Section - 2 Kolom -->
        <div class="charts-section">
          <div class="chart-card">
            <h3>Risk Matrix</h3>
            <div class="chart-container">
              <canvas id="residual-risk-matrix"></canvas>
            </div>
            <div class="matrix-legend">
              <div class="legend-item">
                <div class="legend-symbol circle"></div>
                <span>Inherent Risk Rating</span>
              </div>
              <div class="legend-item">
                <div class="legend-symbol star"></div>
                <span>Residual Risk Rating (★)</span>
              </div>
              <div class="legend-symbol triangle"></div>
                <span>Risk Appetite</span>
              </div>
            </div>
          </div>
          <div class="chart-card">
            <h3>Comparison Chart</h3>
            <div class="chart-container">
              <canvas id="comparison-chart"></canvas>
            </div>
          </div>
        </div>

        <!-- Table Section -->
        <div class="table-section">
          <div class="table-header">
            <h3>Detail Residual Risk Analysis</h3>
          </div>
          <div class="table-responsive">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Kode Risiko</th>
                  <th>Unit Kerja</th>
                  <th>Inherent</th>
                  <th>Residual</th>
                  <th>Reduction</th>
                  <th>Level</th>
                  <th>Review Status</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                ${renderTableRows(state.data)}
              </tbody>
            </table>
          </div>
        </div>
      `;

      // Render charts after DOM is ready
      setTimeout(() => {
        if (typeof Chart !== 'undefined') {
          renderCharts(state.data);
        }
      }, 100);
    };

    console.log('✅ Residual Risk UI enhanced');
  }

  function calculateStats(data) {
    let totalInherent = 0;
    let totalResidual = 0;
    let validInherentCount = 0;
    
    data.forEach(item => {
      const risk = item.risk_inputs || {};
      let inherent = {};
      
      if (risk.risk_inherent_analysis && Array.isArray(risk.risk_inherent_analysis) && risk.risk_inherent_analysis.length > 0) {
        inherent = risk.risk_inherent_analysis[0];
      } else if (risk.risk_inherent_analysis && !Array.isArray(risk.risk_inherent_analysis)) {
        inherent = risk.risk_inherent_analysis;
      }
      
      const inherentValue = parseFloat(inherent.risk_value) || 0;
      const residualValue = parseFloat(item.risk_value) || 0;
      
      if (inherentValue > 0) {
        totalInherent += inherentValue;
        validInherentCount++;
      }
      totalResidual += residualValue;
    });

    const stats = {
      total: data.length,
      avgInherent: validInherentCount > 0 ? totalInherent / validInherentCount : 0,
      avgResidual: data.length > 0 ? totalResidual / data.length : 0,
      reduction: 0
    };
    
    if (stats.avgInherent > 0) {
      stats.reduction = ((stats.avgInherent - stats.avgResidual) / stats.avgInherent * 100).toFixed(1);
    } else {
      stats.reduction = '0.0';
    }

    return stats;
  }

  function renderTableRows(data) {
    if (!data || data.length === 0) {
      return '<tr><td colspan="8" style="text-align: center; padding: 2rem; color: #999;">Tidak ada data residual risk</td></tr>';
    }

    return data.map(item => {
      const risk = item.risk_inputs || {};
      let inherent = {};
      
      if (risk.risk_inherent_analysis && Array.isArray(risk.risk_inherent_analysis) && risk.risk_inherent_analysis.length > 0) {
        inherent = risk.risk_inherent_analysis[0];
      } else if (risk.risk_inherent_analysis && !Array.isArray(risk.risk_inherent_analysis)) {
        inherent = risk.risk_inherent_analysis;
      }
      
      const inherentValue = inherent.risk_value || 0;
      const residualValue = item.risk_value || 0;
      
      let reduction = '-';
      if (inherentValue > 0 && residualValue >= 0) {
        const reductionPercent = ((inherentValue - residualValue) / inherentValue * 100);
        reduction = reductionPercent.toFixed(1) + '%';
      }
      
      const levelClass = getBadgeClass(item.risk_level);
      
      return `
        <tr>
          <td><strong>${risk.kode_risiko || '-'}</strong></td>
          <td>${risk.master_work_units?.name || '-'}</td>
          <td><span class="badge ${getBadgeClass(inherent.risk_level)}">${inherentValue || '-'}</span></td>
          <td><span class="badge ${levelClass}">${residualValue || '-'}</span></td>
          <td><strong style="color: #059669;">${reduction}</strong></td>
          <td><span class="badge ${levelClass}">${item.risk_level || '-'}</span></td>
          <td><span class="badge ${getReviewBadgeClass(item.review_status)}">${item.review_status || '-'}</span></td>
          <td>
            <div class="action-buttons">
              <button class="btn-edit" onclick="alert('Edit: ${item.id}')" title="Edit">
                <i class="fas fa-edit"></i>
              </button>
              <button class="btn-delete" onclick="alert('Delete: ${item.id}')" title="Hapus">
                <i class="fas fa-trash"></i>
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  }

  function getBadgeClass(level) {
    if (!level) return 'badge-rendah';
    const l = level.toUpperCase();
    if (l.includes('TINGGI') || l.includes('HIGH')) return 'badge-tinggi';
    if (l.includes('SEDANG') || l.includes('MEDIUM')) return 'badge-sedang';
    return 'badge-rendah';
  }

  function getReviewBadgeClass(status) {
    if (!status) return 'badge-rendah';
    if (status === 'Reviewed') return 'badge-tinggi';
    return 'badge-sedang';
  }

  function renderCharts(data) {
    // Implement chart rendering here
    console.log('Rendering charts for', data.length, 'items');
  }

})();
