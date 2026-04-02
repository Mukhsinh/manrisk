/**
 * Inisialisasi global untuk scroll horizontal tabel
 * File ini memastikan semua tabel di aplikasi mendapat perbaikan scroll
 */

(function() {
    'use strict';

    // Tunggu sampai DOM dan semua module lain siap
    function initGlobalTableScroll() {
        console.log('🔧 Inisialisasi global table scroll...');

        // Cari semua tabel yang belum diproses
        const tables = document.querySelectorAll('table');
        let processedCount = 0;

        tables.forEach(table => {
            // Cek apakah tabel sudah ada dalam container yang proper
            let container = table.closest('.table-container, .table-responsive');
            
            if (!container) {
                // Buat container baru jika belum ada
                const wrapper = document.createElement('div');
                wrapper.className = 'table-container';
                wrapper.style.cssText = 'overflow-x: auto; max-width: 100%; -webkit-overflow-scrolling: touch;';
                
                // Wrap tabel dengan container
                table.parentNode.insertBefore(wrapper, table);
                wrapper.appendChild(table);
                
                container = wrapper;
                processedCount++;
            }

            // Pastikan tabel memiliki min-width yang cukup
            if (!table.style.minWidth && !table.classList.contains('table-auto-width')) {
                const columnCount = table.querySelector('tr')?.children.length || 0;
                if (columnCount > 6) {
                    table.style.minWidth = 'max-content';
                }
            }

            // Tambahkan class untuk styling
            if (!table.classList.contains('table')) {
                table.classList.add('table');
            }
        });

        if (processedCount > 0) {
            console.log(`✅ ${processedCount} tabel dibungkus dengan container scroll`);
        }

        // Trigger table scroll handler jika tersedia
        if (window.TableScrollHandler) {
            window.TableScrollHandler.init();
            console.log('✅ Table scroll handler diinisialisasi');
        }
    }

    // Jalankan saat DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initGlobalTableScroll);
    } else {
        initGlobalTableScroll();
    }

    // Re-init saat ada perubahan route (untuk SPA)
    window.addEventListener('popstate', function() {
        setTimeout(initGlobalTableScroll, 300);
    });

    // Re-init saat ada perubahan hash
    window.addEventListener('hashchange', function() {
        setTimeout(initGlobalTableScroll, 300);
    });

    // Observer untuk dynamic content
    const observer = new MutationObserver(function(mutations) {
        let hasNewTable = false;
        
        mutations.forEach(function(mutation) {
            if (mutation.addedNodes.length) {
                mutation.addedNodes.forEach(function(node) {
                    if (node.nodeType === 1) {
                        if (node.tagName === 'TABLE' || node.querySelector('table')) {
                            hasNewTable = true;
                        }
                    }
                });
            }
        });

        if (hasNewTable) {
            setTimeout(initGlobalTableScroll, 100);
        }
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

    console.log('✅ Global table scroll observer aktif');

})();
