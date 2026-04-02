// Risk Profile Module - Auto-generate from Risk Inputs
const RiskProfileModule = (() => {
  const state = {
    data: [],
    rencanaStrategis: [],
    unitKerja: [],
    categories: [],
    filters: {
      rencana_strategis_id: '',
      unit_kerja_id: '',
      kategori_risiko_id: '',
      risk_level: ''
    },
    chart: null,
    activeTab: 'risk-profile' // Default tab
  };

  const api = () => {
    // Try to use app.apiCall if available, otherwise use fetch
    if (window.app && window.app.apiCall) {
      return window.app.apiCall;
    } else if (window.apiCall) {
      return window.apiCall;
    } else {
      // Fallback to fetch
      return async (endpoint, options = {}) => {
        const response = await fetch(endpoint, {
          ...options,
          headers: {
            'Content-Type': 'application/json',
            ...options.headers
          }
        });
        if (!response.ok) throw new Error(`API Error: ${response.statusText}`);
        return response.json();
      };
    }
  };

  async function load() {
    console.log('=== RISK PROFILE LOAD START ===');
    
    // Wait for Chart.js to be available
    let attempts = 0;
    while (typeof Chart === 'undefined' && attempts < 20) {
      console.log(`⏳ Menunggu Chart.js... (${attempts + 1}/20)`);
      await new Promise(resolve => setTimeout(resolve, 200));
      attempts++;
    }
    
    if (typeof Chart === 'undefined') {
      console.error('❌ Chart.js tidak tersedia setelah 4 detik');
    } else {
      console.log('✅ Chart.js tersedia');
    }
    
    await Promise.all([fetchMasterData(), fetchRiskProfile()]);
    render();
    console.log('=== RISK PROFILE LOAD END ===');
  }

  async function fetchMasterData() {
    try {
      console.log('Fetching master data...');
      const apiFunc = api();
      
      const [rencana, units, categories] = await Promise.all([
        apiFunc('/api/rencana-strategis').catch(err => {
          console.warn('Failed to fetch rencana strategis:', err.message);
          return [];
        }),
        apiFunc('/api/master-data/work-units').catch(err => {
          console.warn('Failed to fetch work units:', err.message);
          return [];
        }),
        apiFunc('/api/master-data/risk-categories').catch(err => {
          console.warn('Failed to fetch risk categories:', err.message);
          return [];
        })
      ]);
      
      state.rencanaStrategis = rencana || [];
      state.unitKerja = units || [];
      state.categories = categories || [];
      
      console.log('Master data loaded:', {
        rencana: state.rencanaStrategis.length,
        units: state.unitKerja.length,
        categories: state.categories.length
      });
    } catch (error) {
      console.error('Error fetching master data:', error);
      // Set empty arrays as fallback
      state.rencanaStrategis = [];
      state.unitKerja = [];
      state.categories = [];
    }
  }

  async function fetchRiskProfile() {
    try {
      console.log('=== FETCHING RISK PROFILE ===');
      console.log('API function available:', typeof api());
      console.log('Current filters:', state.filters);
      
      const params = new URLSearchParams();
      if (state.filters.rencana_strategis_id) params.append('rencana_strategis_id', state.filters.rencana_strategis_id);
      if (state.filters.unit_kerja_id) params.append('unit_kerja_id', state.filters.unit_kerja_id);
      if (state.filters.kategori_risiko_id) params.append('kategori_risiko_id', state.filters.kategori_risiko_id);
      if (state.filters.risk_level) params.append('risk_level', state.filters.risk_level);

      const queryString = params.toString();
      
      // Try multiple endpoints for better reliability
      const endpoints = [
        queryString ? `/api/risk-profile?${queryString}` : '/api/risk-profile',
        '/api/risk-profile/public',
        '/api/risk-profile/simple'
      ];
      
      let data = null;
      let lastError = null;
      
      for (const endpoint of endpoints) {
        try {
          console.log('Trying API endpoint:', endpoint);
          data = await api()(endpoint);
          console.log('✅ Success with endpoint:', endpoint);
          break;
        } catch (error) {
          console.warn('❌ Failed with endpoint:', endpoint, error.message);
          lastError = error;
        }
      }
      
      if (!data) {
        throw lastError || new Error('All endpoints failed');
      }
      
      // Apply client-side filtering if needed
      let filteredData = data || [];
      
      // Filter by unit kerja
      if (state.filters.unit_kerja_id) {
        filteredData = filteredData.filter(item => 
          item.risk_inputs?.master_work_units?.id === state.filters.unit_kerja_id
        );
      }
      
      // Filter by kategori risiko
      if (state.filters.kategori_risiko_id) {
        filteredData = filteredData.filter(item => 
          item.risk_inputs?.master_risk_categories?.id === state.filters.kategori_risiko_id
        );
      }
      
      // Filter by risk level
      if (state.filters.risk_level) {
        filteredData = filteredData.filter(item => 
          item.risk_level === state.filters.risk_level
        );
      }
      
      state.data = filteredData;
      console.log('Risk profile loaded:', state.data.length, 'items');
      console.log('=== END FETCH ===');
    } catch (error) {
      console.error('Error fetching risk profile:', error);
      state.data = [];
    }
  }

  /**
   * Renders the Risk Profile page with enhanced styling and fixed badge colors
   * @returns {void}
   */
  function render() {
    console.log('=== RENDERING RISK PROFILE ===');
    console.log('Data to render:', state.data.length, 'items');
    console.log('Chart.js available:', typeof Chart !== 'undefined');
    
    /** @type {HTMLElement | null} */
    const container = document.getElementById('risk-profile-content');
    if (!container) {
      console.error('❌ Container #risk-profile-content not found!');
      console.log('Available containers:', 
        Array.from(document.querySelectorAll('[id]')).map(el => el.id).filter(Boolean)
      );
      return;
    }
    console.log('✅ Container found:', container.id);

    // Add enhanced CSS styling with fixed badge colors
    const styleId = 'risk-profile-enhanced-styles';
    if (!document.getElementById(styleId)) {
      /** @type {HTMLStyleElement} */
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = `
        /* Enhanced Risk Profile Styles - Sesuai Gambar */
        .risk-profile-header {
          background: linear-gradient(135deg, #0066cc 0%, #0ea5e9 100%);
          color: white;
          padding: 1.5rem 2rem;
          border-radius: 12px 12px 0 0;
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 0;
        }
        
        .risk-profile-header img {
          width: 48px;
          height: 48px;
          object-fit: contain;
        }
        
        .risk-profile-header h3 {
          margin: 0;
          font-size: 1.5rem;
          font-weight: 600;
        }
        
        .risk-profile-body {
          background: #f8f9fa;
          padding: 2rem;
        }
        
        .badge-status {
          padding: 6px 14px;
          border-radius: 6px;
          font-weight: 600;
          font-size: 0.8125rem;
          display: inline-block;
          text-transform: uppercase;
        }
        
        /* Badge colors sesuai gambar */
        .badge-status.badge-sangat-tinggi {
          background-color: #dc2626 !important;
          color: #ffffff !important;
        }
        
        .badge-status.badge-tinggi {
          background-color: #f59e0b !important;
          color: #ffffff !important;
        }
        
        .badge-status.badge-sedang {
          background-color: #eab308 !important;
          color: #ffffff !important;
        }
        
        .badge-status.badge-rendah {
          background-color: #10b981 !important;
          color: #ffffff !important;
        }
        
        .table-container {
          overflow-x: auto;
          max-width: 100%;
          background: white;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
        }
        
        .table-container table {
          margin-bottom: 0;
          width: 100%;
          font-size: 0.875rem;
        }
        
        .table-container thead {
          background: #1e40af;
          color: white;
        }
        
        .table-container thead th {
          padding: 0.875rem 1rem;
          font-weight: 600;
          border: none;
          white-space: nowrap;
          text-align: center;
        }
        
        .table-container tbody td {
          padding: 0.875rem 1rem;
          border-bottom: 1px solid #e5e7eb;
          vertical-align: middle;
        }
        
        .table-container tbody tr:hover {
          background-color: #f9fafb;
        }
        
        .action-btn {
          width: 36px;
          height: 36px;
          border-radius: 6px;
          border: none;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .action-btn.btn-view {
          background: #3b82f6;
          color: white;
        }
        
        .action-btn.btn-view:hover {
          background: #2563eb;
        }
        
        .action-btn.btn-delete {
          background: #ef4444;
          color: white;
        }
        
        .action-btn.btn-delete:hover {
          background: #dc2626;
        }
        
        .heat-map-container {
          background: white;
          padding: 1.5rem;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
        }
        
        .heat-map-grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 4px;
          margin: 1rem 0;
        }
        
        .heat-map-cell {
          aspect-ratio: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          font-size: 1.125rem;
          border-radius: 4px;
          color: white;
        }
        
        .heat-map-cell.level-low {
          background: #10b981;
        }
        
        .heat-map-cell.level-medium {
          background: #eab308;
        }
        
        .heat-map-cell.level-high {
          background: #f59e0b;
        }
        
        .heat-map-cell.level-extreme {
          background: #dc2626;
        }
        
        .filter-dropdown {
          background: white;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          padding: 0.625rem 1rem;
          font-size: 0.875rem;
          width: 100%;
        }
        
        .filter-dropdown:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }
      `;
      document.head.appendChild(style);
    }

    // Render dengan layout sesuai gambar
    container.innerHTML = `
      ${renderHeader()}
      <div class="risk-profile-body">
        ${renderRiskProfileContent()}
      </div>
    `;

    // Initialize chart after DOM is ready and Chart.js is loaded
    const initCharts = () => {
      if (typeof Chart !== 'undefined') {
        console.log('✅ Chart.js loaded, rendering charts...');
        renderChart();
      } else {
        console.warn('⏳ Chart.js not loaded yet, waiting...');
        setTimeout(initCharts, 200);
      }
    };
    
    // Wait for DOM and Chart.js
    setTimeout(initCharts, 100);
  }

  function renderHeader() {
    return `
      <div class="risk-profile-header">
        <img src="/images/logo.png" alt="Logo" onerror="this.style.display='none'">
        <h3>Profil Risiko Inheren</h3>
      </div>
    `;
  }

  function renderRiskProfileContent() {
    console.log('=== RENDERING RISK PROFILE CONTENT ===');
    console.log('Data available:', state.data.length, 'items');
    
    return `
      <div style="display: grid; grid-template-columns: 1fr 300px; gap: 2rem; margin-bottom: 2rem;">
        <div>
          ${renderHeatMap()}
        </div>
        <div>
          ${renderFilters()}
        </div>
      </div>
      ${renderActionButtons()}
      ${renderTable()}
    `;
  }

  function renderHeatMap() {
    // Hitung distribusi risiko per cell (probability x impact)
    const matrix = Array(5).fill(null).map(() => Array(5).fill(0));
    
    state.data.forEach(item => {
      const prob = parseInt(item.probability) || 0;
      const impact = parseInt(item.impact) || 0;
      if (prob >= 1 && prob <= 5 && impact >= 1 && impact <= 5) {
        matrix[5 - prob][impact - 1]++;
      }
    });

    // Tentukan level risiko untuk setiap cell
    const getRiskLevel = (row, col) => {
      const prob = 5 - row;
      const impact = col + 1;
      const value = prob * impact;
      
      if (value >= 16) return 'extreme';
      if (value >= 10) return 'high';
      if (value >= 5) return 'medium';
      return 'low';
    };

    return `
      <div class="heat-map-container">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
          <div>
            <div style="font-size: 0.875rem; color: #6b7280; margin-bottom: 0.25rem;">Low Risk</div>
            <div style="font-size: 0.875rem; color: #6b7280; text-align: right;">Extreme Risk</div>
          </div>
        </div>
        
        <div style="display: grid; grid-template-columns: auto 1fr; gap: 0.5rem;">
          <!-- Y-axis labels (Probability) -->
          <div style="display: flex; flex-direction: column; justify-content: space-between; padding-right: 0.5rem;">
            <div style="text-align: right; font-size: 0.75rem; font-weight: 600; color: #374151;">5</div>
            <div style="text-align: right; font-size: 0.75rem; font-weight: 600; color: #374151;">4</div>
            <div style="text-align: right; font-size: 0.75rem; font-weight: 600; color: #374151;">3</div>
            <div style="text-align: right; font-size: 0.75rem; font-weight: 600; color: #374151;">2</div>
            <div style="text-align: right; font-size: 0.75rem; font-weight: 600; color: #374151;">1</div>
          </div>
          
          <!-- Heat map grid -->
          <div>
            <div class="heat-map-grid">
              ${matrix.map((row, rowIdx) => 
                row.map((count, colIdx) => {
                  const level = getRiskLevel(rowIdx, colIdx);
                  return `<div class="heat-map-cell level-${level}">${count}</div>`;
                }).join('')
              ).join('')}
            </div>
            
            <!-- X-axis labels (Impact) -->
            <div style="display: grid; grid-template-columns: repeat(5, 1fr); gap: 4px; margin-top: 0.5rem;">
              <div style="text-align: center; font-size: 0.75rem; font-weight: 600; color: #374151;">1</div>
              <div style="text-align: center; font-size: 0.75rem; font-weight: 600; color: #374151;">2</div>
              <div style="text-align: center; font-size: 0.75rem; font-weight: 600; color: #374151;">3</div>
              <div style="text-align: center; font-size: 0.75rem; font-weight: 600; color: #374151;">4</div>
              <div style="text-align: center; font-size: 0.75rem; font-weight: 600; color: #374151;">5</div>
            </div>
          </div>
        </div>
        
        <div style="margin-top: 1rem;">
          <div style="font-weight: 600; margin-bottom: 0.5rem; text-align: center;">Probability</div>
          <div style="font-weight: 600; text-align: center;">Dampak</div>
          <div style="text-align: center; font-size: 0.875rem; color: #6b7280; margin-top: 0.25rem;">Low → High</div>
        </div>
      </div>
    `;
  }

  function renderActionButtons() {
    return `
      <div style="display: flex; gap: 0.75rem; margin-bottom: 1.5rem; flex-wrap: wrap;">
        <button class="btn" onclick="RiskProfileModule.refresh()" title="Refresh Data" style="background: #0066cc; color: white; padding: 0.625rem; border-radius: 6px; border: none; display: flex; align-items: center; justify-content: center; width: 40px; height: 40px; font-size: 1rem; cursor: pointer;">
          <i class="fas fa-sync"></i>
        </button>
        <button class="btn" onclick="RiskProfileDownloadHandler.showFormatSelector()" title="Download Report" style="background: #10b981; color: white; padding: 0.625rem; border-radius: 6px; border: none; display: flex; align-items: center; justify-content: center; width: 40px; height: 40px; font-size: 1rem; cursor: pointer;">
          <i class="fas fa-download"></i>
        </button>
      </div>
    `;
  }

  function renderFilters() {
    return `
      <div style="background: white; padding: 1.5rem; border-radius: 8px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);">
        <div style="margin-bottom: 1.5rem;">
          <label style="font-size: 0.875rem; font-weight: 600; margin-bottom: 0.5rem; display: block; color: #374151;">Rencana Strategis</label>
          <select class="filter-dropdown" id="filter-rencana" onchange="RiskProfileModule.applyFilter()">
            <option value="">Semua</option>
            ${state.rencanaStrategis.map(r => `<option value="${r.id}" ${state.filters.rencana_strategis_id === r.id ? 'selected' : ''}>${r.nama_rencana}</option>`).join('')}
          </select>
        </div>
        
        <div style="margin-bottom: 1.5rem;">
          <label style="font-size: 0.875rem; font-weight: 600; margin-bottom: 0.5rem; display: block; color: #374151;">Unit Kerja</label>
          <select class="filter-dropdown" id="filter-unit" onchange="RiskProfileModule.applyFilter()">
            <option value="">Semua</option>
            ${state.unitKerja.map(u => `<option value="${u.id}" ${state.filters.unit_kerja_id === u.id ? 'selected' : ''}>${u.name}</option>`).join('')}
          </select>
        </div>
        
        <div style="margin-bottom: 1.5rem;">
          <label style="font-size: 0.875rem; font-weight: 600; margin-bottom: 0.5rem; display: block; color: #374151;">Kategori Risiko</label>
          <select class="filter-dropdown" id="filter-kategori" onchange="RiskProfileModule.applyFilter()">
            <option value="">Semua</option>
            ${state.categories.map(c => `<option value="${c.id}" ${state.filters.kategori_risiko_id === c.id ? 'selected' : ''}>${c.name}</option>`).join('')}
          </select>
        </div>
        
        <div>
          <label style="font-size: 0.875rem; font-weight: 600; margin-bottom: 0.5rem; display: block; color: #374151;">Risk Level</label>
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

  function renderStatistics() {
    console.log('=== RENDERING STATISTICS ===');
    console.log('Total data:', state.data.length);
    
    const stats = {
      total: state.data.length,
      extreme: state.data.filter(d => 
        d.risk_level === 'EXTREME HIGH' || 
        d.risk_level === 'Very High' || 
        d.risk_level === 'Sangat Tinggi'
      ).length,
      high: state.data.filter(d => 
        d.risk_level === 'HIGH RISK' || 
        d.risk_level === 'Tinggi'
      ).length,
      medium: state.data.filter(d => 
        d.risk_level === 'MEDIUM RISK' || 
        d.risk_level === 'Sedang'
      ).length,
      low: state.data.filter(d => 
        d.risk_level === 'LOW RISK' || 
        d.risk_level === 'Rendah'
      ).length
    };
    
    console.log('Statistics:', stats);

    return `
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 1.25rem; margin-bottom: 1.5rem; margin-top: 1.5rem;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 1.5rem; border-radius: 12px; color: white; box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);">
          <div style="font-size: 2.5rem; font-weight: bold; margin-bottom: 0.5rem;">${stats.total}</div>
          <div style="font-size: 0.95rem; opacity: 0.95; font-weight: 500;">Total Risiko</div>
        </div>
        <div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 1.5rem; border-radius: 12px; color: white; box-shadow: 0 4px 12px rgba(240, 147, 251, 0.3);">
          <div style="font-size: 2.5rem; font-weight: bold; margin-bottom: 0.5rem;">${stats.extreme}</div>
          <div style="font-size: 0.95rem; opacity: 0.95; font-weight: 500;">Extreme High</div>
        </div>
        <div style="background: linear-gradient(135deg, #fa709a 0%, #fee140 100%); padding: 1.5rem; border-radius: 12px; color: white; box-shadow: 0 4px 12px rgba(250, 112, 154, 0.3);">
          <div style="font-size: 2.5rem; font-weight: bold; margin-bottom: 0.5rem;">${stats.high}</div>
          <div style="font-size: 0.95rem; opacity: 0.95; font-weight: 500;">High Risk</div>
        </div>
        <div style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); padding: 1.5rem; border-radius: 12px; color: white; box-shadow: 0 4px 12px rgba(79, 172, 254, 0.3);">
          <div style="font-size: 2.5rem; font-weight: bold; margin-bottom: 0.5rem;">${stats.medium}</div>
          <div style="font-size: 0.95rem; opacity: 0.95; font-weight: 500;">Medium Risk</div>
        </div>
        <div style="background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%); padding: 1.5rem; border-radius: 12px; color: white; box-shadow: 0 4px 12px rgba(67, 233, 123, 0.3);">
          <div style="font-size: 2.5rem; font-weight: bold; margin-bottom: 0.5rem;">${stats.low}</div>
          <div style="font-size: 0.95rem; opacity: 0.95; font-weight: 500;">Low Risk</div>
        </div>
      </div>
    `;
  }

  function renderLegend() {
    return `
      <div style="background: white; padding: 2rem; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); height: 700px; overflow-y: auto;">
        <h4 style="margin-bottom: 1.5rem; color: #2c3e50; font-weight: 600;"><i class="fas fa-info-circle"></i> Legend</h4>
        <div style="margin-bottom: 2rem;">
          <div style="display: flex; align-items: center; margin-bottom: 1rem; padding: 0.75rem; border-radius: 8px; background: rgba(231, 76, 60, 0.1);">
            <div style="width: 24px; height: 24px; background: #e74c3c; border-radius: 6px; margin-right: 1rem; box-shadow: 0 2px 4px rgba(231, 76, 60, 0.3);"></div>
            <div>
              <strong style="color: #e74c3c;">Extreme High</strong><br>
              <small style="color: #666;">Value ≥ 16</small>
            </div>
          </div>
          <div style="display: flex; align-items: center; margin-bottom: 1rem; padding: 0.75rem; border-radius: 8px; background: rgba(243, 156, 18, 0.1);">
            <div style="width: 24px; height: 24px; background: #f39c12; border-radius: 6px; margin-right: 1rem; box-shadow: 0 2px 4px rgba(243, 156, 18, 0.3);"></div>
            <div>
              <strong style="color: #f39c12;">High Risk</strong><br>
              <small style="color: #666;">10 ≤ Value < 16</small>
            </div>
          </div>
          <div style="display: flex; align-items: center; margin-bottom: 1rem; padding: 0.75rem; border-radius: 8px; background: rgba(52, 152, 219, 0.1);">
            <div style="width: 24px; height: 24px; background: #3498db; border-radius: 6px; margin-right: 1rem; box-shadow: 0 2px 4px rgba(52, 152, 219, 0.3);"></div>
            <div>
              <strong style="color: #3498db;">Medium Risk</strong><br>
              <small style="color: #666;">5 ≤ Value < 10</small>
            </div>
          </div>
          <div style="display: flex; align-items: center; margin-bottom: 1rem; padding: 0.75rem; border-radius: 8px; background: rgba(39, 174, 96, 0.1);">
            <div style="width: 24px; height: 24px; background: #27ae60; border-radius: 6px; margin-right: 1rem; box-shadow: 0 2px 4px rgba(39, 174, 96, 0.3);"></div>
            <div>
              <strong style="color: #27ae60;">Low Risk</strong><br>
              <small style="color: #666;">Value < 5</small>
            </div>
          </div>
        </div>
        <hr>
        <h5 style="margin-top: 1rem;">Statistik Data</h5>
        <div style="background: #f8f9fa; padding: 1rem; border-radius: 8px; margin-bottom: 1rem;">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; font-size: 0.875rem;">
            <div><strong>Total Risiko:</strong> ${state.data.length}</div>
            <div><strong>Extreme High:</strong> ${state.data.filter(d => 
              d.risk_level === 'EXTREME HIGH' || 
              d.risk_level === 'Very High' || 
              d.risk_level === 'Sangat Tinggi'
            ).length}</div>
            <div><strong>High Risk:</strong> ${state.data.filter(d => 
              d.risk_level === 'HIGH RISK' || 
              d.risk_level === 'Tinggi'
            ).length}</div>
            <div><strong>Medium Risk:</strong> ${state.data.filter(d => 
              d.risk_level === 'MEDIUM RISK' || 
              d.risk_level === 'Sedang'
            ).length}</div>
            <div><strong>Low Risk:</strong> ${state.data.filter(d => 
              d.risk_level === 'LOW RISK' || 
              d.risk_level === 'Rendah'
            ).length}</div>
            <div><strong>Unit Kerja:</strong> ${[...new Set(state.data.map(d => d.risk_inputs?.master_work_units?.name).filter(Boolean))].length}</div>
          </div>
        </div>
        <h5>Matrix Guide</h5>
        <p style="font-size: 0.875rem; color: #666; line-height: 1.6;">
          Matrix menampilkan posisi risiko berdasarkan probabilitas (vertikal) dan dampak (horizontal). 
          Setiap titik mewakili satu risiko. Klik titik untuk melihat detail.
        </p>
      </div>
    `;
  }

  function renderTable() {
    if (state.data.length === 0) {
      return `
        <div style="text-align: center; padding: 4rem; color: #666; background: white; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
          <i class="fas fa-info-circle" style="font-size: 3rem; color: #3b82f6; margin-bottom: 1rem;"></i>
          <h4 style="color: #1f2937; margin-bottom: 0.5rem; font-size: 1.25rem;">Tidak Ada Data Risk Profile</h4>
          <p style="color: #6b7280; font-size: 0.875rem;">Belum ada data inherent risk analysis. Silakan lakukan analisis risiko terlebih dahulu.</p>
        </div>
      `;
    }

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
            ${state.data.map((item, index) => {
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
                  <td style="text-align: center; font-weight: 600;">${item.impact || '-'}</td>
                  <td style="text-align: center; font-weight: 700; font-size: 1rem;">${item.risk_value || '-'}</td>
                  <td style="text-align: center;"><span class="badge-status badge-${getRiskLevelBadgeClass(item.risk_level)}">${item.risk_level || '-'}</span></td>
                  <td style="text-align: center;">${item.probability_percentage || '-'}</td>
                  <td style="text-align: right; font-weight: 500;">Rp ${formatNumber(item.financial_impact || 0)}</td>
                  <td style="text-align: center;">
                    <div style="display: flex; gap: 0.25rem; justify-content: center;">
                      <button class="action-btn btn-view" title="Lihat Detail" onclick="RiskProfileModule.viewDetail('${riskCode}')">
                        <i class="fas fa-eye"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  function getRiskLevelBadgeClass(level) {
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

  function renderChart() {
    const ctx = document.getElementById('inherent-risk-matrix');
    if (!ctx || typeof Chart === 'undefined') {
      console.warn('Chart context not available or Chart.js not loaded');
      return;
    }

    if (state.chart) {
      state.chart.destroy();
      state.chart = null;
    }

    if (state.data.length === 0) {
      const canvas = ctx.getContext('2d');
      if (canvas) {
        canvas.clearRect(0, 0, ctx.width, ctx.height);
      }
      return;
    }

    // Create points for scatter chart with enhanced data
    const points = state.data
      .filter(item => item.risk_inputs && item.probability && item.impact)
      .map(item => {
        const risk = item.risk_inputs || {};
        const impact = parseFloat(item.impact) || 0;
        const probability = parseFloat(item.probability) || 0;
        const unitKerja = risk.master_work_units?.name || 'Tidak Ada Unit';
        const kategori = risk.master_risk_categories?.name || 'Tidak Dikategorikan';
        
        return {
          x: impact,
          y: probability,
          riskId: risk.kode_risiko || 'N/A',
          value: parseFloat(item.risk_value) || 0,
          level: item.risk_level || 'LOW RISK',
          color: getRiskColor(item.risk_level),
          sasaran: risk.sasaran || 'Tidak ada sasaran',
          unitKerja: unitKerja,
          kategori: kategori,
          probabilityPercent: item.probability_percent || 0,
          financialImpact: item.financial_impact || 0
        };
      })
      .filter(p => p.x > 0 && p.y > 0 && p.x <= 5 && p.y <= 5);

    if (points.length === 0) {
      console.warn('No valid data points for chart');
      return;
    }

    try {
      state.chart = new Chart(ctx, {
        type: 'scatter',
        data: {
          datasets: [{
            label: 'Inherent Risk',
            data: points,
            backgroundColor: points.map(p => p.color),
            borderColor: '#333',
            borderWidth: 2,
            pointRadius: 10,
            pointHoverRadius: 15,
            pointHoverBorderWidth: 3
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          interaction: {
            intersect: false,
            mode: 'point'
          },
          scales: {
            x: {
              type: 'linear',
              position: 'bottom',
              min: 0.5,
              max: 5.5,
              ticks: {
                stepSize: 1,
                font: { size: 12, weight: 'bold' },
                callback: function(value) {
                  const labels = ['', '1-Ringan Sekali', '2-Ringan', '3-Sedang', '4-Berat', '5-Sangat Berat'];
                  return labels[value] || value;
                }
              },
              title: {
                display: true,
                text: 'DAMPAK (IMPACT)',
                font: { size: 16, weight: 'bold' },
                color: '#1e40af'
              },
              grid: {
                color: '#e5e7eb',
                lineWidth: 1
              }
            },
            y: {
              min: 0.5,
              max: 5.5,
              ticks: {
                stepSize: 1,
                font: { size: 12, weight: 'bold' },
                callback: function(value) {
                  const labels = ['', '1-Sangat Kecil', '2-Kecil', '3-Sedang', '4-Besar', '5-Sangat Besar'];
                  return labels[value] || value;
                }
              },
              title: {
                display: true,
                text: 'PROBABILITAS (PROBABILITY)',
                font: { size: 16, weight: 'bold' },
                color: '#1e40af'
              },
              grid: {
                color: '#e5e7eb',
                lineWidth: 1
              }
            }
          },
          plugins: {
            legend: {
              display: false
            },
            tooltip: {
              enabled: true,
              backgroundColor: 'rgba(0, 0, 0, 0.9)',
              titleColor: '#ffffff',
              bodyColor: '#ffffff',
              borderColor: '#374151',
              borderWidth: 2,
              cornerRadius: 8,
              padding: 15,
              displayColors: false,
              titleFont: { size: 14, weight: 'bold' },
              bodyFont: { size: 12 },
              callbacks: {
                title: function(context) {
                  const point = context[0].raw;
                  return `🎯 ${point.riskId}`;
                },
                label: function(context) {
                  const point = context.raw;
                  return [
                    `📊 Risk Level: ${point.level}`,
                    `📈 Probability: ${point.y}/5 (${point.probabilityPercent}%)`,
                    `💥 Impact: ${point.x}/5`,
                    `⚡ Risk Value: ${point.value}`,
                    `🏢 Unit Kerja: ${point.unitKerja}`,
                    `📂 Kategori: ${point.kategori}`,
                    `💰 Dampak Finansial: Rp ${formatNumber(point.financialImpact)}`,
                    `🎯 Sasaran: ${point.sasaran.length > 60 ? point.sasaran.substring(0, 60) + '...' : point.sasaran}`
                  ];
                }
              }
            }
          },
          onHover: (event, activeElements) => {
            event.native.target.style.cursor = activeElements.length > 0 ? 'pointer' : 'default';
          },
          onClick: (event, activeElements) => {
            if (activeElements.length > 0) {
              const point = activeElements[0].element.$context.raw;
              showRiskDetailModal(point);
            }
          }
        },
        plugins: [{
          id: 'matrixBackground',
          beforeDraw: (chart) => {
            const ctx = chart.ctx;
            const xAxis = chart.scales.x;
            const yAxis = chart.scales.y;

            // Enhanced colored zones with better visibility
            const zones = [
              // Extreme High (red) - top right
              { xMin: 4, xMax: 5, yMin: 4, yMax: 5, color: 'rgba(220, 38, 38, 0.3)' },
              { xMin: 3, xMax: 4, yMin: 5, yMax: 5, color: 'rgba(220, 38, 38, 0.3)' },
              { xMin: 5, xMax: 5, yMin: 3, yMax: 4, color: 'rgba(220, 38, 38, 0.3)' },
              
              // High Risk (orange)
              { xMin: 3, xMax: 4, yMin: 3, yMax: 4, color: 'rgba(234, 88, 12, 0.25)' },
              { xMin: 2, xMax: 3, yMin: 4, yMax: 5, color: 'rgba(234, 88, 12, 0.25)' },
              { xMin: 4, xMax: 5, yMin: 2, yMax: 3, color: 'rgba(234, 88, 12, 0.25)' },
              
              // Medium Risk (yellow)
              { xMin: 2, xMax: 3, yMin: 2, yMax: 3, color: 'rgba(234, 179, 8, 0.2)' },
              { xMin: 1, xMax: 2, yMin: 3, yMax: 4, color: 'rgba(234, 179, 8, 0.2)' },
              { xMin: 3, xMax: 4, yMin: 1, yMax: 2, color: 'rgba(234, 179, 8, 0.2)' },
              
              // Low Risk (green) - bottom left
              { xMin: 1, xMax: 2, yMin: 1, yMax: 3, color: 'rgba(20, 184, 166, 0.2)' },
              { xMin: 2, xMax: 3, yMin: 1, yMax: 2, color: 'rgba(20, 184, 166, 0.2)' }
            ];

            zones.forEach(zone => {
              ctx.fillStyle = zone.color;
              const x1 = xAxis.getPixelForValue(zone.xMin);
              const x2 = xAxis.getPixelForValue(zone.xMax);
              const y1 = yAxis.getPixelForValue(zone.yMax);
              const y2 = yAxis.getPixelForValue(zone.yMin);
              ctx.fillRect(x1, y1, x2 - x1, y2 - y1);
            });
          }
        }]
      });

      // Render pie charts after main chart
      setTimeout(() => renderPieChartsCanvas(), 100);
      
    } catch (error) {
      console.error('Error creating risk profile chart:', error);
    }
  }

  function renderPieChartsCanvas() {
    console.log('=== RENDERING PIE CHARTS ===');
    console.log('Chart.js available:', typeof Chart !== 'undefined');
    console.log('Data count:', state.data.length);
    
    if (typeof Chart === 'undefined') {
      console.warn('❌ Chart.js not loaded, retrying in 200ms...');
      setTimeout(renderPieChartsCanvas, 200);
      return;
    }

    // Risk Level Pie Chart dengan enhanced tooltip
    const riskLevelCtx = document.getElementById('risk-level-pie-chart');
    console.log('Risk level canvas found:', !!riskLevelCtx);
    
    if (riskLevelCtx) {
      const stats = {
        extreme: state.data.filter(d => 
          d.risk_level === 'EXTREME HIGH' || 
          d.risk_level === 'Very High' || 
          d.risk_level === 'Sangat Tinggi'
        ).length,
        high: state.data.filter(d => 
          d.risk_level === 'HIGH RISK' || 
          d.risk_level === 'Tinggi'
        ).length,
        medium: state.data.filter(d => 
          d.risk_level === 'MEDIUM RISK' || 
          d.risk_level === 'Sedang'
        ).length,
        low: state.data.filter(d => 
          d.risk_level === 'LOW RISK' || 
          d.risk_level === 'Rendah'
        ).length
      };

      new Chart(riskLevelCtx, {
        type: 'pie',
        data: {
          labels: ['Extreme High', 'High Risk', 'Medium Risk', 'Low Risk'],
          datasets: [{
            data: [stats.extreme, stats.high, stats.medium, stats.low],
            backgroundColor: ['#dc2626', '#ea580c', '#eab308', '#14b8a6'],
            borderWidth: 3,
            borderColor: '#ffffff',
            hoverBorderWidth: 4,
            hoverOffset: 8
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          plugins: {
            legend: {
              position: 'bottom',
              labels: {
                padding: 15,
                font: { size: 12, weight: '500' },
                usePointStyle: true,
                pointStyle: 'circle'
              }
            },
            tooltip: {
              backgroundColor: 'rgba(0, 0, 0, 0.9)',
              titleColor: '#ffffff',
              bodyColor: '#ffffff',
              borderColor: '#374151',
              borderWidth: 2,
              cornerRadius: 8,
              padding: 12,
              titleFont: { size: 14, weight: 'bold' },
              bodyFont: { size: 12 },
              callbacks: {
                title: function(context) {
                  return `📊 ${context[0].label}`;
                },
                label: function(context) {
                  const label = context.label || '';
                  const value = context.parsed || 0;
                  const total = context.dataset.data.reduce((a, b) => a + b, 0);
                  const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                  return [
                    `Jumlah: ${value} risiko`,
                    `Persentase: ${percentage}%`,
                    `Total: ${total} risiko`
                  ];
                }
              }
            }
          },
          interaction: {
            intersect: false
          },
          animation: {
            animateRotate: true,
            animateScale: true,
            duration: 1000
          }
        }
      });
    }

    // Category Pie Chart dengan enhanced interactivity
    const categoryCtx = document.getElementById('risk-category-pie-chart');
    console.log('Category canvas found:', !!categoryCtx);
    
    if (categoryCtx) {
      const categoryData = {};
      state.data.forEach(item => {
        const category = item.risk_inputs?.master_risk_categories?.name || 'Tidak Dikategorikan';
        categoryData[category] = (categoryData[category] || 0) + 1;
      });

      const labels = Object.keys(categoryData);
      const data = Object.values(categoryData);
      const colors = generateEnhancedColors(labels.length);

      new Chart(categoryCtx, {
        type: 'pie',
        data: {
          labels: labels,
          datasets: [{
            data: data,
            backgroundColor: colors,
            borderWidth: 3,
            borderColor: '#ffffff',
            hoverBorderWidth: 4,
            hoverOffset: 8
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          plugins: {
            legend: {
              position: 'bottom',
              labels: {
                padding: 15,
                font: { size: 11, weight: '500' },
                usePointStyle: true,
                pointStyle: 'circle',
                generateLabels: function(chart) {
                  const data = chart.data;
                  if (data.labels.length && data.datasets.length) {
                    return data.labels.map((label, i) => {
                      const value = data.datasets[0].data[i];
                      const shortLabel = label.length > 20 ? label.substring(0, 20) + '...' : label;
                      return {
                        text: `${shortLabel} (${value})`,
                        fillStyle: data.datasets[0].backgroundColor[i],
                        strokeStyle: data.datasets[0].borderColor,
                        lineWidth: data.datasets[0].borderWidth,
                        hidden: false,
                        index: i
                      };
                    });
                  }
                  return [];
                }
              }
            },
            tooltip: {
              backgroundColor: 'rgba(0, 0, 0, 0.9)',
              titleColor: '#ffffff',
              bodyColor: '#ffffff',
              borderColor: '#374151',
              borderWidth: 2,
              cornerRadius: 8,
              padding: 12,
              titleFont: { size: 14, weight: 'bold' },
              bodyFont: { size: 12 },
              callbacks: {
                title: function(context) {
                  return `📂 ${context[0].label}`;
                },
                label: function(context) {
                  const label = context.label || '';
                  const value = context.parsed || 0;
                  const total = context.dataset.data.reduce((a, b) => a + b, 0);
                  const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                  return [
                    `Kategori: ${label}`,
                    `Jumlah: ${value} risiko`,
                    `Persentase: ${percentage}%`
                  ];
                }
              }
            }
          },
          interaction: {
            intersect: false
          },
          animation: {
            animateRotate: true,
            animateScale: true,
            duration: 1000
          }
        }
      });
    }

    // Unit Kerja Pie Chart dengan enhanced display
    const unitCtx = document.getElementById('risk-unit-pie-chart');
    console.log('Unit canvas found:', !!unitCtx);
    
    if (unitCtx) {
      const unitData = {};
      state.data.forEach(item => {
        const unit = item.risk_inputs?.master_work_units?.name || 'Tidak Ada Unit';
        unitData[unit] = (unitData[unit] || 0) + 1;
      });

      const labels = Object.keys(unitData);
      const data = Object.values(unitData);
      const colors = generateEnhancedColors(labels.length);

      new Chart(unitCtx, {
        type: 'pie',
        data: {
          labels: labels,
          datasets: [{
            data: data,
            backgroundColor: colors,
            borderWidth: 3,
            borderColor: '#ffffff',
            hoverBorderWidth: 4,
            hoverOffset: 8
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          plugins: {
            legend: {
              position: 'bottom',
              labels: {
                padding: 15,
                font: { size: 11, weight: '500' },
                usePointStyle: true,
                pointStyle: 'circle',
                generateLabels: function(chart) {
                  const data = chart.data;
                  if (data.labels.length && data.datasets.length) {
                    return data.labels.map((label, i) => {
                      const value = data.datasets[0].data[i];
                      const shortLabel = label.length > 25 ? label.substring(0, 25) + '...' : label;
                      return {
                        text: `${shortLabel} (${value})`,
                        fillStyle: data.datasets[0].backgroundColor[i],
                        strokeStyle: data.datasets[0].borderColor,
                        lineWidth: data.datasets[0].borderWidth,
                        hidden: false,
                        index: i
                      };
                    });
                  }
                  return [];
                }
              }
            },
            tooltip: {
              backgroundColor: 'rgba(0, 0, 0, 0.9)',
              titleColor: '#ffffff',
              bodyColor: '#ffffff',
              borderColor: '#374151',
              borderWidth: 2,
              cornerRadius: 8,
              padding: 12,
              titleFont: { size: 14, weight: 'bold' },
              bodyFont: { size: 12 },
              callbacks: {
                title: function(context) {
                  return `🏢 ${context[0].label}`;
                },
                label: function(context) {
                  const label = context.label || '';
                  const value = context.parsed || 0;
                  const total = context.dataset.data.reduce((a, b) => a + b, 0);
                  const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                  return [
                    `Unit Kerja: ${label}`,
                    `Jumlah: ${value} risiko`,
                    `Persentase: ${percentage}%`,
                    `Total: ${total} risiko`
                  ];
                }
              }
            }
          },
          interaction: {
            intersect: false
          },
          animation: {
            animateRotate: true,
            animateScale: true,
            duration: 1000
          }
        }
      });
    }
  }

  function generateColors(count) {
    const colors = [
      '#3498db', '#e74c3c', '#f39c12', '#27ae60', '#9b59b6',
      '#1abc9c', '#34495e', '#e67e22', '#95a5a6', '#16a085',
      '#2980b9', '#8e44ad', '#2c3e50', '#f1c40f', '#d35400'
    ];
    
    const result = [];
    for (let i = 0; i < count; i++) {
      result.push(colors[i % colors.length]);
    }
    return result;
  }

  function generateEnhancedColors(count) {
    // Enhanced color palette dengan gradasi yang lebih baik
    const colors = [
      '#3b82f6', '#ef4444', '#f59e0b', '#10b981', '#8b5cf6',
      '#06b6d4', '#6366f1', '#f97316', '#84cc16', '#ec4899',
      '#14b8a6', '#f43f5e', '#a855f7', '#22c55e', '#eab308',
      '#0ea5e9', '#dc2626', '#059669', '#7c3aed', '#ea580c'
    ];
    
    const result = [];
    for (let i = 0; i < count; i++) {
      result.push(colors[i % colors.length]);
    }
    return result;
  }

  function showRiskDetailModal(point) {
    // Create modal untuk menampilkan detail risiko saat diklik
    const modal = document.createElement('div');
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.7);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10000;
      animation: fadeIn 0.3s ease-out;
    `;

    const modalContent = document.createElement('div');
    modalContent.style.cssText = `
      background: white;
      border-radius: 12px;
      padding: 2rem;
      max-width: 600px;
      width: 90%;
      max-height: 80vh;
      overflow-y: auto;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
      animation: slideUp 0.3s ease-out;
    `;

    modalContent.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; border-bottom: 2px solid #f1f5f9; padding-bottom: 1rem;">
        <h3 style="margin: 0; color: #1e293b; font-size: 1.5rem; font-weight: 700;">
          🎯 Detail Risiko
        </h3>
        <button onclick="this.closest('.modal').remove()" style="background: #ef4444; color: white; border: none; border-radius: 50%; width: 32px; height: 32px; cursor: pointer; font-size: 1.2rem; display: flex; align-items: center; justify-content: center;">
          ×
        </button>
      </div>
      
      <div style="display: grid; gap: 1rem;">
        <div style="background: #f8fafc; padding: 1rem; border-radius: 8px; border-left: 4px solid #3b82f6;">
          <strong style="color: #1e40af;">📋 Kode Risiko:</strong><br>
          <span style="font-size: 1.1rem; font-weight: 600; color: #1e293b;">${point.riskId}</span>
        </div>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
          <div style="background: #fef3c7; padding: 1rem; border-radius: 8px; text-align: center;">
            <div style="font-size: 0.875rem; color: #92400e; font-weight: 600;">PROBABILITAS</div>
            <div style="font-size: 2rem; font-weight: bold; color: #d97706;">${point.y}/5</div>
            <div style="font-size: 0.75rem; color: #92400e;">${point.probabilityPercent}%</div>
          </div>
          <div style="background: #fecaca; padding: 1rem; border-radius: 8px; text-align: center;">
            <div style="font-size: 0.875rem; color: #991b1b; font-weight: 600;">DAMPAK</div>
            <div style="font-size: 2rem; font-weight: bold; color: #dc2626;">${point.x}/5</div>
          </div>
        </div>
        
        <div style="background: linear-gradient(135deg, ${point.color}20, ${point.color}10); padding: 1rem; border-radius: 8px; border: 2px solid ${point.color};">
          <div style="text-align: center;">
            <div style="font-size: 0.875rem; color: #374151; font-weight: 600;">RISK LEVEL</div>
            <div style="font-size: 1.25rem; font-weight: bold; color: ${point.color}; margin: 0.5rem 0;">
              ${point.level}
            </div>
            <div style="font-size: 1.5rem; font-weight: bold; color: #1e293b;">
              Risk Value: ${point.value}
            </div>
          </div>
        </div>
        
        <div style="background: #f0fdf4; padding: 1rem; border-radius: 8px; border-left: 4px solid #22c55e;">
          <strong style="color: #15803d;">🏢 Unit Kerja:</strong><br>
          <span style="color: #1e293b;">${point.unitKerja}</span>
        </div>
        
        <div style="background: #f0f9ff; padding: 1rem; border-radius: 8px; border-left: 4px solid #0ea5e9;">
          <strong style="color: #0369a1;">📂 Kategori:</strong><br>
          <span style="color: #1e293b;">${point.kategori}</span>
        </div>
        
        <div style="background: #fefce8; padding: 1rem; border-radius: 8px; border-left: 4px solid #eab308;">
          <strong style="color: #a16207;">💰 Dampak Finansial:</strong><br>
          <span style="color: #1e293b; font-weight: 600;">Rp ${formatNumber(point.financialImpact)}</span>
        </div>
        
        <div style="background: #faf5ff; padding: 1rem; border-radius: 8px; border-left: 4px solid #a855f7;">
          <strong style="color: #7c2d12;">🎯 Sasaran:</strong><br>
          <span style="color: #1e293b; line-height: 1.5;">${point.sasaran}</span>
        </div>
      </div>
      
      <div style="margin-top: 2rem; text-align: center;">
        <button onclick="this.closest('.modal').remove()" style="background: #3b82f6; color: white; border: none; padding: 0.75rem 2rem; border-radius: 8px; font-weight: 600; cursor: pointer; font-size: 1rem;">
          Tutup
        </button>
      </div>
    `;

    modal.className = 'modal';
    modal.appendChild(modalContent);
    document.body.appendChild(modal);

    // Add CSS animations
    const style = document.createElement('style');
    style.textContent = `
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      @keyframes slideUp {
        from { transform: translateY(50px); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
      }
    `;
    document.head.appendChild(style);

    // Close modal when clicking outside
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.remove();
      }
    });
  }

  function getRiskColor(level) {
    const colorMap = {
      'EXTREME HIGH': '#e74c3c',  // Solid red
      'HIGH RISK': '#f39c12',     // Solid orange
      'MEDIUM RISK': '#3498db',   // Solid blue
      'LOW RISK': '#27ae60',      // Solid green
      'Very High': '#e74c3c',     // Solid red
      'Sangat Tinggi': '#e74c3c', // Solid red
      'Tinggi': '#f39c12',        // Solid orange
      'Sedang': '#3498db',        // Solid blue
      'Rendah': '#27ae60'         // Solid green
    };
    return colorMap[level] || '#95a5a6';
  }

  function getRiskLevelColor(level) {
    const colorMap = {
      'EXTREME HIGH': 'sangat-tinggi',
      'HIGH RISK': 'tinggi',
      'MEDIUM RISK': 'sedang',
      'LOW RISK': 'rendah',
      'Very High': 'sangat-tinggi',
      'Sangat Tinggi': 'sangat-tinggi',
      'Tinggi': 'tinggi',
      'Sedang': 'sedang',
      'Rendah': 'rendah',
      'SANGAT TINGGI': 'sangat-tinggi',
      'TINGGI': 'tinggi',
      'SEDANG': 'sedang',
      'RENDAH': 'rendah'
    };
    return colorMap[level] || 'sedang';
  }

  function formatNumber(num) {
    return new Intl.NumberFormat('id-ID').format(num);
  }

  async function applyFilter() {
    console.log('=== APPLYING FILTERS ===');
    
    // Get filter values from DOM
    const rencanaEl = document.getElementById('filter-rencana');
    const unitEl = document.getElementById('filter-unit');
    const kategoriEl = document.getElementById('filter-kategori');
    const levelEl = document.getElementById('filter-level');
    
    // Update state filters
    state.filters.rencana_strategis_id = rencanaEl?.value || '';
    state.filters.unit_kerja_id = unitEl?.value || '';
    state.filters.kategori_risiko_id = kategoriEl?.value || '';
    state.filters.risk_level = levelEl?.value || '';
    
    console.log('Filter values updated:', state.filters);
    
    // Show loading indicator
    const container = document.getElementById('risk-profile-content');
    if (container) {
      const loadingDiv = document.createElement('div');
      loadingDiv.id = 'filter-loading';
      loadingDiv.style.cssText = 'position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: rgba(255,255,255,0.95); padding: 2rem; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); z-index: 9999;';
      loadingDiv.innerHTML = '<i class="fas fa-spinner fa-spin" style="font-size: 2rem; color: #007bff;"></i><p style="margin-top: 1rem; color: #333;">Memfilter data...</p>';
      document.body.appendChild(loadingDiv);
    }
    
    try {
      // Fetch filtered data from server
      await fetchRiskProfile();
      
      // Re-render with filtered data
      render();
      
      console.log('=== FILTERS APPLIED - Data count:', state.data.length, '===');
      
      // Show success message
      const successMsg = document.createElement('div');
      successMsg.style.cssText = 'position: fixed; top: 20px; right: 20px; background: #28a745; color: white; padding: 1rem 1.5rem; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); z-index: 10000; animation: slideIn 0.3s ease-out;';
      successMsg.innerHTML = `<i class="fas fa-check-circle"></i> Filter berhasil diterapkan! Menampilkan ${state.data.length} data`;
      document.body.appendChild(successMsg);
      
      setTimeout(() => {
        successMsg.remove();
      }, 3000);
      
    } catch (error) {
      console.error('Error applying filter:', error);
      alert('Gagal memfilter data: ' + error.message);
    } finally {
      // Remove loading indicator
      const loadingDiv = document.getElementById('filter-loading');
      if (loadingDiv) {
        loadingDiv.remove();
      }
    }
  }

  async function refresh() {
    await load();
    alert('Data risk profile berhasil di-refresh');
  }

  function downloadChart() {
    try {
      const canvas = document.getElementById('inherent-risk-matrix');
      if (!canvas) {
        alert('Grafik tidak ditemukan');
        return;
      }

      // Create download link
      const link = document.createElement('a');
      link.download = `risk-profile-matrix-${new Date().toISOString().split('T')[0]}.png`;
      link.href = canvas.toDataURL('image/png', 1.0);
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      console.log('Chart downloaded successfully');
    } catch (error) {
      console.error('Error downloading chart:', error);
      alert('Gagal mengunduh grafik: ' + error.message);
    }
  }

  function viewDetail(riskCode) {
    // Cari data risiko berdasarkan kode
    const riskData = state.data.find(item => 
      item.risk_inputs?.kode_risiko === riskCode
    );
    
    if (!riskData) {
      alert('Data risiko tidak ditemukan');
      return;
    }
    
    const risk = riskData.risk_inputs || {};
    const unitKerja = risk.master_work_units?.name || 'Tidak Ada Unit';
    const kategori = risk.master_risk_categories?.name || 'Tidak Dikategorikan';
    
    // Buat objek point untuk modal
    const point = {
      riskId: risk.kode_risiko || 'N/A',
      x: parseFloat(riskData.impact) || 0,
      y: parseFloat(riskData.probability) || 0,
      value: parseFloat(riskData.risk_value) || 0,
      level: riskData.risk_level || 'LOW RISK',
      color: getRiskColor(riskData.risk_level),
      sasaran: risk.sasaran || 'Tidak ada sasaran',
      unitKerja: unitKerja,
      kategori: kategori,
      probabilityPercent: riskData.probability_percent || 0,
      financialImpact: riskData.financial_impact || 0
    };
    
    // Tampilkan modal detail
    showRiskDetailModal(point);
  }

  async function downloadReport() {
    try {
      if (state.data.length === 0) {
        alert('Tidak ada data untuk diunduh');
        return;
      }

      // Show loading
      const button = event.target.closest('button');
      const originalHTML = button.innerHTML;
      button.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
      button.disabled = true;

      // Create CSV content
      const headers = [
        'Kode Risiko',
        'Unit Kerja', 
        'Kategori',
        'Probabilitas',
        'Dampak',
        'Risk Value',
        'Risk Level',
        'Prob %',
        'Dampak Finansial',
        'Sasaran'
      ];

      let csvContent = headers.join(',') + '\n';
      
      state.data.forEach(item => {
        const risk = item.risk_inputs || {};
        const row = [
          `"${risk.kode_risiko || '-'}"`,
          `"${risk.master_work_units?.name || '-'}"`,
          `"${risk.master_risk_categories?.name || '-'}"`,
          item.probability || '-',
          item.impact || '-',
          item.risk_value || '-',
          `"${item.risk_level || '-'}"`,
          `${item.probability_percent || 0}%`,
          `"Rp ${formatNumber(item.financial_impact || 0)}"`,
          `"${(risk.sasaran || '').replace(/"/g, '""')}"`
        ];
        csvContent += row.join(',') + '\n';
      });

      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      link.setAttribute('href', url);
      link.setAttribute('download', `risk-profile-report-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Show success message
      const successMsg = document.createElement('div');
      successMsg.style.cssText = 'position: fixed; top: 20px; right: 20px; background: #10b981; color: white; padding: 1rem 1.5rem; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); z-index: 10000;';
      successMsg.innerHTML = '<i class="fas fa-check-circle"></i> Laporan berhasil diunduh!';
      document.body.appendChild(successMsg);
      
      setTimeout(() => successMsg.remove(), 3000);
      
      // Reset button
      setTimeout(() => {
        button.innerHTML = originalHTML;
        button.disabled = false;
      }, 1000);
      
      console.log('Report downloaded successfully');
    } catch (error) {
      console.error('Error downloading report:', error);
      alert('Gagal mengunduh laporan: ' + error.message);
      
      // Reset button on error
      const button = event.target.closest('button');
      if (button) {
        button.innerHTML = '<i class="fas fa-download"></i>';
        button.disabled = false;
      }
    }
  }

  return {
    load,
    applyFilter,
    refresh,
    downloadChart,
    downloadReport,
    viewDetail,
    state // Expose state untuk diakses oleh download handler
  };
})();

async function loadRiskProfile() {
  await RiskProfileModule.load();
}

window.RiskProfileModule = RiskProfileModule;
window.loadRiskProfile = loadRiskProfile;
