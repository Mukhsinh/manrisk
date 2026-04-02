/**
 * AUTOMATIC BUTTON STANDARDIZATION
 * Menerapkan class standardisasi secara otomatis ke semua tombol
 * Berjalan saat halaman dimuat dan saat konten dinamis ditambahkan
 */

(function() {
    'use strict';

    // Fungsi untuk menstandarisasi tombol
    function standardizeButtons() {
        console.log('[Button Standardization] Memulai standardisasi tombol...');

        // ============================================
        // STANDARDISASI TOMBOL DI ATAS TABEL
        // ============================================
        
        // Tombol Refresh
        const refreshButtons = document.querySelectorAll(
            'button[onclick*="refresh"], button[onclick*="loadData"], ' +
            'button[title*="Refresh"], button[title*="refresh"], ' +
            '.btn-refresh, #btnRefresh, #btn-refresh'
        );
        refreshButtons.forEach(btn => {
            if (!btn.classList.contains('btn-refresh')) {
                btn.classList.add('btn-refresh');
            }
            // Pastikan ada ikon
            if (!btn.querySelector('i') && !btn.querySelector('svg')) {
                const icon = document.createElement('i');
                icon.className = 'fas fa-sync-alt';
                btn.insertBefore(icon, btn.firstChild);
            }
        });

        // Tombol Download/Unduh/Export
        const downloadButtons = document.querySelectorAll(
            'button[onclick*="download"], button[onclick*="export"], button[onclick*="unduh"], ' +
            'button[title*="Download"], button[title*="Unduh"], button[title*="Export"], ' +
            '.btn-download, .btn-unduh, .btn-export, #btnDownload, #btn-download'
        );
        downloadButtons.forEach(btn => {
            if (!btn.classList.contains('btn-download')) {
                btn.classList.add('btn-download');
            }
            // Pastikan ada ikon
            if (!btn.querySelector('i') && !btn.querySelector('svg')) {
                const icon = document.createElement('i');
                icon.className = 'fas fa-download';
                btn.insertBefore(icon, btn.firstChild);
            }
        });

        // Tombol Tambah/Add
        const addButtons = document.querySelectorAll(
            'button[onclick*="tambah"], button[onclick*="create"], button[onclick*="add"], ' +
            'button[title*="Tambah"], button[title*="Add"], button[title*="Create"], ' +
            '.btn-tambah, .btn-add, .btn-new, #btnTambah, #btn-tambah'
        );
        addButtons.forEach(btn => {
            if (!btn.classList.contains('btn-tambah')) {
                btn.classList.add('btn-tambah');
            }
            // Pastikan ada ikon
            if (!btn.querySelector('i') && !btn.querySelector('svg')) {
                const icon = document.createElement('i');
                icon.className = 'fas fa-plus';
                btn.insertBefore(icon, btn.firstChild);
            }
        });

        // Tombol Print/Cetak
        const printButtons = document.querySelectorAll(
            'button[onclick*="print"], button[onclick*="cetak"], ' +
            'button[title*="Print"], button[title*="Cetak"], ' +
            '.btn-print, .btn-cetak, #btnPrint, #btn-print'
        );
        printButtons.forEach(btn => {
            if (!btn.classList.contains('btn-print')) {
                btn.classList.add('btn-print');
            }
            // Pastikan ada ikon
            if (!btn.querySelector('i') && !btn.querySelector('svg')) {
                const icon = document.createElement('i');
                icon.className = 'fas fa-print';
                btn.insertBefore(icon, btn.firstChild);
            }
        });

        // Tombol Filter
        const filterButtons = document.querySelectorAll(
            'button[onclick*="filter"], button[title*="Filter"], ' +
            '.btn-filter, #btnFilter, #btn-filter'
        );
        filterButtons.forEach(btn => {
            if (!btn.classList.contains('btn-filter')) {
                btn.classList.add('btn-filter');
            }
            // Pastikan ada ikon
            if (!btn.querySelector('i') && !btn.querySelector('svg')) {
                const icon = document.createElement('i');
                icon.className = 'fas fa-filter';
                btn.insertBefore(icon, btn.firstChild);
            }
        });

        // ============================================
        // STANDARDISASI TOMBOL DI KOLOM AKSI
        // ============================================

        // Cari semua tombol di dalam kolom tabel
        const tableCells = document.querySelectorAll('td, td.aksi, td.action, td.actions, td[class*="aksi"], td[class*="action"]');
        
        tableCells.forEach(cell => {
            const buttons = cell.querySelectorAll('button, a.btn');
            
            buttons.forEach(btn => {
                const onclick = btn.getAttribute('onclick') || '';
                const title = btn.getAttribute('title') || '';
                const className = btn.className || '';
                const text = btn.textContent.toLowerCase();

                // Tombol Edit
                if (
                    onclick.includes('edit') || 
                    title.toLowerCase().includes('edit') ||
                    className.includes('edit') ||
                    text.includes('edit') ||
                    text.includes('ubah')
                ) {
                    if (!btn.classList.contains('btn-edit')) {
                        btn.classList.add('btn-edit');
                    }
                    // Pastikan ada ikon
                    if (!btn.querySelector('i') && !btn.querySelector('svg')) {
                        btn.innerHTML = '<i class="fas fa-edit"></i>';
                    }
                    // Set title jika belum ada
                    if (!btn.getAttribute('title')) {
                        btn.setAttribute('title', 'Edit');
                    }
                }
                
                // Tombol View/Lihat/Detail
                else if (
                    onclick.includes('view') || 
                    onclick.includes('lihat') || 
                    onclick.includes('detail') ||
                    title.toLowerCase().includes('view') ||
                    title.toLowerCase().includes('lihat') ||
                    title.toLowerCase().includes('detail') ||
                    className.includes('view') ||
                    className.includes('lihat') ||
                    className.includes('detail') ||
                    text.includes('view') ||
                    text.includes('lihat') ||
                    text.includes('detail')
                ) {
                    if (!btn.classList.contains('btn-view')) {
                        btn.classList.add('btn-view');
                    }
                    // Pastikan ada ikon
                    if (!btn.querySelector('i') && !btn.querySelector('svg')) {
                        btn.innerHTML = '<i class="fas fa-eye"></i>';
                    }
                    // Set title jika belum ada
                    if (!btn.getAttribute('title')) {
                        btn.setAttribute('title', 'Lihat Detail');
                    }
                }
                
                // Tombol Delete/Hapus
                else if (
                    onclick.includes('delete') || 
                    onclick.includes('hapus') || 
                    onclick.includes('remove') ||
                    title.toLowerCase().includes('delete') ||
                    title.toLowerCase().includes('hapus') ||
                    title.toLowerCase().includes('remove') ||
                    className.includes('delete') ||
                    className.includes('hapus') ||
                    className.includes('remove') ||
                    text.includes('delete') ||
                    text.includes('hapus') ||
                    text.includes('remove')
                ) {
                    if (!btn.classList.contains('btn-delete')) {
                        btn.classList.add('btn-delete');
                    }
                    // Pastikan ada ikon
                    if (!btn.querySelector('i') && !btn.querySelector('svg')) {
                        btn.innerHTML = '<i class="fas fa-trash"></i>';
                    }
                    // Set title jika belum ada
                    if (!btn.getAttribute('title')) {
                        btn.setAttribute('title', 'Hapus');
                    }
                }
            });
        });

        // ============================================
        // STANDARDISASI BADGE STATUS
        // ============================================

        const badges = document.querySelectorAll('span.badge, .status-badge, td span[class*="badge"]');
        badges.forEach(badge => {
            const text = badge.textContent.toLowerCase();
            
            if (text.includes('aktif') && !text.includes('non')) {
                if (!badge.classList.contains('badge-aktif')) {
                    badge.classList.add('badge-aktif');
                }
            } else if (text.includes('non-aktif') || text.includes('nonaktif') || text.includes('inactive')) {
                if (!badge.classList.contains('badge-nonaktif')) {
                    badge.classList.add('badge-nonaktif');
                }
            }
        });

        console.log('[Button Standardization] Standardisasi selesai');
        console.log(`- Tombol Refresh: ${refreshButtons.length}`);
        console.log(`- Tombol Download: ${downloadButtons.length}`);
        console.log(`- Tombol Tambah: ${addButtons.length}`);
        console.log(`- Tombol Print: ${printButtons.length}`);
        console.log(`- Tombol Filter: ${filterButtons.length}`);
        console.log(`- Badge: ${badges.length}`);
    }

    // ============================================
    // MUTATION OBSERVER
    // Untuk mendeteksi perubahan DOM dinamis
    // ============================================

    function setupMutationObserver() {
        const observer = new MutationObserver((mutations) => {
            let shouldStandardize = false;
            
            mutations.forEach((mutation) => {
                if (mutation.addedNodes.length > 0) {
                    mutation.addedNodes.forEach((node) => {
                        if (node.nodeType === 1) { // Element node
                            if (node.tagName === 'BUTTON' || 
                                node.querySelector('button') ||
                                node.tagName === 'TABLE' ||
                                node.querySelector('table')) {
                                shouldStandardize = true;
                            }
                        }
                    });
                }
            });
            
            if (shouldStandardize) {
                console.log('[Button Standardization] Konten baru terdeteksi, menjalankan standardisasi...');
                setTimeout(standardizeButtons, 100);
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });

        console.log('[Button Standardization] Mutation Observer aktif');
    }

    // ============================================
    // INITIALIZATION
    // ============================================

    function init() {
        console.log('[Button Standardization] Inisialisasi...');
        
        // Jalankan standardisasi pertama kali
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                standardizeButtons();
                setupMutationObserver();
            });
        } else {
            standardizeButtons();
            setupMutationObserver();
        }

        // Jalankan ulang setelah AJAX/fetch selesai
        const originalFetch = window.fetch;
        window.fetch = function(...args) {
            return originalFetch.apply(this, args).then(response => {
                setTimeout(standardizeButtons, 200);
                return response;
            });
        };

        // Jalankan ulang setelah jQuery AJAX (jika ada)
        if (window.jQuery) {
            jQuery(document).ajaxComplete(function() {
                setTimeout(standardizeButtons, 200);
            });
        }

        console.log('[Button Standardization] Inisialisasi selesai');
    }

    // Jalankan inisialisasi
    init();

    // Export fungsi untuk digunakan manual jika diperlukan
    window.standardizeButtons = standardizeButtons;

})();
