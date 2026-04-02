// Residual Risk UI Fix - Sesuai Gambar

class ResidualRiskUI {
    constructor() {
        this.data = [];
        this.filters = {
            rencanaStrategis: 'semua',
            unitKerja: 'semua',
            kategoriRisiko: 'semua'
        };
        this.init();
    }

    async init() {
        await this.loadData();
        this.renderMatrix();
        this.renderComparisonChart();
        this.renderTable();
        this.attachEventListeners();
    }

    async loadData() {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/reports/residual-risk/public', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (response.ok) {
                this.data = await response.json();
            }
        } catch (error) {
            console.error('Error loading data:', error);
        }
    }

    renderMatrix() {
        const matrixContainer = document.getElementById('riskMatrix');
        if (!matrixContainer) return;

        let html = '<div class="risk-matrix">';
        
        // Render 5x5 matrix (dari atas ke bawah: 5 ke 1)
        for (let impact = 5; impact >= 1; impact--) {
            for (let probability = 1; probability <= 5; probability++) {
                const cellData = this.getMatrixCellData(probability, impact);
                html += `
                    <div class="matrix-cell level-${impact}-${probability}">
                        ${cellData}
                    </div>
                `;
            }
        }
        
        html += '</div>';
        
        // Add labels
        html += `
            <div class="matrix-labels">
                <div class="matrix-label">
                    <div class="matrix-label-icon inherent"></div>
                    <span>Inherent Risk</span>
                </div>
                <div class="matrix-label">
                    <div class="matrix-label-icon residual"></div>
                    <span>Residual Risk</span>
                </div>
                <div class="matrix-label">
                    <div class="matrix-label-icon appetite"></div>
                    <span>Risk Appetite</span>
                </div>
            </div>
        `;
        
        matrixContainer.innerHTML = html;
    }

    getMatrixCellData(probability, impact) {
        const inherentRisks = this.data.filter(item => {
            const inherent = item.risk_inputs?.risk_inherent_analysis;
            return inherent && inherent.probability === probability && inherent.impact === impact;
        });
        
        const residualRisks = this.data.filter(item => {
            return item.probability === probability && item.impact === impact;
        });
        
        let html = '';
        
        // Show inherent risk markers (blue circles)
        if (inherentRisks.length > 0) {
            html += `<div style="position: absolute; top: 25%; left: 50%; transform: translate(-50%, -50%);">
                <div style="width: 12px; height: 12px; background: #3b82f6; border-radius: 50%;"></div>
            </div>`;
        }
        
        // Show residual risk markers (green stars)
        if (residualRisks.length > 0) {
            html += `<div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);">
                <div style="color: #10b981; font-size: 16px;">★</div>
            </div>`;
        }
        
        return html;
    }

    renderComparisonChart() {
        const chartContainer = document.getElementById('comparisonChart');
        if (!chartContainer) return;

        // Prepare data for chart
        const chartData = this.data.slice(0, 10).map(item => {
            const inherent = item.risk_inputs?.risk_inherent_analysis;
            return {
                code: item.risk_inputs?.kode_risiko || 'N/A',
                inherent: inherent?.risk_value || 0,
                residual: item.risk_value || 0
            };
        });

        // Simple bar chart HTML
        let html = '<div class="comparison-chart">';
        html += '<div style="display: flex; justify-content: space-between; margin-bottom: 12px;">';
        html += '<div style="display: flex; gap: 16px; font-size: 12px;">';
        html += '<div><span style="display: inline-block; width: 12px; height: 12px; background: #ef4444; margin-right: 4px;"></span>Inherent Risk</div>';
        html += '<div><span style="display: inline-block; width: 12px; height: 12px; background: #10b981; margin-right: 4px;"></span>Residual Risk</div>';
        html += '</div></div>';
        
        html += '<div style="display: flex; gap: 8px; height: 250px; align-items: flex-end;">';
        
        chartData.forEach(item => {
            const maxValue = Math.max(item.inherent, item.residual, 5);
            const inherentHeight = (item.inherent / maxValue) * 100;
            const residualHeight = (item.residual / maxValue) * 100;
            
            html += `
                <div style="flex: 1; display: flex; flex-direction: column; align-items: center; gap: 4px;">
                    <div style="width: 100%; display: flex; gap: 2px; align-items: flex-end; height: 200px;">
                        <div style="flex: 1; background: #ef4444; height: ${inherentHeight}%;"></div>
                        <div style="flex: 1; background: #10b981; height: ${residualHeight}%;"></div>
                    </div>
                    <div style="font-size: 10px; text-align: center; transform: rotate(-45deg); white-space: nowrap;">${item.code}</div>
                </div>
            `;
        });
        
        html += '</div></div>';
        
        chartContainer.innerHTML = html;
    }

    renderTable() {
        const tableBody = document.getElementById('residualTableBody');
        if (!tableBody) return;

        const filteredData = this.getFilteredData();
        
        let html = '';
        filteredData.forEach((item, index) => {
            const risk = item.risk_inputs || {};
            const inherent = risk.risk_inherent_analysis || {};
            
            html += `
                <tr>
                    <td>${risk.kode_risiko || '-'}</td>
                    <td>${risk.master_work_units?.name || '-'}</td>
                    <td>${inherent.risk_value || 0}</td>
                    <td>${item.risk_value || 0}</td>
                    <td>${this.calculateReduction(inherent.risk_value, item.risk_value)}</td>
                    <td><span class="status-badge ${this.getLevelClass(item.risk_level)}">${item.risk_level || '-'}</span></td>
                    <td><span class="status-badge reviewed">${item.review_status || 'REVIEWED'}</span></td>
                    <td>${this.formatDate(item.next_review_date)}</td>
                    <td>
                        <div class="action-icons">
                            <div class="action-icon edit" onclick="editResidualRisk(${item.id})">
                                <i class="fas fa-edit"></i>
                            </div>
                            <div class="action-icon delete" onclick="deleteResidualRisk(${item.id})">
                                <i class="fas fa-trash"></i>
                            </div>
                        </div>
                    </td>
                </tr>
            `;
        });
        
        tableBody.innerHTML = html || '<tr><td colspan="9" style="text-align: center;">Tidak ada data</td></tr>';
    }

    getFilteredData() {
        return this.data.filter(item => {
            const risk = item.risk_inputs || {};
            
            if (this.filters.rencanaStrategis !== 'semua') {
                if (risk.rencana_strategis_id !== parseInt(this.filters.rencanaStrategis)) {
                    return false;
                }
            }
            
            if (this.filters.unitKerja !== 'semua') {
                if (risk.work_unit_id !== parseInt(this.filters.unitKerja)) {
                    return false;
                }
            }
            
            if (this.filters.kategoriRisiko !== 'semua') {
                if (risk.risk_category_id !== parseInt(this.filters.kategoriRisiko)) {
                    return false;
                }
            }
            
            return true;
        });
    }

    calculateReduction(inherent, residual) {
        if (!inherent || !residual) return 0;
        return Math.round(((inherent - residual) / inherent) * 100);
    }

    getLevelClass(level) {
        if (!level) return 'rendah';
        const levelLower = level.toLowerCase();
        if (levelLower.includes('high') || levelLower.includes('tinggi')) return 'tinggi';
        if (levelLower.includes('medium') || levelLower.includes('sedang')) return 'sedang';
        return 'rendah';
    }

    formatDate(dateString) {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
    }

    attachEventListeners() {
        // Filter changes
        document.getElementById('filterRencanaStrategis')?.addEventListener('change', (e) => {
            this.filters.rencanaStrategis = e.target.value;
            this.renderTable();
            this.renderMatrix();
            this.renderComparisonChart();
        });

        document.getElementById('filterUnitKerja')?.addEventListener('change', (e) => {
            this.filters.unitKerja = e.target.value;
            this.renderTable();
            this.renderMatrix();
            this.renderComparisonChart();
        });

        document.getElementById('filterKategoriRisiko')?.addEventListener('change', (e) => {
            this.filters.kategoriRisiko = e.target.value;
            this.renderTable();
            this.renderMatrix();
            this.renderComparisonChart();
        });

        // Refresh button
        document.getElementById('btnRefresh')?.addEventListener('click', () => {
            this.init();
        });

        // Download button
        document.getElementById('btnDownload')?.addEventListener('click', () => {
            this.downloadReport();
        });
    }

    async downloadReport() {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/reports/residual-risk/export?format=excel', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `residual-risk-${new Date().toISOString().split('T')[0]}.xlsx`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                window.URL.revokeObjectURL(url);
            }
        } catch (error) {
            console.error('Error downloading report:', error);
        }
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.residualRiskUI = new ResidualRiskUI();
});

// Global functions for actions
function editResidualRisk(id) {
    console.log('Edit residual risk:', id);
    // Implement edit functionality
}

function deleteResidualRisk(id) {
    if (confirm('Apakah Anda yakin ingin menghapus data ini?')) {
        console.log('Delete residual risk:', id);
        // Implement delete functionality
    }
}
