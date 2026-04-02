// ===================================
// RISK PROFILE FILTER FIX
// Memperbaiki fungsi filter yang tidak bekerja
// ===================================

(function() {
    'use strict';

    // State management untuk filter
    const filterState = {
        rencanaStrategis: '',
        unitKerja: '',
        kategoriRisiko: '',
        riskLevel: '',
        searchQuery: ''
    };

    let allRiskData = [];
    let filteredRiskData = [];

    // Inisialisasi filter saat halaman dimuat
    function initializeFilters() {
        console.log('🔧 Initializing Risk Profile Filters...');

        // Load data awal
        loadRiskProfileData();

        // Setup event listeners untuk semua filter
        setupFilterListeners();

        // Setup search listener
        setupSearchListener();
    }

    // Load data risk profile
    async function loadRiskProfileData() {
        try {
            const response = await fetch('/api/risk-profile/public');
            const data = await response.json();
            
            allRiskData = Array.isArray(data) ? data : [];
            filteredRiskData = [...allRiskData];
            
            console.log('✅ Data loaded:', allRiskData.length, 'items');
            
            // Populate filter dropdowns
            populateFilterDropdowns();
            
            // Render table dengan data awal
            renderFilteredData();
            
        } catch (error) {
            console.error('❌ Error loading data:', error);
        }
    }

    // Populate dropdown filters dengan data unik
    function populateFilterDropdowns() {
        // Get unique values
        const rencanaStrategisSet = new Set();
        const unitKerjaSet = new Set();
        const kategoriRisikoSet = new Set();
        const riskLevelSet = new Set();

        allRiskData.forEach(item => {
            if (item.risk_inputs?.rencana_strategis) {
                rencanaStrategisSet.add(item.risk_inputs.rencana_strategis);
            }
            if (item.risk_inputs?.master_work_units?.name) {
                unitKerjaSet.add(item.risk_inputs.master_work_units.name);
            }
            if (item.risk_inputs?.master_risk_categories?.name) {
                kategoriRisikoSet.add(item.risk_inputs.master_risk_categories.name);
            }
            if (item.risk_level) {
                riskLevelSet.add(item.risk_level);
            }
        });

        // Populate dropdowns
        populateDropdown('filter-rencana-strategis', Array.from(rencanaStrategisSet));
        populateDropdown('filter-unit-kerja', Array.from(unitKerjaSet));
        populateDropdown('filter-kategori-risiko', Array.from(kategoriRisikoSet));
        populateDropdown('filter-risk-level', Array.from(riskLevelSet));

        console.log('✅ Filters populated');
    }

    // Helper untuk populate dropdown
    function populateDropdown(elementId, options) {
        const select = document.getElementById(elementId);
        if (!select) return;

        // Clear existing options except first (Semua)
        while (select.options.length > 1) {
            select.remove(1);
        }

        // Add new options
        options.sort().forEach(option => {
            const optionElement = document.createElement('option');
            optionElement.value = option;
            optionElement.textContent = option;
            select.appendChild(optionElement);
        });
    }

    // Setup event listeners untuk filter
    function setupFilterListeners() {
        const filters = [
            { id: 'filter-rencana-strategis', key: 'rencanaStrategis' },
            { id: 'filter-unit-kerja', key: 'unitKerja' },
            { id: 'filter-kategori-risiko', key: 'kategoriRisiko' },
            { id: 'filter-risk-level', key: 'riskLevel' }
        ];

        filters.forEach(filter => {
            const element = document.getElementById(filter.id);
            if (element) {
                element.addEventListener('change', function(e) {
                    const oldValue = filterState[filter.key];
                    filterState[filter.key] = e.target.value;
                    console.log('🔍 Filter changed:', filter.key, 'from', oldValue, 'to', e.target.value);
                    console.log('📊 Current filter state:', JSON.stringify(filterState, null, 2));
                    
                    // Highlight filter yang aktif
                    if (e.target.value) {
                        e.target.classList.add('ring-2', 'ring-primary', 'border-primary', 'bg-blue-50');
                    } else {
                        e.target.classList.remove('ring-2', 'ring-primary', 'border-primary', 'bg-blue-50');
                    }
                    
                    applyFilters();
                });
                console.log('✅ Listener attached to:', filter.id);
            } else {
                console.warn('⚠️ Filter element not found:', filter.id);
            }
        });
    }

    // Setup search listener
    function setupSearchListener() {
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            searchInput.addEventListener('input', function(e) {
                filterState.searchQuery = e.target.value.toLowerCase();
                console.log('🔍 Search:', filterState.searchQuery);
                applyFilters();
            });
        }
    }

    // Apply semua filter
    function applyFilters() {
        console.log('🔄 Applying filters...', filterState);

        filteredRiskData = allRiskData.filter(item => {
            // Filter Rencana Strategis
            if (filterState.rencanaStrategis && filterState.rencanaStrategis !== '') {
                const rencana = item.risk_inputs?.rencana_strategis || '';
                if (rencana !== filterState.rencanaStrategis) {
                    console.log('❌ Filtered out by Rencana Strategis:', rencana, '!==', filterState.rencanaStrategis);
                    return false;
                }
            }

            // Filter Unit Kerja
            if (filterState.unitKerja && filterState.unitKerja !== '') {
                const unit = item.risk_inputs?.master_work_units?.name || '';
                if (unit !== filterState.unitKerja) {
                    console.log('❌ Filtered out by Unit Kerja:', unit, '!==', filterState.unitKerja);
                    return false;
                }
            }

            // Filter Kategori Risiko
            if (filterState.kategoriRisiko && filterState.kategoriRisiko !== '') {
                const kategori = item.risk_inputs?.master_risk_categories?.name || '';
                if (kategori !== filterState.kategoriRisiko) {
                    console.log('❌ Filtered out by Kategori:', kategori, '!==', filterState.kategoriRisiko);
                    return false;
                }
            }

            // Filter Risk Level
            if (filterState.riskLevel && filterState.riskLevel !== '') {
                const level = item.risk_level || '';
                if (level !== filterState.riskLevel) {
                    console.log('❌ Filtered out by Risk Level:', level, '!==', filterState.riskLevel);
                    return false;
                }
            }

            // Filter Search Query
            if (filterState.searchQuery && filterState.searchQuery !== '') {
                const searchableText = [
                    item.risk_inputs?.kode_risiko || '',
                    item.risk_inputs?.sasaran || '',
                    item.risk_inputs?.master_work_units?.name || '',
                    item.risk_inputs?.master_risk_categories?.name || '',
                    item.risk_level || ''
                ].join(' ').toLowerCase();

                if (!searchableText.includes(filterState.searchQuery)) {
                    console.log('❌ Filtered out by Search:', searchableText, 'does not include', filterState.searchQuery);
                    return false;
                }
            }

            return true;
        });

        console.log('✅ Filtered:', filteredRiskData.length, 'of', allRiskData.length, 'items');
        console.log('📊 Filter state:', filterState);

        // Update tampilan
        renderFilteredData();
        updateStatistics();
    }

    // Render data yang sudah difilter
    function renderFilteredData() {
        console.log('🎨 Rendering filtered data...', filteredRiskData.length, 'items');
        
        // Tampilkan notifikasi filter aktif
        showFilterNotification();
        
        // Jika modernRiskProfile sudah ada, gunakan method-nya
        if (window.modernRiskProfile) {
            console.log('✅ Using modernRiskProfile.renderTable()');
            window.modernRiskProfile.filteredData = filteredRiskData;
            window.modernRiskProfile.currentPage = 1;
            window.modernRiskProfile.renderTable();
            window.modernRiskProfile.updateHeatMap();
        } else {
            console.log('⚠️ modernRiskProfile not found, using manual render');
            // Fallback: render manual
            renderTableManual();
        }
    }

    // Tampilkan notifikasi filter aktif
    function showFilterNotification() {
        const activeFilters = [];
        if (filterState.rencanaStrategis) activeFilters.push(`Rencana: ${filterState.rencanaStrategis}`);
        if (filterState.unitKerja) activeFilters.push(`Unit: ${filterState.unitKerja}`);
        if (filterState.kategoriRisiko) activeFilters.push(`Kategori: ${filterState.kategoriRisiko}`);
        if (filterState.riskLevel) activeFilters.push(`Level: ${filterState.riskLevel}`);
        if (filterState.searchQuery) activeFilters.push(`Search: ${filterState.searchQuery}`);

        const tableInfo = document.getElementById('table-info');
        if (tableInfo && activeFilters.length > 0) {
            tableInfo.innerHTML = `
                <span class="text-xs font-medium text-slate-500">
                    Showing ${filteredRiskData.length} of ${allRiskData.length} items
                    <span class="text-primary">• ${activeFilters.length} filter(s) active</span>
                </span>
            `;
        } else if (tableInfo) {
            tableInfo.innerHTML = `
                <span class="text-xs font-medium text-slate-500">
                    Showing ${filteredRiskData.length} items
                </span>
            `;
        }
    }

    // Render table manual (fallback)
    function renderTableManual() {
        const tbody = document.getElementById('risk-profile-table-body');
        if (!tbody) return;

        if (filteredRiskData.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" class="px-6 py-8 text-center text-slate-500">
                        <div class="flex flex-col items-center gap-2">
                            <span class="material-symbols-outlined text-4xl text-slate-300">search_off</span>
                            <p>Tidak ada data yang sesuai dengan filter</p>
                        </div>
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = filteredRiskData.map((item, index) => {
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
    }

    // Update statistics
    function updateStatistics() {
        const stats = {
            total: filteredRiskData.length,
            high: 0,
            medium: 0,
            low: 0
        };

        filteredRiskData.forEach(item => {
            const level = (item.risk_level || '').toLowerCase();
            if (level.includes('high') || level.includes('extreme')) {
                stats.high++;
            } else if (level.includes('medium') || level.includes('moderat')) {
                stats.medium++;
            } else if (level.includes('low') || level.includes('rendah')) {
                stats.low++;
            }
        });

        // Update UI
        updateStatElement('total-profiles', stats.total);
        updateStatElement('high-risk-profiles', stats.high);
        updateStatElement('medium-risk-profiles', stats.medium);
        updateStatElement('low-risk-profiles', stats.low);
    }

    // Helper functions
    function updateStatElement(id, value) {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = value;
        }
    }

    function calculateRiskScore(item) {
        const impact = item.impact_score || item.dampak_score || 1;
        const probability = item.probability_score || item.kemungkinan_score || 1;
        return Math.min(impact * probability, 25);
    }

    function getRiskLevelClass(level) {
        const levelLower = level.toLowerCase();
        if (levelLower.includes('high') || levelLower.includes('extreme')) {
            return 'bg-red-50 text-red-600 border border-red-100';
        } else if (levelLower.includes('medium') || levelLower.includes('moderat')) {
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

    // Reset semua filter
    function resetFilters() {
        filterState.rencanaStrategis = '';
        filterState.unitKerja = '';
        filterState.kategoriRisiko = '';
        filterState.riskLevel = '';
        filterState.searchQuery = '';

        // Reset dropdown values
        ['filter-rencana-strategis', 'filter-unit-kerja', 'filter-kategori-risiko', 'filter-risk-level'].forEach(id => {
            const element = document.getElementById(id);
            if (element) element.value = '';
        });

        // Reset search input
        const searchInput = document.getElementById('search-input');
        if (searchInput) searchInput.value = '';

        // Apply filters (akan menampilkan semua data)
        applyFilters();
    }

    // Export functions untuk global access
    window.riskProfileFilterFix = {
        init: initializeFilters,
        reset: resetFilters,
        getFilteredData: () => filteredRiskData,
        getAllData: () => allRiskData
    };

    // Auto-initialize saat DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeFilters);
    } else {
        initializeFilters();
    }

    console.log('✅ Risk Profile Filter Fix loaded');

})();
