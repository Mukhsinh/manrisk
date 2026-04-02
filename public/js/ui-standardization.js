/**
 * UI Standardization JS - v1.0
 * Standarisasi tombol aksi, ikon Lucide, judul halaman, overflow prevention
 * Menggunakan MutationObserver untuk konten dinamis
 */
(function () {
  'use strict';

  // ============================================================
  // 2.1 ICON MAPPING
  // ============================================================
  const PAGE_ICONS = {
    'dashboard': 'layout-dashboard',
    'visi-misi': 'eye',
    'analisis-swot': 'bar-chart-2',
    'inventarisasi-swot': 'list',
    'matriks-tows': 'grid',
    'diagram-kartesius': 'crosshair',
    'sasaran-strategi': 'target',
    'indikator-kinerja-utama': 'activity',
    'evaluasi-iku': 'check-square',
    'strategic-map': 'map',
    'rencana-strategis': 'map',
    'renstra': 'book',
    'risk-input': 'alert-triangle',
    'risk-register': 'clipboard-list',
    'risk-profile': 'shield',
    'kri': 'trending-up',
    'ews': 'bell',
    'residual-risk': 'shield-check',
    'monitoring-evaluasi': 'check-square',
    'peluang': 'star',
    'laporan': 'file-text',
    'buku-pedoman': 'book-open',
    'master-data': 'database',
    'pengaturan': 'settings',
    'user-management': 'users',
    'ai-assistant': 'bot'
  };

  const ACTION_ICONS = {
    'edit': 'pencil',
    'delete': 'trash-2',
    'hapus': 'trash-2',
    'view': 'eye',
    'lihat': 'eye',
    'detail': 'eye',
    'add': 'plus',
    'tambah': 'plus',
    'save': 'save',
    'simpan': 'save',
    'download': 'download',
    'unduh': 'download',
    'print': 'printer',
    'cetak': 'printer',
    'approve': 'check-circle',
    'reject': 'x-circle',
    'refresh': 'refresh-cw',
    'upload': 'upload',
    'import': 'upload',
    'export': 'download',
    'search': 'search',
    'filter': 'filter',
    'close': 'x',
    'cancel': 'x',
    'batal': 'x',
    'info': 'info',
    'warning': 'alert-triangle',
    'history': 'clock',
    'copy': 'copy',
    'link': 'link',
    'chart': 'bar-chart-2',
    'report': 'file-text'
  };

  // Mapping class tombol ke tipe aksi
  const BUTTON_CLASS_MAP = {
    'btn-edit': 'edit',
    'btn-delete': 'delete',
    'btn-hapus': 'hapus',
    'btn-view': 'view',
    'btn-lihat': 'lihat',
    'btn-detail': 'detail',
    'btn-tambah': 'add',
    'btn-add': 'add',
    'btn-save': 'save',
    'btn-simpan': 'simpan',
    'btn-download': 'download',
    'btn-unduh': 'unduh',
    'btn-export': 'export',
    'btn-import': 'import',
    'btn-print': 'print',
    'btn-cetak': 'cetak',
    'btn-refresh': 'refresh',
    'btn-approve': 'approve',
    'btn-reject': 'reject',
    'ss-btn-edit': 'edit',
    'ss-btn-delete': 'delete',
    'action-btn-edit': 'edit',
    'action-btn-delete': 'delete',
    'action-btn-view': 'view',
    'btn-action-edit': 'edit',
    'btn-action-delete': 'delete',
    'btn-action-view': 'view',
    'btn-action-warning': 'warning'
  };

  // ============================================================
  // 2.2 APPLY ACTION BUTTON STYLES
  // ============================================================
  function applyActionButtonStyles(container) {
    const root = container || document;

    // Scan semua tombol di dalam td (kolom aksi) - lebih luas
    root.querySelectorAll('td button, td a.btn, td .btn, td [class*="btn-"], .action-buttons button, .table-actions button, .aksi button').forEach(btn => {
      // Reset jika masih ada FA icons (perlu di-update)
      const hasFaIcon = btn.querySelector('i.fas, i.far, i.fab, i[class*="fa-"]');
      if (btn.dataset.uiStd && !hasFaIcon) return;

      const classes = Array.from(btn.classList);
      let actionType = null;

      // Deteksi tipe dari class
      for (const cls of classes) {
        if (BUTTON_CLASS_MAP[cls]) {
          actionType = BUTTON_CLASS_MAP[cls];
          break;
        }
      }

      // Deteksi dari teks tombol jika belum ketemu
      if (!actionType) {
        const text = btn.textContent.trim().toLowerCase();
        if (text.includes('edit') || text.includes('ubah')) actionType = 'edit';
        else if (text.includes('hapus') || text.includes('delete')) actionType = 'hapus';
        else if (text.includes('lihat') || text.includes('detail') || text.includes('view')) actionType = 'view';
        else if (text.includes('tambah') || text.includes('add')) actionType = 'add';
        else if (text.includes('simpan') || text.includes('save')) actionType = 'save';
      }

      // Inject ikon
      if (actionType && ACTION_ICONS[actionType]) {
        injectIconToButton(btn, ACTION_ICONS[actionType]);
      } else if (hasFaIcon) {
        // Hapus FA icon meski tidak tahu tipe
        hasFaIcon && btn.querySelectorAll('i.fas, i.far, i.fab').forEach(fa => fa.remove());
      }

      btn.dataset.uiStd = '1';
    });

    // Scan tombol toolbar (tambah, download, dll)
    root.querySelectorAll('.btn-tambah, .btn-add, .btn-download, .btn-export, .btn-import, .btn-template, .btn-unduh, .btn-cetak, .btn-print').forEach(btn => {
      const hasFaIcon = btn.querySelector('i.fas, i.far, i.fab');
      if (btn.dataset.uiStd && !hasFaIcon) return;

      const classes = Array.from(btn.classList);
      let actionType = null;
      for (const cls of classes) {
        if (BUTTON_CLASS_MAP[cls]) {
          actionType = BUTTON_CLASS_MAP[cls];
          break;
        }
      }

      if (actionType && ACTION_ICONS[actionType]) {
        injectIconToButton(btn, ACTION_ICONS[actionType]);
      }

      btn.dataset.uiStd = '1';
    });
  }

  /**
   * Inject ikon Lucide ke dalam tombol - ganti FA jika ada
   */
  function injectIconToButton(btn, iconName) {
    // Hapus ikon Font Awesome yang ada dan ganti dengan Lucide
    const faIcons = btn.querySelectorAll('i.fas, i.far, i.fab, i[class*="fa-"]');
    faIcons.forEach(fa => fa.remove());

    // Cek apakah sudah ada ikon Lucide
    const hasLucide = btn.querySelector('i[data-lucide], svg[data-lucide]');
    if (hasLucide) return;

    // Buat elemen ikon Lucide
    const icon = document.createElement('i');
    icon.setAttribute('data-lucide', iconName);
    icon.style.cssText = 'width:14px;height:14px;flex-shrink:0;display:inline-block;vertical-align:middle;';

    // Insert di awal tombol
    btn.insertBefore(icon, btn.firstChild);

    // Render ikon jika Lucide tersedia
    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      try {
        window.lucide.createIcons({ nodes: [icon] });
      } catch (e) {
        // Fallback: akan di-render saat lucide.createIcons() dipanggil global
      }
    }
  }

  // ============================================================
  // 2.4 APPLY PAGE TITLES
  // ============================================================
  function applyPageTitles(container) {
    const root = container || document;

    // Cari semua elemen judul halaman
    root.querySelectorAll('.page-title, h1.page-title, .page-header h1').forEach(titleEl => {
      if (titleEl.dataset.uiTitleStd) return;

      // Deteksi halaman dari parent page-content
      const pageContent = titleEl.closest('.page-content, [id]');
      const pageId = pageContent ? (pageContent.id || '') : '';
      const iconName = PAGE_ICONS[pageId] || detectPageIconFromTitle(titleEl.textContent);

      if (iconName) {
        // Cek apakah sudah ada ikon
        const hasIcon = titleEl.querySelector('i[data-lucide], svg, i.fas, i.far');
        if (!hasIcon) {
          const icon = document.createElement('i');
          icon.setAttribute('data-lucide', iconName);
          icon.className = 'page-title-icon';
          icon.style.cssText = 'width:22px;height:22px;flex-shrink:0;color:#8B0000;';
          titleEl.insertBefore(icon, titleEl.firstChild);

          if (window.lucide && typeof window.lucide.createIcons === 'function') {
            try { window.lucide.createIcons({ nodes: [icon] }); } catch (e) {}
          }
        }
      }

      titleEl.dataset.uiTitleStd = '1';
    });
  }

  /**
   * Deteksi ikon dari teks judul
   */
  function detectPageIconFromTitle(text) {
    const t = text.toLowerCase();
    if (t.includes('dashboard')) return 'layout-dashboard';
    if (t.includes('visi') || t.includes('misi')) return 'eye';
    if (t.includes('swot')) return 'bar-chart-2';
    if (t.includes('tows')) return 'grid';
    if (t.includes('kartesius') || t.includes('diagram')) return 'crosshair';
    if (t.includes('sasaran')) return 'target';
    if (t.includes('indikator') || t.includes('iku')) return 'activity';
    if (t.includes('evaluasi')) return 'check-square';
    if (t.includes('strategic map') || t.includes('peta')) return 'map';
    if (t.includes('rencana strategis') || t.includes('renstra')) return 'map';
    if (t.includes('risk input') || t.includes('input risiko')) return 'alert-triangle';
    if (t.includes('risk register') || t.includes('register')) return 'clipboard-list';
    if (t.includes('risk profile') || t.includes('profil')) return 'shield';
    if (t.includes('kri')) return 'trending-up';
    if (t.includes('ews')) return 'bell';
    if (t.includes('residual')) return 'shield-check';
    if (t.includes('monitoring')) return 'check-square';
    if (t.includes('peluang')) return 'star';
    if (t.includes('laporan')) return 'file-text';
    if (t.includes('buku') || t.includes('pedoman')) return 'book-open';
    if (t.includes('master') || t.includes('data')) return 'database';
    if (t.includes('pengaturan') || t.includes('setting')) return 'settings';
    if (t.includes('pengguna') || t.includes('user')) return 'users';
    return 'layout-dashboard';
  }

  // ============================================================
  // OVERFLOW PREVENTION - Wrap tabel yang belum punya wrapper
  // ============================================================
  function applyTableOverflowFix(container) {
    const root = container || document;

    root.querySelectorAll('table').forEach(table => {
      if (table.dataset.uiOverflowStd) return;

      const parent = table.parentElement;
      if (!parent) return;

      // Cek apakah parent sudah punya overflow-x
      const parentStyle = window.getComputedStyle(parent);
      const hasOverflow = parentStyle.overflowX === 'auto' || parentStyle.overflowX === 'scroll';
      const hasClass = parent.classList.contains('table-responsive') ||
                       parent.classList.contains('table-container') ||
                       parent.classList.contains('data-table-container');

      if (!hasOverflow && !hasClass) {
        parent.style.overflowX = 'auto';
        parent.style.webkitOverflowScrolling = 'touch';
        parent.style.maxWidth = '100%';
      }

      table.dataset.uiOverflowStd = '1';
    });
  }

  // ============================================================
  // RENDER LUCIDE ICONS
  // ============================================================
  function renderLucideIcons() {
    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      try {
        window.lucide.createIcons();
      } catch (e) {
        console.warn('[UI-Std] Lucide createIcons error:', e);
      }
    }
  }

  // ============================================================
  // APPLY ALL - Jalankan semua standarisasi
  // ============================================================
  function applyAll(container) {
    applyActionButtonStyles(container);
    applyPageTitles(container);
    applyTableOverflowFix(container);
    renderLucideIcons();
  }

  // ============================================================
  // 2.6 MUTATION OBSERVER - Konten dinamis
  // ============================================================
  let observerTimer = null;

  const observer = new MutationObserver((mutations) => {
    let hasRelevantChange = false;

    for (const mutation of mutations) {
      if (mutation.addedNodes.length > 0) {
        for (const node of mutation.addedNodes) {
          if (node.nodeType === 1) {
            const tag = node.tagName;
            // Proses semua perubahan DOM yang signifikan
            if (tag === 'TABLE' || tag === 'BUTTON' || tag === 'TR' || tag === 'TD' ||
                tag === 'DIV' || tag === 'SECTION' ||
                node.querySelector && (
                  node.querySelector('table') ||
                  node.querySelector('button') ||
                  node.querySelector('.page-title') ||
                  node.querySelector('[class*="btn-"]') ||
                  node.querySelector('i.fas') ||
                  node.querySelector('i.far')
                )) {
              hasRelevantChange = true;
              break;
            }
          }
        }
      }
      if (hasRelevantChange) break;
    }

    if (hasRelevantChange) {
      clearTimeout(observerTimer);
      observerTimer = setTimeout(() => applyAll(), 100);
    }
  });

  // ============================================================
  // INIT
  // ============================================================
  function init() {
    // Jalankan pertama kali
    applyAll();

    // Jalankan lagi setelah delay untuk konten yang di-render lambat
    setTimeout(() => applyAll(), 300);
    setTimeout(() => applyAll(), 800);
    setTimeout(() => applyAll(), 1500);
    setTimeout(() => applyAll(), 3000);

    // Tunggu Lucide tersedia lalu render ulang
    function waitForLucide(attempts) {
      if (window.lucide && typeof window.lucide.createIcons === 'function') {
        renderLucideIcons();
        // Jalankan applyAll lagi setelah Lucide siap
        applyAll();
        setTimeout(() => applyAll(), 500);
      } else if (attempts > 0) {
        setTimeout(() => waitForLucide(attempts - 1), 200);
      }
    }
    waitForLucide(20);

    // Start observer
    if (document.body) {
      observer.observe(document.body, {
        childList: true,
        subtree: true
      });
    }

    // Listen untuk navigasi halaman
    window.addEventListener('popstate', () => setTimeout(() => applyAll(), 300));

    // Listen untuk custom events dari modul
    document.addEventListener('moduleLoaded', () => setTimeout(() => applyAll(), 200));
    document.addEventListener('tableRendered', () => setTimeout(() => applyAll(), 100));

    // Expose API global
    window.UIStandardization = {
      applyAll,
      applyActionButtonStyles,
      applyPageTitles,
      applyTableOverflowFix,
      renderLucideIcons,
      PAGE_ICONS,
      ACTION_ICONS
    };

    console.log('[UI-Std] Initialized v1.1');
  }

  // Start
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Juga jalankan saat window load (untuk konten yang di-load async)
  window.addEventListener('load', () => {
    setTimeout(() => applyAll(), 100);
    setTimeout(() => applyAll(), 500);
    setTimeout(() => applyAll(), 1000);
  });

})();
