/**
 * ARIA Label Manager
 * Mengelola aria-labels untuk semua tombol di aplikasi
 * 
 * Features:
 * - Auto-generate aria-labels untuk icon-only buttons
 * - Validate aria-labels untuk accessibility
 * - Add descriptive labels berdasarkan context
 */

class AriaLabelManager {
    constructor() {
        this.labelMap = {
            // Action labels
            'add': 'Tambah data baru',
            'edit': 'Edit data',
            'delete': 'Hapus data',
            'save': 'Simpan perubahan',
            'cancel': 'Batalkan',
            'close': 'Tutup',
            'submit': 'Kirim',
            'reset': 'Reset form',
            'search': 'Cari',
            'filter': 'Filter data',
            'refresh': 'Refresh data',
            'download': 'Download file',
            'upload': 'Upload file',
            'import': 'Import data',
            'export': 'Export data',
            'print': 'Cetak',
            'view': 'Lihat detail',
            'back': 'Kembali',
            'next': 'Selanjutnya',
            'previous': 'Sebelumnya',
            'first': 'Halaman pertama',
            'last': 'Halaman terakhir',
            
            // Icon labels
            'plus': 'Tambah',
            'pencil': 'Edit',
            'trash': 'Hapus',
            'check': 'Konfirmasi',
            'times': 'Tutup',
            'download': 'Download',
            'upload': 'Upload',
            'search': 'Cari',
            'filter': 'Filter',
            'refresh': 'Refresh',
            'eye': 'Lihat',
            'eye-slash': 'Sembunyikan',
            'chevron-left': 'Kembali',
            'chevron-right': 'Selanjutnya',
            'chevron-up': 'Ke atas',
            'chevron-down': 'Ke bawah',
            'bars': 'Menu',
            'cog': 'Pengaturan',
            'user': 'Profil pengguna',
            'bell': 'Notifikasi',
            'question-circle': 'Bantuan',
            'info-circle': 'Informasi',
            'exclamation-triangle': 'Peringatan',
            'check-circle': 'Berhasil',
            'times-circle': 'Error'
        };
        
        this.init();
    }

    init() {
        // Process semua buttons saat page load
        this.processAllButtons();
        
        // Setup MutationObserver untuk detect new buttons
        this.setupMutationObserver();
        
        console.log('✅ ARIA Label Manager initialized');
    }

    /**
     * Process semua buttons di page
     */
    processAllButtons() {
        const buttons = document.querySelectorAll('button, [role="button"], [data-action]');
        let processed = 0;
        let added = 0;
        
        buttons.forEach(button => {
            if (this.processButton(button)) {
                added++;
            }
            processed++;
        });
        
        console.log(`📋 Processed ${processed} buttons, added ${added} aria-labels`);
    }

    /**
     * Process single button
     */
    processButton(button) {
        // Skip jika sudah ada aria-label atau aria-labelledby
        if (button.hasAttribute('aria-label') || button.hasAttribute('aria-labelledby')) {
            return false;
        }

        // Check jika button memiliki visible text
        const hasVisibleText = this.hasVisibleText(button);
        
        if (!hasVisibleText) {
            // Button tidak memiliki visible text, generate aria-label
            const label = this.generateAriaLabel(button);
            
            if (label) {
                button.setAttribute('aria-label', label);
                console.log(`✅ Added aria-label to button: "${label}"`);
                return true;
            }
        }
        
        return false;
    }

    /**
     * Check jika button memiliki visible text
     */
    hasVisibleText(button) {
        // Get text content (excluding hidden elements)
        const text = Array.from(button.childNodes)
            .filter(node => {
                if (node.nodeType === Node.TEXT_NODE) {
                    return node.textContent.trim().length > 0;
                }
                if (node.nodeType === Node.ELEMENT_NODE) {
                    const style = window.getComputedStyle(node);
                    return style.display !== 'none' && 
                           style.visibility !== 'hidden' &&
                           !node.classList.contains('sr-only') &&
                           !node.classList.contains('visually-hidden');
                }
                return false;
            })
            .map(node => node.textContent)
            .join('')
            .trim();
        
        return text.length > 0;
    }

    /**
     * Generate aria-label untuk button
     */
    generateAriaLabel(button) {
        // 1. Check data-action attribute
        const action = button.getAttribute('data-action');
        if (action && this.labelMap[action]) {
            const entity = button.getAttribute('data-entity');
            if (entity) {
                return `${this.labelMap[action]} ${entity}`;
            }
            return this.labelMap[action];
        }

        // 2. Check onclick attribute
        const onclick = button.getAttribute('onclick');
        if (onclick) {
            const label = this.extractLabelFromOnclick(onclick);
            if (label) {
                return label;
            }
        }

        // 3. Check class names
        const classLabel = this.extractLabelFromClasses(button);
        if (classLabel) {
            return classLabel;
        }

        // 4. Check icon classes
        const iconLabel = this.extractLabelFromIcon(button);
        if (iconLabel) {
            return iconLabel;
        }

        // 5. Check title attribute
        const title = button.getAttribute('title');
        if (title) {
            return title;
        }

        // 6. Check parent context
        const contextLabel = this.extractLabelFromContext(button);
        if (contextLabel) {
            return contextLabel;
        }

        // 7. Fallback
        return 'Button';
    }

    /**
     * Extract label dari onclick attribute
     */
    extractLabelFromOnclick(onclick) {
        // Extract function name
        const match = onclick.match(/^(\w+)\(/);
        if (match) {
            const funcName = match[1];
            
            // Map common function names
            const funcMap = {
                'tambah': 'Tambah data',
                'add': 'Tambah data',
                'edit': 'Edit data',
                'hapus': 'Hapus data',
                'delete': 'Hapus data',
                'simpan': 'Simpan',
                'save': 'Simpan',
                'batal': 'Batalkan',
                'cancel': 'Batalkan',
                'tutup': 'Tutup',
                'close': 'Tutup',
                'download': 'Download',
                'upload': 'Upload',
                'import': 'Import',
                'export': 'Export',
                'filter': 'Filter',
                'search': 'Cari',
                'refresh': 'Refresh',
                'print': 'Cetak'
            };
            
            return funcMap[funcName.toLowerCase()];
        }
        
        return null;
    }

    /**
     * Extract label dari class names
     */
    extractLabelFromClasses(button) {
        const classes = Array.from(button.classList);
        
        // Check for action classes
        for (const cls of classes) {
            const lower = cls.toLowerCase();
            
            if (lower.includes('add') || lower.includes('tambah')) {
                return 'Tambah data';
            }
            if (lower.includes('edit')) {
                return 'Edit data';
            }
            if (lower.includes('delete') || lower.includes('hapus')) {
                return 'Hapus data';
            }
            if (lower.includes('save') || lower.includes('simpan')) {
                return 'Simpan';
            }
            if (lower.includes('cancel') || lower.includes('batal')) {
                return 'Batalkan';
            }
            if (lower.includes('close') || lower.includes('tutup')) {
                return 'Tutup';
            }
            if (lower.includes('download')) {
                return 'Download';
            }
            if (lower.includes('upload')) {
                return 'Upload';
            }
            if (lower.includes('filter')) {
                return 'Filter';
            }
            if (lower.includes('search') || lower.includes('cari')) {
                return 'Cari';
            }
            if (lower.includes('refresh')) {
                return 'Refresh';
            }
        }
        
        return null;
    }

    /**
     * Extract label dari icon
     */
    extractLabelFromIcon(button) {
        // Check for icon elements
        const icon = button.querySelector('i, svg, .icon');
        
        if (icon) {
            // Check icon classes
            const classes = Array.from(icon.classList);
            
            for (const cls of classes) {
                // Remove prefixes (fa-, fas-, far-, lucide-, etc)
                const iconName = cls.replace(/^(fa|fas|far|fab|fal|lucide|icon)-/, '');
                
                if (this.labelMap[iconName]) {
                    return this.labelMap[iconName];
                }
            }
            
            // Check data-icon attribute (Lucide icons)
            const dataIcon = icon.getAttribute('data-icon');
            if (dataIcon && this.labelMap[dataIcon]) {
                return this.labelMap[dataIcon];
            }
        }
        
        return null;
    }

    /**
     * Extract label dari context (parent elements)
     */
    extractLabelFromContext(button) {
        // Check parent table cell
        const td = button.closest('td');
        if (td) {
            const th = td.parentElement.parentElement.querySelector('th:nth-child(' + (Array.from(td.parentElement.children).indexOf(td) + 1) + ')');
            if (th) {
                const headerText = th.textContent.trim();
                if (headerText) {
                    return headerText;
                }
            }
        }
        
        // Check parent with data-label
        const labeledParent = button.closest('[data-label]');
        if (labeledParent) {
            return labeledParent.getAttribute('data-label');
        }
        
        // Check modal title
        const modal = button.closest('.modal, [role="dialog"]');
        if (modal) {
            const modalTitle = modal.querySelector('.modal-title, .modal-header h1, .modal-header h2, .modal-header h3');
            if (modalTitle) {
                const action = this.extractActionFromButton(button);
                return `${action} - ${modalTitle.textContent.trim()}`;
            }
        }
        
        return null;
    }

    /**
     * Extract action dari button
     */
    extractActionFromButton(button) {
        const classes = Array.from(button.classList);
        
        if (classes.some(c => c.includes('save') || c.includes('simpan'))) {
            return 'Simpan';
        }
        if (classes.some(c => c.includes('cancel') || c.includes('batal'))) {
            return 'Batalkan';
        }
        if (classes.some(c => c.includes('close') || c.includes('tutup'))) {
            return 'Tutup';
        }
        
        return 'Button';
    }

    /**
     * Setup MutationObserver untuk detect new buttons
     */
    setupMutationObserver() {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach(mutation => {
                mutation.addedNodes.forEach(node => {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        // Check jika node adalah button
                        if (node.matches('button, [role="button"], [data-action]')) {
                            this.processButton(node);
                        }
                        
                        // Check jika node contains buttons
                        const buttons = node.querySelectorAll('button, [role="button"], [data-action]');
                        buttons.forEach(button => this.processButton(button));
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
     * Validate aria-labels
     */
    validateAriaLabels() {
        const buttons = document.querySelectorAll('button, [role="button"], [data-action]');
        const issues = [];
        
        buttons.forEach(button => {
            const hasVisibleText = this.hasVisibleText(button);
            const hasAriaLabel = button.hasAttribute('aria-label') || button.hasAttribute('aria-labelledby');
            
            if (!hasVisibleText && !hasAriaLabel) {
                issues.push({
                    element: button,
                    issue: 'Icon-only button tanpa aria-label',
                    severity: 'ERROR'
                });
            }
            
            if (hasAriaLabel) {
                const label = button.getAttribute('aria-label');
                if (label && label.length < 3) {
                    issues.push({
                        element: button,
                        issue: 'Aria-label terlalu pendek',
                        severity: 'WARNING'
                    });
                }
            }
        });
        
        return issues;
    }

    /**
     * Generate report
     */
    generateReport() {
        const buttons = document.querySelectorAll('button, [role="button"], [data-action]');
        const withAriaLabel = Array.from(buttons).filter(b => b.hasAttribute('aria-label')).length;
        const withVisibleText = Array.from(buttons).filter(b => this.hasVisibleText(b)).length;
        const iconOnly = buttons.length - withVisibleText;
        
        const issues = this.validateAriaLabels();
        
        return {
            total: buttons.length,
            withAriaLabel,
            withVisibleText,
            iconOnly,
            issues: issues.length,
            details: issues
        };
    }
}

// Initialize ARIA Label Manager
let ariaLabelManager;

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        ariaLabelManager = new AriaLabelManager();
    });
} else {
    ariaLabelManager = new AriaLabelManager();
}

// Export untuk digunakan di module lain
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AriaLabelManager;
}
