
/* Cache-busted: 2026-03-31T02:15:20.498Z */
/**
 * RENCANA STRATEGIS MODULE v5.3-STABLE
 * 
 * CRITICAL RULES:
 * 1. ALWAYS display: Statistics Cards + Data Table + Form
 * 2. NEVER display: Selection List / "Pilih Rencana Strategis" view
 * 3. This is the ONLY correct interface for /rencana-strategis page
 * 
 * FIXED: Removed aggressive MutationObserver to prevent page stuck
 * Updated: 2026-01-09
 */

const RencanaStrategisModule = (() => {
  const MODULE_VERSION = '5.3-STABLE';
  const state = {
    data: [],
    missions: [],
    currentId: null,
    formValues: {},
    isLoading: false,
    isInitialized: false,
    showForm: false, // Form hidden by default, shown when "Tambah Data" clicked
    renderCount: 0,
    renderLocked: false,
    lastRenderTime: 0,
    maxRenderCount: 3 // Limit re-renders to prevent infinite loop
  };

  // API call helper with multiple fallbacks
  const api = () => {
    if (window.apiCall && typeof window.apiCall === 'function') {
      return window.apiCall;
    }
    if (window.app && window.app.apiCall && typeof window.app.apiCall === 'function') {
      return window.app.apiCall;
    }
    if (window.apiService && window.apiService.apiCall && typeof window.apiService.apiCall === 'function') {
      return window.apiService.apiCall;
    }
    // Ultimate fallback - direct fetch with token
    return async (endpoint, options = {}) => {
      const token = localStorage.getItem('token') || (window.currentSession?.access_token);
      const headers = {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        ...options.headers
      };
      const config = { ...options, headers };
      if (options.body && typeof options.body === 'object') {
        config.body = JSON.stringify(options.body);
      }
      const response = await fetch(endpoint, config);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return response.json();
    };
  };
  const getEl = (id) => document.getElementById(id);

  function getDefaultForm() {
    return {
      kode: '',
      visi_misi_id: '',
      nama_rencana: '',
      deskripsi: '',
      periode_mulai: '',
      periode_selesai: '',
      target: '',
      status: 'Draft'
    };
  }

  
  // GUARD: Prevent selection list from being rendered
  function preventSelectionList() {
    const container = getEl('rencana-strategis-content');
    if (!container) return;
    
    // Check if selection list is being rendered
    if (container.innerHTML.includes('Pilih Rencana Strategis') && 
        !container.querySelector('table')) {
      console.warn('⚠️ Selection list detected! Forcing proper interface...');
      renderInterface();
    }
  }
  
  async function load() {
    console.log(`🚀 Loading Rencana Strategis Module v${MODULE_VERSION}...`);
    console.log('📋 This module displays: Cards + Table + Form (NOT selection list)');
    
    // Load CSS minimalis dengan cache-busting
    if (!document.getElementById('rs-minimalis-css')) {
      const link = document.createElement('link');
      link.id = 'rs-minimalis-css';
      link.rel = 'stylesheet';
      link.href = '/css/rencana-strategis-minimalis.css?v=' + Date.now();
      document.head.appendChild(link);
      console.log('✅ CSS minimalis dimuat dengan cache-busting');
    }
    
    // Load CSS critical fix dengan cache-busting
    if (!document.getElementById('rs-critical-fix-css')) {
      const link = document.createElement('link');
      link.id = 'rs-critical-fix-css';
      link.rel = 'stylesheet';
      link.href = '/css/rencana-strategis-fix-critical.css?v=' + Date.now();
      document.head.appendChild(link);
      console.log('✅ CSS critical fix dimuat dengan cache-busting');
    }
    
    // Load JS edit handler dengan cache-busting
    if (!document.getElementById('rs-edit-handler-js')) {
      const script = document.createElement('script');
      script.id = 'rs-edit-handler-js';
      script.src = '/js/rencana-strategis-edit-handler.js?v=' + Date.now();
      document.head.appendChild(script);
      console.log('✅ JS edit handler dimuat dengan cache-busting');
    }
    
    // Load JS table fix dengan cache-busting
    if (!document.getElementById('rs-table-fix-js')) {
      const script = document.createElement('script');
      script.id = 'rs-table-fix-js';
      script.src = '/js/rencana-strategis-table-fix.js?v=' + Date.now();
      document.head.appendChild(script);
      console.log('✅ JS table fix dimuat dengan cache-busting');
    }
    
    // Tambahkan inline style KUAT untuk memastikan kartu putih dan nilai terlihat
    if (!document.getElementById('rs-inline-force-css')) {
      const style = document.createElement('style');
      style.id = 'rs-inline-force-css';
      style.textContent = `
        /* PAKSA KARTU PUTIH - SPECIFICITY MAKSIMAL */
        body #rencana-strategis .rencana-strategis-wrapper .stat-card,
        body #rencana-strategis .rencana-strategis-wrapper .stat-card.aktif,
        body #rencana-strategis .rencana-strategis-wrapper .stat-card.draft,
        body #rencana-strategis .rencana-strategis-wrapper .stat-card.selesai,
        body #rencana-strategis .rencana-strategis-wrapper .stat-card.total { 
          background: white !important; 
          background-color: white !important;
          border: 2px solid #e5e7eb !important;
          display: flex !important;
          flex-direction: row !important;
        }
        body #rencana-strategis .rencana-strategis-wrapper .stat-card-success { border-color: #10b981 !important; }
        body #rencana-strategis .rencana-strategis-wrapper .stat-card-warning { border-color: #f59e0b !important; }
        body #rencana-strategis .rencana-strategis-wrapper .stat-card-info { border-color: #3b82f6 !important; }
        body #rencana-strategis .rencana-strategis-wrapper .stat-card-secondary { border-color: #64748b !important; }
        
        /* PAKSA NILAI DAN LABEL TERLIHAT - HITAM */
        body #rencana-strategis .rencana-strategis-wrapper .stat-value,
        body #rencana-strategis .rencana-strategis-wrapper .stat-card .stat-value,
        body #rencana-strategis .rencana-strategis-wrapper .stat-card-value { 
          color: #1f2937 !important; 
          font-size: 1.875rem !important;
          display: block !important;
          visibility: visible !important;
          opacity: 1 !important;
        }
        body #rencana-strategis .rencana-strategis-wrapper .stat-label,
        body #rencana-strategis .rencana-strategis-wrapper .stat-card .stat-label,
        body #rencana-strategis .rencana-strategis-wrapper .stat-card-label { 
          color: #6b7280 !important;
          display: block !important;
          visibility: visible !important;
          opacity: 1 !important;
        }
        
        /* PAKSA KOLOM KODE TERLIHAT */
        body #rencana-strategis .table td:nth-child(1),
        body #rencana-strategis .table tbody td:nth-child(1) {
          display: table-cell !important;
          visibility: visible !important;
          opacity: 1 !important;
          min-width: 120px !important;
        }
        
        /* PAKSA BADGE KODE TERLIHAT */
        body #rencana-strategis .table td:nth-child(1) .badge {
          display: inline-block !important;
          visibility: visible !important;
          opacity: 1 !important;
          background: #f1f5f9 !important;
          color: #1e293b !important;
          font-weight: 700 !important;
        }
        
        /* PAKSA BADGE STATUS DI DALAM TABEL */
        body #rencana-strategis .table td:nth-child(5) {
          display: table-cell !important;
          visibility: visible !important;
          opacity: 1 !important;
          overflow: visible !important;
          position: relative !important;
        }
        
        body #rencana-strategis .table td:nth-child(5) .badge {
          display: inline-block !important;
          visibility: visible !important;
          opacity: 1 !important;
          position: relative !important;
          z-index: 1 !important;
          max-width: 100% !important;
        }
        
        /* PAKSA TOMBOL EDIT BIRU TERLIHAT DAN BERFUNGSI */
        body #rencana-strategis .btn-action-edit,
        body #rencana-strategis .rs-action-btn[data-action="edit"] {
          display: inline-flex !important;
          visibility: visible !important;
          opacity: 1 !important;
          pointer-events: auto !important;
          cursor: pointer !important;
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%) !important;
        }
        
        body #rencana-strategis .btn-action-edit i,
        body #rencana-strategis .rs-action-btn[data-action="edit"] i {
          color: white !important;
          display: inline-block !important;
          visibility: visible !important;
          opacity: 1 !important;
        }
      `;
      document.head.appendChild(style);
      console.log('✅ Inline force CSS ditambahkan untuk kartu putih');
    }
    
    // Prevent concurrent loading
    if (state.isLoading) {
      console.log('⚠️ Module is already loading, skipping...');
      return;
    }
    
    // Check if already initialized with proper interface
    const container = getEl('rencana-strategis-content');
    if (!container) {
      console.error('❌ Container rencana-strategis-content not found!');
      console.error('❌ Halaman tidak memiliki container yang diperlukan. Periksa struktur HTML.');
      // Try to create container if parent exists
      const parentPage = document.getElementById('rencana-strategis');
      if (parentPage) {
        console.log('🔧 Membuat container rencana-strategis-content...');
        const newContainer = document.createElement('div');
        newContainer.id = 'rencana-strategis-content';
        newContainer.className = 'container-fluid p-4';
        parentPage.appendChild(newContainer);
        // Retry load after creating container
        setTimeout(() => load(), 100);
      }
      return;
    }
    
    if (container && state.isInitialized && !state.isLoading) {
      const hasTable = container.querySelector('table');
      const hasCards = container.querySelector('.rencana-strategis-wrapper');
      
      if (hasTable && hasCards) {
        console.log('✅ Module already initialized with proper interface, skipping reload');
        return;
      }
    }
    
    state.isLoading = true;
    state.isInitialized = false;
    state.renderCount = 0;

    try {
      // Show loading spinner
      container.innerHTML = '<div class="text-center py-5"><div class="spinner-border text-primary" role="status"></div><p class="mt-3 text-muted">Memuat data rencana strategis...</p></div>';

      await waitForAuth();
      await fetchData();

      state.formValues = getDefaultForm();
      await generateKode();

      // Render interface - FORCE RENDER
      console.log('🎨 Memulai render interface...');
      renderInterface();
      
      // Verify render was successful
      setTimeout(() => {
        const hasTable = container.querySelector('table');
        const hasCards = container.querySelector('.rencana-strategis-wrapper');
        if (!hasTable || !hasCards) {
          console.error('❌ Render gagal! Mencoba render ulang...');
          renderInterface();
        } else {
          console.log('✅ Render berhasil diverifikasi');
        }
      }, 500);

      state.isInitialized = true;
      state.isLoading = false;
      
      // Mark container as managed by this module
      container.setAttribute('data-module', 'RencanaStrategisModule');
      container.setAttribute('data-version', MODULE_VERSION);
      
      console.log(`✅ Rencana Strategis Module v${MODULE_VERSION} loaded successfully`);

    } catch (error) {
      console.error('❌ Error loading Rencana Strategis:', error);
      state.isLoading = false;
      showError(error.message);
    }
  }

  async function waitForAuth() {
    if (window.waitForAuthReady) {
      try {
        await Promise.race([
          window.waitForAuthReady(1500),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Auth timeout')), 1500))
        ]);
      } catch (e) {
        console.warn('Auth timeout, continuing...');
      }
    }
  }

  async function fetchData() {
    try {
      const apiFunc = api();
      
      // Try authenticated endpoints first, fallback to public endpoints
      const [rencanaRes, visiRes] = await Promise.allSettled([
        apiFunc('/api/rencana-strategis').catch(async () => {
          // Fallback to public endpoint
          console.log('📋 Falling back to public rencana-strategis endpoint...');
          return apiFunc('/api/rencana-strategis/public').catch(() => []);
        }),
        apiFunc('/api/visi-misi').catch(async () => {
          // Fallback to public endpoint
          console.log('📋 Falling back to public visi-misi endpoint...');
          return apiFunc('/api/visi-misi/public').catch(() => []);
        })
      ]);
      
      state.data = rencanaRes.status === 'fulfilled' ? 
        (Array.isArray(rencanaRes.value) ? rencanaRes.value : (rencanaRes.value?.data || [])) : [];
      
      state.missions = visiRes.status === 'fulfilled' ? 
        (Array.isArray(visiRes.value) ? visiRes.value : (visiRes.value?.data || [])) : [];
      
      console.log('📊 Data loaded:', { rencana: state.data.length, visi: state.missions.length });
      
      // Debug: Log first 3 items to verify kode and status fields
      if (state.data.length > 0) {
        console.log('📋 Sample data (first 3 items):');
        state.data.slice(0, 3).forEach(function(item, idx) {
          console.log('  Item ' + (idx + 1) + ':', {
            id: item.id,
            kode: item.kode || 'TIDAK ADA',
            nama: item.nama_rencana,
            status: item.status || 'TIDAK ADA'
          });
        });
        
        // Check if any item is missing kode
        var missingKode = state.data.filter(function(item) { return !item.kode; });
        if (missingKode.length > 0) {
          console.warn('⚠️ Ada ' + missingKode.length + ' data tanpa kode!');
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      state.data = [];
      state.missions = [];
    }
  }

  function renderInterface() {
    const container = getEl('rencana-strategis-content');
    if (!container) return;

    console.log('🎨 Rendering complete interface with cards + form + table...');

    let html = '<div class="rencana-strategis-wrapper p-3">';
    
    // Always render stat cards first
    html += renderStatCards();
    
    // Always render form (collapsible)
    html += renderFormCard();
    
    // Then render table
    html += renderTableCard();
    html += '</div>';

    container.innerHTML = html;
    
    // Force browser to reflow/repaint before binding events
    container.offsetHeight; // Trigger reflow
    
    // Use requestAnimationFrame to ensure DOM is fully rendered
    requestAnimationFrame(() => {
      bindEvents();
      console.log('✅ Interface rendered: Cards + Form + Table displayed');
    });
  }

  function renderStatCards() {
    const aktif = state.data.filter(i => i.status === 'Aktif').length;
    const draft = state.data.filter(i => i.status === 'Draft').length;
    const selesai = state.data.filter(i => i.status === 'Selesai').length;
    const total = state.data.length;

    return '<div class="row g-3 mb-4">' +
      // Card 1: Aktif - Putih dengan border hijau
      '<div class="col-xl-3 col-md-6 col-6">' +
        '<div class="stat-card stat-card-success">' +
          '<div class="stat-icon"><i class="fas fa-check-circle"></i></div>' +
          '<div class="stat-content">' +
            '<div class="stat-value">' + aktif + '</div>' +
            '<div class="stat-label">Aktif</div>' +
          '</div>' +
        '</div>' +
      '</div>' +
      // Card 2: Draft - Putih dengan border orange
      '<div class="col-xl-3 col-md-6 col-6">' +
        '<div class="stat-card stat-card-warning">' +
          '<div class="stat-icon"><i class="fas fa-file-alt"></i></div>' +
          '<div class="stat-content">' +
            '<div class="stat-value">' + draft + '</div>' +
            '<div class="stat-label">Draft</div>' +
          '</div>' +
        '</div>' +
      '</div>' +
      // Card 3: Selesai - Putih dengan border biru
      '<div class="col-xl-3 col-md-6 col-6">' +
        '<div class="stat-card stat-card-info">' +
          '<div class="stat-icon"><i class="fas fa-flag-checkered"></i></div>' +
          '<div class="stat-content">' +
            '<div class="stat-value">' + selesai + '</div>' +
            '<div class="stat-label">Selesai</div>' +
          '</div>' +
        '</div>' +
      '</div>' +
      // Card 4: Total - Putih dengan border abu
      '<div class="col-xl-3 col-md-6 col-6">' +
        '<div class="stat-card stat-card-secondary">' +
          '<div class="stat-icon"><i class="fas fa-chart-line"></i></div>' +
          '<div class="stat-content">' +
            '<div class="stat-value">' + total + '</div>' +
            '<div class="stat-label">Total</div>' +
          '</div>' +
        '</div>' +
      '</div>' +
    '</div>';
  }

  function renderFormCard() {
    const f = state.formValues;
    const isEdit = !!state.currentId;
    const isCollapsed = !state.showForm && !isEdit;
    
    return '<div class="card mb-4 shadow-sm border-0" id="rs-form-section" style="' + (isCollapsed ? 'display: none;' : '') + '">' +
      '<div class="card-header bg-white d-flex justify-content-between align-items-center" style="border-left: 4px solid #3b82f6; border-bottom: 1px solid #e5e7eb;">' +
        '<h5 class="mb-0" style="color: #1a1a1a !important;"><i class="fas fa-' + (isEdit ? 'edit' : 'plus-circle') + ' me-2" style="color: #3b82f6;"></i>' + (isEdit ? 'Edit Rencana Strategis' : 'Form Input Rencana Strategis') + '</h5>' +
        '<button type="button" class="btn btn-outline-secondary btn-sm" id="rs-close-form" title="Tutup Form">' +
          '<i class="fas fa-times"></i>' +
        '</button>' +
      '</div>' +
      '<div class="card-body" id="rs-form-body">' +
        '<form id="rs-form">' +
          '<div class="row g-3">' +
            // Row 1: Kode, Status, Misi
            '<div class="col-md-3">' +
              '<label class="form-label fw-semibold"><i class="fas fa-barcode me-1 text-primary"></i> Kode</label>' +
              '<input type="text" class="form-control bg-light" id="rs-kode" value="' + (f.kode || '') + '" readonly placeholder="Auto-generate">' +
              '<small class="text-muted">Kode otomatis</small>' +
            '</div>' +
            '<div class="col-md-3">' +
              '<label class="form-label fw-semibold"><i class="fas fa-flag me-1 text-warning"></i> Status</label>' +
              '<select class="form-select" id="rs-status">' +
                '<option value="Draft"' + (f.status === 'Draft' ? ' selected' : '') + '>📝 Draft</option>' +
                '<option value="Aktif"' + (f.status === 'Aktif' ? ' selected' : '') + '>✅ Aktif</option>' +
                '<option value="Selesai"' + (f.status === 'Selesai' ? ' selected' : '') + '>🏁 Selesai</option>' +
              '</select>' +
            '</div>' +
            '<div class="col-md-6">' +
              '<label class="form-label fw-semibold"><i class="fas fa-bullseye me-1 text-success"></i> Misi Terkait</label>' +
              '<select class="form-select" id="rs-misi">' +
                '<option value="">-- Pilih Misi --</option>' +
                renderMissionOptions() +
              '</select>' +
            '</div>' +
            // Row 2: Nama Rencana
            '<div class="col-12">' +
              '<label class="form-label fw-semibold"><i class="fas fa-file-alt me-1 text-info"></i> Nama Rencana Strategis <span class="text-danger">*</span></label>' +
              '<input type="text" class="form-control form-control-lg" id="rs-nama" value="' + (f.nama_rencana || '') + '" placeholder="Masukkan nama rencana strategis..." required>' +
            '</div>' +
            // Row 3: Periode
            '<div class="col-md-6">' +
              '<label class="form-label fw-semibold"><i class="fas fa-calendar-alt me-1 text-primary"></i> Periode Mulai</label>' +
              '<input type="date" class="form-control" id="rs-mulai" value="' + (f.periode_mulai || '') + '">' +
            '</div>' +
            '<div class="col-md-6">' +
              '<label class="form-label fw-semibold"><i class="fas fa-calendar-check me-1 text-success"></i> Periode Selesai</label>' +
              '<input type="date" class="form-control" id="rs-selesai" value="' + (f.periode_selesai || '') + '">' +
            '</div>' +
            // Row 4: Deskripsi
            '<div class="col-12">' +
              '<label class="form-label fw-semibold"><i class="fas fa-align-left me-1 text-secondary"></i> Deskripsi</label>' +
              '<textarea class="form-control" id="rs-deskripsi" rows="3" placeholder="Masukkan deskripsi rencana strategis...">' + (f.deskripsi || '') + '</textarea>' +
            '</div>' +
            // Row 5: Target
            '<div class="col-12">' +
              '<label class="form-label fw-semibold"><i class="fas fa-crosshairs me-1 text-danger"></i> Target</label>' +
              '<textarea class="form-control" id="rs-target" rows="2" placeholder="Masukkan target yang ingin dicapai...">' + (f.target || '') + '</textarea>' +
            '</div>' +
            // Row 6: Buttons
            '<div class="col-12 pt-3 border-top">' +
              '<div class="d-flex gap-2 flex-wrap">' +
                '<button type="submit" class="btn btn-primary btn-lg"><i class="fas fa-save me-2"></i>' + (isEdit ? 'Update Data' : 'Simpan Data') + '</button>' +
                '<button type="button" class="btn btn-outline-secondary" id="rs-reset-btn"><i class="fas fa-undo me-2"></i>Reset Form</button>' +
                (isEdit ? '<button type="button" class="btn btn-outline-danger" id="rs-cancel-edit"><i class="fas fa-times me-2"></i>Batal Edit</button>' : '') +
              '</div>' +
            '</div>' +
          '</div>' +
        '</form>' +
      '</div>' +
    '</div>';
  }

  function renderTableCard() {
    return '<div class="card shadow-sm border-0" style="border-radius: 12px;">' +
      '<div class="card-header bg-white d-flex justify-content-between align-items-center py-3 flex-wrap gap-2" style="border-radius: 12px 12px 0 0; border-bottom: 1px solid #e5e7eb;">' +
        '<div>' +
          '<h5 class="mb-0" style="color: #1f2937 !important; font-weight: 700 !important; -webkit-text-fill-color: #1f2937 !important;"><i class="fas fa-table me-2" style="color: #3b82f6;"></i>Daftar Rencana Strategis</h5>' +
          '<small style="color: #6b7280 !important;">Total: ' + state.data.length + ' data</small>' +
        '</div>' +
        '<div class="d-flex gap-2">' +
          '<button type="button" class="btn btn-primary d-flex align-items-center gap-2" id="rs-refresh-btn" title="Refresh Data" style="background: #3b82f6 !important; color: white !important; border: none !important; padding: 0.5rem 1rem; border-radius: 8px; font-weight: 600; min-width: 120px; box-shadow: 0 2px 4px rgba(59, 130, 246, 0.2); transition: all 0.2s ease;">' +
            '<i class="fas fa-sync-alt" style="color: white !important;"></i>' +
            '<span style="color: white !important;">Refresh</span>' +
          '</button>' +
          '<button type="button" class="btn btn-primary d-flex align-items-center gap-2" id="rs-add-btn" title="Tambah Data Baru" style="background: #3b82f6 !important; color: white !important; border: none !important; padding: 0.5rem 1rem; border-radius: 8px; font-weight: 600; min-width: 140px; box-shadow: 0 2px 4px rgba(59, 130, 246, 0.2); transition: all 0.2s ease;">' +
            '<i class="fas fa-plus" style="color: white !important;"></i>' +
            '<span style="color: white !important;">Tambah Data</span>' +
          '</button>' +
          '<button type="button" class="btn btn-success d-flex align-items-center gap-2" id="rs-export-btn" title="Unduh Laporan Excel" style="background: #10b981 !important; color: white !important; border: none !important; padding: 0.5rem 1rem; border-radius: 8px; font-weight: 600; min-width: 150px; box-shadow: 0 2px 4px rgba(16, 185, 129, 0.2); transition: all 0.2s ease;">' +
            '<i class="fas fa-file-download" style="color: white !important;"></i>' +
            '<span style="color: white !important;">Unduh Laporan</span>' +
          '</button>' +
        '</div>' +
      '</div>' +
      '<div class="card-body p-0">' +
        '<div class="table-responsive">' +
          '<table class="table table-hover mb-0">' +
            '<thead style="background: #1e3a8a !important;">' +
              '<tr>' +
                '<th class="border-0 py-3" style="width: 120px; color: white !important;"><i class="fas fa-barcode me-2" style="color: white !important;"></i>KODE</th>' +
                '<th class="border-0 py-3" style="color: white !important;"><i class="fas fa-file-alt me-2" style="color: white !important;"></i>NAMA RENCANA</th>' +
                '<th class="border-0 py-3" style="width: 150px; color: white !important;"><i class="fas fa-crosshairs me-2" style="color: white !important;"></i>TARGET</th>' +
                '<th class="border-0 py-3" style="width: 180px; color: white !important;"><i class="fas fa-calendar me-2" style="color: white !important;"></i>PERIODE</th>' +
                '<th class="border-0 py-3" style="width: 120px; color: white !important;"><i class="fas fa-flag me-2" style="color: white !important;"></i>STATUS</th>' +
                '<th class="border-0 py-3 text-center" style="width: 140px; color: white !important;"><i class="fas fa-cog me-2" style="color: white !important;"></i>AKSI</th>' +
              '</tr>' +
            '</thead>' +
            '<tbody>' + renderTableRows() + '</tbody>' +
          '</table>' +
        '</div>' +
      '</div>' +
    '</div>';
  }

  function renderTableRows() {
    if (!state.data || state.data.length === 0) {
      return '<tr><td colspan="6" class="text-center py-5 border-0">' +
        '<div class="py-4">' +
          '<div class="mb-3" style="width: 80px; height: 80px; margin: 0 auto; background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center;">' +
            '<i class="fas fa-inbox fa-2x text-muted"></i>' +
          '</div>' +
          '<h5 class="text-muted mb-2">Belum Ada Data</h5>' +
          '<p class="text-muted mb-3">Silakan isi form di atas untuk menambahkan rencana strategis baru</p>' +
          '<button class="btn btn-primary" onclick="RencanaStrategisModule.showAddForm()"><i class="fas fa-plus me-2"></i>Tambah Rencana Strategis</button>' +
        '</div>' +
      '</td></tr>';
    }

    console.log('📊 Rendering table rows, data count:', state.data.length);
    
    return state.data.map(function(item, index) {
      // Debug: Log each item's kode and status
      console.log('Row ' + index + ':', { 
        id: item.id, 
        kode: item.kode || 'MISSING', 
        status: item.status || 'MISSING' 
      });
      
      var statusBadge = getStatusBadgeFixed(item.status);
      var periode = formatPeriode(item.periode_mulai, item.periode_selesai);
      var rowBg = index % 2 === 0 ? '' : 'style="background-color: #fafbfc;"';
      var kodeDisplay = item.kode || generateFallbackKode(index);
      var itemId = item.id || '';
      
      // Ensure all HTML is properly escaped and formatted
      var row = '<tr ' + rowBg + ' data-id="' + itemId + '">';
      
      // Column 1: Kode - TAMPILKAN KODE DENGAN JELAS
      row += '<td class="align-middle" style="min-width: 120px; max-width: 150px; padding: 0.75rem 1rem; overflow: visible; position: relative; vertical-align: middle;">';
      row += '<span class="badge bg-light text-dark border fw-semibold" style="font-size: 0.85rem; padding: 0.45rem 0.75rem; white-space: nowrap; display: inline-block; max-width: 100%; overflow: visible; text-overflow: clip; font-family: \'Courier New\', monospace; font-weight: 700; color: #1e293b !important; background: #f1f5f9 !important; border: 1px solid #cbd5e1 !important; visibility: visible; opacity: 1;">' + escapeHtml(kodeDisplay) + '</span>';
      row += '</td>';
      
      // Column 2: Nama Rencana
      row += '<td class="align-middle" style="min-width: 200px; max-width: 350px;">';
      row += '<div class="fw-semibold text-dark" style="word-wrap: break-word; overflow-wrap: break-word; white-space: normal; line-height: 1.5;">' + escapeHtml(item.nama_rencana || '-') + '</div>';
      if (item.deskripsi) {
        row += '<small class="text-muted d-block mt-1" style="line-height: 1.4; word-wrap: break-word; overflow-wrap: break-word; white-space: normal;">' + escapeHtml(truncateText(item.deskripsi, 80)) + '</small>';
      }
      row += '</td>';
      
      // Column 3: Target
      row += '<td class="align-middle" style="min-width: 150px; max-width: 250px;">';
      row += '<small class="text-muted" style="word-wrap: break-word; overflow-wrap: break-word; white-space: normal; display: block; line-height: 1.5;">' + escapeHtml(item.target || '-') + '</small>';
      row += '</td>';
      
      // Column 4: Periode
      row += '<td class="align-middle" style="min-width: 140px; white-space: nowrap;">';
      row += '<small class="text-muted">' + periode + '</small>';
      row += '</td>';
      
      // Column 5: Status - BADGE DI DALAM TABEL, TIDAK OVERFLOW
      row += '<td class="align-middle" style="min-width: 110px; max-width: 130px; padding: 0.75rem 1rem; overflow: visible; position: relative; vertical-align: middle;">';
      row += '<div style="display: inline-block; max-width: 100%; overflow: visible; position: relative; z-index: 1;">' + statusBadge + '</div>';
      row += '</td>';
      
      // Column 6: Action Buttons - ICON ONLY (VIEW, EDIT, DELETE)
      row += '<td class="align-middle text-center" style="min-width: 140px; white-space: nowrap; padding: 0.5rem 0.75rem;">';
      row += '<div class="d-flex justify-content-center gap-2" role="group">';
      
      // View Button - ICON ONLY
      row += '<button type="button" class="btn-action-view rs-action-btn" ';
      row += 'data-action="view" data-id="' + itemId + '" ';
      row += 'title="Lihat Detail" ';
      row += 'style="display: inline-flex !important; align-items: center !important; justify-content: center !important;">';
      row += '<i class="fas fa-eye"></i>';
      row += '</button>';
      
      // Edit Button - ICON ONLY - BIRU
      row += '<button type="button" class="btn-action-edit rs-action-btn" ';
      row += 'data-action="edit" data-id="' + itemId + '" ';
      row += 'title="Edit Data" ';
      row += 'style="display: inline-flex !important; align-items: center !important; justify-content: center !important; background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%) !important;">';
      row += '<i class="fas fa-edit" style="color: white !important;"></i>';
      row += '</button>';
      
      // Delete Button - ICON ONLY
      row += '<button type="button" class="btn-action-delete rs-action-btn" ';
      row += 'data-action="delete" data-id="' + itemId + '" ';
      row += 'title="Hapus" ';
      row += 'style="display: inline-flex !important; align-items: center !important; justify-content: center !important;">';
      row += '<i class="fas fa-trash-alt"></i>';
      row += '</button>';
      
      row += '</div>';
      row += '</td>';
      row += '</tr>';
      
      return row;
    }).join('');
  }
  
  // Helper function to escape HTML
  function escapeHtml(text) {
    if (!text) return '';
    var div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
  
  // Generate fallback kode if missing
  function generateFallbackKode(index) {
    var year = new Date().getFullYear();
    return 'RS-' + year + '-' + String(index + 1).padStart(3, '0');
  }
  
  // Fixed status badge with solid bright colors - CONTAINED IN TABLE
  function getStatusBadgeFixed(status) {
    var statusText = status || 'Draft';
    console.log('🏷️ Creating badge for status:', statusText);
    
    var badgeClass = '';
    var icon = '';
    
    if (statusText === 'Aktif') {
      badgeClass = 'bg-success';
      icon = '<i class="fas fa-check-circle me-1"></i>';
    } else if (statusText === 'Draft') {
      badgeClass = 'bg-warning';
      icon = '<i class="fas fa-file-alt me-1"></i>';
    } else if (statusText === 'Selesai') {
      badgeClass = 'bg-secondary';
      icon = '<i class="fas fa-flag-checkered me-1"></i>';
    } else {
      badgeClass = 'bg-secondary';
      icon = '';
    }
    
    return '<span class="badge ' + badgeClass + ' text-white" style="font-size: 0.8rem; padding: 0.45rem 0.85rem; border-radius: 8px; font-weight: 600; white-space: nowrap; display: inline-block; max-width: 100%; overflow: visible; box-shadow: 0 2px 6px rgba(0,0,0,0.15); visibility: visible; opacity: 1; position: relative; z-index: 1;">' + icon + escapeHtml(statusText) + '</span>';
  }

  function renderMissionOptions() {
    if (!state.missions || state.missions.length === 0) {
      return '<option value="" disabled>Tidak ada misi tersedia</option>';
    }

    var options = '';
    state.missions.forEach(function(mission) {
      if (!mission.misi) return;
      var misiArray = mission.misi.split('\n').filter(function(m) { return m.trim(); });
      misiArray.forEach(function(misi, index) {
        var cleanMisi = misi.replace(/^\d+\.\s*/, '').trim();
        var value = mission.id + '|' + index + '|' + encodeURIComponent(cleanMisi);
        var selected = state.formValues.visi_misi_id === value ? ' selected' : '';
        options += '<option value="' + value + '"' + selected + '>' + truncateText(cleanMisi, 80) + '</option>';
      });
    });
    return options;
  }

  function formatPeriode(mulai, selesai) {
    if (!mulai && !selesai) return '-';
    var formatDate = function(d) {
      if (!d) return '';
      return new Date(d).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
    };
    return formatDate(mulai) + ' - ' + formatDate(selesai);
  }

  function truncateText(text, maxLength) {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  }

  function bindEvents() {
    var form = getEl('rs-form');
    if (form) form.addEventListener('submit', handleSubmit);
    
    var addBtn = getEl('rs-add-btn');
    if (addBtn) {
      addBtn.addEventListener('click', function(e) {
        e.preventDefault();
        console.log('➕ Tombol Tambah Data diklik');
        showAddForm();
      });
    }
    
    var closeBtn = getEl('rs-close-form');
    if (closeBtn) closeBtn.addEventListener('click', closeForm);
    
    var resetBtn = getEl('rs-reset-btn');
    if (resetBtn) resetBtn.addEventListener('click', resetForm);
    
    var cancelEditBtn = getEl('rs-cancel-edit');
    if (cancelEditBtn) cancelEditBtn.addEventListener('click', cancelEdit);
    
    var refreshBtn = getEl('rs-refresh-btn');
    if (refreshBtn) refreshBtn.addEventListener('click', refreshData);
    
    var exportBtn = getEl('rs-export-btn');
    if (exportBtn) exportBtn.addEventListener('click', exportData);
    
    // Bind action buttons using event delegation for better reliability
    bindActionButtons();
  }
  
  function bindActionButtons() {
    var container = getEl('rencana-strategis-content');
    if (!container) return;
    
    // Remove existing listener to prevent duplicates
    container.removeEventListener('click', handleActionClick);
    
    // Add event delegation for action buttons
    container.addEventListener('click', handleActionClick);
    
    console.log('✅ Action buttons bound with event delegation');
  }
  
  function handleActionClick(e) {
    var btn = e.target.closest('.rs-action-btn, .btn-action-view, .btn-action-edit, .btn-action-delete');
    if (!btn) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    var action = btn.getAttribute('data-action');
    var id = btn.getAttribute('data-id');
    
    console.log('🔘 Tombol aksi diklik!');
    console.log('  - Action:', action);
    console.log('  - ID:', id);
    console.log('  - Button class:', btn.className);
    
    if (!id) {
      console.error('❌ Tidak ada ID pada tombol aksi');
      return;
    }
    
    // Find record to verify it exists
    var record = state.data.find(function(i) { return i.id === id; });
    if (!record) {
      console.error('❌ Record tidak ditemukan untuk ID:', id);
      alert('Data tidak ditemukan. Silakan refresh halaman.');
      return;
    }
    
    console.log('✅ Record ditemukan:', record.nama_rencana);
    
    switch(action) {
      case 'view':
        console.log('👁️ Membuka detail view...');
        viewDetail(id);
        break;
      case 'edit':
        console.log('✏️ Memulai edit...');
        startEdit(id);
        break;
      case 'delete':
        console.log('🗑️ Memulai delete...');
        deleteRencana(id);
        break;
      default:
        console.warn('⚠️ Action tidak dikenal:', action);
    }
  }
  
  function toggleForm() {
    state.showForm = !state.showForm;
    var formBody = getEl('rs-form-body');
    var toggleBtn = getEl('rs-toggle-form');
    
    if (formBody) {
      if (state.showForm) {
        formBody.classList.remove('d-none');
        if (toggleBtn) toggleBtn.innerHTML = '<i class="fas fa-chevron-up"></i>';
      } else {
        formBody.classList.add('d-none');
        if (toggleBtn) toggleBtn.innerHTML = '<i class="fas fa-chevron-down"></i>';
      }
    }
  }
  
  function cancelEdit() {
    state.currentId = null;
    state.formValues = getDefaultForm();
    generateKode().then(function() { renderInterface(); });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    
    var formData = {
      kode: getEl('rs-kode') ? getEl('rs-kode').value : '',
      visi_misi_id: getEl('rs-misi') ? getEl('rs-misi').value : '',
      nama_rencana: getEl('rs-nama') ? getEl('rs-nama').value : '',
      deskripsi: getEl('rs-deskripsi') ? getEl('rs-deskripsi').value : '',
      periode_mulai: getEl('rs-mulai') ? getEl('rs-mulai').value : '',
      periode_selesai: getEl('rs-selesai') ? getEl('rs-selesai').value : '',
      target: getEl('rs-target') ? getEl('rs-target').value : '',
      status: getEl('rs-status') ? getEl('rs-status').value : 'Draft'
    };

    if (formData.visi_misi_id && formData.visi_misi_id.indexOf('|') !== -1) {
      formData.visi_misi_id = formData.visi_misi_id.split('|')[0];
    }

    if (!formData.nama_rencana.trim()) {
      alert('Nama rencana wajib diisi!');
      return;
    }

    try {
      var apiFunc = api();
      if (state.currentId) {
        await apiFunc('/api/rencana-strategis/' + state.currentId, { method: 'PUT', body: formData });
        alert('Data berhasil diupdate!');
      } else {
        await apiFunc('/api/rencana-strategis', { method: 'POST', body: formData });
        alert('Data berhasil disimpan!');
      }
      
      closeForm();
      await refreshData();
    } catch (error) {
      console.error('Error saving:', error);
      alert('Gagal menyimpan: ' + error.message);
    }
  }

  function showAddForm() {
    state.currentId = null;
    state.formValues = getDefaultForm();
    state.showForm = true;
    
    generateKode().then(function() {
      renderInterface();
      setTimeout(function() {
        var formSection = getEl('rs-form-section');
        var formBody = getEl('rs-form-body');
        
        // Make sure form is visible
        if (formBody && formBody.classList.contains('d-none')) {
          formBody.classList.remove('d-none');
          var toggleBtn = getEl('rs-toggle-form');
          if (toggleBtn) toggleBtn.innerHTML = '<i class="fas fa-chevron-up"></i>';
        }
        
        if (formSection) {
          formSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
        var namaInput = getEl('rs-nama');
        if (namaInput) namaInput.focus();
      }, 100);
    });
  }

  function closeForm() {
    console.log('❌ Menutup form...');
    state.showForm = false;
    state.currentId = null;
    state.formValues = getDefaultForm();
    
    var formSection = getEl('rs-form-section');
    if (formSection) {
      formSection.style.display = 'none';
    }
    
    generateKode();
    console.log('✅ Form ditutup');
  }

  function resetForm() {
    state.formValues = getDefaultForm();
    generateKode().then(function() { renderInterface(); });
  }

  async function refreshData() {
    console.log('🔄 Refreshing data...');
    
    const refreshBtn = getEl('rs-refresh-btn');
    const originalHtml = refreshBtn ? refreshBtn.innerHTML : '';
    
    try {
      // Show loading indicator on button
      if (refreshBtn) {
        refreshBtn.disabled = true;
        refreshBtn.innerHTML = '<i class="fas fa-spinner fa-spin" style="color: white !important;"></i>';
      }
      
      // Fetch fresh data
      await fetchData();
      
      // Verify data is loaded
      console.log('📊 Data setelah refresh:', { 
        jumlah: state.data.length,
        adaData: state.data.length > 0
      });
      
      // Re-render interface with verified data
      renderInterface();
      
      // Show success notification (simple alert)
      console.log('✅ Data berhasil di-refresh');
      
      // Optional: Show temporary success message
      if (refreshBtn) {
        const tempHtml = refreshBtn.innerHTML;
        refreshBtn.innerHTML = '<i class="fas fa-check" style="color: white !important;"></i> <span style="color: white !important;">Berhasil!</span>';
        setTimeout(function() {
          refreshBtn.innerHTML = originalHtml;
        }, 2000);
      }
      
    } catch (error) {
      console.error('❌ Error saat refresh data:', error);
      alert('Gagal memperbarui data: ' + error.message);
    } finally {
      // Restore button state
      if (refreshBtn) {
        refreshBtn.disabled = false;
        if (refreshBtn.innerHTML.includes('fa-spinner')) {
          refreshBtn.innerHTML = originalHtml;
        }
      }
    }
  }

  async function generateKode() {
    try {
      var apiFunc = api();
      var response = await apiFunc('/api/rencana-strategis/generate/kode/public');
      state.formValues.kode = response.kode || response;
    } catch (error) {
      var year = new Date().getFullYear();
      var random = String(Math.floor(Math.random() * 1000)).padStart(3, '0');
      state.formValues.kode = 'RS-' + year + '-' + random;
    }
  }

  function viewDetail(id) {
    var record = state.data.find(function(i) { return i.id === id; });
    if (!record) {
      console.error('Record not found for ID:', id);
      alert('Data tidak ditemukan');
      return;
    }
    
    console.log('📋 Viewing detail for:', record.nama_rencana);
    console.log('📋 Record ID:', id);
    
    // Create modal for detail view
    var modalHtml = '<div class="modal fade" id="rs-detail-modal" tabindex="-1">' +
      '<div class="modal-dialog modal-lg">' +
        '<div class="modal-content">' +
          '<div class="modal-header bg-primary text-white">' +
            '<h5 class="modal-title"><i class="fas fa-info-circle me-2"></i>Detail Rencana Strategis</h5>' +
            '<button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>' +
          '</div>' +
          '<div class="modal-body">' +
            '<div class="row g-3">' +
              '<div class="col-md-6">' +
                '<label class="form-label text-muted small">Kode</label>' +
                '<p class="fw-semibold">' + escapeHtml(record.kode || '-') + '</p>' +
              '</div>' +
              '<div class="col-md-6">' +
                '<label class="form-label text-muted small">Status</label>' +
                '<p>' + getStatusBadgeFixed(record.status) + '</p>' +
              '</div>' +
              '<div class="col-12">' +
                '<label class="form-label text-muted small">Nama Rencana</label>' +
                '<p class="fw-semibold fs-5">' + escapeHtml(record.nama_rencana || '-') + '</p>' +
              '</div>' +
              '<div class="col-md-6">' +
                '<label class="form-label text-muted small">Periode Mulai</label>' +
                '<p>' + (record.periode_mulai ? new Date(record.periode_mulai).toLocaleDateString('id-ID') : '-') + '</p>' +
              '</div>' +
              '<div class="col-md-6">' +
                '<label class="form-label text-muted small">Periode Selesai</label>' +
                '<p>' + (record.periode_selesai ? new Date(record.periode_selesai).toLocaleDateString('id-ID') : '-') + '</p>' +
              '</div>' +
              '<div class="col-12">' +
                '<label class="form-label text-muted small">Deskripsi</label>' +
                '<p class="bg-light p-3 rounded">' + escapeHtml(record.deskripsi || '-') + '</p>' +
              '</div>' +
              '<div class="col-12">' +
                '<label class="form-label text-muted small">Target</label>' +
                '<p class="bg-light p-3 rounded">' + escapeHtml(record.target || '-') + '</p>' +
              '</div>' +
            '</div>' +
          '</div>' +
          '<div class="modal-footer">' +
            '<button type="button" class="btn btn-primary rs-modal-edit-btn" data-edit-id="' + id + '" title="Edit Data" style="background: #3b82f6 !important; border: none !important;"><i class="fas fa-edit me-2"></i>Edit Data</button>' +
            '<button type="button" class="btn btn-secondary" data-bs-dismiss="modal"><i class="fas fa-times me-2"></i>Tutup</button>' +
          '</div>' +
        '</div>' +
      '</div>' +
    '</div>';
    
    // Remove existing modal if any
    var existingModal = document.getElementById('rs-detail-modal');
    if (existingModal) existingModal.remove();
    
    // Add modal to body
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    
    // Get modal element
    var modalEl = document.getElementById('rs-detail-modal');
    
    // Show modal first
    var modal = new bootstrap.Modal(modalEl);
    modal.show();
    
    // Bind edit button AFTER modal is shown
    setTimeout(function() {
      var editBtn = modalEl.querySelector('.rs-modal-edit-btn');
      if (editBtn) {
        console.log('✅ Binding edit button in modal for ID:', id);
        
        // Remove any existing listeners by cloning
        var newEditBtn = editBtn.cloneNode(true);
        editBtn.parentNode.replaceChild(newEditBtn, editBtn);
        
        // Add new listener
        newEditBtn.addEventListener('click', function(e) {
          e.preventDefault();
          e.stopPropagation();
          var editId = this.getAttribute('data-edit-id');
          console.log('🔘 Edit button clicked! ID:', editId);
          
          // Close modal
          modal.hide();
          
          // Wait for modal animation, then start edit
          setTimeout(function() {
            console.log('🚀 Starting edit for ID:', editId);
            startEdit(editId);
          }, 400);
        });
        
        console.log('✅ Edit button bound successfully');
      } else {
        console.error('❌ Edit button not found in modal');
      }
    }, 100);
    
    // Clean up modal after hidden
    modalEl.addEventListener('hidden.bs.modal', function() {
      setTimeout(function() {
        modalEl.remove();
      }, 200);
    });
  }

  function startEdit(id) {
    console.log('🔥 startEdit() dipanggil dengan ID:', id);
    
    var record = state.data.find(function(i) { return i.id === id; });
    if (!record) {
      console.error('❌ Record not found for edit, ID:', id);
      alert('Data tidak ditemukan');
      return;
    }
    
    console.log('✅ Record ditemukan:', record.nama_rencana);
    console.log('📋 Record lengkap:', JSON.stringify(record, null, 2));
    
    // Set current ID and form values
    state.currentId = id;
    state.formValues = {
      kode: record.kode || '',
      visi_misi_id: record.visi_misi_id || '',
      nama_rencana: record.nama_rencana || '',
      deskripsi: record.deskripsi || '',
      periode_mulai: record.periode_mulai ? record.periode_mulai.substring(0, 10) : '',
      periode_selesai: record.periode_selesai ? record.periode_selesai.substring(0, 10) : '',
      target: record.target || '',
      status: record.status || 'Draft'
    };
    state.showForm = true;
    
    console.log('📝 Form values di-set:', JSON.stringify(state.formValues, null, 2));
    
    // Re-render interface with form data
    console.log('🎨 Merender ulang interface dengan data edit...');
    renderInterface();
    
    // Wait for DOM to update, then ensure form is visible and populated
    setTimeout(function() {
      console.log('🔍 Verifikasi form setelah render...');
      
      var formSection = getEl('rs-form-section');
      var formBody = getEl('rs-form-body');
      
      // Make sure form is visible
      if (formSection) {
        formSection.style.display = 'block';
        console.log('📂 Form ditampilkan');
      }
      
      // Get form fields
      var kodeInput = getEl('rs-kode');
      var namaInput = getEl('rs-nama');
      var deskripsiInput = getEl('rs-deskripsi');
      var targetInput = getEl('rs-target');
      var statusSelect = getEl('rs-status');
      var misiSelect = getEl('rs-misi');
      var mulaiInput = getEl('rs-mulai');
      var selesaiInput = getEl('rs-selesai');
      
      console.log('🔍 Status form fields:');
      console.log('  - Kode input:', kodeInput ? 'FOUND (value: ' + kodeInput.value + ')' : 'NOT FOUND');
      console.log('  - Nama input:', namaInput ? 'FOUND (value: ' + namaInput.value + ')' : 'NOT FOUND');
      console.log('  - Status select:', statusSelect ? 'FOUND (value: ' + statusSelect.value + ')' : 'NOT FOUND');
      
      // If fields are empty, manually populate them
      if (namaInput && !namaInput.value) {
        console.warn('⚠️ Form fields kosong setelah render, mengisi manual...');
        if (kodeInput) kodeInput.value = state.formValues.kode;
        if (namaInput) namaInput.value = state.formValues.nama_rencana;
        if (deskripsiInput) deskripsiInput.value = state.formValues.deskripsi;
        if (targetInput) targetInput.value = state.formValues.target;
        if (statusSelect) statusSelect.value = state.formValues.status;
        if (misiSelect) misiSelect.value = state.formValues.visi_misi_id;
        if (mulaiInput) mulaiInput.value = state.formValues.periode_mulai;
        if (selesaiInput) selesaiInput.value = state.formValues.periode_selesai;
        console.log('✅ Form fields diisi manual');
      } else {
        console.log('✅ Form fields sudah terisi dari render');
      }
      
      // Scroll to form
      if (formSection) {
        console.log('📜 Scroll ke form...');
        formSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      
      // Focus on nama input
      if (namaInput) {
        namaInput.focus();
        console.log('🎯 Focus pada input nama');
      }
      
      console.log('✅ Edit form siap digunakan!');
    }, 150);
  }

  async function deleteRencana(id) {
    console.log('🗑️ Delete requested for ID:', id);
    
    if (!confirm('Apakah Anda yakin ingin menghapus rencana strategis ini?')) {
      console.log('Delete cancelled by user');
      return;
    }
    
    try {
      var apiFunc = api();
      await apiFunc('/api/rencana-strategis/' + id, { method: 'DELETE' });
      alert('Data berhasil dihapus!');
      await refreshData();
    } catch (error) {
      console.error('Error deleting:', error);
      alert('Gagal menghapus: ' + error.message);
    }
  }

  async function exportData() {
    console.log('📥 Mengunduh laporan...');
    
    const exportBtn = getEl('rs-export-btn');
    const originalHtml = exportBtn ? exportBtn.innerHTML : '';
    
    try {
      // Show loading state on button
      if (exportBtn) {
        exportBtn.disabled = true;
        exportBtn.innerHTML = '<i class="fas fa-spinner fa-spin" style="color: white !important;"></i> <span style="color: white !important;">Mengunduh...</span>';
      }
      
      // Get token
      var token = localStorage.getItem('token') || (window.currentSession?.access_token);
      var headers = {};
      
      if (token) {
        headers['Authorization'] = 'Bearer ' + token;
      }
      
      console.log('📡 Fetching export from: /api/rencana-strategis/actions/export');
      
      // Fetch export data
      var response = await fetch('/api/rencana-strategis/actions/export', { 
        method: 'GET',
        headers: headers 
      });
      
      if (!response.ok) {
        throw new Error('Gagal mengunduh laporan (HTTP ' + response.status + ')');
      }
      
      // Get blob and create download
      var blob = await response.blob();
      
      if (blob.size === 0) {
        throw new Error('File laporan kosong');
      }
      
      console.log('📦 Blob size:', blob.size, 'bytes');
      
      // Create download link
      var url = window.URL.createObjectURL(blob);
      var link = document.createElement('a');
      link.href = url;
      
      // Generate filename with date
      var tanggal = new Date().toISOString().split('T')[0];
      link.download = 'laporan-rencana-strategis-' + tanggal + '.xlsx';
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      setTimeout(function() {
        link.remove();
        window.URL.revokeObjectURL(url);
      }, 100);
      
      console.log('✅ Laporan berhasil diunduh');
      
      // Show success message on button
      if (exportBtn) {
        exportBtn.innerHTML = '<i class="fas fa-check" style="color: white !important;"></i> <span style="color: white !important;">Berhasil!</span>';
        setTimeout(function() {
          exportBtn.innerHTML = originalHtml;
        }, 2000);
      }
      
    } catch (error) {
      console.error('❌ Error saat mengunduh laporan:', error);
      alert('Gagal mengunduh laporan: ' + error.message);
    } finally {
      // Restore button state
      if (exportBtn) {
        exportBtn.disabled = false;
        if (exportBtn.innerHTML.includes('fa-spinner')) {
          exportBtn.innerHTML = originalHtml;
        }
      }
    }
  }

  function showError(message) {
    var container = getEl('rencana-strategis-content');
    if (container) {
      container.innerHTML = '<div class="alert alert-danger m-4">' +
        '<h5><i class="fas fa-exclamation-triangle me-2"></i>Error</h5>' +
        '<p class="mb-3">' + message + '</p>' +
        '<button onclick="RencanaStrategisModule.load()" class="btn btn-primary"><i class="fas fa-sync me-1"></i> Coba Lagi</button>' +
      '</div>';
    }
  }

  /**
   * Show toast notification
   */
  function showToast(message, type = 'info') {
    // Remove existing toast if any
    var existingToast = document.getElementById('rs-toast');
    if (existingToast) existingToast.remove();
    
    // Create toast element
    var bgColor = type === 'success' ? '#22c55e' : type === 'error' ? '#ef4444' : '#3b82f6';
    var icon = type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle';
    
    var toastHtml = '<div id="rs-toast" style="position: fixed; top: 20px; right: 20px; z-index: 9999; min-width: 300px; max-width: 500px; background: ' + bgColor + '; color: white; padding: 1rem 1.5rem; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); display: flex; align-items: center; gap: 0.75rem; animation: slideInRight 0.3s ease-out;">' +
      '<i class="fas fa-' + icon + ' fa-lg"></i>' +
      '<span style="flex: 1; font-weight: 500;">' + escapeHtml(message) + '</span>' +
      '<button onclick="this.parentElement.remove()" style="background: none; border: none; color: white; font-size: 1.25rem; cursor: pointer; padding: 0; line-height: 1; opacity: 0.8;" onmouseover="this.style.opacity=1" onmouseout="this.style.opacity=0.8">&times;</button>' +
    '</div>';
    
    // Add CSS animation if not exists
    if (!document.getElementById('rs-toast-style')) {
      var style = document.createElement('style');
      style.id = 'rs-toast-style';
      style.textContent = '@keyframes slideInRight { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }';
      document.head.appendChild(style);
    }
    
    // Add toast to body
    document.body.insertAdjacentHTML('beforeend', toastHtml);
    
    // Auto remove after 4 seconds
    setTimeout(function() {
      var toast = document.getElementById('rs-toast');
      if (toast) {
        toast.style.animation = 'slideInRight 0.3s ease-out reverse';
        setTimeout(function() { toast.remove(); }, 300);
      }
    }, 4000);
  }

  /**
   * Cleanup function - Called when navigating away from rencana-strategis page
   */
  function cleanup() {
    console.log('🧹 RencanaStrategisModule cleanup called');
    
    // Reset state
    state.isInitialized = false;
    state.isLoading = false;
    state.renderCount = 0;
    
    console.log('✅ RencanaStrategisModule cleanup complete');
  }

  return {
    load: load,
    viewDetail: viewDetail,
    startEdit: startEdit,
    deleteRencana: deleteRencana,
    showAddForm: showAddForm,
    refreshData: refreshData,
    exportData: exportData,
    toggleForm: toggleForm,
    resetForm: resetForm,
    cancelEdit: cancelEdit,
    cleanup: cleanup,
    state: state,
    version: MODULE_VERSION
  };
})();

// Global exports
window.RencanaStrategisModule = RencanaStrategisModule;

// Legacy function aliases for backward compatibility
window.viewDetail = function(id) { RencanaStrategisModule.viewDetail(id); };
window.startEdit = function(id) { RencanaStrategisModule.startEdit(id); };
window.deleteRencana = function(id) { RencanaStrategisModule.deleteRencana(id); };
window.editRencanaStrategis = function(id) { RencanaStrategisModule.startEdit(id); };
window.deleteRencanaStrategis = function(id) { RencanaStrategisModule.deleteRencana(id); };

// Simple load function for external calls
window.loadRencanaStrategis = function() {
  console.log('🔄 loadRencanaStrategis called');
  return RencanaStrategisModule.load();
};

console.log('✅ RencanaStrategisModule loaded and ready');
