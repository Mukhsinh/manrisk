// Diagram Kartesius Module - Auto Calculation for All Units
const DiagramKartesiusModule = (() => {
  const state = {
    data: [],
    unitKerja: [],
    availableYears: [],
    filters: {
      unit_kerja_id: '',
      jenis: '',
      tahun: null // Will be auto-detected
    },
    chart: null
  };

  const api = () => (window.app ? window.app.apiCall : window.apiCall);

  // Generate year options for dropdown (5 years back, current year, 5 years forward)
  function generateYearOptions(selectedYear) {
    const currentYear = new Date().getFullYear();
    const startYear = currentYear - 5;
    const endYear = currentYear + 5;
    let options = '';
    const selectedYearInt = parseInt(selectedYear) || currentYear;
    
    for (let year = endYear; year >= startYear; year--) {
      const selected = year === selectedYearInt ? 'selected' : '';
      // Mark years with data
      const hasData = state.availableYears.includes(year);
      const dataIndicator = hasData ? ' ✓' : '';
      options += `<option value="${year}" ${selected}>${year}${dataIndicator}</option>`;
    }
    return options;
  }

  async function load() {
    // First, try to get available years from existing data
    await detectAvailableYear();
    await fetchInitialData();
    render();
  }
  
  async function detectAvailableYear() {
    try {
      // Fetch all diagram data without year filter to detect available years
      const allData = await api()('/api/diagram-kartesius');
      if (allData && allData.length > 0) {
        // Get all unique years with data
        state.availableYears = [...new Set(allData.map(d => d.tahun))].sort((a, b) => b - a);
        if (state.availableYears.length > 0 && !state.filters.tahun) {
          state.filters.tahun = state.availableYears[0];
          console.log('📅 Auto-detected year with data:', state.filters.tahun);
          console.log('📅 Available years:', state.availableYears);
        }
      } else {
        // No data, default to current year
        state.filters.tahun = state.filters.tahun || new Date().getFullYear();
      }
    } catch (error) {
      console.log('Could not auto-detect year, using current year');
      state.filters.tahun = state.filters.tahun || new Date().getFullYear();
    }
  }

  async function fetchInitialData() {
    try {
      // Build query params, only include non-empty values
      const params = new URLSearchParams();
      if (state.filters.unit_kerja_id) params.append('unit_kerja_id', state.filters.unit_kerja_id);
      if (state.filters.jenis) params.append('jenis', state.filters.jenis);
      if (state.filters.tahun) params.append('tahun', state.filters.tahun);
      
      console.log('📊 Fetching diagram data with filters:', Object.fromEntries(params));
      
      const [diagram, unitKerja] = await Promise.all([
        api()('/api/diagram-kartesius?' + params.toString()),
        api()('/api/master-data/work-units')
      ]);
      
      state.data = diagram || [];
      state.unitKerja = unitKerja || [];
      
      // Normalize jenis values for consistent display
      state.unitKerja = state.unitKerja.map(u => ({
        ...u,
        jenis: u.jenis ? capitalizeWords(u.jenis) : u.jenis
      }));
      
      console.log('📊 Loaded data:', state.data.length, 'diagrams,', state.unitKerja.length, 'units');
    } catch (error) {
      console.error('Error fetching data:', error);
      state.data = [];
      state.unitKerja = [];
    }
  }
  
  // Helper function to capitalize words
  function capitalizeWords(str) {
    if (!str) return str;
    return str.split(' ').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ).join(' ');
  }

  function render() {
    const container = document.getElementById('diagram-kartesius-content');
    if (!container) return;

    // Get unique jenis options from unit kerja data (already capitalized)
    const jenisOptions = [...new Set(state.unitKerja.map(u => u.jenis).filter(Boolean))].sort();
    
    console.log('🔧 Filter options - Jenis:', jenisOptions);
    console.log('🔧 Current filter state:', state.filters);

    // Get current filter values (capitalize for display matching)
    const currentJenis = state.filters.jenis ? capitalizeWords(state.filters.jenis) : '';

    container.innerHTML = `
      <div class="card">
        <div class="card-header">
          <h3 class="card-title">Diagram Kartesius SWOT - Auto Calculation</h3>
          <div style="display: flex; gap: 0.5rem;">
            <button class="btn btn-success" onclick="DiagramKartesiusModule.calculate()">
              <i class="fas fa-calculator"></i> Hitung Diagram Otomatis
            </button>
            ${state.data.length > 0 ? `
              <button class="btn btn-primary" onclick="DiagramKartesiusModule.downloadChart()">
                <i class="fas fa-download"></i> Unduh Diagram
              </button>
            ` : ''}
          </div>
        </div>
        <div class="card-body">
          <div class="filter-group" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-bottom: 1.5rem;">
            <div class="form-group">
              <label>Unit Kerja</label>
              <select class="form-control" id="filter-unit-kerja">
                <option value="">Semua Unit Kerja</option>
                ${state.unitKerja.map(u => `<option value="${u.id}" ${state.filters.unit_kerja_id === u.id ? 'selected' : ''}>${u.code || ''} - ${u.name}</option>`).join('')}
              </select>
            </div>
            <div class="form-group">
              <label>Jenis</label>
              <select class="form-control" id="filter-jenis">
                <option value="">Semua Jenis</option>
                ${jenisOptions.map(j => {
                  const selected = currentJenis === j ? 'selected' : '';
                  return `<option value="${j}" ${selected}>${j}</option>`;
                }).join('')}
              </select>
            </div>
            <div class="form-group">
              <label>Tahun <span class="text-danger">*</span></label>
              <select class="form-control" id="filter-tahun">
                ${generateYearOptions(state.filters.tahun)}
              </select>
              <small class="form-text text-muted">
                <i class="fas fa-info-circle"></i> Sistem akan menghitung diagram untuk unit kerja yang dipilih secara otomatis!
              </small>
            </div>
          </div>
          <div style="margin-bottom: 1rem;">
            <button class="btn btn-primary" onclick="DiagramKartesiusModule.applyFilter()">
              <i class="fas fa-filter"></i> Terapkan Filter
            </button>
            <button class="btn btn-secondary" onclick="DiagramKartesiusModule.resetFilter()">
              <i class="fas fa-undo"></i> Reset Filter
            </button>
          </div>
          ${state.data.length > 0 ? `
            <div class="alert alert-success" style="margin-bottom: 1rem;">
              <h5><i class="fas fa-info-circle"></i> Interpretasi Kuadran SWOT</h5>
              <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1rem; margin-top: 0.5rem;">
                <div><span class="badge-kuadran badge-kuadran-i">KUADRAN I</span> <strong>Growth:</strong> Kekuatan + Peluang</div>
                <div><span class="badge-kuadran badge-kuadran-ii">KUADRAN II</span> <strong>Stability:</strong> Kelemahan + Peluang</div>
                <div><span class="badge-kuadran badge-kuadran-iii">KUADRAN III</span> <strong>Survival:</strong> Kelemahan + Ancaman</div>
                <div><span class="badge-kuadran badge-kuadran-iv">KUADRAN IV</span> <strong>Diversification:</strong> Kekuatan + Ancaman</div>
              </div>
            </div>
          ` : ''}
          <div id="diagram-chart-container" style="position: relative; height: 600px; margin-bottom: 2rem;">
            <canvas id="diagram-chart"></canvas>
          </div>
          <div class="table-container" style="overflow-x: auto;">
            <table class="table" style="min-width: 900px; table-layout: fixed;">
              <thead>
                <tr>
                  <th style="width: 80px;">Tahun</th>
                  <th style="width: 100px;">Kode</th>
                  <th style="width: 250px;">Unit Kerja</th>
                  <th style="width: 100px; text-align: center;">X-Axis</th>
                  <th style="width: 100px; text-align: center;">Y-Axis</th>
                  <th style="width: 140px; text-align: center;">Kuadran</th>
                  <th style="width: 130px; text-align: center;">Strategi</th>
                </tr>
              </thead>
              <tbody>
                ${state.data.length === 0 ? '<tr><td colspan="7" class="text-center">Tidak ada data. Klik "Hitung Diagram Otomatis" untuk generate dari analisis SWOT.</td></tr>' : ''}
                ${state.data.map(item => {
                  const workUnit = item.master_work_units;
                  const unitCode = workUnit?.code || (item.unit_kerja_name && item.unit_kerja_name.includes('Agregasi') ? 'AGR' : '-');
                  const unitName = workUnit?.name || item.unit_kerja_name || 'Unit Kerja';
                  
                  return `
                    <tr>
                      <td style="text-align: center;">${item.tahun}</td>
                      <td style="text-align: center;"><strong>${unitCode}</strong></td>
                      <td style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${unitName}">
                        ${unitName}
                        ${item.unit_kerja_name && item.unit_kerja_name.includes('Agregasi') ? 
                          '<span class="badge badge-primary ml-1" style="font-size: 0.7rem;">Agregasi</span>' : 
                          ''
                        }
                      </td>
                      <td style="text-align: center;">${parseFloat(item.x_axis).toFixed(2)}</td>
                      <td style="text-align: center;">${parseFloat(item.y_axis).toFixed(2)}</td>
                      <td style="text-align: center;"><span class="badge-kuadran badge-kuadran-${item.kuadran.toLowerCase()}">KUADRAN ${item.kuadran}</span></td>
                      <td style="text-align: center;"><span class="badge-strategi badge-strategi-${item.strategi.toLowerCase()}">${item.strategi}</span></td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;

    // Add event listeners for filter dropdowns
    setupFilterListeners();

    if (state.data.length > 0) {
      renderChart();
    }
  }

  function setupFilterListeners() {
    // Add change event listeners to filter dropdowns
    const unitKerjaSelect = document.getElementById('filter-unit-kerja');
    const jenisSelect = document.getElementById('filter-jenis');
    const tahunSelect = document.getElementById('filter-tahun');
    
    // When unit kerja changes, update state and auto-apply
    if (unitKerjaSelect) {
      unitKerjaSelect.addEventListener('change', async function() {
        state.filters.unit_kerja_id = this.value;
        console.log('🔧 Unit Kerja changed to:', this.value);
        // Auto-apply filter when changed
        await applyFilter();
      });
    }
    
    // When jenis changes, update state and auto-apply
    if (jenisSelect) {
      jenisSelect.addEventListener('change', async function() {
        state.filters.jenis = this.value;
        console.log('🔧 Jenis changed to:', this.value);
        // Auto-apply filter when changed
        await applyFilter();
      });
    }
    
    // When tahun changes, update state and auto-apply
    if (tahunSelect) {
      tahunSelect.addEventListener('change', async function() {
        state.filters.tahun = parseInt(this.value) || new Date().getFullYear();
        console.log('🔧 Tahun changed to:', state.filters.tahun);
        // Auto-apply filter when changed
        await applyFilter();
      });
    }
  }

  function renderChart() {
    const ctx = document.getElementById('diagram-chart');
    if (!ctx) return;

    if (state.chart) {
      state.chart.destroy();
    }

    // Calculate axis range based on data
    const xValues = state.data.map(d => parseFloat(d.x_axis));
    const yValues = state.data.map(d => parseFloat(d.y_axis));
    const maxX = Math.max(Math.abs(Math.max(...xValues)), Math.abs(Math.min(...xValues)), 10);
    const maxY = Math.max(Math.abs(Math.max(...yValues)), Math.abs(Math.min(...yValues)), 10);
    const range = Math.max(maxX, maxY) * 1.2;

    // Prepare datasets with quadrant backgrounds and lines
    const datasets = [
      // Quadrant I Background (top-right) - Growth
      {
        label: 'Kuadran I - Growth',
        data: [
          { x: 0, y: 0 },
          { x: range, y: 0 },
          { x: range, y: range },
          { x: 0, y: range }
        ],
        backgroundColor: 'rgba(39, 174, 96, 0.1)', // Green transparent
        borderColor: 'rgba(39, 174, 96, 0.3)',
        borderWidth: 1,
        fill: true,
        pointRadius: 0,
        showLine: true,
        tension: 0
      },
      // Quadrant II Background (top-left) - Stability  
      {
        label: 'Kuadran II - Stability',
        data: [
          { x: -range, y: 0 },
          { x: 0, y: 0 },
          { x: 0, y: range },
          { x: -range, y: range }
        ],
        backgroundColor: 'rgba(52, 152, 219, 0.1)', // Blue transparent
        borderColor: 'rgba(52, 152, 219, 0.3)',
        borderWidth: 1,
        fill: true,
        pointRadius: 0,
        showLine: true,
        tension: 0
      },
      // Quadrant III Background (bottom-left) - Survival
      {
        label: 'Kuadran III - Survival',
        data: [
          { x: -range, y: -range },
          { x: 0, y: -range },
          { x: 0, y: 0 },
          { x: -range, y: 0 }
        ],
        backgroundColor: 'rgba(231, 76, 60, 0.1)', // Red transparent
        borderColor: 'rgba(231, 76, 60, 0.3)',
        borderWidth: 1,
        fill: true,
        pointRadius: 0,
        showLine: true,
        tension: 0
      },
      // Quadrant IV Background (bottom-right) - Diversification
      {
        label: 'Kuadran IV - Diversification',
        data: [
          { x: 0, y: -range },
          { x: range, y: -range },
          { x: range, y: 0 },
          { x: 0, y: 0 }
        ],
        backgroundColor: 'rgba(243, 156, 18, 0.1)', // Orange transparent
        borderColor: 'rgba(243, 156, 18, 0.3)',
        borderWidth: 1,
        fill: true,
        pointRadius: 0,
        showLine: true,
        tension: 0
      },
      // Vertical line (x=0)
      {
        label: 'Garis Tengah',
        data: [{ x: 0, y: -range }, { x: 0, y: range }],
        type: 'line',
        borderColor: '#333',
        borderWidth: 3,
        pointRadius: 0,
        showLine: true,
        fill: false
      },
      // Horizontal line (y=0)
      {
        label: 'Garis Tengah',
        data: [{ x: -range, y: 0 }, { x: range, y: 0 }],
        type: 'line',
        borderColor: '#333',
        borderWidth: 3,
        pointRadius: 0,
        showLine: true,
        fill: false
      },
      // Data points - smaller radius
      ...state.data.map((item) => {
        const workUnit = item.master_work_units;
        const unitCode = workUnit?.code || (item.unit_kerja_name && item.unit_kerja_name.includes('Agregasi') ? 'AGR' : '-');
        const unitName = workUnit?.name || item.unit_kerja_name || 'Unit Kerja';
        
        return {
          label: `${item.tahun} - ${unitCode} - ${unitName} (Kuadran ${item.kuadran})`,
          data: [{ x: parseFloat(item.x_axis), y: parseFloat(item.y_axis) }],
          backgroundColor: getKuadranColorHex(item.kuadran),
          borderColor: getKuadranColorHex(item.kuadran),
          pointRadius: item.unit_kerja_name && item.unit_kerja_name.includes('Agregasi') ? 10 : 7,
          pointHoverRadius: item.unit_kerja_name && item.unit_kerja_name.includes('Agregasi') ? 14 : 10,
          pointBorderWidth: 2,
          pointBorderColor: '#fff'
        };
      })
    ];

    state.chart = new Chart(ctx, {
      type: 'scatter',
      data: { datasets },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          intersect: false,
          mode: 'point'
        },
        scales: {
          x: {
            title: {
              display: true,
              text: 'Strength - Weakness →',
              font: { size: 14, weight: 'bold' },
              color: '#333'
            },
            min: -range,
            max: range,
            grid: {
              color: function(context) {
                return context.tick.value === 0 ? '#333' : '#e0e0e0';
              },
              lineWidth: function(context) {
                return context.tick.value === 0 ? 3 : 1;
              }
            },
            ticks: {
              font: { size: 11 },
              color: '#666'
            }
          },
          y: {
            title: {
              display: true,
              text: '↑ Opportunity - Threat',
              font: { size: 14, weight: 'bold' },
              color: '#333'
            },
            min: -range,
            max: range,
            grid: {
              color: function(context) {
                return context.tick.value === 0 ? '#333' : '#e0e0e0';
              },
              lineWidth: function(context) {
                return context.tick.value === 0 ? 3 : 1;
              }
            },
            ticks: {
              font: { size: 11 },
              color: '#666'
            }
          }
        },
        plugins: {
          legend: {
            display: false // Hide legend completely
          },
          tooltip: {
            filter: function(tooltipItem) {
              // Only show tooltip for data points (not quadrant backgrounds or lines)
              return tooltipItem.datasetIndex >= 6;
            },
            callbacks: {
              label: function(context) {
                const item = state.data[context.datasetIndex - 6];
                if (!item) return [];
                const workUnit = item.master_work_units;
                const unitCode = workUnit?.code || (item.unit_kerja_name && item.unit_kerja_name.includes('Agregasi') ? 'AGR' : '-');
                const unitName = workUnit?.name || item.unit_kerja_name || 'Unit Kerja';
                
                return [
                  `Tahun: ${item.tahun}`,
                  `Kode: ${unitCode}`,
                  `Unit: ${unitName}`,
                  `Posisi: (${parseFloat(item.x_axis).toFixed(1)}, ${parseFloat(item.y_axis).toFixed(1)})`,
                  `Kuadran: ${item.kuadran} - ${item.strategi}`
                ];
              }
            }
          }
        },
        // Add quadrant labels as annotations
        onHover: function(event, elements) {
          event.native.target.style.cursor = elements.length > 0 ? 'pointer' : 'default';
        }
      },
      plugins: [{
        id: 'quadrantLabels',
        afterDraw: function(chart) {
          const ctx = chart.ctx;
          const xScale = chart.scales.x;
          const yScale = chart.scales.y;
          
          ctx.save();
          ctx.font = 'bold 14px Arial';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          
          // Quadrant I (top-right) - Growth
          ctx.fillStyle = 'rgba(39, 174, 96, 0.8)';
          const q1X = xScale.getPixelForValue(range * 0.5);
          const q1Y = yScale.getPixelForValue(range * 0.5);
          ctx.fillText('KUADRAN I', q1X, q1Y - 10);
          ctx.font = '12px Arial';
          ctx.fillText('GROWTH', q1X, q1Y + 10);
          
          // Quadrant II (top-left) - Stability
          ctx.fillStyle = 'rgba(52, 152, 219, 0.8)';
          const q2X = xScale.getPixelForValue(-range * 0.5);
          const q2Y = yScale.getPixelForValue(range * 0.5);
          ctx.font = 'bold 14px Arial';
          ctx.fillText('KUADRAN II', q2X, q2Y - 10);
          ctx.font = '12px Arial';
          ctx.fillText('STABILITY', q2X, q2Y + 10);
          
          // Quadrant III (bottom-left) - Survival
          ctx.fillStyle = 'rgba(231, 76, 60, 0.8)';
          const q3X = xScale.getPixelForValue(-range * 0.5);
          const q3Y = yScale.getPixelForValue(-range * 0.5);
          ctx.font = 'bold 14px Arial';
          ctx.fillText('KUADRAN III', q3X, q3Y - 10);
          ctx.font = '12px Arial';
          ctx.fillText('SURVIVAL', q3X, q3Y + 10);
          
          // Quadrant IV (bottom-right) - Diversification
          ctx.fillStyle = 'rgba(243, 156, 18, 0.8)';
          const q4X = xScale.getPixelForValue(range * 0.5);
          const q4Y = yScale.getPixelForValue(-range * 0.5);
          ctx.font = 'bold 14px Arial';
          ctx.fillText('KUADRAN IV', q4X, q4Y - 10);
          ctx.font = '12px Arial';
          ctx.fillText('DIVERSIFICATION', q4X, q4Y + 10);
          
          ctx.restore();
        }
      }]
    });
  }

  function getKuadranColor(kuadran) {
    const colors = {
      'I': 'aman',
      'II': 'normal',
      'III': 'kritis',
      'IV': 'hati-hati'
    };
    return colors[kuadran] || 'secondary';
  }

  function getKuadranColorHex(kuadran) {
    const colors = {
      'I': '#22c55e',   // Green - Growth (lebih cerah)
      'II': '#3b82f6',  // Blue - Stability  
      'III': '#ef4444', // Red - Survival
      'IV': '#f97316'   // Orange - Diversification (lebih cerah)
    };
    return colors[kuadran] || '#6b7280';
  }

  async function applyFilter() {
    // Get filter values from DOM to ensure we have the latest values
    const unitKerjaEl = document.getElementById('filter-unit-kerja');
    const jenisEl = document.getElementById('filter-jenis');
    const tahunEl = document.getElementById('filter-tahun');
    
    // Update state with current DOM values
    if (unitKerjaEl) state.filters.unit_kerja_id = unitKerjaEl.value || '';
    if (jenisEl) state.filters.jenis = jenisEl.value || '';
    if (tahunEl) state.filters.tahun = parseInt(tahunEl.value) || new Date().getFullYear();
    
    console.log('🔍 Applying filters:', state.filters);
    
    // Show loading indicator
    const container = document.getElementById('diagram-kartesius-content');
    if (container) {
      const tableBody = container.querySelector('tbody');
      if (tableBody) {
        tableBody.innerHTML = '<tr><td colspan="7" class="text-center"><i class="fas fa-spinner fa-spin"></i> Memuat data...</td></tr>';
      }
    }
    
    // Fetch data with new filters
    await fetchInitialData();
    
    // Re-render the page with filtered data
    render();
  }
  
  async function resetFilter() {
    // Reset all filters to default - use first available year or current year
    const defaultYear = state.availableYears.length > 0 ? state.availableYears[0] : new Date().getFullYear();
    
    state.filters = {
      unit_kerja_id: '',
      jenis: '',
      tahun: defaultYear
    };
    
    console.log('🔄 Resetting filters to default, year:', defaultYear);
    
    await fetchInitialData();
    render();
  }

  async function calculate() {
    const unit_kerja_id = document.getElementById('filter-unit-kerja')?.value || '';
    const jenis = document.getElementById('filter-jenis')?.value || '';
    const tahun = parseInt(document.getElementById('filter-tahun')?.value || new Date().getFullYear());

    // Update state filters to match current selection
    state.filters.unit_kerja_id = unit_kerja_id;
    state.filters.jenis = jenis;
    state.filters.tahun = tahun;

    const message = `Hitung diagram kartesius otomatis untuk tahun ${tahun}?\n\nSistem akan menghitung diagram untuk unit kerja yang dipilih secara otomatis.`;
    
    if (!confirm(message)) return;

    // Find button element
    const button = document.querySelector('button[onclick*="calculate"]');
    let originalText = '';
    
    try {
      // Show loading
      if (button) {
        originalText = button.innerHTML;
        button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Menghitung Unit Kerja...';
        button.disabled = true;
      }

      console.log('🔄 Auto calculating diagram for units:', {
        unit_kerja_id: unit_kerja_id || null,
        jenis: jenis || null,
        tahun
      });

      const response = await api()('/api/diagram-kartesius/calculate', {
        method: 'POST',
        body: {
          unit_kerja_id: unit_kerja_id || null,
          jenis: jenis || null,
          tahun
        }
      });
      
      console.log('✅ Auto calculation response:', response);
      
      await load();
      
      const successMessage = `Diagram berhasil dihitung!\n\n` +
        `✅ Berhasil: ${response.summary?.successful || 0} unit\n` +
        `❌ Gagal: ${response.summary?.failed || 0} unit\n\n` +
        `Total unit diproses: ${response.summary?.total_processed || 0}`;
      
      alert(successMessage);
      
    } catch (error) {
      console.error('❌ Auto calculate error:', error);
      alert('Error: ' + (error.message || 'Terjadi kesalahan saat menghitung diagram'));
    } finally {
      // Restore button state
      if (button) {
        button.innerHTML = originalText || '<i class="fas fa-calculator"></i> Hitung Diagram Otomatis';
        button.disabled = false;
      }
    }
  }

  function edit(id) {
    const item = state.data.find(d => d.id === id);
    if (!item) return;

    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.innerHTML = `
      <div class="modal-content" style="max-width: 500px;">
        <div class="modal-header">
          <h3 class="modal-title">Edit Diagram Kartesius</h3>
          <button class="modal-close" onclick="this.closest('.modal').remove()">&times;</button>
        </div>
        <form onsubmit="DiagramKartesiusModule.saveManual(event, '${id}')">
          <div class="form-group">
            <label class="form-label">X-Axis</label>
            <input type="number" class="form-control" id="dk-x-axis" value="${item.x_axis}" step="0.1">
          </div>
          <div class="form-group">
            <label class="form-label">Y-Axis</label>
            <input type="number" class="form-control" id="dk-y-axis" value="${item.y_axis}" step="0.1">
          </div>
          <div style="display: flex; gap: 1rem; justify-content: flex-end; margin-top: 1.5rem;">
            <button type="button" class="btn btn-secondary" onclick="this.closest('.modal').remove()">Batal</button>
            <button type="submit" class="btn btn-primary">Simpan</button>
          </div>
        </form>
      </div>
    `;
    document.body.appendChild(modal);
  }

  async function saveManual(e, id) {
    e.preventDefault();
    try {
      const data = {
        x_axis: parseFloat(document.getElementById('dk-x-axis').value),
        y_axis: parseFloat(document.getElementById('dk-y-axis').value)
      };

      await api()(`/api/diagram-kartesius/${id}`, { method: 'PUT', body: data });
      document.querySelector('.modal').remove();
      await load();
      alert('Data berhasil diupdate');
    } catch (error) {
      alert('Error: ' + error.message);
    }
  }

  async function deleteItem(id) {
    if (!confirm('Yakin ingin menghapus data ini?')) return;
    try {
      await api()(`/api/diagram-kartesius/${id}`, { method: 'DELETE' });
      await load();
      alert('Data berhasil dihapus');
    } catch (error) {
      alert('Error: ' + error.message);
    }
  }

  function downloadChart() {
    if (!state.chart) {
      alert('Tidak ada diagram untuk diunduh');
      return;
    }

    try {
      // Create download modal
      const modal = document.createElement('div');
      modal.className = 'modal active';
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
                     value="diagram-kartesius-auto-${state.filters.tahun}" 
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
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" onclick="this.closest('.modal').remove()">Batal</button>
            <button type="button" class="btn btn-primary" onclick="DiagramKartesiusModule.executeDownload()">
              <i class="fas fa-download"></i> Unduh
            </button>
          </div>
        </div>
      `;
      document.body.appendChild(modal);
    } catch (error) {
      console.error('Download error:', error);
      alert('Error: ' + error.message);
    }
  }

  function executeDownload() {
    try {
      const format = document.getElementById('download-format').value;
      const filename = document.getElementById('download-filename').value || 'diagram-kartesius-auto';
      const quality = parseFloat(document.getElementById('download-quality').value);

      if (format === 'pdf') {
        downloadAsPDF(filename, quality);
      } else {
        downloadAsImage(format, filename, quality);
      }

      document.querySelector('.modal').remove();
    } catch (error) {
      console.error('Execute download error:', error);
      alert('Error saat mengunduh: ' + error.message);
    }
  }

  function downloadAsImage(format, filename, quality) {
    try {
      const canvas = document.getElementById('diagram-chart');
      if (!canvas) {
        alert('Canvas diagram tidak ditemukan');
        return;
      }

      console.log('📥 Downloading as image:', format, filename, 'quality:', quality);

      // Use Chart.js built-in method to get image
      const imageUrl = state.chart.toBase64Image();
      
      // Create download link
      const link = document.createElement('a');
      link.href = imageUrl;
      link.download = `${filename}.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      console.log('✅ Image downloaded successfully');
      
    } catch (error) {
      console.error('❌ Download image error:', error);
      alert('Error saat mengunduh gambar: ' + error.message);
    }
  }

  function downloadAsPDF(filename) {
    try {
      console.log('📥 Downloading as PDF:', filename);
      
      // Check if jsPDF is available
      if (typeof window.jspdf === 'undefined' && typeof window.jsPDF === 'undefined') {
        console.log('⏳ Loading jsPDF library...');
        // Load jsPDF dynamically
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
        script.onload = function() {
          console.log('✅ jsPDF loaded');
          generatePDF(filename);
        };
        script.onerror = function() {
          console.error('❌ Failed to load jsPDF');
          alert('Gagal memuat library PDF. Silakan coba lagi atau gunakan format gambar.');
        };
        document.head.appendChild(script);
      } else {
        generatePDF(filename);
      }
    } catch (error) {
      console.error('❌ Download PDF error:', error);
      alert('Error saat mengunduh PDF: ' + error.message);
    }
  }

  function generatePDF(filename) {
    try {
      const canvas = document.getElementById('diagram-chart');
      if (!canvas) {
        alert('Canvas diagram tidak ditemukan');
        return;
      }

      console.log('📄 Generating PDF...');

      // Get jsPDF from window
      const jsPDF = window.jspdf?.jsPDF || window.jsPDF;
      
      if (!jsPDF) {
        alert('Library PDF tidak tersedia. Silakan gunakan format gambar.');
        return;
      }

      const pdf = new jsPDF('landscape', 'mm', 'a4');
      
      // Add title
      pdf.setFontSize(16);
      pdf.text('Diagram Kartesius SWOT Analysis - Auto Calculation', 20, 20);
      
      // Add metadata
      pdf.setFontSize(10);
      const currentDate = new Date().toLocaleDateString('id-ID');
      pdf.text(`Tanggal: ${currentDate}`, 20, 30);
      pdf.text(`Tahun Data: ${state.filters.tahun}`, 20, 35);
      pdf.text(`Mode: Perhitungan Otomatis Semua Unit`, 20, 40);

      // Convert canvas to image and add to PDF
      const imgData = state.chart.toBase64Image();
      const imgWidth = 250;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 20, 50, imgWidth, imgHeight);
      
      // Add data table
      let yPos = 50 + imgHeight + 20;
      
      // Check if we need a new page for the table
      if (yPos > 150) {
        pdf.addPage();
        yPos = 20;
      }
      
      pdf.setFontSize(12);
      pdf.text('Data Diagram:', 20, yPos);
      
      yPos += 10;
      pdf.setFontSize(8);
      
      // Table headers
      pdf.text('Tahun', 20, yPos);
      pdf.text('Unit Kerja', 50, yPos);
      pdf.text('X-Axis', 120, yPos);
      pdf.text('Y-Axis', 150, yPos);
      pdf.text('Kuadran', 180, yPos);
      pdf.text('Strategi', 210, yPos);
      
      yPos += 5;
      
      // Table data
      state.data.forEach(item => {
        if (yPos > 180) { // New page if needed
          pdf.addPage();
          yPos = 20;
        }
        
        const workUnit = item.master_work_units;
        const unitName = workUnit?.name || item.unit_kerja_name || 'Unit Kerja';
        
        pdf.text(item.tahun.toString(), 20, yPos);
        pdf.text(unitName.substring(0, 20), 50, yPos);
        pdf.text(parseFloat(item.x_axis).toFixed(2), 120, yPos);
        pdf.text(parseFloat(item.y_axis).toFixed(2), 150, yPos);
        pdf.text(item.kuadran, 180, yPos);
        pdf.text(item.strategi, 210, yPos);
        
        yPos += 5;
      });

      // Save PDF
      pdf.save(`${filename}.pdf`);
      console.log('✅ PDF generated successfully');
      
    } catch (error) {
      console.error('❌ PDF generation error:', error);
      alert('Error saat membuat PDF: ' + error.message);
    }
  }

  return {
    load,
    applyFilter,
    resetFilter,
    calculate,
    edit,
    saveManual,
    delete: deleteItem,
    deleteItem: deleteItem,
    downloadChart,
    executeDownload
  };
})();

async function loadDiagramKartesius() {
  await DiagramKartesiusModule.load();
}

window.diagramKartesiusModule = DiagramKartesiusModule;