// ===================================
// RISK PROFILE FILTER FIX - ENHANCED
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
        console.log('🔧 Initializing Risk Profile Filters (Enhanced)...');

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
            console.log('📥 Loading risk profile data...');
            const response = await fetch('/api/risk-profile/public');
            const data = await response.json();
            
            allRiskData = Array.isArray(data) ? data : [];
            filteredRiskData = [...allRiskData];
            
            console.log('✅ Data loaded:', allRiskData.length, 'items');
            console.log('📊 Sample data:', allRiskData[0]);
            
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
        console.log('🔄 Populating filter dropdowns...');
        
        // Get unique values
        const rencanaStrategisSet = new Set();
        const unitKerjaSet = new Set();
        const kategoriRisikoSet = new Set();
        const riskLevelSet = new Set();

        allRiskData.forEach(item => {
            // Rencana Strategis - cek berbagai kemungkinan field
            const rencana = item.risk_inputs?.rencana_strategis || 
                           item.risk_inputs?.rencana_strategis_name ||
                           item.rencana_strategis;
            if (rencana) rencanaStrategisSet.add(rencana);
            
            // Unit Kerja
            const unit = item.risk_inputs?.master_work_units?.name;
            if (unit) unitKerjaSet.add(unit);
            
            // Kategori Risiko
            const kategori = item.risk_inputs?.master_risk_categories?.name;
            if (kategori) kategoriRisikoSet.add(kategori);
            
            // Risk Level
            const level = item.risk_level;
            if (level) riskLevelSet.add(level);
        });

        console.log('📋 Filter options:', {
            rencanaStrategis: rencanaStrategisSet.size,
            unitKerja: unitKerjaSet.size,
            kategoriRisiko: kategoriRisikoSet.size,
            riskLevel: riskLevelSet.size
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
        if (!select) {
            console.warn(`⚠️ Element ${elementId} not found`);
            return;
        }

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

        console.log(`✅ Populated ${elementId} with ${options.length} options`);
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
                    filterState[filter.key] = e.target.value;
                    console.log('🔍 Filter changed:', filter.key, '=', e.target.value);
                    applyFilters();
                });
                console.log(`✅ Listener attached to ${filter.id}`);
            } else {
                console.warn(`⚠️ Filter element ${filter.id} not found`);
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
            console.log('✅ Search listener attached');
        } else {
            console.warn('⚠️ Search input not found');
        }
    }

    // Apply semua filter - PERBAIKAN UTAMA
    function applyFilters() {
        console.log('🔄 Applying filters...', filterState);

        filteredRiskData = allRiskData.filter(item => {
            // Filter Rencana Strategis
            if (filterState.rencanaStrategis) {
                const rencana = item.risk_inputs?.rencana_strategis || 
                               item.risk_inputs?.rencana_strategis_name ||
                               item.rencana_strategis || '';
                
                if (rencana !== filterState.rencanaStrategis) {
                    console.log('❌ Filtered out by Rencana Strategis:', rencana, '!==', filterState.rencanaStrategis);
                    return false;
                }
            }

            // Filter Unit Kerja
            if (filterState.unitKerja) {
                const unit = item.risk_inputs?.master_work_units?.name || '';
                if (unit !== filterState.unitKerja) {
                    console.log('❌ Filtered out by Unit Kerja:', unit, '!==', filterState.unitKerja);
                    return false;
                }
            }

            // Filter Kategori Risiko
            if (filterState.kategoriRisiko) {
                const kategori = item.risk_inputs?.master_risk_categories?.name || '';
                if (kategori !== filterState.kategoriRisiko) {
                    console.log('❌ Filtered out by Kategori:', kategori, '!==', filterState.kategoriRisiko);
                    return false;
                }
            }

            // Filter Risk Level
            if (filterState.riskLevel) {
                const level = item.risk_level || '';
                if (level !== filterState.riskLevel) {
                    console.log('❌ Filtered out by Risk Level:', level, '!==', filterState.riskLevel);
                    return false;
                }
            }

            // Filter Search Query
            if (filterState.searchQuery) {
                const searchableText = [
                    item.risk_inputs?.kode_risiko || '',
                    item.risk_inputs?.sasaran || '',
                    item.risk_inputs?.master_work_units?.name || '',
                    item.risk_inputs?.master_risk_categories?.name || '',
                    item.risk_level || ''
                ].join(' ').toLowerCase();

                if (!searchableText.includes(filterState.searchQuery)) {
                    console.log('❌ Filtered out by Search:', searchableText);
                    return false;
                }
            }

            return true;
        });

        console.log('✅ Filtered:', filteredRiskData.length, 'items from', allRiskData.length, 'total');

        // Update tampilan
        renderFilteredData();
        updateStatistics();
    }

    // Render data yang sudah difilter
    function renderFilteredData() {
        console.log('🎨 Rendering filtered data...');
        
        // Jika modernRiskProfile sudah ada, gunakan method-nya
        if (window.modernRiskProfile) {
            console.log('✅ Using modernRiskProfile to render');
            window.modernRiskProfile.filteredData = filteredRiskData;
            window.modernRiskProfile.currentPage = 1;
            window.modernRiskProfile.renderTable();
            window.modernRiskProfile.updateHeatMap();
        } else {
            console.log('⚠️ modernRiskProfile not found, using fallback');
            // Fallback: render manual
            renderTableManual();
        }
    }

    // Render table manual (fallback)
    function renderTableManual() {
        const tbody = document.getElementById('risk-profile-table-body');
        if (!tbody) {
            console.warn('⚠️ Table body not found');
            return;
        }

        if (filteredRiskData.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" class="px-6 py-8 text-center text-slate-500">
                        <div class="flex flex-col items-center gap-2">
                            <span class="material-symbols-outlined text-4xl text-slate-300">search_off</span>
                            <p>Tidak ada data yang sesuai dengan filter</p>
                            <button onclick="window.riskProfileFilterFix.reset()" class="mt-2 px-4 py-2 bg-primary text-white rounded-lg text-sm hover:bg-primary-dark">
                                Reset Filter
                            </button>
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

        console.log('✅ Table rendered with', filteredRiskData.length, 'rows');
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
            if (level.includes('high') || level.includes('extreme') || level.includes('ekstrem')) {
                stats.high++;
            } else if (level.includes('medium') || level.includes('moderat') || level.includes('sedang')) {
                stats.medium++;
            } else if (level.includes('low') || level.includes('rendah')) {
                stats.low++;
            }
        });

        console.log('📊 Statistics:', stats);

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

    // Reset semua filter
    function resetFilters() {
        console.log('🔄 Resetting all filters...');
        
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
        
        console.log('✅ Filters reset');
    }

    // Export functions untuk global access
    window.riskProfileFilterFix = {
        init: initializeFilters,
        reset: resetFilters,
        getFilteredData: () => filteredRiskData,
        getAllData: () => allRiskData,
        applyFilters: applyFilters
    };

    // Auto-initialize saat DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeFilters);
    } else {
        initializeFilters();
    }

    console.log('✅ Risk Profile Filter Fix (Enhanced) loaded');

})();
