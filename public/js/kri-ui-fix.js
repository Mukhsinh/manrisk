// KRI UI Fix - Sesuai Gambar

class KRIUI {
    constructor() {
        this.data = [];
        this.filters = {
            rencanaStrategis: 'semua',
            unitKerja: 'semua',
            status: 'semua'
        };
        this.init();
    }

    async init() {
        await this.loadData();
        this.renderTable();
        this.attachEventListeners();
    }

    async loadData() {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/kri', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (response.ok) {
                this.data = await response.json();
            } else {
                // Mock data untuk testing
                this.data = this.getMockData();
            }
        } catch (error) {
            console.error('Error loading KRI data:', error);
            this.data = this.getMockData();
        }
    }

    getMockData() {
        return [
            {
                id: 1,
                kode_kri: 'KRI-2025-001',
                nama_indikator: 'Tingkat Kepuasan Pasien',
                work_unit: { name: 'Unit Gawat Darurat' },
                risk_category: { name: 'Risiko Operasional' },
                nilai_saat_ini: 85,
                threshold: 80,
                status: 'normal',
                tanggal_update: '2025-01-15'
            },
            {
                id: 2,
                kode_kri: 'KRI-2025-002',
                nama_indikator: 'Waktu Tunggu Pelayanan',
                work_unit: { name: 'Poliklinik' },
                risk_category: { name: 'Risiko Pelayanan' },
                nilai_saat_ini: 45,
                threshold: 30,
                status: 'warning',
                tanggal_update: '2025-01-14'
            },
            {
                id: 3,
                kode_kri: 'KRI-2025-003',
                nama_indikator: 'Tingkat Infeksi Nosokomial',
                work_unit: { name: 'Ruang Rawat Inap' },
                risk_category: { name: 'Risiko Klinis' },
                nilai_saat_ini: 8,
                threshold: 5,
                status: 'critical',
                tanggal_update: '2025-01-13'
            }
        ];
    }

    renderTable() {
        const tableBody = document.getElementById('kriTableBody');
        if (!tableBody) return;

        const filteredData = this.getFilteredData();
        
        let html = '';
        filteredData.forEach((item) => {
            html += `
                <tr>
                    <td>${item.kode_kri || '-'}</td>
                    <td>${item.nama_indikator || '-'}</td>
                    <td>${item.work_unit?.name || '-'}</td>
                    <td>${item.risk_category?.name || '-'}</td>
                    <td>${item.nilai_saat_ini || 0}</td>
                    <td>${item.threshold || 0}</td>
                    <td><span class="kri-status-badge ${item.status}">${this.getStatusText(item.status)}</span></td>
                    <td>${this.formatDate(item.tanggal_update)}</td>
                    <td>
                        <div class="kri-action-icons">
                            <div class="kri-action-icon edit" onclick="editKRI(${item.id})">
                                <i class="fas fa-edit"></i>
                            </div>
                            <div class="kri-action-icon delete" onclick="deleteKRI(${item.id})">
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
            if (this.filters.rencanaStrategis !== 'semua') {
                if (item.rencana_strategis_id !== parseInt(this.filters.rencanaStrategis)) {
                    return false;
                }
            }
            
            if (this.filters.unitKerja !== 'semua') {
                if (item.work_unit_id !== parseInt(this.filters.unitKerja)) {
                    return false;
                }
            }
            
            if (this.filters.status !== 'semua') {
                if (item.status !== this.filters.status) {
                    return false;
                }
            }
            
            return true;
        });
    }

    getStatusText(status) {
        const statusMap = {
            'critical': 'Critical',
            'warning': 'Warning',
            'normal': 'Normal'
        };
        return statusMap[status] || status;
    }

    formatDate(dateString) {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
    }

    attachEventListeners() {
        // Filter changes
        document.getElementById('filterKRIRencanaStrategis')?.addEventListener('change', (e) => {
            this.filters.rencanaStrategis = e.target.value;
            this.renderTable();
        });

        document.getElementById('filterKRIUnitKerja')?.addEventListener('change', (e) => {
            this.filters.unitKerja = e.target.value;
            this.renderTable();
        });

        document.getElementById('filterKRIStatus')?.addEventListener('change', (e) => {
            this.filters.status = e.target.value;
            this.renderTable();
        });

        // Refresh button
        document.getElementById('btnRefreshKRI')?.addEventListener('click', () => {
            this.init();
        });

        // Download button
        document.getElementById('btnDownloadKRI')?.addEventListener('click', () => {
            this.downloadReport();
        });
    }

    async downloadReport() {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/kri/export?format=excel', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `kri-${new Date().toISOString().split('T')[0]}.xlsx`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                window.URL.revokeObjectURL(url);
            }
        } catch (error) {
            console.error('Error downloading report:', error);
            alert('Gagal mengunduh laporan');
        }
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.kriUI = new KRIUI();
});

// Global functions for actions
function editKRI(id) {
    console.log('Edit KRI:', id);
    // Implement edit functionality
}

function deleteKRI(id) {
    if (confirm('Apakah Anda yakin ingin menghapus data ini?')) {
        console.log('Delete KRI:', id);
        // Implement delete functionality
    }
}
