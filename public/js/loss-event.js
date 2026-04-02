// Loss Event Module - Professional Design
const LossEvent = {
    chartInstances: {},
    currentPage: 1,
    pageSize: 10,
    allData: [],
    filteredData: [],
    filters: {
        dateRange: 'all',
        category: 'all',
        impact: 'all',
        search: ''
    },

    async load() {
        try {
            const data = await apiCall('/api/loss-event');
            this.allData = data || [];
            this.filteredData = [...this.allData];
            this.render(data);
        } catch (error) {
            console.error('Error loading loss event:', error);
            document.getElementById('loss-event-content').innerHTML =
                '<div class="card"><p>Error: ' + error.message + '</p></div>';
        }
    },

    render(data) {
        const content = document.getElementById('loss-event-content');
        const totalLoss = data.reduce((sum, item) => sum + (parseFloat(item.dampak_finansial) || 0), 0);
        const totalEvents = data.length;
        const resolvedEvents = data.filter(d => d.status_penanganan === 'Sudah Ditangani').length;
        const pendingEvents = data.filter(d => d.status_penanganan === 'Sedang Ditangani').length;
        const unhandledEvents = data.filter(d => d.status_penanganan === 'Belum Ditangani').length;

        // Count categories
        const categoryCounts = {};
        data.forEach(item => {
            const cat = item.kategori_risiko_nama || item.category_name || 'Tidak Terkategori';
            categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
        });
        const topCategory = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1])[0];
        const topCategoryName = topCategory ? topCategory[0] : '-';
        const topCategoryPercent = topCategory && totalEvents > 0 ? Math.round((topCategory[1] / totalEvents) * 100) : 0;

        content.innerHTML = `
            <style>
                .le-container { font-family: 'Inter', sans-serif; }
                .le-filters {
                    background: #fff;
                    padding: 1.25rem;
                    border-radius: 12px;
                    border: 1px solid #e2e8f0;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.04);
                    margin-bottom: 1.5rem;
                }
                .le-filters-grid {
                    display: flex;
                    flex-wrap: wrap;
                    align-items: flex-end;
                    gap: 1rem;
                }
                .le-filter-group {
                    flex: 1;
                    min-width: 200px;
                }
                .le-filter-label {
                    display: block;
                    font-size: 0.7rem;
                    font-weight: 700;
                    color: #64748b;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    margin-bottom: 6px;
                }
                .le-filter-select, .le-filter-input {
                    width: 100%;
                    padding: 0.5rem 0.75rem;
                    font-size: 0.875rem;
                    border: 1px solid #e2e8f0;
                    border-radius: 8px;
                    background: #f8fafc;
                    color: #334155;
                    outline: none;
                    transition: border-color 0.2s, box-shadow 0.2s;
                }
                .le-filter-select:focus, .le-filter-input:focus {
                    border-color: #2563eb;
                    box-shadow: 0 0 0 3px rgba(37,99,235,0.1);
                }
                .le-filter-actions {
                    display: flex;
                    gap: 0.5rem;
                    flex-shrink: 0;
                }
                .le-btn {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.5rem;
                    padding: 0.5rem 1rem;
                    border-radius: 8px;
                    font-size: 0.8125rem;
                    font-weight: 600;
                    border: none;
                    cursor: pointer;
                    transition: all 0.2s;
                    text-decoration: none;
                    white-space: nowrap;
                }
                .le-btn:hover { opacity: 0.9; transform: translateY(-1px); }
                .le-btn-navy { background: #1e293b; color: #fff; }
                .le-btn-emerald { background: #059669; color: #fff; }
                .le-btn-amber { background: #d97706; color: #fff; }
                .le-btn-blue { background: #2563eb; color: #fff; }
                .le-btn-teal { background: #0d9488; color: #fff; }
                .le-btn-red { background: #dc2626; color: #fff; }
                .le-btn-outline { background: #f1f5f9; color: #475569; border: 1px solid #e2e8f0; }
                .le-btn-sm { padding: 0.35rem 0.5rem; font-size: 0.75rem; border-radius: 4px; }

                .le-scorecards {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
                    gap: 1.25rem;
                    margin-bottom: 1.5rem;
                }
                .le-scorecard {
                    background: #fff;
                    padding: 1.5rem;
                    border-radius: 12px;
                    border: 1px solid #e2e8f0;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.04);
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    transition: box-shadow 0.2s;
                }
                .le-scorecard:hover { box-shadow: 0 4px 12px rgba(0,0,0,0.08); }
                .le-scorecard-label {
                    font-size: 0.875rem;
                    font-weight: 500;
                    color: #64748b;
                    margin-bottom: 4px;
                }
                .le-scorecard-value {
                    font-size: 1.875rem;
                    font-weight: 700;
                    color: #0f172a;
                    line-height: 1.2;
                }
                .le-scorecard-value.text-xl {
                    font-size: 1.25rem;
                }
                .le-scorecard-sub {
                    font-size: 0.75rem;
                    font-weight: 600;
                    margin-top: 0.5rem;
                    display: flex;
                    align-items: center;
                    gap: 4px;
                }
                .le-scorecard-sub.emerald { color: #059669; }
                .le-scorecard-sub.rose { color: #e11d48; }
                .le-scorecard-sub.slate { color: #64748b; }
                .le-scorecard-sub.teal { color: #0d9488; }
                .le-scorecard-icon {
                    padding: 0.75rem;
                    border-radius: 10px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .le-scorecard-icon.blue { background: #dbeafe; color: #2563eb; }
                .le-scorecard-icon.rose { background: #ffe4e6; color: #dc2626; }
                .le-scorecard-icon.amber { background: #fef3c7; color: #d97706; }
                .le-scorecard-icon.teal { background: #ccfbf1; color: #0d9488; }

                .le-charts-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
                    gap: 1.25rem;
                    margin-bottom: 1.5rem;
                }
                .le-chart-card {
                    background: #fff;
                    padding: 1.5rem;
                    border-radius: 12px;
                    border: 1px solid #e2e8f0;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.04);
                }
                .le-chart-title {
                    font-size: 0.8125rem;
                    font-weight: 700;
                    color: #334155;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    margin-bottom: 1rem;
                }
                .le-chart-container {
                    height: 280px;
                    width: 100%;
                    position: relative;
                }

                .le-table-wrapper {
                    background: #fff;
                    border-radius: 12px;
                    border: 1px solid #e2e8f0;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.04);
                    overflow: hidden;
                }
                .le-table-header {
                    padding: 1rem 1.25rem;
                    border-bottom: 1px solid #e2e8f0;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    background: #f8fafc;
                }
                .le-table-title {
                    font-size: 0.8125rem;
                    font-weight: 700;
                    color: #334155;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                }
                .le-search-input {
                    padding: 0.375rem 0.75rem 0.375rem 2rem;
                    font-size: 0.875rem;
                    border: 1px solid #cbd5e1;
                    border-radius: 6px;
                    outline: none;
                    background: #fff url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='%2394a3b8' viewBox='0 0 24 24'%3E%3Ccircle cx='11' cy='11' r='7' stroke='%2394a3b8' stroke-width='2' fill='none'/%3E%3Cline x1='16.65' y1='16.65' x2='21' y2='21' stroke='%2394a3b8' stroke-width='2'/%3E%3C/svg%3E") no-repeat 8px center;
                    transition: border-color 0.2s;
                }
                .le-search-input:focus { border-color: #2563eb; }
                .le-table {
                    width: 100%;
                    text-align: left;
                    font-size: 0.875rem;
                    border-collapse: collapse;
                }
                .le-table thead {
                    background: #1e293b;
                    color: #fff;
                }
                .le-table thead th {
                    padding: 0.875rem 1.25rem;
                    font-weight: 600;
                    font-size: 0.8125rem;
                    white-space: nowrap;
                }
                .le-table tbody tr {
                    border-bottom: 1px solid #e2e8f0;
                    transition: background 0.15s;
                }
                .le-table tbody tr:hover { background: #f8fafc; }
                .le-table tbody td {
                    padding: 0.875rem 1.25rem;
                    color: #334155;
                }
                .le-table .td-code {
                    font-family: 'SF Mono', 'Fira Code', monospace;
                    font-weight: 700;
                    color: #2563eb;
                }
                .le-table .td-date { color: #64748b; }
                .le-table .td-amount {
                    text-align: right;
                    font-weight: 600;
                }
                .le-table .td-desc {
                    max-width: 220px;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                }
                .le-table .td-center { text-align: center; }
                .le-badge-category {
                    background: #f1f5f9;
                    color: #334155;
                    padding: 0.25rem 0.5rem;
                    border-radius: 4px;
                    font-size: 0.75rem;
                    font-weight: 700;
                    white-space: nowrap;
                }
                .le-badge-status {
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    padding: 0.2rem 0.6rem;
                    border-radius: 9999px;
                    font-size: 0.75rem;
                    font-weight: 500;
                    white-space: nowrap;
                }
                .le-badge-status .dot {
                    width: 6px; height: 6px;
                    border-radius: 50%;
                    display: inline-block;
                }
                .le-badge-resolved { background: #dcfce7; color: #166534; }
                .le-badge-resolved .dot { background: #16a34a; }
                .le-badge-pending { background: #fef3c7; color: #92400e; }
                .le-badge-pending .dot { background: #d97706; }
                .le-badge-unhandled { background: #dbeafe; color: #1e40af; }
                .le-badge-unhandled .dot { background: #2563eb; }

                .le-table-footer {
                    padding: 0.875rem 1.25rem;
                    border-top: 1px solid #e2e8f0;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    font-size: 0.8125rem;
                    color: #64748b;
                    font-weight: 500;
                }
                .le-pagination {
                    display: flex;
                    align-items: center;
                    gap: 0.375rem;
                }
                .le-page-btn {
                    padding: 0.3rem 0.65rem;
                    border: 1px solid #cbd5e1;
                    border-radius: 4px;
                    background: #fff;
                    color: #475569;
                    cursor: pointer;
                    font-size: 0.8125rem;
                    font-weight: 500;
                    transition: all 0.15s;
                }
                .le-page-btn:hover { background: #f8fafc; }
                .le-page-btn.active { background: #1e293b; color: #fff; border-color: #1e293b; }
                .le-page-btn:disabled { opacity: 0.5; cursor: not-allowed; }

                .le-page-header {
                    display: flex;
                    flex-wrap: wrap;
                    justify-content: space-between;
                    align-items: flex-start;
                    gap: 1rem;
                    margin-bottom: 1.5rem;
                }
                .le-page-title {
                    font-size: 1.5rem;
                    font-weight: 700;
                    color: #0f172a;
                    letter-spacing: -0.01em;
                }
                .le-page-subtitle {
                    font-size: 0.875rem;
                    color: #64748b;
                    margin-top: 2px;
                }
                .le-header-actions {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 0.6rem;
                }
                .le-action-group {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }

                @media (max-width: 768px) {
                    .le-scorecards { grid-template-columns: 1fr 1fr; }
                    .le-charts-grid { grid-template-columns: 1fr; }
                    .le-table-header { flex-direction: column; gap: 0.75rem; }
                    .le-page-header { flex-direction: column; }
                }
                @media (max-width: 480px) {
                    .le-scorecards { grid-template-columns: 1fr; }
                }
            </style>

            <div class="le-container">
                <!-- Page Header -->
                <div class="le-page-header">
                    <div>
                        <h2 class="le-page-title">Loss Event Analysis</h2>
                        <p class="le-page-subtitle">Monitoring financial and operational impacts of clinical risk events.</p>
                    </div>
                    <div class="le-header-actions">
                        <button class="le-btn le-btn-amber" onclick="LossEvent.downloadTemplate()">
                            <i class="fas fa-download"></i> Unduh Template
                        </button>
                        <button class="le-btn le-btn-emerald" onclick="LossEvent.showImportModal()">
                            <i class="fas fa-upload"></i> Import Data
                        </button>
                        <button class="le-btn le-btn-blue" onclick="LossEvent.showAddModal()">
                            <i class="fas fa-plus-circle"></i> Tambah Event
                        </button>
                        <button class="le-btn le-btn-teal" onclick="LossEvent.downloadReport()">
                            <i class="fas fa-file-pdf"></i> Unduh Laporan
                        </button>
                    </div>
                </div>

                <!-- Filters -->
                <div class="le-filters">
                    <div class="le-filters-grid">
                        <div class="le-filter-group">
                            <label class="le-filter-label">
                                <i class="fas fa-calendar" style="margin-right: 4px;"></i> Date Range
                            </label>
                            <select class="le-filter-select" id="le-filter-date" onchange="LossEvent.applyFilters()">
                                <option value="all">Semua Tanggal</option>
                                <option value="30">30 Hari Terakhir</option>
                                <option value="90">3 Bulan Terakhir</option>
                                <option value="365">Tahun Ini</option>
                            </select>
                        </div>
                        <div class="le-filter-group">
                            <label class="le-filter-label">Event Category</label>
                            <select class="le-filter-select" id="le-filter-category" onchange="LossEvent.applyFilters()">
                                <option value="all">Semua Kategori</option>
                                ${this.getUniqueCategoryOptions(data)}
                            </select>
                        </div>
                        <div class="le-filter-group">
                            <label class="le-filter-label">Impact Level</label>
                            <select class="le-filter-select" id="le-filter-impact" onchange="LossEvent.applyFilters()">
                                <option value="all">Semua Dampak</option>
                                <option value="critical">Kritis (> 50 Juta)</option>
                                <option value="moderate">Sedang (10 - 50 Juta)</option>
                                <option value="low">Rendah (< 10 Juta)</option>
                            </select>
                        </div>
                        <div class="le-filter-actions">
                            <button class="le-btn le-btn-navy" onclick="LossEvent.applyFilters()">
                                Terapkan Filter
                            </button>
                            <button class="le-btn le-btn-outline" onclick="LossEvent.resetFilters()">
                                Reset
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Scorecards -->
                <div class="le-scorecards">
                    <div class="le-scorecard">
                        <div>
                            <p class="le-scorecard-label">Total Loss Events</p>
                            <h3 class="le-scorecard-value">${totalEvents}</h3>
                            <p class="le-scorecard-sub emerald">
                                <i class="fas fa-clipboard-list"></i> ${resolvedEvents} resolved
                            </p>
                        </div>
                        <div class="le-scorecard-icon blue">
                            <i class="fas fa-clipboard-list" style="font-size: 1.5rem;"></i>
                        </div>
                    </div>
                    <div class="le-scorecard">
                        <div>
                            <p class="le-scorecard-label">Total Impact Value</p>
                            <h3 class="le-scorecard-value">Rp ${this.formatCurrency(totalLoss)}</h3>
                            <p class="le-scorecard-sub rose">
                                <i class="fas fa-exclamation-circle"></i> ${totalLoss > 50000000 ? 'Critical Level' : 'Moderate Level'}
                            </p>
                        </div>
                        <div class="le-scorecard-icon rose">
                            <i class="fas fa-money-bill-wave" style="font-size: 1.5rem;"></i>
                        </div>
                    </div>
                    <div class="le-scorecard">
                        <div>
                            <p class="le-scorecard-label">Top Category</p>
                            <h3 class="le-scorecard-value text-xl">${topCategoryName}</h3>
                            <p class="le-scorecard-sub slate">
                                ${topCategoryPercent}% dari total events
                            </p>
                        </div>
                        <div class="le-scorecard-icon amber">
                            <i class="fas fa-shield-alt" style="font-size: 1.5rem;"></i>
                        </div>
                    </div>
                    <div class="le-scorecard">
                        <div>
                            <p class="le-scorecard-label">Pending Claims</p>
                            <h3 class="le-scorecard-value">${pendingEvents + unhandledEvents}</h3>
                            <p class="le-scorecard-sub teal">
                                <i class="fas fa-clock"></i> Active Investigation
                            </p>
                        </div>
                        <div class="le-scorecard-icon teal">
                            <i class="fas fa-clock" style="font-size: 1.5rem;"></i>
                        </div>
                    </div>
                </div>

                <!-- Charts -->
                <div class="le-charts-grid">
                    <div class="le-chart-card">
                        <h4 class="le-chart-title">Loss by Category</h4>
                        <div class="le-chart-container">
                            <canvas id="leCategoryChart"></canvas>
                        </div>
                    </div>
                    <div class="le-chart-card">
                        <h4 class="le-chart-title">Monthly Loss Trend</h4>
                        <div class="le-chart-container">
                            <canvas id="leTrendChart"></canvas>
                        </div>
                    </div>
                </div>

                <!-- Data Table -->
                <div class="le-table-wrapper">
                    <div class="le-table-header">
                        <h4 class="le-table-title">Recent Loss Events</h4>
                        <input type="text" class="le-search-input" placeholder="Search events..." id="le-search-input" oninput="LossEvent.handleSearch(this.value)">
                    </div>
                    <div style="overflow-x: auto;">
                        <table class="le-table">
                            <thead>
                                <tr>
                                    <th>Tanggal</th>
                                    <th>Kode</th>
                                    <th>Kategori</th>
                                    <th>Deskripsi</th>
                                    <th style="text-align: right;">Dampak Finansial</th>
                                    <th>Status</th>
                                    <th style="text-align: center;">Aksi</th>
                                </tr>
                            </thead>
                            <tbody id="le-table-body">
                                ${this.renderTableRows(data)}
                            </tbody>
                        </table>
                    </div>
                    <div class="le-table-footer">
                        <p>Menampilkan ${Math.min(data.length, this.pageSize)} dari ${data.length} data</p>
                        <div class="le-pagination" id="le-pagination">
                            ${this.renderPagination(data.length)}
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Render charts after DOM is ready
        setTimeout(() => this.renderCharts(data), 100);
    },

    getUniqueCategoryOptions(data) {
        const cats = new Set();
        data.forEach(item => {
            const cat = item.kategori_risiko_nama || item.category_name;
            if (cat) cats.add(cat);
        });
        return [...cats].map(c => `<option value="${c}">${c}</option>`).join('');
    },

    formatCurrency(value) {
        if (value >= 1000000000) return (value / 1000000000).toFixed(1).replace(/\.0$/, '') + 'M';
        if (value >= 1000000) return (value / 1000000).toFixed(1).replace(/\.0$/, '') + ' Jt';
        if (value >= 1000) return (value / 1000).toFixed(0) + 'K';
        return value.toLocaleString('id-ID');
    },

    formatDate(dateStr) {
        if (!dateStr) return '-';
        try {
            const d = new Date(dateStr);
            return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
        } catch { return dateStr; }
    },

    getStatusBadge(status) {
        if (status === 'Sudah Ditangani') {
            return '<span class="le-badge-status le-badge-resolved"><span class="dot"></span> Resolved</span>';
        } else if (status === 'Sedang Ditangani') {
            return '<span class="le-badge-status le-badge-pending"><span class="dot"></span> Pending</span>';
        } else {
            return '<span class="le-badge-status le-badge-unhandled"><span class="dot"></span> Investigating</span>';
        }
    },

    renderTableRows(data) {
        if (!data || data.length === 0) {
            return '<tr><td colspan="7" style="text-align: center; padding: 2rem; color: #94a3b8;">Tidak ada data loss event</td></tr>';
        }

        const start = (this.currentPage - 1) * this.pageSize;
        const end = start + this.pageSize;
        const pageData = data.slice(start, end);

        return pageData.map(item => `
            <tr>
                <td class="td-date">${this.formatDate(item.tanggal_kejadian)}</td>
                <td class="td-code">${item.kode || '-'}</td>
                <td><span class="le-badge-category">${item.kategori_risiko_nama || item.category_name || '-'}</span></td>
                <td class="td-desc">${item.deskripsi_kejadian?.substring(0, 50) || '-'}${item.deskripsi_kejadian?.length > 50 ? '...' : ''}</td>
                <td class="td-amount">Rp ${(parseFloat(item.dampak_finansial) || 0).toLocaleString('id-ID')}</td>
                <td>${this.getStatusBadge(item.status_penanganan)}</td>
                <td class="td-center">
                    <div class="le-action-group" style="justify-content: center;">
                        <button class="le-btn le-btn-teal le-btn-sm" onclick="LossEvent.viewDetail('${item.id}')" title="Lihat Detail">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="le-btn le-btn-blue le-btn-sm" onclick="LossEvent.edit('${item.id}')" title="Edit">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="le-btn le-btn-red le-btn-sm" onclick="LossEvent.delete('${item.id}')" title="Hapus">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    },

    renderPagination(totalItems) {
        const totalPages = Math.ceil(totalItems / this.pageSize);
        if (totalPages <= 1) return '';

        let html = `<button class="le-page-btn" onclick="LossEvent.goToPage(${this.currentPage - 1})" ${this.currentPage === 1 ? 'disabled' : ''}>Previous</button>`;

        for (let i = 1; i <= Math.min(totalPages, 5); i++) {
            html += `<button class="le-page-btn ${i === this.currentPage ? 'active' : ''}" onclick="LossEvent.goToPage(${i})">${i}</button>`;
        }

        html += `<button class="le-page-btn" onclick="LossEvent.goToPage(${this.currentPage + 1})" ${this.currentPage >= totalPages ? 'disabled' : ''}>Next</button>`;
        return html;
    },

    goToPage(page) {
        const totalPages = Math.ceil(this.filteredData.length / this.pageSize);
        if (page < 1 || page > totalPages) return;
        this.currentPage = page;
        this.updateTable();
    },

    updateTable() {
        const tbody = document.getElementById('le-table-body');
        const pagination = document.getElementById('le-pagination');
        const footer = document.querySelector('.le-table-footer p');

        if (tbody) tbody.innerHTML = this.renderTableRows(this.filteredData);
        if (pagination) pagination.innerHTML = this.renderPagination(this.filteredData.length);
        if (footer) {
            const start = (this.currentPage - 1) * this.pageSize + 1;
            const end = Math.min(this.currentPage * this.pageSize, this.filteredData.length);
            footer.textContent = `Menampilkan ${this.filteredData.length === 0 ? 0 : start} - ${end} dari ${this.filteredData.length} data`;
        }
    },

    handleSearch(query) {
        this.filters.search = query.toLowerCase();
        this.applyFilters();
    },

    applyFilters() {
        const dateFilter = document.getElementById('le-filter-date')?.value || 'all';
        const catFilter = document.getElementById('le-filter-category')?.value || 'all';
        const impactFilter = document.getElementById('le-filter-impact')?.value || 'all';
        const searchQuery = this.filters.search;

        this.filteredData = this.allData.filter(item => {
            // Date filter
            if (dateFilter !== 'all') {
                const days = parseInt(dateFilter);
                const eventDate = new Date(item.tanggal_kejadian);
                const cutoff = new Date();
                cutoff.setDate(cutoff.getDate() - days);
                if (eventDate < cutoff) return false;
            }
            // Category filter
            if (catFilter !== 'all') {
                const cat = item.kategori_risiko_nama || item.category_name || '';
                if (cat !== catFilter) return false;
            }
            // Impact filter
            if (impactFilter !== 'all') {
                const amount = parseFloat(item.dampak_finansial) || 0;
                if (impactFilter === 'critical' && amount <= 50000000) return false;
                if (impactFilter === 'moderate' && (amount < 10000000 || amount > 50000000)) return false;
                if (impactFilter === 'low' && amount >= 10000000) return false;
            }
            // Search
            if (searchQuery) {
                const searchable = [
                    item.kode, item.deskripsi_kejadian, item.status_penanganan,
                    item.kategori_risiko_nama, item.category_name
                ].filter(Boolean).join(' ').toLowerCase();
                if (!searchable.includes(searchQuery)) return false;
            }
            return true;
        });

        this.currentPage = 1;
        this.updateTable();
    },

    resetFilters() {
        const dateEl = document.getElementById('le-filter-date');
        const catEl = document.getElementById('le-filter-category');
        const impactEl = document.getElementById('le-filter-impact');
        const searchEl = document.getElementById('le-search-input');

        if (dateEl) dateEl.value = 'all';
        if (catEl) catEl.value = 'all';
        if (impactEl) impactEl.value = 'all';
        if (searchEl) searchEl.value = '';

        this.filters.search = '';
        this.filteredData = [...this.allData];
        this.currentPage = 1;
        this.updateTable();
    },

    viewDetail(id) {
        const item = this.allData.find(d => d.id === id);
        if (!item) { alert('Data tidak ditemukan'); return; }

        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 700px;">
                <div class="modal-header">
                    <h3 class="modal-title"><i class="fas fa-eye" style="margin-right: 8px;"></i>Detail Loss Event</h3>
                    <button class="modal-close" onclick="this.closest('.modal').remove()">&times;</button>
                </div>
                <div style="padding: 1.5rem;">
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                        <div><strong style="color: #64748b; font-size: 0.8rem; text-transform: uppercase;">Kode</strong><br><span style="font-weight: 700; color: #2563eb;">${item.kode}</span></div>
                        <div><strong style="color: #64748b; font-size: 0.8rem; text-transform: uppercase;">Tanggal</strong><br>${this.formatDate(item.tanggal_kejadian)}</div>
                        <div><strong style="color: #64748b; font-size: 0.8rem; text-transform: uppercase;">Status</strong><br>${this.getStatusBadge(item.status_penanganan)}</div>
                        <div><strong style="color: #64748b; font-size: 0.8rem; text-transform: uppercase;">Dampak Finansial</strong><br><span style="font-weight: 700; color: #dc2626;">Rp ${(parseFloat(item.dampak_finansial) || 0).toLocaleString('id-ID')}</span></div>
                    </div>
                    <hr style="margin: 1rem 0; border-color: #e2e8f0;">
                    <div style="margin-bottom: 1rem;">
                        <strong style="color: #64748b; font-size: 0.8rem; text-transform: uppercase;">Deskripsi Kejadian</strong>
                        <p style="margin-top: 4px; color: #334155;">${item.deskripsi_kejadian || '-'}</p>
                    </div>
                    <div style="margin-bottom: 1rem;">
                        <strong style="color: #64748b; font-size: 0.8rem; text-transform: uppercase;">Penyebab</strong>
                        <p style="margin-top: 4px; color: #334155;">${item.penyebab || '-'}</p>
                    </div>
                    <div style="margin-bottom: 1rem;">
                        <strong style="color: #64748b; font-size: 0.8rem; text-transform: uppercase;">Dampak Non Finansial</strong>
                        <p style="margin-top: 4px; color: #334155;">${item.dampak_non_finansial || '-'}</p>
                    </div>
                    <div style="margin-bottom: 1rem;">
                        <strong style="color: #64748b; font-size: 0.8rem; text-transform: uppercase;">Tindakan Perbaikan</strong>
                        <p style="margin-top: 4px; color: #334155;">${item.tindakan_perbaikan || '-'}</p>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    },

    renderCharts(data) {
        // Destroy previous instances
        if (this.chartInstances.category) { this.chartInstances.category.destroy(); }
        if (this.chartInstances.trend) { this.chartInstances.trend.destroy(); }

        // Category bar chart
        const catCtx = document.getElementById('leCategoryChart');
        if (catCtx && typeof Chart !== 'undefined') {
            const categoryCounts = {};
            data.forEach(item => {
                const cat = item.kategori_risiko_nama || item.category_name || 'Lainnya';
                categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
            });

            const labels = Object.keys(categoryCounts);
            const values = Object.values(categoryCounts);

            this.chartInstances.category = new Chart(catCtx.getContext('2d'), {
                type: 'bar',
                data: {
                    labels: labels.length > 0 ? labels : ['No Data'],
                    datasets: [{
                        label: 'Jumlah Kejadian',
                        data: values.length > 0 ? values : [0],
                        backgroundColor: '#2563eb',
                        borderRadius: 4,
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: {
                        y: { beginAtZero: true, grid: { borderDash: [5, 5] } },
                        x: { grid: { display: false } }
                    }
                }
            });
        }

        // Monthly trend area chart
        const trendCtx = document.getElementById('leTrendChart');
        if (trendCtx && typeof Chart !== 'undefined') {
            const monthlyData = {};
            data.forEach(item => {
                if (item.tanggal_kejadian) {
                    const d = new Date(item.tanggal_kejadian);
                    const key = d.toLocaleDateString('id-ID', { month: 'short', year: '2-digit' });
                    monthlyData[key] = (monthlyData[key] || 0) + (parseFloat(item.dampak_finansial) || 0);
                }
            });

            const monthLabels = Object.keys(monthlyData);
            const monthValues = Object.values(monthlyData).map(v => v / 1000000); // Convert to millions

            this.chartInstances.trend = new Chart(trendCtx.getContext('2d'), {
                type: 'line',
                data: {
                    labels: monthLabels.length > 0 ? monthLabels : ['No Data'],
                    datasets: [{
                        label: 'Total Impact (Jt)',
                        data: monthValues.length > 0 ? monthValues : [0],
                        fill: true,
                        backgroundColor: 'rgba(13, 148, 136, 0.1)',
                        borderColor: '#0d9488',
                        tension: 0.4,
                        pointRadius: 4,
                        pointBackgroundColor: '#0d9488'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: {
                        y: {
                            beginAtZero: true,
                            grid: { borderDash: [5, 5] },
                            ticks: { callback: (value) => 'Rp ' + value + ' Jt' }
                        },
                        x: { grid: { display: false } }
                    }
                }
            });
        }
    },

    async showAddModal() {
        let kode = '';
        try {
            const kodeData = await apiCall('/api/loss-event/generate/kode');
            kode = kodeData.kode;
        } catch (error) {
            console.error('Error generating kode:', error);
        }
        await this.showModal(null, kode);
    },

    async showModal(id = null, kode = '') {
        const [categories, risks, units] = await Promise.all([
            apiCall('/api/master-data/categories'),
            apiCall('/api/risks'),
            apiCall('/api/master-data/work-units')
        ]);

        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 800px;">
                <div class="modal-header">
                    <h3 class="modal-title">${id ? 'Edit' : 'Tambah'} Loss Event</h3>
                    <button class="modal-close" onclick="this.closest('.modal').remove()">&times;</button>
                </div>
                <form id="loss-form-modal" onsubmit="LossEvent.save(event, '${id || ''}')">
                    <div class="form-group">
                        <label class="form-label">Kode *</label>
                        <input type="text" class="form-control" id="loss-kode" required 
                               value="${kode}" ${kode ? 'readonly' : ''}>
                        <small style="color: var(--gray-500);">${kode ? 'Kode otomatis digenerate' : ''}</small>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Tanggal Kejadian *</label>
                        <input type="date" class="form-control" id="loss-tanggal" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Kategori Risiko</label>
                        <select class="form-control" id="loss-kategori">
                            <option value="">Pilih Kategori</option>
                            ${categories.map(cat => `<option value="${cat.id}">${cat.name}</option>`).join('')}
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Risiko Terkait</label>
                        <select class="form-control" id="loss-risk">
                            <option value="">Pilih Risiko</option>
                            ${risks.map(r => `<option value="${r.id}">${r.kode_risiko}</option>`).join('')}
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Unit Kerja</label>
                        <select class="form-control" id="loss-unit">
                            <option value="">Pilih Unit Kerja</option>
                            ${units.map(u => `<option value="${u.id}">${u.name}</option>`).join('')}
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Deskripsi Kejadian *</label>
                        <textarea class="form-control" id="loss-deskripsi" required rows="4"></textarea>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Penyebab</label>
                        <textarea class="form-control" id="loss-penyebab" rows="3"></textarea>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Dampak Finansial (Rp)</label>
                        <input type="number" class="form-control" id="loss-finansial" step="0.01" min="0">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Dampak Non Finansial</label>
                        <textarea class="form-control" id="loss-non-finansial" rows="3"></textarea>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Tindakan Perbaikan</label>
                        <textarea class="form-control" id="loss-tindakan" rows="3"></textarea>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Status Penanganan</label>
                        <select class="form-control" id="loss-status">
                            <option value="Belum Ditangani">Belum Ditangani</option>
                            <option value="Sedang Ditangani">Sedang Ditangani</option>
                            <option value="Sudah Ditangani">Sudah Ditangani</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Tanggal Penanganan</label>
                        <input type="date" class="form-control" id="loss-tanggal-penanganan">
                    </div>
                    <div style="display: flex; gap: 1rem; justify-content: flex-end; margin-top: 1.5rem;">
                        <button type="button" class="btn btn-secondary" onclick="this.closest('.modal').remove()">Batal</button>
                        <button type="submit" class="btn btn-primary">Simpan</button>
                    </div>
                </form>
            </div>
        `;
        document.body.appendChild(modal);
        if (id) await this.loadForEdit(id);
    },

    async save(e, id) {
        e.preventDefault();
        try {
            const data = {
                kode: document.getElementById('loss-kode').value,
                tanggal_kejadian: document.getElementById('loss-tanggal').value,
                kategori_risiko_id: document.getElementById('loss-kategori').value || null,
                risk_input_id: document.getElementById('loss-risk').value || null,
                unit_kerja_id: document.getElementById('loss-unit').value || null,
                deskripsi_kejadian: document.getElementById('loss-deskripsi').value,
                penyebab: document.getElementById('loss-penyebab').value,
                dampak_finansial: parseFloat(document.getElementById('loss-finansial').value) || 0,
                dampak_non_finansial: document.getElementById('loss-non-finansial').value,
                tindakan_perbaikan: document.getElementById('loss-tindakan').value,
                status_penanganan: document.getElementById('loss-status').value,
                tanggal_penanganan: document.getElementById('loss-tanggal-penanganan').value || null
            };

            if (id) {
                await apiCall(`/api/loss-event/${id}`, { method: 'PUT', body: data });
                alert('Loss Event berhasil diupdate');
            } else {
                await apiCall('/api/loss-event', { method: 'POST', body: data });
                alert('Loss Event berhasil disimpan');
            }

            document.querySelector('.modal').remove();
            await this.load();
        } catch (error) {
            alert('Error: ' + error.message);
        }
    },

    async delete(id) {
        if (!confirm('Yakin ingin menghapus?')) return;
        try {
            await apiCall(`/api/loss-event/${id}`, { method: 'DELETE' });
            await this.load();
            alert('Data berhasil dihapus');
        } catch (error) {
            alert('Error: ' + error.message);
        }
    },

    async edit(id) {
        let kode = '';
        try {
            const item = await apiCall(`/api/loss-event/${id}`);
            kode = item.kode;
        } catch (error) {
            console.error('Error loading data:', error);
        }
        await this.showModal(id, kode);
    },

    async loadForEdit(id) {
        try {
            const data = await apiCall(`/api/loss-event/${id}`);
            document.getElementById('loss-kode').value = data.kode || '';
            document.getElementById('loss-tanggal').value = data.tanggal_kejadian || '';
            document.getElementById('loss-kategori').value = data.kategori_risiko_id || '';
            document.getElementById('loss-risk').value = data.risk_input_id || '';
            document.getElementById('loss-unit').value = data.unit_kerja_id || '';
            document.getElementById('loss-deskripsi').value = data.deskripsi_kejadian || '';
            document.getElementById('loss-penyebab').value = data.penyebab || '';
            document.getElementById('loss-finansial').value = data.dampak_finansial || '';
            document.getElementById('loss-non-finansial').value = data.dampak_non_finansial || '';
            document.getElementById('loss-tindakan').value = data.tindakan_perbaikan || '';
            document.getElementById('loss-status').value = data.status_penanganan || 'Belum Ditangani';
            document.getElementById('loss-tanggal-penanganan').value = data.tanggal_penanganan || '';
        } catch (error) {
            alert('Error loading data: ' + error.message);
        }
    },

    async downloadTemplate() { alert('Fitur unduh template akan diimplementasikan'); },
    showImportModal() { alert('Fitur import akan diimplementasikan'); },
    async downloadReport() { alert('Fitur unduh laporan akan diimplementasikan'); }
};

window.lossEventModule = LossEvent;
window.LossEventModule = LossEvent;
