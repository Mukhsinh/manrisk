// ===================================
// RISK PROFILE COMPREHENSIVE FIX
// Memperbaiki: Judul, Kartu, Grafik, dan Filter
// ===================================

(function() {
    'use strict';

    console.log('🚀 Risk Profile Comprehensive Fix Loading...');

    // State management
    const state = {
        allData: [],
        filteredData: [],
        filters: {
            rencanaStrategis: '',
            unitKerja: '',
            kategoriRisiko: '',
            riskLevel: '',
            searchQuery: ''
        },
        charts: {
            riskLevel: null,
            category: null,
            unit: null
        },
        isInitialized: false
    };

    // ===================================
    // INITIALIZATION
    // ===================================
    
    async function initialize() {
        if (state.isInitialized) {
            console.log('⚠️ Already initialized, skipping...');
            return;
        }

        console.log('🔧 Initializing Risk Profile...');
        
        try {
            // 1. Load data
            await loadData();
            
            // 2. Setup filters
            setupFilters();
            
            // 3. Render initial view
            renderAll();
            
            // 4. Setup event listeners
            setupEventListeners();
            
            state.isInitialized = true;
            console.log('✅ Risk Profile initialized successfully');
            
        } catch (error) {
            console.error('❌ Initialization error:', error);
            showError('Gagal menginisialisasi Risk Profile: ' + error.message);
        }
    }

    // ===================================
    // DATA LOADING
    // ===================================
    
    async function loadData() {
        console.log('📥 Loading risk profile data...');
        
        try {
            const response = await fetch('/api/risk-profile/public');
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            state.allData = Array.isArray(data) ? data : [];
            state.filteredData = [...state.allData];
            
            console.log('✅ Data loaded:', state.allData.length, 'items');
            
            if (state.allData.length > 0) {
                console.log('📊 Sample data:', state.allData[0]);
            }
            
        } catch (error) {
            console.error('❌ Error loading data:', error);
            throw error;
        }
    }

    // ===================================
    // FILTER SETUP
    // ===================================
    
    function setupFilters() {
        console.log('🔧 Setting up filters...');
        
        // Extract unique values
        const uniqueValues = {
            rencanaStrategis: new Set(),
            unitKerja: new Set(),
            kategoriRisiko: new Set(),
            riskLevel: new Set()
        };

        state.allData.forEach(item => {
            // Rencana Strategis
            const rencana = item.risk_inputs?.rencana_strategis || 
                           item.risk_inputs?.rencana_strategis_name ||
                           item.rencana_strategis;
            if (rencana) uniqueValues.rencanaStrategis.add(rencana);
            
            // Unit Kerja
            const unit = item.risk_inputs?.master_work_units?.name;
            if (unit) uniqueValues.unitKerja.add(unit);
            
            // Kategori Risiko
            const kategori = item.risk_inputs?.master_risk_categories?.name;
            if (kategori) uniqueValues.kategoriRisiko.add(kategori);
            
            // Risk Level
            const level = item.risk_level;
            if (level) uniqueValues.riskLevel.add(level);
        });

        // Populate dropdowns
        populateDropdown('filter-rencana-strategis', Array.from(uniqueValues.rencanaStrategis));
        populateDropdown('filter-unit-kerja', Array.from(uniqueValues.unitKerja));
        populateDropdown('filter-kategori-risiko', Array.from(uniqueValues.kategoriRisiko));
        populateDropdown('filter-risk-level', Array.from(uniqueValues.riskLevel));

        console.log('✅ Filters populated:', {
            rencanaStrategis: uniqueValues.rencanaStrategis.size,
            unitKerja: uniqueValues.unitKerja.size,
            kategoriRisiko: uniqueValues.kategoriRisiko.size,
            riskLevel: uniqueValues.riskLevel.size
        });
    }

    function populateDropdown(elementId, options) {
        const select = document.getElementById(elementId);
        if (!select) {
            console.warn(`⚠️ Dropdown ${elementId} not found`);
            return;
        }

        // Clear existing options except first
        while (select.options.length > 1) {
            select.remove(1);
        }

        // Add sorted options
        options.sort().forEach(option => {
            const optionElement = document.createElement('option');
            optionElement.value = option;
            optionElement.textContent = option;
            select.appendChild(optionElement);
        });
    }

    // ===================================
    // EVENT LISTENERS
    // ===================================
    
    function setupEventListeners() {
        console.log('🔧 Setting up event listeners...');
        
        // Filter dropdowns
        const filterMappings = [
            { id: 'filter-rencana-strategis', key: 'rencanaStrategis' },
            { id: 'filter-unit-kerja', key: 'unitKerja' },
            { id: 'filter-kategori-risiko', key: 'kategoriRisiko' },
            { id: 'filter-risk-level', key: 'riskLevel' }
        ];

        filterMappings.forEach(({ id, key }) => {
            const element = document.getElementById(id);
            if (element) {
                element.addEventListener('change', function(e) {
                    state.filters[key] = e.target.value;
                    console.log(`🔍 Filter changed: ${key} = "${e.target.value}"`);
                    applyFilters();
                });
            }
        });

        // Search input
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            searchInput.addEventListener('input', function(e) {
                state.filters.searchQuery = e.target.value.toLowerCase();
                console.log(`🔍 Search: "${state.filters.searchQuery}"`);
                applyFilters();
            });
        }

        console.log('✅ Event listeners attached');
    }

    // ===================================
    // FILTER APPLICATION
    // ===================================
    
    function applyFilters() {
        console.log('🔄 Applying filters...', state.filters);

        state.filteredData = state.allData.filter(item => {
            // Filter Rencana Strategis
            if (state.filters.rencanaStrategis) {
                const rencana = item.risk_inputs?.rencana_strategis || 
                               item.risk_inputs?.rencana_strategis_name ||
                               item.rencana_strategis || '';
                if (rencana !== state.filters.rencanaStrategis) return false;
            }

            // Filter Unit Kerja
            if (state.filters.unitKerja) {
                const unit = item.risk_inputs?.master_work_units?.name || '';
                if (unit !== state.filters.unitKerja) return false;
            }

            // Filter Kategori Risiko
            if (state.filters.kategoriRisiko) {
                const kategori = item.risk_inputs?.master_risk_categories?.name || '';
                if (kategori !== state.filters.kategoriRisiko) return false;
            }

            // Filter Risk Level
            if (state.filters.riskLevel) {
                const level = item.risk_level || '';
                if (level !== state.filters.riskLevel) return false;
            }

            // Filter Search Query
            if (state.filters.searchQuery) {
                const searchableText = [
                    item.risk_inputs?.kode_risiko || '',
                    item.risk_inputs?.sasaran || '',
                    item.risk_inputs?.master_work_units?.name || '',
                    item.risk_inputs?.master_risk_categories?.name || '',
                    item.risk_level || ''
                ].join(' ').toLowerCase();

                if (!searchableText.includes(state.filters.searchQuery)) return false;
            }

            return true;
        });

        console.log(`✅ Filtered: ${state.filteredData.length} / ${state.allData.length} items`);

        // Re-render everything
        renderAll();
    }

    // ===================================
    // RENDERING
    // ===================================
    
    function renderAll() {
        console.log('🎨 Rendering all components...');
        
        updateStatistics();
        renderTable();
        renderCharts();
        updateHeatMap();
    }

    function updateStatistics() {
        const stats = {
            total: state.filteredData.length,
            high: 0,
            medium: 0,
            low: 0
        };

        state.filteredData.forEach(item => {
            const level = (item.risk_level || '').toLowerCase();
            if (level.includes('high') || level.includes('extreme') || level.includes('ekstrem')) {
                stats.high++;
            } else if (level.includes('medium') || level.includes('moderat') || level.includes('sedang')) {
                stats.medium++;
            } else if (level.includes('low') || level.includes('rendah')) {
                stats.low++;
            }
        });

        // Update UI with animation
        animateCounter('total-profiles', stats.total);
        animateCounter('high-risk-profiles', stats.high);
        animateCounter('medium-risk-profiles', stats.medium);
        animateCounter('low-risk-profiles', stats.low);

        console.log('📊 Statistics updated:', stats);
    }

    function animateCounter(elementId, targetValue) {
        const element = document.getElementById(elementId);
        if (!element) return;

        const currentValue = parseInt(element.textContent) || 0;
        const duration = 500;
        const startTime = performance.now();

        function update(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            const value = Math.floor(currentValue + (targetValue - currentValue) * progress);
            element.textContent = value;

            if (progress < 1) {
                requestAnimationFrame(update);
            } else {
                element.textContent = targetValue;
            }
        }

        requestAnimationFrame(update);
    }

    function renderTable() {
        const tbody = document.getElementById('risk-profile-table-body');
        const tableInfo = document.getElementById('table-info');
        
        if (!tbody) {
            console.warn('⚠️ Table body not found');
            return;
        }

        if (state.filteredData.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" class="px-6 py-8 text-center text-slate-500">
                        <div class="flex flex-col items-center gap-2">
                            <span class="material-symbols-outlined text-4xl text-slate-300">search_off</span>
                            <p>Tidak ada data yang sesuai dengan filter</p>
                            <button onclick="window.riskProfileFix.resetFilters()" class="mt-2 px-4 py-2 bg-primary text-white rounded-lg text-sm hover:bg-primary-dark transition-colors">
                                Reset Filter
                            </button>
                        </div>
                    </td>
                </tr>
            `;
            if (tableInfo) tableInfo.textContent = 'Tidak ada data';
            return;
        }

        tbody.innerHTML = state.filteredData.map((item, index) => {
            const riskCode = item.risk_inputs?.kode_risiko || `RSK-${String(index + 1).padStart(3, '0')}`;
            const sasaran = item.risk_inputs?.sasaran || 'Tidak ada deskripsi';
            const unitName = item.risk_inputs?.master_work_units?.name || 'Unit tidak diketahui';
            const categoryName = item.risk_inputs?.master_risk_categories?.name || 'Kategori tidak diketahui';
            const riskLevel = item.risk_level || 'Unknown';
            const riskScore = calculateRiskScore(item);
            const levelClass = getRiskLevelClass(riskLevel);

            return `
                <tr class="hover:bg-blue-50/30 transition-colors group cursor-pointer">
                    <td class="px-6 py-4">
                        <span class="text-xs font-bold px-2 py-1 bg-slate-100 text-slate-600 rounded">${riskCode}</span>
                    </td>
                    <td class="px-6 py-4">
                        <p class="text-sm font-bold text-slate-800 group-hover:text-primary transition-colors">
                            ${truncateText(sasaran, 50)}
                        </p>
                        <div class="flex items-center gap-2 mt-1.5">
                            <span class="flex items-center gap-1 text-[11px] font-medium text-slate-500">
                                <span class="material-symbols-outlined text-[14px] text-slate-400">business</span> 
                                ${truncateText(unitName, 20)}
                            </span>
                        </div>
                    </td>
                    <td class="px-6 py-4 text-center">
                        <div class="inline-flex items-center justify-center size-8 rounded-lg bg-slate-100 font-bold text-slate-700 text-sm">
                            ${riskScore}
                        </div>
                    </td>
                    <td class="px-6 py-4">
                        <span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${levelClass}">
                            ${riskLevel}
                        </span>
                    </td>
                    <td class="px-6 py-4">
                        <span class="text-xs text-slate-600">${truncateText(categoryName, 20)}</span>
                    </td>
                    <td class="px-6 py-4 text-right">
                        <button class="text-slate-400 hover:text-primary hover:bg-blue-50 transition-all p-1.5 rounded-lg">
                            <span class="material-symbols-outlined text-[20px]">more_horiz</span>
                        </button>
                    </td>
                </tr>
            `;
        }).join('');

        if (tableInfo) {
            tableInfo.textContent = `Showing 1-${state.filteredData.length} of ${state.filteredData.length} risk profiles`;
        }

        console.log('✅ Table rendered');
    }

    function renderCharts() {
        if (typeof Chart === 'undefined') {
            console.warn('⚠️ Chart.js not loaded');
            return;
        }

        console.log('📊 Rendering charts...');
        
        // Delay chart rendering to ensure DOM is ready
        setTimeout(() => {
            renderRiskLevelChart();
            renderCategoryChart();
            renderUnitChart();
        }, 100);
    }

    function renderRiskLevelChart() {
        const ctx = document.getElementById('risk-level-pie-chart');
        if (!ctx) {
            console.warn('⚠️ Risk level chart canvas not found');
            return;
        }

        const stats = {
            extreme: state.filteredData.filter(d => {
                const level = d.risk_level || '';
                return level.includes('EXTREME') || level.includes('Very High');
            }).length,
            high: state.filteredData.filter(d => {
                const level = d.risk_level || '';
                return level.includes('HIGH') && !level.includes('EXTREME');
            }).length,
            medium: state.filteredData.filter(d => {
                const level = d.risk_level || '';
                return level.includes('MEDIUM') || level.includes('Sedang');
            }).length,
            low: state.filteredData.filter(d => {
                const level = d.risk_level || '';
                return level.includes('LOW') || level.includes('Rendah');
            }).length
        };

        // Destroy existing chart
        if (state.charts.riskLevel) {
            state.charts.riskLevel.destroy();
        }

        state.charts.riskLevel = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: ['Extreme High', 'High Risk', 'Medium Risk', 'Low Risk'],
                datasets: [{
                    data: [stats.extreme, stats.high, stats.medium, stats.low],
                    backgroundColor: ['#dc2626', '#f59e0b', '#3b82f6', '#10b981'],
                    borderWidth: 2,
                    borderColor: '#fff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 10,
                            font: { size: 11 }
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const label = context.label || '';
                                const value = context.parsed || 0;
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                                return `${label}: ${value} (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        });

        console.log('✅ Risk level chart rendered');
    }

    function renderCategoryChart() {
        const ctx = document.getElementById('risk-category-pie-chart');
        if (!ctx) {
            console.warn('⚠️ Category chart canvas not found');
            return;
        }

        const categoryData = {};
        state.filteredData.forEach(item => {
            const category = item.risk_inputs?.master_risk_categories?.name || 'Tidak Dikategorikan';
            categoryData[category] = (categoryData[category] || 0) + 1;
        });

        const labels = Object.keys(categoryData);
        const data = Object.values(categoryData);
        const colors = generateColors(labels.length);

        // Destroy existing chart
        if (state.charts.category) {
            state.charts.category.destroy();
        }

        state.charts.category = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: colors,
                    borderWidth: 2,
                    borderColor: '#fff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 10,
                            font: { size: 11 }
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const label = context.label || '';
                                const value = context.parsed || 0;
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                                return `${label}: ${value} (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        });

        console.log('✅ Category chart rendered');
    }

    function renderUnitChart() {
        const ctx = document.getElementById('risk-unit-pie-chart');
        if (!ctx) {
            console.warn('⚠️ Unit chart canvas not found');
            return;
        }

        const unitData = {};
        state.filteredData.forEach(item => {
            const unit = item.risk_inputs?.master_work_units?.name || 'Tidak Ada Unit';
            unitData[unit] = (unitData[unit] || 0) + 1;
        });

        const labels = Object.keys(unitData);
        const data = Object.values(unitData);
        const colors = generateColors(labels.length);

        // Destroy existing chart
        if (state.charts.unit) {
            state.charts.unit.destroy();
        }

        state.charts.unit = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: colors,
                    borderWidth: 2,
                    borderColor: '#fff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 10,
                            font: { size: 11 }
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const label = context.label || '';
                                const value = context.parsed || 0;
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                                return `${label}: ${value} (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        });

        console.log('✅ Unit chart rendered');
    }

    function updateHeatMap() {
        const cells = document.querySelectorAll('.heatmap-cell');
        
        // Reset all cells
        cells.forEach(cell => {
            const existingBadge = cell.querySelector('.risk-count-badge');
            if (existingBadge) {
                existingBadge.remove();
            }
        });

        // Count risks by score
        const scoreCounts = {};
        state.filteredData.forEach(item => {
            const score = calculateRiskScore(item);
            scoreCounts[score] = (scoreCounts[score] || 0) + 1;
        });

        // Add count badges
        Object.entries(scoreCounts).forEach(([score, count]) => {
            const cell = document.querySelector(`[data-score="${score}"]`);
            if (cell && count > 0) {
                const badge = document.createElement('div');
                badge.className = 'absolute -top-2 -right-2 bg-white text-red-600 size-5 rounded-full flex items-center justify-center text-[10px] shadow-sm border border-red-100 font-bold risk-count-badge';
                badge.textContent = count;
                cell.appendChild(badge);
            }
        });

        console.log('✅ Heat map updated');
    }

    // ===================================
    // UTILITY FUNCTIONS
    // ===================================
    
    function calculateRiskScore(item) {
        const impact = item.impact_score || item.dampak_score || 1;
        const probability = item.probability_score || item.kemungkinan_score || 1;
        return Math.min(impact * probability, 25);
    }

    function getRiskLevelClass(level) {
        const levelLower = level.toLowerCase();
        if (levelLower.includes('high') || levelLower.includes('extreme') || levelLower.includes('ekstrem')) {
            return 'bg-red-50 text-red-600 border border-red-100';
        } else if (levelLower.includes('medium') || levelLower.includes('moderat') || levelLower.includes('sedang')) {
            return 'bg-yellow-50 text-yellow-600 border border-yellow-100';
        } else if (levelLower.includes('low') || levelLower.includes('rendah')) {
            return 'bg-emerald-50 text-emerald-600 border border-emerald-100';
        }
        return 'bg-slate-50 text-slate-600 border border-slate-100';
    }

    function truncateText(text, maxLength) {
        if (!text) return '';
        return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
    }

    function generateColors(count) {
        const colors = [
            '#3b82f6', '#ef4444', '#f59e0b', '#10b981', '#8b5cf6',
            '#06b6d4', '#64748b', '#f97316', '#94a3b8', '#14b8a6',
            '#2563eb', '#7c3aed', '#1e293b', '#eab308', '#ea580c'
        ];
        
        const result = [];
        for (let i = 0; i < count; i++) {
            result.push(colors[i % colors.length]);
        }
        return result;
    }

    function showError(message) {
        const tbody = document.getElementById('risk-profile-table-body');
        if (tbody) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" class="px-6 py-8 text-center text-red-500">
                        <div class="flex flex-col items-center gap-2">
                            <span class="material-symbols-outlined text-4xl text-red-300">error</span>
                            <p>${message}</p>
                            <button onclick="window.riskProfileFix.refresh()" class="mt-2 px-4 py-2 bg-primary text-white rounded-lg text-sm hover:bg-primary-dark transition-colors">
                                Coba Lagi
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }
    }

    // ===================================
    // PUBLIC API
    // ===================================
    
    function resetFilters() {
        console.log('🔄 Resetting filters...');
        
        // Reset state
        state.filters = {
            rencanaStrategis: '',
            unitKerja: '',
            kategoriRisiko: '',
            riskLevel: '',
            searchQuery: ''
        };

        // Reset UI
        ['filter-rencana-strategis', 'filter-unit-kerja', 'filter-kategori-risiko', 'filter-risk-level'].forEach(id => {
            const element = document.getElementById(id);
            if (element) element.value = '';
        });

        const searchInput = document.getElementById('search-input');
        if (searchInput) searchInput.value = '';

        // Reapply (will show all data)
        applyFilters();
        
        console.log('✅ Filters reset');
    }

    async function refresh() {
        console.log('🔄 Refreshing data...');
        state.isInitialized = false;
        await initialize();
    }

    // Export public API
    window.riskProfileFix = {
        init: initialize,
        resetFilters: resetFilters,
        refresh: refresh,
        getState: () => state
    };

    // Auto-initialize
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize);
    } else {
        // Delay to ensure Chart.js is loaded
        setTimeout(initialize, 500);
    }

    console.log('✅ Risk Profile Comprehensive Fix loaded');

})();
