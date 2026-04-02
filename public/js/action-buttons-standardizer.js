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
     * Standardisasi satu tombol
     */
    function standardizeButton(button) {
        // Skip jika sudah distandardisasi
        if (button.hasAttribute('data-standardized')) {
            return;
        }

        const actionType = detectActionType(button);
        if (!actionType) {
            return;
        }

        // Simpan onclick handler jika ada
        const originalOnclick = button.getAttribute('onclick');
        const originalDataId = button.getAttribute('data-id');
        const originalTitle = button.getAttribute('title') || button.textContent.trim();

        // Hapus semua class Bootstrap
        button.className = button.className
            .split(' ')
            .filter(cls => !cls.startsWith('btn-') || cls === 'btn-sm')
            .join(' ');

        // Tambah class standar
        button.classList.add('action-btn', `action-btn-${actionType}`);

        // Set warna berdasarkan tipe
        switch(actionType) {
            case 'view':
                button.style.background = '#10b981';
                button.style.color = 'white';
                break;
            case 'edit':
                button.style.background = '#3b82f6';
                button.style.color = 'white';
                break;
            case 'delete':
                button.style.background = '#ef4444';
                button.style.color = 'white';
                break;
        }

        // Cek apakah sudah ada icon
        let hasIcon = button.querySelector('i, svg');
        
        if (!hasIcon) {
            // Tambahkan icon FontAwesome
            const icon = document.createElement('i');
            icon.className = `fas ${ACTION_ICONS[actionType].fontawesome}`;
            button.innerHTML = '';
            button.appendChild(icon);
        } else {
            // Hapus teks, pertahankan icon
            const icon = button.querySelector('i, svg');
            button.innerHTML = '';
            button.appendChild(icon);
        }

        // Tambah screen reader text
        const srText = document.createElement('span');
        srText.className = 'sr-only';
        srText.textContent = originalTitle;
        button.appendChild(srText);

        // Restore attributes
        if (originalOnclick) {
            button.setAttribute('onclick', originalOnclick);
        }
        if (originalDataId) {
            button.setAttribute('data-id', originalDataId);
        }
        button.setAttribute('title', originalTitle);
        button.setAttribute('data-action', actionType);
        button.setAttribute('data-standardized', 'true');

        // Set ukuran
        button.style.minWidth = '32px';
        button.style.width = '32px';
        button.style.height = '32px';
        button.style.padding = '0';
        button.style.border = 'none';
        button.style.borderRadius = '6px';
        button.style.display = 'inline-flex';
        button.style.alignItems = 'center';
        button.style.justifyContent = 'center';
        button.style.cursor = 'pointer';
        button.style.transition = 'all 0.2s ease';
        button.style.margin = '0 2px';

        // Hover effect
        button.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-1px)';
            switch(actionType) {
                case 'view':
                    this.style.background = '#059669';
                    this.style.boxShadow = '0 4px 8px rgba(16, 185, 129, 0.3)';
                    break;
                case 'edit':
                    this.style.background = '#2563eb';
                    this.style.boxShadow = '0 4px 8px rgba(59, 130, 246, 0.3)';
                    break;
                case 'delete':
                    this.style.background = '#dc2626';
                    this.style.boxShadow = '0 4px 8px rgba(239, 68, 68, 0.3)';
                    break;
            }
        });

        button.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
            switch(actionType) {
                case 'view':
                    this.style.background = '#10b981';
                    break;
                case 'edit':
                    this.style.background = '#3b82f6';
                    break;
                case 'delete':
                    this.style.background = '#ef4444';
                    break;
            }
            this.style.boxShadow = 'none';
        });
    }

    /**
     * Standardisasi semua tombol di halaman
     */
    function standardizeAllButtons() {
        // Selector untuk tombol aksi
        const selectors = [
            '.table-actions button',
            '.action-buttons button',
            'button[class*="btn-edit"]',
            'button[class*="btn-delete"]',
            'button[class*="btn-hapus"]',
            'button[class*="btn-view"]',
            'button[class*="btn-lihat"]',
            'button[class*="btn-detail"]',
            'button[onclick*="edit"]',
            'button[onclick*="delete"]',
            'button[onclick*="hapus"]',
            'button[onclick*="view"]',
            'button[onclick*="lihat"]',
            'td button.btn-sm',
            'td button.btn-primary',
            'td button.btn-danger',
            'td button.btn-success',
            'td button.btn-info'
        ];

        const buttons = document.querySelectorAll(selectors.join(', '));
        
        buttons.forEach(button => {
            // Skip tombol yang bukan aksi (seperti tombol tambah, export, dll)
            const text = button.textContent.toLowerCase();
            const skipKeywords = ['tambah', 'add', 'export', 'import', 'download', 'upload', 'print', 'refresh', 'filter', 'search', 'cari'];
            
            if (skipKeywords.some(keyword => text.includes(keyword))) {
                return;
            }

            standardizeButton(button);
        });

        console.log(`✅ Standardisasi ${buttons.length} tombol aksi selesai`);
    }

    /**
     * Observer untuk tombol yang ditambahkan secara dinamis
     */
    function observeDynamicButtons() {
        const observer = new MutationObserver(mutations => {
            mutations.forEach(mutation => {
                mutation.addedNodes.forEach(node => {
                    if (node.nodeType === 1) { // Element node
                        // Cek apakah node itu sendiri adalah tombol
                        if (node.tagName === 'BUTTON') {
                            standardizeButton(node);
                        }
                        // Cek tombol di dalam node
                        const buttons = node.querySelectorAll('button');
                        buttons.forEach(standardizeButton);
                    }
                });
            });
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    /**
     * Inisialisasi
     */
    function init() {
        // Tunggu DOM ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                standardizeAllButtons();
                observeDynamicButtons();
            });
        } else {
            standardizeAllButtons();
            observeDynamicButtons();
        }

        // Re-standardize setelah delay (untuk konten yang dimuat async)
        setTimeout(standardizeAllButtons, 1000);
        setTimeout(standardizeAllButtons, 3000);
    }

    // Expose ke global untuk manual trigger
    window.standardizeActionButtons = standardizeAllButtons;

    // Auto-init
    init();

    console.log('🎨 Action Buttons Standardizer loaded');
})();

  // Observer untuk tombol yang ditambahkan secara dinamis
  const observer = new MutationObserver(mutations => {
    mutations.forEach(mutation => {
      if (mutation.addedNodes.length) {
        standardizeActionButtons();
      }
    });
  });

  // Mulai observe
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });

  // Export untuk digunakan manual jika diperlukan
  window.standardizeActionButtons = standardizeActionButtons;
})();
