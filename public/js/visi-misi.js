// Visi Misi Module
async function loadVisiMisi() {
    try {
        console.log('Loading visi misi data...');

        // Show loading state
        const content = document.getElementById('visi-misi-content');
        if (content) {
            content.innerHTML = '<div class="loading-state"><i class="fas fa-spinner fa-spin"></i> Memuat data visi misi...</div>';
        }

        // Try multiple endpoints in order of preference
        let data;
        const endpoints = [
            '/api/visi-misi',
            '/api/simple/visi-misi',
            '/api/debug-data/visi-misi',
            '/api/test-data/visi-misi'
        ];

        for (const endpoint of endpoints) {
            try {
                console.log(`Trying endpoint: ${endpoint}`);
                const response = await apiCall(endpoint);
                console.log(`Visi misi response from ${endpoint}:`, response);

                // Handle different response formats
                if (response && response.success && response.data) {
                    data = response.data;
                } else if (Array.isArray(response)) {
                    data = response;
                } else if (response && typeof response === 'object') {
                    data = response;
                } else {
                    throw new Error('Invalid response format');
                }

                console.log(`Visi misi data processed from ${endpoint}:`, data);
                break;
            } catch (error) {
                console.warn(`Endpoint ${endpoint} failed:`, error.message);
                continue;
            }
        }

        if (!data) {
            throw new Error('Tidak dapat memuat data visi misi dari semua endpoint yang tersedia.');
        }

        if (!Array.isArray(data)) {
            console.warn('Data is not an array, converting:', data);
            data = Array.isArray(data) ? data : [];
        }

        renderVisiMisi(data);
    } catch (error) {
        console.error('Error loading visi misi:', error);
        const content = document.getElementById('visi-misi-content');
        if (content) {
            content.innerHTML =
                '<div class="card"><div class="card-body"><h5 class="text-danger"><i class="fas fa-exclamation-triangle"></i> Error memuat visi misi</h5><p>' + error.message + '</p><button onclick="window.visiMisiModule.loadVisiMisi()" class="btn btn-primary">Coba Lagi</button><button onclick="loadTestVisiMisi()" class="btn btn-secondary">Muat Data Test</button></div></div>';
        }
    }
}

async function loadTestVisiMisi() {
    try {
        console.log('Loading test visi misi data...');

        const content = document.getElementById('visi-misi-content');
        if (content) {
            content.innerHTML = '<div class="loading-state"><i class="fas fa-spinner fa-spin"></i> Memuat data test...</div>';
        }

        const data = await apiCall('/api/test-data/visi-misi');
        console.log('Test visi misi data loaded:', data);

        if (!Array.isArray(data)) {
            throw new Error('Invalid test data format received from server');
        }

        renderVisiMisi(data);
    } catch (error) {
        console.error('Error loading test visi misi:', error);
        const content = document.getElementById('visi-misi-content');
        if (content) {
            content.innerHTML =
                '<div class="card"><div class="card-body"><h5 class="text-danger"><i class="fas fa-exclamation-triangle"></i> Error memuat data test</h5><p>' + error.message + '</p></div></div>';
        }
    }
}

function renderVisiMisi(data) {
    const content = document.getElementById('visi-misi-content');

    // Helper function to format misi as numbered list
    const formatMisi = (misi) => {
        if (!misi) return '-';
        const lines = misi.split('\n').filter(line => line.trim().length > 0);
        if (lines.length === 0) return '-';
        if (lines.length === 1) return `<div style="line-height:1.6;">${lines[0]}</div>`;
        return '<ol style="margin: 0; padding-left: 1.4rem; line-height: 1.8;">' +
            lines.map(line => `<li style="margin-bottom:0.1rem;">${line}</li>`).join('') +
            '</ol>';
    };

    content.innerHTML = `
        <style>
            #visi-misi-content .vm-wrapper {
                background: #f4f6f9;
                font-family: 'Inter', 'Segoe UI', sans-serif;
            }
            #visi-misi-content .vm-card {
                background: #ffffff;
                border-radius: 10px;
                box-shadow: 0 2px 16px rgba(30,58,95,0.10);
                overflow: hidden;
                border: none;
            }
            #visi-misi-content .vm-card-header {
                background: #ffffff;
                padding: 1.1rem 1.4rem;
                border-bottom: 1.5px solid #e8ecf0;
                display: flex;
                align-items: center;
                justify-content: space-between;
            }
            #visi-misi-content .vm-header-left {
                display: flex;
                align-items: center;
                gap: 0.7rem;
            }
            #visi-misi-content .vm-accent-bar {
                width: 4px;
                height: 26px;
                background: #10b981;
                border-radius: 4px;
                flex-shrink: 0;
            }
            #visi-misi-content .vm-card-title {
                font-size: 1.05rem;
                font-weight: 700;
                color: #1e3a5f;
                margin: 0;
                letter-spacing: -0.01em;
            }
            #visi-misi-content .vm-btn-add {
                display: inline-flex;
                align-items: center;
                gap: 0.45rem;
                background: #10b981;
                color: #ffffff;
                border: none;
                border-radius: 7px;
                padding: 0.55rem 1.1rem;
                font-size: 0.875rem;
                font-weight: 600;
                cursor: pointer;
                transition: background 0.2s, box-shadow 0.2s, transform 0.1s;
                box-shadow: 0 2px 8px rgba(16,185,129,0.28);
                letter-spacing: 0.01em;
            }
            #visi-misi-content .vm-btn-add:hover {
                background: #059669;
                box-shadow: 0 4px 14px rgba(16,185,129,0.38);
                transform: translateY(-1px);
            }
            #visi-misi-content .vm-table {
                width: 100%;
                border-collapse: collapse;
                font-size: 0.875rem;
                font-family: 'Inter', 'Segoe UI', sans-serif;
            }
            #visi-misi-content .vm-table thead tr {
                background: #1e3a5f;
            }
            #visi-misi-content .vm-table thead th {
                color: #ffffff;
                font-weight: 600;
                padding: 0.85rem 1.1rem;
                text-align: left;
                font-size: 0.78rem;
                text-transform: uppercase;
                letter-spacing: 0.05em;
                border: none;
                white-space: nowrap;
            }
            #visi-misi-content .vm-table thead th.col-aksi {
                text-align: center;
            }
            #visi-misi-content .vm-table tbody tr {
                border-bottom: 1px solid #f0f2f5;
                transition: background 0.15s;
            }
            #visi-misi-content .vm-table tbody tr:last-child {
                border-bottom: none;
            }
            #visi-misi-content .vm-table tbody tr:hover {
                background: #f8fafc;
            }
            #visi-misi-content .vm-table tbody td {
                padding: 0.9rem 1.1rem;
                color: #374151;
                vertical-align: top;
                border: none;
            }
            #visi-misi-content .vm-tahun {
                display: inline-block;
                background: #eff6ff;
                color: #1d4ed8;
                border: 1px solid #bfdbfe;
                border-radius: 6px;
                padding: 0.28rem 0.65rem;
                font-weight: 700;
                font-size: 0.82rem;
                letter-spacing: 0.02em;
            }
            #visi-misi-content .vm-cell-with-icon {
                display: flex;
                align-items: flex-start;
                gap: 0.7rem;
            }
            #visi-misi-content .vm-icon-box {
                flex-shrink: 0;
                width: 34px;
                height: 34px;
                border-radius: 8px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 0.9rem;
                margin-top: 0.05rem;
            }
            #visi-misi-content .vm-icon-visi {
                background: #eff6ff;
                color: #3b82f6;
            }
            #visi-misi-content .vm-icon-misi {
                background: #f0fdf4;
                color: #10b981;
            }
            #visi-misi-content .vm-cell-text {
                flex: 1;
                line-height: 1.6;
                color: #374151;
            }
            #visi-misi-content .vm-badge-aktif {
                display: inline-flex;
                align-items: center;
                background: #10b981;
                color: #fff;
                border-radius: 20px;
                padding: 0.28rem 0.8rem;
                font-weight: 700;
                font-size: 0.72rem;
                letter-spacing: 0.05em;
                text-transform: uppercase;
                box-shadow: 0 2px 6px rgba(16,185,129,0.3);
                white-space: nowrap;
            }
            #visi-misi-content .vm-badge-nonaktif {
                display: inline-flex;
                align-items: center;
                background: #6b7280;
                color: #fff;
                border-radius: 20px;
                padding: 0.28rem 0.8rem;
                font-weight: 700;
                font-size: 0.72rem;
                letter-spacing: 0.05em;
                text-transform: uppercase;
                white-space: nowrap;
            }
            #visi-misi-content .vm-actions {
                display: flex;
                gap: 0.4rem;
                justify-content: center;
                align-items: center;
            }
            #visi-misi-content .vm-btn-edit {
                width: 32px;
                height: 32px;
                display: flex;
                align-items: center;
                justify-content: center;
                background: #2563eb;
                color: #fff;
                border: none;
                border-radius: 6px;
                cursor: pointer;
                font-size: 0.78rem;
                transition: background 0.2s, transform 0.1s, box-shadow 0.2s;
                box-shadow: 0 2px 6px rgba(37,99,235,0.25);
            }
            #visi-misi-content .vm-btn-edit:hover {
                background: #1d4ed8;
                transform: translateY(-1px);
                box-shadow: 0 4px 10px rgba(37,99,235,0.35);
            }
            #visi-misi-content .vm-btn-del {
                width: 32px;
                height: 32px;
                display: flex;
                align-items: center;
                justify-content: center;
                background: #dc2626;
                color: #fff;
                border: none;
                border-radius: 6px;
                cursor: pointer;
                font-size: 0.78rem;
                transition: background 0.2s, transform 0.1s, box-shadow 0.2s;
                box-shadow: 0 2px 6px rgba(220,38,38,0.25);
            }
            #visi-misi-content .vm-btn-del:hover {
                background: #b91c1c;
                transform: translateY(-1px);
                box-shadow: 0 4px 10px rgba(220,38,38,0.35);
            }
            #visi-misi-content .vm-empty {
                text-align: center;
                padding: 2.5rem 1rem;
                color: #9ca3af;
            }
            #visi-misi-content .vm-empty i {
                font-size: 2.2rem;
                display: block;
                margin-bottom: 0.6rem;
                color: #d1d5db;
            }
        </style>
        <div class="vm-wrapper">
            <div class="vm-card">
                <div class="vm-card-header">
                    <div class="vm-header-left">
                        <div class="vm-accent-bar"></div>
                        <h2 class="vm-card-title">Visi dan Misi</h2>
                    </div>
                    <button class="vm-btn-add" id="btn-tambah-visi-misi">
                        <i class="fas fa-plus"></i> Tambah Visi Misi
                    </button>
                </div>
                <div style="overflow-x: auto;">
                    <table class="vm-table">
                        <thead>
                            <tr>
                                <th style="width: 90px;">Tahun</th>
                                <th style="width: 31%;">
                                    <i class="fas fa-eye" style="opacity:0.8; margin-right:0.35rem;"></i>Visi
                                </th>
                                <th style="width: 39%;">
                                    <i class="fas fa-bullseye" style="opacity:0.8; margin-right:0.35rem;"></i>Misi
                                </th>
                                <th style="width: 110px;">Status</th>
                                <th class="col-aksi" style="width: 90px;">Aksi</th>
                            </tr>
                        </thead>
                        <tbody id="visi-misi-tbody">
                            ${data.length === 0 ? `
                                <tr><td colspan="5">
                                    <div class="vm-empty">
                                        <i class="fas fa-inbox"></i>
                                        <span>Belum ada data Visi dan Misi</span>
                                    </div>
                                </td></tr>` : ''}
                            ${data.map(item => `
                                <tr>
                                    <td><span class="vm-tahun">${item.tahun}</span></td>
                                    <td>
                                        <div class="vm-cell-with-icon">
                                            <div class="vm-icon-box vm-icon-visi">
                                                <i class="fas fa-eye"></i>
                                            </div>
                                            <div class="vm-cell-text">${item.visi || '-'}</div>
                                        </div>
                                    </td>
                                    <td>
                                        <div class="vm-cell-with-icon">
                                            <div class="vm-icon-box vm-icon-misi">
                                                <i class="fas fa-bullseye"></i>
                                            </div>
                                            <div class="vm-cell-text">${formatMisi(item.misi)}</div>
                                        </div>
                                    </td>
                                    <td>
                                        <span class="${item.status === 'Aktif' ? 'vm-badge-aktif' : 'vm-badge-nonaktif'}">
                                            ${item.status}
                                        </span>
                                    </td>
                                    <td>
                                        <div class="vm-actions">
                                            <button class="btn-action-edit" data-action="edit" data-id="${item.id}" title="Edit">
                                                <i data-lucide="pencil"></i>
                                            </button>
                                            <button class="btn-action-delete" data-action="delete" data-id="${item.id}" title="Hapus">
                                                <i data-lucide="trash-2"></i>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;

    // Attach event listeners after rendering
    attachVisiMisiEventListeners();
}

function attachVisiMisiEventListeners() {
    // Tambah button
    const btnTambah = document.getElementById('btn-tambah-visi-misi');
    if (btnTambah) {
        btnTambah.addEventListener('click', () => showVisiMisiModal());
    }

    // Edit and delete buttons
    document.querySelectorAll('[data-action="edit"]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = e.currentTarget.getAttribute('data-id');
            editVisiMisi(id);
        });
    });

    document.querySelectorAll('[data-action="delete"]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = e.currentTarget.getAttribute('data-id');
            deleteVisiMisi(id);
        });
    });
}

function showVisiMisiModal(id = null) {
    // Modal implementation
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 800px; max-height: 90vh; overflow-y: auto;">
            <div class="modal-header">
                <h3 class="modal-title">${id ? 'Edit' : 'Tambah'} Visi dan Misi</h3>
                <button class="modal-close" onclick="this.closest('.modal').remove()">&times;</button>
            </div>
            <form id="visi-misi-form-modal" onsubmit="saveVisiMisi(event, '${id || ''}')">
                <div class="form-group">
                    <label class="form-label">Tahun *</label>
                    <input type="number" class="form-control" id="vm-tahun" required value="${new Date().getFullYear()}">
                </div>
                <div class="form-group">
                    <label class="form-label">Visi *</label>
                    <textarea class="form-control" id="vm-visi" required rows="3" placeholder="Menjadi rumah sakit umum daerah yang mandiri, inovatif, berkualitas dalam pelayanan, pendidikan dan penelitian"></textarea>
                </div>
                <div class="form-group">
                    <label class="form-label">Misi *</label>
                    <small class="form-hint" style="display: block; margin-bottom: 0.5rem;">Tambahkan misi satu per satu. Klik tombol + untuk menambah misi baru.</small>
                    <div id="misi-container">
                        <div class="misi-item" style="display: flex; gap: 0.5rem; margin-bottom: 0.5rem;">
                            <input type="text" class="form-control misi-input" placeholder="Misi 1" required>
                            <button type="button" class="btn btn-danger btn-sm" onclick="removeMisiField(this)" style="min-width: 40px;">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                    </div>
                    <button type="button" class="btn btn-secondary btn-sm" onclick="addMisiField()" style="margin-top: 0.5rem;">
                        <i class="fas fa-plus"></i> Tambah Misi
                    </button>
                </div>
                <div class="form-group">
                    <label class="form-label">Status</label>
                    <select class="form-control" id="vm-status">
                        <option value="Aktif">Aktif</option>
                        <option value="Tidak Aktif">Tidak Aktif</option>
                    </select>
                </div>
                <div style="display: flex; gap: 1rem; justify-content: flex-end; margin-top: 1.5rem;">
                    <button type="button" class="btn btn-secondary" onclick="this.closest('.modal').remove()">Batal</button>
                    <button type="submit" class="btn btn-primary">Simpan</button>
                </div>
            </form>
        </div>
    `;
    document.body.appendChild(modal);

    if (id) {
        // Load data for edit
        loadVisiMisiForEdit(id);
    }
}

function addMisiField() {
    const container = document.getElementById('misi-container');
    const count = container.children.length + 1;
    const div = document.createElement('div');
    div.className = 'misi-item';
    div.style.cssText = 'display: flex; gap: 0.5rem; margin-bottom: 0.5rem;';
    div.innerHTML = `
        <input type="text" class="form-control misi-input" placeholder="Misi ${count}" required>
        <button type="button" class="btn btn-danger btn-sm" onclick="removeMisiField(this)" style="min-width: 40px;">
            <i class="fas fa-times"></i>
        </button>
    `;
    container.appendChild(div);
}

function removeMisiField(button) {
    const container = document.getElementById('misi-container');
    if (container.children.length > 1) {
        button.closest('.misi-item').remove();
        // Update placeholders
        const inputs = container.querySelectorAll('.misi-input');
        inputs.forEach((input, index) => {
            input.placeholder = `Misi ${index + 1}`;
        });
    } else {
        alert('Minimal harus ada 1 misi');
    }
}

async function saveVisiMisi(e, id) {
    e.preventDefault();
    try {
        // Collect all misi inputs
        const misiInputs = document.querySelectorAll('.misi-input');
        const misiArray = Array.from(misiInputs)
            .map(input => input.value.trim())
            .filter(value => value.length > 0);

        if (misiArray.length === 0) {
            alert('Minimal harus ada 1 misi');
            return;
        }

        // Join with newline for storage
        const misiFormatted = misiArray.join('\n');

        const data = {
            tahun: parseInt(document.getElementById('vm-tahun').value),
            visi: document.getElementById('vm-visi').value,
            misi: misiFormatted,
            status: document.getElementById('vm-status').value
        };

        if (id) {
            await apiCall(`/api/visi-misi/${id}`, { method: 'PUT', body: data });
        } else {
            await apiCall('/api/visi-misi', { method: 'POST', body: data });
        }

        document.querySelector('.modal').remove();
        await loadVisiMisi();
        alert('Visi Misi berhasil disimpan');
    } catch (error) {
        alert('Error: ' + error.message);
    }
}

async function deleteVisiMisi(id) {
    if (!confirm('Yakin ingin menghapus?')) return;
    try {
        await apiCall(`/api/visi-misi/${id}`, { method: 'DELETE' });
        await loadVisiMisi();
        alert('Visi Misi berhasil dihapus');
    } catch (error) {
        alert('Error: ' + error.message);
    }
}

async function editVisiMisi(id) {
    showVisiMisiModal(id);
}

async function loadVisiMisiForEdit(id) {
    try {
        const data = await apiCall(`/api/visi-misi/${id}`);
        document.getElementById('vm-tahun').value = data.tahun;
        document.getElementById('vm-visi').value = data.visi;
        document.getElementById('vm-status').value = data.status;

        // Load misi fields
        const container = document.getElementById('misi-container');
        container.innerHTML = ''; // Clear existing

        const misiArray = data.misi ? data.misi.split('\n').filter(line => line.trim()) : [''];
        if (misiArray.length === 0) misiArray.push('');

        misiArray.forEach((misi, index) => {
            const div = document.createElement('div');
            div.className = 'misi-item';
            div.style.cssText = 'display: flex; gap: 0.5rem; margin-bottom: 0.5rem;';
            div.innerHTML = `
                <input type="text" class="form-control misi-input" placeholder="Misi ${index + 1}" value="${misi}" required>
                <button type="button" class="btn btn-danger btn-sm" onclick="removeMisiField(this)" style="min-width: 40px;">
                    <i class="fas fa-times"></i>
                </button>
            `;
            container.appendChild(div);
        });
    } catch (error) {
        alert('Error loading data: ' + error.message);
    }
}

// Export
window.visiMisiModule = { loadVisiMisi };
window.addMisiField = addMisiField;
window.removeMisiField = removeMisiField;
