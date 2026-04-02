/**
 * Error Help System
 * Sistem untuk menyediakan help links dan troubleshooting tips untuk errors
 */

const ErrorHelpLinks = {
    HANDLER_NOT_FOUND: {
        documentationUrl: '/docs/troubleshooting#handler-not-found',
        supportUrl: '/support',
        troubleshootingSteps: [
            'Refresh halaman dan coba lagi',
            'Clear cache browser Anda',
            'Pastikan Anda menggunakan browser versi terbaru',
            'Hubungi administrator jika masalah berlanjut'
        ],
        relatedArticles: [
            { title: 'Mengatasi Tombol yang Tidak Berfungsi', url: '/docs/button-issues' },
            { title: 'Panduan Troubleshooting Umum', url: '/docs/general-troubleshooting' }
        ]
    },
    API_ERROR: {
        documentationUrl: '/docs/troubleshooting#api-error',
        supportUrl: '/support',
        troubleshootingSteps: [
            'Tunggu beberapa saat dan coba lagi',
            'Periksa status server di halaman status',
            'Pastikan koneksi internet Anda stabil',
            'Hubungi administrator jika error berlanjut'
        ],
        relatedArticles: [
            { title: 'Mengatasi Error Server', url: '/docs/server-errors' },
            { title: 'Status Sistem', url: '/status' }
        ]
    },
    VALIDATION_ERROR: {
        documentationUrl: '/docs/troubleshooting#validation-error',
        supportUrl: '/support',
        troubleshootingSteps: [
            'Periksa kembali data yang Anda masukkan',
            'Pastikan semua field required terisi',
            'Pastikan format data sesuai (email, nomor telepon, dll)',
            'Lihat pesan error spesifik untuk detail'
        ],
        relatedArticles: [
            { title: 'Panduan Validasi Data', url: '/docs/data-validation' },
            { title: 'Format Data yang Benar', url: '/docs/data-formats' }
        ]
    },
    NETWORK_ERROR: {
        documentationUrl: '/docs/troubleshooting#network-error',
        supportUrl: '/support',
        troubleshootingSteps: [
            'Periksa koneksi internet Anda',
            'Coba refresh halaman',
            'Periksa apakah firewall memblokir koneksi',
            'Coba gunakan jaringan yang berbeda'
        ],
        relatedArticles: [
            { title: 'Mengatasi Masalah Koneksi', url: '/docs/connection-issues' },
            { title: 'Konfigurasi Jaringan', url: '/docs/network-config' }
        ]
    },
    PERMISSION_ERROR: {
        documentationUrl: '/docs/troubleshooting#permission-error',
        supportUrl: '/support',
        troubleshootingSteps: [
            'Pastikan Anda login dengan akun yang benar',
            'Periksa role dan permission akun Anda',
            'Hubungi administrator untuk request akses',
            'Logout dan login kembali'
        ],
        relatedArticles: [
            { title: 'Panduan Permission dan Role', url: '/docs/permissions' },
            { title: 'Request Akses', url: '/docs/access-request' }
        ]
    },
    UNKNOWN_ERROR: {
        documentationUrl: '/docs/troubleshooting#unknown-error',
        supportUrl: '/support',
        troubleshootingSteps: [
            'Refresh halaman dan coba lagi',
            'Clear cache dan cookies browser',
            'Coba gunakan browser yang berbeda',
            'Hubungi support dengan detail error'
        ],
        relatedArticles: [
            { title: 'Panduan Troubleshooting Umum', url: '/docs/general-troubleshooting' },
            { title: 'Cara Melaporkan Bug', url: '/docs/bug-report' }
        ]
    }
};

class ErrorHelpSystem {
    /**
     * Dapatkan help information untuk error category
     */
    getHelpInfo(errorCategory) {
        return ErrorHelpLinks[errorCategory] || ErrorHelpLinks.UNKNOWN_ERROR;
    }

    /**
     * Generate help section HTML
     */
    generateHelpSection(errorCategory) {
        const helpInfo = this.getHelpInfo(errorCategory);
        
        return `
            <div class="error-help-section">
                <h5 class="error-help-title">
                    <i data-lucide="help-circle"></i>
                    Cara Mengatasi
                </h5>
                
                <div class="error-troubleshooting">
                    <ol class="troubleshooting-steps">
                        ${helpInfo.troubleshootingSteps.map(step => 
                            `<li>${step}</li>`
                        ).join('')}
                    </ol>
                </div>

                <div class="error-help-links">
                    <a href="${helpInfo.documentationUrl}" class="help-link" target="_blank">
                        <i data-lucide="book-open"></i>
                        Lihat Dokumentasi
                    </a>
                    <a href="${helpInfo.supportUrl}" class="help-link" target="_blank">
                        <i data-lucide="message-circle"></i>
                        Hubungi Support
                    </a>
                </div>

                ${helpInfo.relatedArticles.length > 0 ? `
                    <div class="error-related-articles">
                        <h6>Artikel Terkait:</h6>
                        <ul>
                            ${helpInfo.relatedArticles.map(article => 
                                `<li><a href="${article.url}" target="_blank">${article.title}</a></li>`
                            ).join('')}
                        </ul>
                    </div>
                ` : ''}
            </div>
        `;
    }

    /**
     * Show help modal
     */
    showHelpModal(errorCategory, errorMessage) {
        const helpInfo = this.getHelpInfo(errorCategory);
        
        const modal = document.createElement('div');
        modal.className = 'error-help-modal';
        modal.innerHTML = `
            <div class="error-help-modal-overlay"></div>
            <div class="error-help-modal-content">
                <div class="error-help-modal-header">
                    <h4>Bantuan: ${errorMessage.title}</h4>
                    <button class="error-help-modal-close" aria-label="Tutup">
                        <i data-lucide="x"></i>
                    </button>
                </div>
                <div class="error-help-modal-body">
                    <p class="error-description">${errorMessage.message}</p>
                    ${this.generateHelpSection(errorCategory)}
                </div>
                <div class="error-help-modal-footer">
                    <button class="btn btn-secondary error-help-modal-close">Tutup</button>
                    <a href="${helpInfo.supportUrl}" class="btn btn-primary" target="_blank">
                        Hubungi Support
                    </a>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Initialize Lucide icons
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }

        // Close handlers
        const closeButtons = modal.querySelectorAll('.error-help-modal-close');
        closeButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                modal.remove();
            });
        });

        modal.querySelector('.error-help-modal-overlay').addEventListener('click', () => {
            modal.remove();
        });
    }

    /**
     * Add help button ke error message
     */
    addHelpButton(errorElement, errorCategory, errorMessage) {
        const helpButton = document.createElement('button');
        helpButton.className = 'btn-help';
        helpButton.innerHTML = '<i data-lucide="help-circle"></i> Bantuan';
        
        helpButton.addEventListener('click', () => {
            this.showHelpModal(errorCategory, errorMessage);
        });

        errorElement.querySelector('.error-content').appendChild(helpButton);

        // Initialize Lucide icons
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }

    /**
     * Generate quick tips tooltip
     */
    generateQuickTips(errorCategory) {
        const helpInfo = this.getHelpInfo(errorCategory);
        const firstTwoSteps = helpInfo.troubleshootingSteps.slice(0, 2);
        
        return `
            <div class="error-quick-tips">
                <strong>Quick Tips:</strong>
                <ul>
                    ${firstTwoSteps.map(step => `<li>${step}</li>`).join('')}
                </ul>
            </div>
        `;
    }
}

// Create global instance
const errorHelpSystem = new ErrorHelpSystem();

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ErrorHelpSystem, errorHelpSystem, ErrorHelpLinks };
}
