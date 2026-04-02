// Residual Risk Analysis - New Implementation
let residualData = [];
let filteredData = [];
let riskMatrixChart = null;
let comparisonChart = null;

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    console.log('Initializing Residual Risk Analysis...');
    loadMasterData();
    loadResidualData();
});

// Load master data for filters
async function loadMasterData() {
    try {
        // Load Rencana Strategis
        const rencanaResponse = await fetch('/api/rencana-strategis');
        const rencanaData = await rencanaResponse.json();
        populateSelect('filter-rencana', rencanaData, 'id', 'nama_rencana');
        
        // Load Unit Kerja
        const unitResponse = await fetch('/api/master-data/work-units');
        const unitData = await unitResponse.json();
        populateSelect('filter-unit', unitData, 'id', 'name');
        
        // Load Kategori Risiko
        const kategoriResponse = await fetch('/api/master-data/risk-categories');
        const kategoriData = await kategoriResponse.json();
        populateSelect('filter-kategori', kategoriData, 'id', 'name');
        
    } catch (error) {
        console.error('Error loading master data:', error);
    }
}

// Populate select dropdown
function populateSelect(selectId, data, valueField, textField) {
    const select = document.getElementById(selectId);
    if (!select) return;
    
    // Keep "Semua" option - clear other options first
    const firstOption = select.querySelector('option[value=""]');
    select.innerHTML = '';
    if (firstOption) {
        select.appendChild(firstOption);
    }
    
    if (Array.isArray(data)) {
        data.forEach(item => {
            const option = document.createElement('option');
            option.value = item[valueField];
            option.textContent = item[textField];
            select.appendChild(option);
        });
    }
}

// Load residual risk data
async function loadResidualData() {
    try {
        const response = await fetch('/api/reports/residual-risk');
        const data = await response.json();
        
        residualData = Array.isArray(data) ? data : [];
        filteredData = [...residualData];
        
        console.log('Loaded residual data:', residualData.length, 'records');
        
        renderCharts();
        renderTable();
        
    } catch (error) {
        console.error('Error loading residual data:', error);
        showError('Gagal memuat data residual risk');
    }
}

// Apply filters
function applyFilters() {
    const rencanaId = document.getElementById('filter-rencana').value;
    const unitId = document.getElementById('filter-unit').value;
    const kategoriId = document.getElementById('filter-kategori').value;
    
    filteredData = residualData.filter(item => {
        const risk = item.risk_inputs || {};
        
        if (rencanaId && risk.rencana_strategis_id != rencanaId) return false;
        if (unitId && risk.unit_kerja_id != unitId) return false;
        if (kategoriId && risk.kategori_risiko_id != kategoriId) return false;
        
        return true;
    });
    
    console.log('Filtered data:', filteredData.length, 'records');
    
    renderCharts();
    renderTable();
}

// Render charts
function renderCharts() {
    renderRiskMatrix();
    renderComparisonChart();
}

// Render Risk Matrix Chart
function renderRiskMatrix() {
    const ctx = document.getElementById('riskMatrixChart');
    if (!ctx) return;
    
    if (riskMatrixChart) {
        riskMatrixChart.destroy();
    }
    
    // Prepare data points
    const inherentPoints = [];
    const residualPoints = [];
    
    filteredData.forEach(item => {
        const risk = item.risk_inputs || {};
        
        // Get inherent data
        let inherent = {};
        if (risk.risk_inherent_analysis) {
            if (Array.isArray(risk.risk_inherent_analysis) && risk.risk_inherent_analysis.length > 0) {
                inherent = risk.risk_inherent_analysis[0];
            } else if (!Array.isArray(risk.risk_inherent_analysis)) {
                inherent = risk.risk_inherent_analysis;
            }
        }
        
        // Add inherent point (red circle)
        if (inherent.probability && inherent.impact) {
            inherentPoints.push({
                x: parseFloat(inherent.impact),
                y: parseFloat(inherent.probability),
                label: risk.kode_risiko || 'N/A'
            });
        }
        
        // Add residual point (green circle)
        if (item.probability && item.impact) {
            residualPoints.push({
                x: parseFloat(item.impact),
                y: parseFloat(item.probability),
                label: risk.kode_risiko || 'N/A'
            });
        }
    });
    
    riskMatrixChart = new Chart(ctx, {
        type: 'scatter',
        data: {
            datasets: [
                {
                    label: 'Inherent Risk Rating',
                    data: inherentPoints,
                    backgroundColor: '#EF4444',
                    borderColor: '#000000',
                    borderWidth: 2,
                    pointRadius: 10,
                    pointStyle: 'circle',
                    pointHoverRadius: 12
                },
                {
                    label: 'Residual Risk Rating',
                    data: residualPoints,
                    backgroundColor: '#10B981',
                    borderColor: '#000000',
                    borderWidth: 2,
                    pointRadius: 10,
                    pointStyle: 'circle',
                    pointHoverRadius: 12
                },
                {
                    label: 'Risk Appetite',
                    data: [],
                    backgroundColor: '#FFFFFF',
                    borderColor: '#000000',
                    borderWidth: 2,
                    pointRadius: 8,
                    pointStyle: 'triangle',
                    pointHoverRadius: 10
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    type: 'linear',
                    min: 0.5,
                    max: 5.5,
                    ticks: {
                        stepSize: 1,
                        font: { size: 12, weight: 'bold' }
                    },
                    title: {
                        display: true,
                        text: 'Dampak',
                        font: { size: 14, weight: 'bold' }
                    },
                    grid: {
                        color: '#E5E7EB',
                        lineWidth: 1
                    }
                },
                y: {
                    min: 0.5,
                    max: 5.5,
                    ticks: {
                        stepSize: 1,
                        font: { size: 12, weight: 'bold' }
                    },
                    title: {
                        display: true,
                        text: 'Probabilitas',
                        font: { size: 14, weight: 'bold' }
                    },
                    grid: {
                        color: '#E5E7EB',
                        lineWidth: 1
                    }
                }
            },
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        usePointStyle: true,
                        padding: 15,
                        font: { size: 11 }
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const point = context.raw;
                            return `${point.label} - Dampak: ${point.x}, Probabilitas: ${point.y}`;
                        }
                    }
                }
            }
        }
    });
}

// Render Comparison Chart
function renderComparisonChart() {
    const ctx = document.getElementById('comparisonChart');
    if (!ctx) return;
    
    if (comparisonChart) {
        comparisonChart.destroy();
    }
    
    // Prepare data
    const labels = [];
    const inherentData = [];
    const residualData = [];
    
    filteredData.forEach(item => {
        const risk = item.risk_inputs || {};
        const kodeRisiko = risk.kode_risiko || 'N/A';
        
        // Get inherent value
        let inherentValue = 0;
        if (risk.risk_inherent_analysis) {
            let inherent = {};
            if (Array.isArray(risk.risk_inherent_analysis) && risk.risk_inherent_analysis.length > 0) {
                inherent = risk.risk_inherent_analysis[0];
            } else if (!Array.isArray(risk.risk_inherent_analysis)) {
                inherent = risk.risk_inherent_analysis;
            }
            inherentValue = parseFloat(inherent.risk_value) || 0;
        }
        
        const residualValue = parseFloat(item.risk_value) || 0;
        
        labels.push(kodeRisiko);
        inherentData.push(inherentValue);
        residualData.push(residualValue);
    });
    
    comparisonChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Inherent Risk',
                    data: inherentData,
                    backgroundColor: '#EF4444',
                    borderColor: '#EF4444',
                    borderWidth: 1,
                    barThickness: 20
                },
                {
                    label: 'Residual Risk',
                    data: residualData,
                    backgroundColor: '#10B981',
                    borderColor: '#10B981',
                    borderWidth: 1,
                    barThickness: 20
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 25,
                    ticks: {
                        stepSize: 5,
                        font: { size: 11 }
                    },
                    title: {
                        display: true,
                        text: 'Risk Value',
                        font: { size: 13, weight: 'bold' }
                    },
                    grid: {
                        color: '#E5E7EB'
                    }
                },
                x: {
                    ticks: {
                        font: { size: 10 }
                    },
                    title: {
                        display: true,
                        text: 'Kode Risiko',
                        font: { size: 13, weight: 'bold' }
                    },
                    grid: {
                        display: false
                    }
                }
            },
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        usePointStyle: false,
                        padding: 15,
                        font: { size: 11 }
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `${context.dataset.label}: ${context.parsed.y}`;
                        }
                    }
                }
            }
        }
    });
}

// Render table
function renderTable() {
    const tbody = document.getElementById('tableBody');
    if (!tbody) return;
    
    if (filteredData.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="9" style="text-align: center; padding: 2rem; color: #999;">
                    Tidak ada data residual risk
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = filteredData.map(item => {
        const risk = item.risk_inputs || {};
        const kodeRisiko = risk.kode_risiko || '-';
        const unitKerja = risk.master_work_units?.name || '-';
        
        // Get inherent value
        let inherentValue = 0;
        if (risk.risk_inherent_analysis) {
            let inherent = {};
            if (Array.isArray(risk.risk_inherent_analysis) && risk.risk_inherent_analysis.length > 0) {
                inherent = risk.risk_inherent_analysis[0];
            } else if (!Array.isArray(risk.risk_inherent_analysis)) {
                inherent = risk.risk_inherent_analysis;
            }
            inherentValue = parseFloat(inherent.risk_value) || 0;
        }
        
        const residualValue = parseFloat(item.risk_value) || 0;
        
        // Calculate reduction
        let reduction = '-';
        if (inherentValue > 0) {
            const reductionPercent = ((inherentValue - residualValue) / inherentValue * 100);
            reduction = reductionPercent.toFixed(0) + '%';
        }
        
        const level = item.risk_level || '-';
        const reviewStatus = item.review_status || '-';
        const nextReview = item.next_review_date || '-';
        
        // Get badge classes
        const levelBadge = getLevelBadgeClass(level);
        const reviewBadge = getReviewBadgeClass(reviewStatus);
        
        return `
            <tr>
                <td><strong>${kodeRisiko}</strong></td>
                <td>${unitKerja}</td>
                <td>${inherentValue}</td>
                <td>${residualValue}</td>
                <td><strong style="color: #10b981;">${reduction}</strong></td>
                <td><span class="badge-status ${levelBadge}">${level}</span></td>
                <td><span class="badge-status ${reviewBadge}">${reviewStatus}</span></td>
                <td>${nextReview}</td>
                <td>
                    <div class="action-icons">
                        <button class="action-icon edit" onclick="editItem('${item.id}')" title="Edit">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="action-icon delete" onclick="deleteItem('${item.id}')" title="Delete">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

// Get level badge class
function getLevelBadgeClass(level) {
    const levelUpper = (level || '').toUpperCase();
    if (levelUpper.includes('LOW') || levelUpper.includes('RENDAH')) return 'badge-low-risk';
    if (levelUpper.includes('MEDIUM') || levelUpper.includes('SEDANG')) return 'badge-medium-risk';
    if (levelUpper.includes('HIGH') || levelUpper.includes('TINGGI')) return 'badge-high-risk';
    if (levelUpper.includes('EXTREME') || levelUpper.includes('SANGAT')) return 'badge-extreme-high';
    return 'badge-secondary';
}

// Get review badge class
function getReviewBadgeClass(status) {
    const statusUpper = (status || '').toUpperCase();
    if (statusUpper.includes('REVIEWED')) return 'badge-reviewed';
    if (statusUpper.includes('PENDING')) return 'badge-pending';
    return 'badge-secondary';
}

// Show error message
function showError(message) {
    const tbody = document.getElementById('tableBody');
    if (tbody) {
        tbody.innerHTML = `
            <tr>
                <td colspan="9" style="text-align: center; padding: 2rem; color: #ef4444;">
                    <i class="fas fa-exclamation-triangle" style="font-size: 2rem; margin-bottom: 1rem;"></i>
                    <p>${message}</p>
                    <button class="btn-action btn-refresh" onclick="loadResidualData()">
                        <i class="fas fa-sync-alt"></i> Coba Lagi
                    </button>
                </td>
            </tr>
        `;
    }
}

// Action functions
function refreshData() {
    console.log('Refreshing data...');
    loadResidualData();
}

function downloadReport() {
    console.log('Downloading report...');
    window.location.href = '/api/reports/residual-risk/export';
}

function addAnalysis() {
    console.log('Adding new analysis...');
    alert('Fitur tambah analisis akan segera tersedia');
}

function openSettings() {
    console.log('Opening settings...');
    alert('Fitur pengaturan akan segera tersedia');
}

function editItem(id) {
    console.log('Editing item:', id);
    alert('Fitur edit akan segera tersedia');
}

function deleteItem(id) {
    if (confirm('Apakah Anda yakin ingin menghapus data ini?')) {
        console.log('Deleting item:', id);
        alert('Fitur delete akan segera tersedia');
    }
}
