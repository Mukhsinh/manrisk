/**
 * STANDARDISASI TOMBOL AKSI - AUTOMATIC
 * Mengubah semua tombol aksi menjadi icon-only dengan warna standar
 * Hijau (Lihat), Biru (Edit), Merah (Hapus)
 */

(function() {
    'use strict';

    // Mapping kata kunci ke tipe aksi
    const ACTION_KEYWORDS = {
        view: ['view', 'lihat', 'detail', 'show', 'eye'],
        edit: ['edit', 'ubah', 'update', 'modify', 'pencil'],
        delete: ['delete', 'hapus', 'remove', 'trash']
    };

    // Icon mapping untuk setiap aksi
    const ACTION_ICONS = {
        view: {
            fontawesome: 'fa-eye',
            lucide: 'eye'
        },
        edit: {
            fontawesome: 'fa-edit',
            lucide: 'edit-2'
        },
        delete: {
            fontawesome: 'fa-trash',
            lucide: 'trash-2'
        }
    };

    /**
     * Deteksi tipe aksi dari tombol
     */
    function detectActionType(button) {
        const text = button.textContent.toLowerCase().trim();
        const className = button.className.toLowerCase();
        const onclick = (button.getAttribute('onclick') || '').toLowerCase();
        const dataAction = (button.getAttribute('data-action') || '').toLowerCase();
        
        const searchText = `${text} ${className} ${onclick} ${dataAction}`;
        
        // Cek setiap tipe aksi
        for (const [actionType, keywords] of Object.entries(ACTION_KEYWORDS)) {
            if (keywords.some(keyword => searchText.includes(keyword))) {
                return actionType;
            }
        }
        
        return null;
    }

    /**
     * Standardisasi tombol aksi
     */
    function standardizeActionButtons() {
        // Cari semua tombol dalam tabel
        const buttons = document.querySelectorAll('table button, table .btn, .table button, .table .btn');
        
        let count = 0;
        buttons.forEach(button => {
            const actionType = detectActionType(button);
            if (!actionType) return;
            
            // Simpan onclick handler
            const onclickAttr = button.getAttribute('onclick');
            
            // Tentukan warna berdasarkan tipe
            let colorClass = '';
            switch(actionType) {
                case 'view':
                    colorClass = 'btn-success';
                    break;
                case 'edit':
                    colorClass = 'btn-primary';
                    break;
                case 'delete':
                    colorClass = 'btn-danger';
                    break;
            }
            
            // Bersihkan class lama
            button.className = `btn ${colorClass} btn-sm`;
            
            // Set icon
            const icon = ACTION_ICONS[actionType];
            button.innerHTML = `<i class="fas ${icon.fontawesome}"></i>`;
            
            // Restore onclick jika ada
            if (onclickAttr) {
                button.setAttribute('onclick', onclickAttr);
            }
            
            // Set title untuk accessibility
            const titles = {
                view: 'Lihat Detail',
                edit: 'Edit',
                delete: 'Hapus'
            };
            button.setAttribute('title', titles[actionType]);
            button.setAttribute('aria-label', titles[actionType]);
            
            count++;
        });
        
        if (count > 0) {
            console.log(`[Action Buttons] Standardized ${count} action buttons`);
        }
    }

    // Jalankan saat DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', standardizeActionButtons);
    } else {
        standardizeActionButtons();
    }

    // Observer untuk tabel yang di-render dinamis
    const observer = new MutationObserver((mutations) => {
        let shouldRun = false;
        mutations.forEach(mutation => {
            if (mutation.addedNodes.length > 0) {
                mutation.addedNodes.forEach(node => {
                    if (node.nodeType === 1 && (
                        node.tagName === 'TABLE' ||
                        node.querySelector && node.querySelector('table')
                    )) {
                        shouldRun = true;
                    }
                });
            }
        });
        
        if (shouldRun) {
            setTimeout(standardizeActionButtons, 100);
        }
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

    // Export untuk digunakan manual jika diperlukan
    window.standardizeActionButtons = standardizeActionButtons;
})();
