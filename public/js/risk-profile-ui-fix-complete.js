/**
 * Risk Profile UI Fix - Complete Version
 * Perbaikan tampilan dan fungsi sesuai gambar
 */

(function() {
  'use strict';
  
  // Pastikan module sudah ada
  if (!window.RiskProfileModule) {
    console.error('RiskProfileModule not found!');
    return;
  }
  
  // Simpan fungsi render original
  const originalRender = window.RiskProfileModule.render;
  
  // Override render function
  window.RiskProfileModule.render = function() {
    console.log('=== RISK PROFILE UI FIX - RENDERING ===');
    
    const container = document.getElementById('risk-profile-content');
    if (!container) {
      console.error('Container #risk-profile-content not found!');
      return;
    }
    
    // Load CSS if not already loaded
    if (!document.getElementById('risk-profile-ui-fix-css')) {
      const link = document.createElement('link');
      link.id = 'risk-profile-ui-fix-css';
      link.rel = 'stylesheet';
      link.href = '/css/risk-profile-ui-fix-complete.css';
      document.head.appendChild(link);
    }
    
    // Get data from module state
    const state = window.RiskProfileModule.state || { data: [], rencanaStrategis: [], unitKerja: [], categories: [], filters: {} };
    
    // Render dengan layout yang diperbaiki
    container.innerHTML = `
      ${renderHeader()}
      <div class="risk-profile-body">
        ${renderActionButtons()}
        ${renderMainGrid(state)}
        ${renderTable(state)}
      </div>
    `;
    
    // Initialize event listeners
    initializeEventListeners();
    
    console.log('=== RENDERING COMPLETE ===');
  };
  
  function renderHeader() {
    return `
      <div class="risk-profile-header">
        <img src="/images/logo.png" alt="Logo" onerror="this.style.display='none'">
        <h3>Profil Risiko Inheren</h3>
      </div>
    `;
  }
  
  function renderActionButtons() {
    return `
      <div class="action-buttons">
        <button class="btn-action btn-refresh" onclick="RiskProfileModule.refresh()">
          <i class="fas fa-sync"></i> Refresh Data
        </button>
        <button class="btn-action btn-download" onclick="RiskProfileModule.downloadReport()">
          <i class="fas fa-download"></i> Download Report
        </button>
        <button class="btn-action btn-add">
          <i class="fas fa-plus"></i> Tambah Analisis
        </button>
        <button class="btn-action btn-settings">
          <i class="fas fa-cog"></i> Pengaturan
        </button>
      </div>
    `;
  }
  
  function renderMainGrid(state) {
    return `
      <div class="main-grid">
        ${renderHeatMap(state.data)}
        ${renderFilters(state)}
      </div>
    `;
  }
  
  function renderHeatMap(data) {
    // Hitung distribusi risiko per cell
    const matrix = Array(5).fill(null).map(() => Array(5).fill(0));
    
    data.forEach(item => {
      const prob = parseInt(item.probability) || 0;
      const impact = parseInt(item.impact) || 0;
      if (prob >= 1 && prob <= 5 && impact >= 1 && impact <= 5) {
        matrix[5 - prob][impact - 1]++;
      }
    });
    
    // Generate cells HTML
    let cellsHTML = '';
    for (let row = 0; row < 5; row++) {
      for (let col = 0; col < 5; col++) {
        const count = matrix[row][col];
        const level = getRiskLevel(row, col);
        cellsHTML += `<div class="heat-map-cell level-${level}" title="Count: ${count}">${count}</div>`;
      }
    }
    
    return `
      <div class="heat-map-container">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
          <div style="font-size: 0.875rem; color: #6b7280;">Low Risk</div>
          <div style="font-size: 0.875rem; color: #6b7280;">Extreme Risk</div>
        </div>
        
        <div style="display: grid; grid-template-columns: auto 1fr; gap: 0.5rem;">
          <!-- Y-axis labels (Probability) -->
          <div style="display: flex; flex-direction: column; justify-content: space-between; padding-right: 0.5rem;">
            <div class="axis-label">5</div>
            <div class="axis-label">4</div>
            <div class="axis-label">3</div>
            <div class="axis-label">2</div>
            <div class="axis-label">1</div>
          </div>
          
          <!-- Heat map grid -->
          <div>
            <div class="heat-map-grid">${cellsHTML}</div>
            
            <!-- X-axis labels (Impact) -->
            <div style="display: grid; grid-template-columns: repeat(5, 1fr); gap: 4px; margin-top: 0.5rem;">
              <div class="axis-label">1</div>
              <div class="axis-label">2</div>
              <div class="axis-label">3</div>
              <div class="axis-label">4</div>
              <div class="axis-label">5</div>
            </div>
          </div>
        </div>
        
        <div style="margin-top: 1rem; text-align: center;">
          <div style="font-weight: 600; margin-bottom: 0.25rem;">Probability</div>
          <div style="font-weight: 600; margin-bottom: 0.25rem;">Dampak</div>
          <div style="font-size: 0.875rem; color: #6b7280;">Low → High</div>
        </div>
      </div>
    `;
  }
  
  function getRiskLevel(row, col) {
    const prob = 5 - row;
    const impact = col + 1;
    const value = prob * impact;
    
    if (value >= 16) return 'extreme';
    if (value >= 10) return 'high';
    if (value >= 5) return 'medium';
    return 'low';
  }
  
  function renderFilters(state) {
    return `
      <div class="filter-container">
        <div class="filter-group">
          <label>Rencana Strategis</label>
          <select class="filter-dropdown" id="filter-rencana" onchange="RiskProfileModule.applyFilter()">
            <option value="">Semua</option>
            ${state.rencanaStrategis.map(r => `
              <option value="${r.id}" ${state.filters.rencana_strategis_id === r.id ? 'selected' : ''}>
                ${r.nama_rencana}
              </option>
            `).join('')}
          </select>
        </div>
        
        <div class="filter-group">
          <label>Unit Kerja</label>
          <select class="filter-dropdown" id="filter-unit" onchange="RiskProfileModule.applyFilter()">
            <option value="">Semua</option>
            ${state.unitKerja.map(u => `
              <option value="${u.id}" ${state.filters.unit_kerja_id === u.id ? 'selected' : ''}>
                ${u.name}
              </option>
            `).join('')}
          </select>
        </div>
        
        <div class="filter-group">
          <label>Kategori Risiko</label>
          <select class="filter-dropdown" id="filter-kategori" onchange="RiskProfileModule.applyFilter()">
            <option value="">Semua</option>
            ${state.categories.map(c => `
              <option value="${c.id}" ${state.filters.kategori_risiko_id === c.id ? 'selected' : ''}>
                ${c.name}
              </option>
            `).join('')}
          </select>
        </div>
        
        <div class="filter-group">
          <label>Risk Level</label>
          <select class="filter-dropdown" id="filter-level" onchange="RiskProfileModule.applyFilter()">
            <option value="">Semua</option>
            <option value="EXTREME HIGH" ${state.filters.risk_level === 'EXTREME HIGH' ? 'selected' : ''}>Extreme High</option>
            <option value="HIGH RISK" ${state.filters.risk_level === 'HIGH RISK' ? 'selected' : ''}>High Risk</option>
            <option value="MEDIUM RISK" ${state.filters.risk_level === 'MEDIUM RISK' ? 'selected' : ''}>Medium Risk</option>
            <option value="LOW RISK" ${state.filters.risk_level === 'LOW RISK' ? 'selected' : ''}>Low Risk</option>
          </select>
        </div>
      </div>
    `;
  }
  
  function renderTable(state) {
    if (!state.data || state.data.length === 0) {
      return `
        <div class="table-container">
          <div class="empty-state">
            <i class="fas fa-info-circle"></i>
            <h4>Tidak Ada Data Risk Profile</h4>
            <p>Belum ada data inherent risk analysis. Silakan lakukan analisis risiko terlebih dahulu.</p>
          </div>
        </div>
      `;
    }
    
    const rowsHTML = state.data.map(item => {
      const risk = item.risk_inputs || {};
      const riskCode = risk?.kode_risiko || '-';
      const unitName = risk?.master_work_units?.name || '-';
      const unitJenis = risk?.master_work_units?.jenis || '';
      const unitKategori = risk?.master_work_units?.kategori || '';
      const categoryName = risk?.master_risk_categories?.name || '-';
      
      return `
        <tr>
          <td style="font-weight: 600; color: #1f2937;">${riskCode}</td>
          <td>
            <div style="font-weight: 500;">${unitName}</div>
            ${unitJenis || unitKategori ? `<div style="font-size: 0.75rem; color: #6b7280;">${unitJenis} - ${unitKategori}</div>` : ''}
          </td>
          <td>${categoryName}</td>
          <td style="text-align: center; font-weight: 600;">${item.probability || '-'}</td>
          <td style="text-align: center; font-weight: 600;">${item.impact || '-'}</td>
          <td style="text-align: center; font-weight: 700; font-size: 1rem;">${item.risk_value || '-'}</td>
          <td style="text-align: center;">
            <span class="badge-status badge-${getBadgeClass(item.risk_level)}">${item.risk_level || '-'}</span>
          </td>
          <td style="text-align: center;">${item.probability_percentage || '-'}</td>
          <td style="text-align: right; font-weight: 500;">Rp ${formatNumber(item.financial_impact || 0)}</td>
          <td style="text-align: center;">
            <div style="display: flex; gap: 0.25rem; justify-content: center;">
              <button class="action-btn btn-edit" title="Edit" onclick="editRiskProfile('${item.id}')">
                <i class="fas fa-edit"></i>
              </button>
              <button class="action-btn btn-delete" title="Hapus" onclick="deleteRiskProfile('${item.id}')">
                <i class="fas fa-trash"></i>
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
    
    return `
      <div class="table-container">
        <table class="table">
          <thead>
            <tr>
              <th>KODE RISIKO</th>
              <th>UNIT KERJA</th>
              <th>KATEGORI</th>
              <th>PROBABILITAS</th>
              <th>DAMPAK</th>
              <th>RISK VALUE</th>
              <th>RISK LEVEL</th>
              <th>PROB %</th>
              <th>DAMPAK FINANSIAL</th>
              <th>AKSI</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHTML}
          </tbody>
        </table>
      </div>
    `;
  }
  
  function getBadgeClass(level) {
    const levelMap = {
      'EXTREME HIGH': 'sangat-tinggi',
      'Very High': 'sangat-tinggi',
      'Sangat Tinggi': 'sangat-tinggi',
      'HIGH RISK': 'tinggi',
      'Tinggi': 'tinggi',
      'MEDIUM RISK': 'sedang',
      'Sedang': 'sedang',
      'LOW RISK': 'rendah',
      'Rendah': 'rendah'
    };
    return levelMap[level] || 'rendah';
  }
  
  function formatNumber(num) {
    return new Intl.NumberFormat('id-ID').format(num);
  }
  
  function initializeEventListeners() {
    // Add any additional event listeners here
    console.log('Event listeners initialized');
  }
  
  // Global functions for button actions
  window.editRiskProfile = function(id) {
    console.log('Edit risk profile:', id);
    alert('Edit functionality - ID: ' + id);
  };
  
  window.deleteRiskProfile = function(id) {
    if (confirm('Apakah Anda yakin ingin menghapus data ini?')) {
      console.log('Delete risk profile:', id);
      alert('Delete functionality - ID: ' + id);
      // In real app, call API to delete
    }
  };
  
  console.log('Risk Profile UI Fix loaded successfully');
})();
