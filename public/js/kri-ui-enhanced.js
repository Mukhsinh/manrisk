// Enhanced UI untuk KRI - Sesuai Gambar
// File ini meng-override render function dari kri.js

(function() {
  'use strict';

  // Wait for KRI module to be available
  const waitForModule = setInterval(() => {
    if (window.KRI) {
      clearInterval(waitForModule);
      enhanceKRIUI();
    }
  }, 100);

  function enhanceKRIUI() {
    console.log('🎨 Enhancing KRI UI...');

    // Ensure CSS is loaded
    if (!document.getElementById('kri-ui-fix-css')) {
      const link = document.createElement('link');
      link.id = 'kri-ui-fix-css';
      link.rel = 'stylesheet';
      link.href = '/css/kri-ui-fix.css';
      document.head.appendChild(link);
    }

    // Override render function
    const originalRender = window.KRI.render;
    
    window.KRI.render = function(data) {
      const content = document.getElementById('kri-content');
      if (!content) {
        console.error('KRI content container not found');
        return;
      }

      if (!data || data.length === 0) {
        content.innerHTML = `
          <div style="text-align: center; padding: 3rem; color: #666;">
            <i class="fas fa-info-circle" style="font-size: 3rem; color: #3498db; margin-bottom: 1rem;"></i>
            <h4 style="color: #2c3e50; margin-bottom: 0.5rem;">Tidak Ada Data KRI</h4>
            <p style="color: #7f8c8d;">Belum ada data Key Risk Indicator. Silakan tambah data KRI terlebih dahulu.</p>
          </div>
        `;
        return;
      }

      // Calculate statistics
      const stats = calculateStats(data);

      content.innerHTML = `
        <!-- KRI Header dengan Gradient Biru -->
        <div class="kri-header">
          <h1>Key Risk Indicator (KRI)</h1>
        </div>

        <!-- Button Group -->
        <div class="kri-button-group">
          <button class="btn-kri-refresh" onclick="KRI.load()">
            <i class="fas fa-sync"></i> Refresh
          </button>
          <button class="btn-kri-download" onclick="KRI.downloadReport()">
            <i class="fas fa-download"></i> Download
          </button>
          <button class="btn-kri-add" onclick="KRI.showAddModal()">
            <i class="fas fa-plus"></i> Tambah KRI
          </button>
          <button class="btn-kri-settings" onclick="alert('Fitur pengaturan akan segera tersedia')">
            <i class="fas fa-cog"></i> Pengaturan
          </button>
        </div>

        <!-- Filter Section - 3 Kolom -->
        <div class="kri-filter-section">
          <div class="kri-filter-grid">
            <div class="kri-filter-item">
              <label>Rencana Strategis</label>
              <select>
                <option value="">Semua</option>
              </select>
            </div>
            <div class="kri-filter-item">
              <label>Unit Kerja</label>
              <select>
                <option value="">Semua</option>
              </select>
            </div>
            <div class="kri-filter-item">
              <label>Kategori Risiko</label>
              <select>
                <option value="">Semua</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Statistics Cards - 4 Kolom -->
        <div class="kri-stats-grid">
          <div class="kri-stat-card critical">
            <div class="kri-stat-value">${stats.kritis}</div>
            <div class="kri-stat-label">Kritis</div>
          </div>
          <div class="kri-stat-card high">
            <div class="kri-stat-value">${stats.hatiHati}</div>
            <div class="kri-stat-label">Hati-hati</div>
          </div>
          <div class="kri-stat-card medium">
            <div class="kri-stat-value">${stats.aman}</div>
            <div class="kri-stat-label">Aman</div>
          </div>
          <div class="kri-stat-card low">
            <div class="kri-stat-value">${data.length}</div>
            <div class="kri-stat-label">Total KRI</div>
          </div>
        </div>

        <!-- Charts Section - 2 Kolom -->
        <div class="kri-charts-section">
          <div class="kri-chart-card">
            <h3>Status Distribution</h3>
            <div class="kri-chart-container">
              <canvas id="kri-status-chart"></canvas>
            </div>
          </div>
          <div class="kri-chart-card">
            <h3>Trend Analysis</h3>
            <div class="kri-chart-container">
              <canvas id="kri-trend-chart"></canvas>
            </div>
          </div>
        </div>

        <!-- Table Section -->
        <div class="kri-table-section">
          <div class="kri-table-header">
            <h3>Key Risk Indicator Data</h3>
          </div>
          <div class="kri-table-responsive">
            <table class="kri-data-table">
              <thead>
                <tr>
                  <th>Kode</th>
                  <th>Nama Indikator</th>
                  <th>Kategori</th>
                  <th>Nilai Aktual</th>
                  <th>Status</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                ${renderTableRows(data)}
              </tbody>
            </table>
          </div>
        </div>
      `;

      // Render charts after DOM is ready
      setTimeout(() => {
        if (typeof Chart !== 'undefined') {
          renderCharts(stats);
        }
      }, 100);
    };

    console.log('✅ KRI UI enhanced');
  }

  function calculateStats(data) {
    return {
      aman: data.filter(d => d.status_indikator === 'Aman').length,
      hatiHati: data.filter(d => d.status_indikator === 'Hati-hati' || d.status_indikator === 'Peringatan').length,
      kritis: data.filter(d => d.status_indikator === 'Kritis').length
    };
  }

  function renderTableRows(data) {
    return data.map(item => {
      const statusClass = getStatusBadgeClass(item.status_indikator);
      
      return `
        <tr>
          <td><strong>${item.kode}</strong></td>
          <td>${item.nama_indikator}</td>
          <td>${item.master_risk_categories?.name || '-'}</td>
          <td>${item.nilai_aktual || '-'}</td>
          <td><span class="kri-badge ${statusClass}">${item.status_indikator || '-'}</span></td>
          <td>
            <div class="kri-action-buttons">
              <button class="kri-btn-edit" onclick="KRI.edit('${item.id}')" title="Edit">
                <i class="fas fa-edit"></i>
              </button>
              <button class="kri-btn-delete" onclick="KRI.confirmDelete('${item.id}', '${item.kode}')" title="Hapus">
                <i class="fas fa-trash"></i>
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  }

  function getStatusBadgeClass(status) {
    if (!status) return 'kri-badge-low';
    if (status === 'Kritis') return 'kri-badge-critical';
    if (status === 'Hati-hati' || status === 'Peringatan') return 'kri-badge-high';
    if (status === 'Aman') return 'kri-badge-low';
    return 'kri-badge-medium';
  }

  function renderCharts(stats) {
    // Render status distribution chart
    const ctx = document.getElementById('kri-status-chart');
    if (!ctx || typeof Chart === 'undefined') return;

    try {
      if (window.kriChartInstance) {
        window.kriChartInstance.destroy();
      }

      window.kriChartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: ['Aman', 'Hati-hati', 'Kritis'],
          datasets: [{
            data: [stats.aman, stats.hatiHati, stats.kritis],
            backgroundColor: ['#10b981', '#f59e0b', '#ef4444'],
            borderWidth: 2,
            borderColor: '#ffffff'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom',
              labels: {
                padding: 15,
                font: { size: 12 }
              }
            }
          }
        }
      });
    } catch (error) {
      console.error('Error rendering KRI chart:', error);
    }
  }

})();
