/**
 * Download Integration Script
 * Mengintegrasikan enhanced download system ke seluruh aplikasi
 */

(function() {
    'use strict';

    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeDownloadSystem);
    } else {
        initializeDownloadSystem();
    }

    function initializeDownloadSystem() {
        console.log('🚀 Initializing Enhanced Download System...');

        // Add download attributes to existing buttons
        enhanceExistingButtons();
        
        // Setup automatic download handling
        setupAutomaticHandling();
        
        // Add global styles if not present
        addGlobalStyles();
        
        console.log('✅ Enhanced Download System ready!');
    }

    function enhanceExistingButtons() {
        // Find and enhance existing download buttons
        const downloadSelectors = [
            'a[href*="excel"]',
            'a[href*="export"]', 
            'a[href*="download"]',
            'button[onclick*="download"]',
            'button[onclick*="export"]',
            '.btn-download',
            '.download-btn',
            '.export-btn'
        ];

        downloadSelectors.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            elements.forEach(element => {
                if (!element.hasAttribute('data-download')) {
                    enhanceDownloadElement(element);
                }
            });
        });
    }

    function enhanceDownloadElement(element) {
        const href = element.href || element.getAttribute('onclick');
        if (!href) return;

        // Determine download type and filename
        let type = 'excel';
        let filename = 'laporan';

        if (href.includes('pdf') || element.textContent.toLowerCase().includes('pdf')) {
            type = 'pdf';
            filename = 'laporan.pdf';
        } else if (href.includes('csv') || element.textContent.toLowerCase().includes('csv')) {
            type = 'csv';
            filename = 'data.csv';
        } else if (href.includes('excel') || href.includes('xlsx')) {
            type = 'excel';
            filename = 'laporan.xlsx';
        }

        // Extract filename from text content
        const textContent = element.textContent.trim();
        if (textContent) {
            const cleanText = textContent
                .replace(/unduh|download|export/gi, '')
                .replace(/\s+/g, '-')
                .toLowerCase()
                .trim();
            if (cleanText) {
                filename = cleanText;
            }
        }

        // Set download attributes
        if (element.href) {
            element.setAttribute('data-download', element.href);
            element.removeAttribute('href');
        } else if (href.includes('window.open') || href.includes('location.href')) {
            const urlMatch = href.match(/['"`]([^'"`]+)['"`]/);
            if (urlMatch) {
                element.setAttribute('data-download', urlMatch[1]);
            }
        }

        element.setAttribute('data-filename', filename);
        element.setAttribute('data-type', type);
        element.setAttribute('data-enhanced', 'true');

        // Add loading state capability
        element.addEventListener('click', function() {
            this.classList.add('loading');
            this.disabled = true;
            
            setTimeout(() => {
                this.classList.remove('loading');
                this.disabled = false;
            }, 3000);
        });

        console.log(`📎 Enhanced download button: ${filename} (${type})`);
    }

    function setupAutomaticHandling() {
        // Handle form submissions that might trigger downloads
        document.addEventListener('submit', function(e) {
            const form = e.target;
            const action = form.action;
            
            if (action && (action.includes('export') || action.includes('download'))) {
                e.preventDefault();
                handleFormDownload(form);
            }
        });

        // Handle AJAX download responses
        interceptAjaxDownloads();
    }

    function handleFormDownload(form) {
        const formData = new FormData(form);
        const params = new URLSearchParams(formData).toString();
        const url = form.action + (form.action.includes('?') ? '&' : '?') + params;
        
        const filename = form.getAttribute('data-filename') || 'laporan';
        const type = form.getAttribute('data-type') || 'excel';
        
        // Use enhanced download handler
        if (window.enhancedDownloadHandler) {
            const downloadId = enhancedDownloadHandler.startDownload(filename, type);
            enhancedDownloadHandler.performDownload(url, filename, type, downloadId);
        }
    }

    function interceptAjaxDownloads() {
        // Override fetch for download detection
        const originalFetch = window.fetch;
        window.fetch = function(...args) {
            const url = args[0];
            
            if (typeof url === 'string' && (url.includes('export') || url.includes('download'))) {
                console.log('🔍 Detected download request:', url);
            }
            
            return originalFetch.apply(this, args);
        };
    }

    function addGlobalStyles() {
        if (document.getElementById('download-integration-styles')) return;

        const styles = document.createElement('style');
        styles.id = 'download-integration-styles';
        styles.textContent = `
            .loading {
                position: relative;
                pointer-events: none;
                opacity: 0.7;
            }
            
            .loading::after {
                content: '';
                position: absolute;
                top: 50%;
                left: 50%;
                width: 16px;
                height: 16px;
                margin: -8px 0 0 -8px;
                border: 2px solid transparent;
                border-top: 2px solid currentColor;
                border-radius: 50%;
                animation: spin 1s linear infinite;
            }
            
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
            
            [data-enhanced="true"] {
                transition: all 0.3s ease;
            }
            
            [data-enhanced="true"]:hover {
                transform: translateY(-1px);
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            }
        `;
        document.head.appendChild(styles);
    }

    // Utility functions for manual integration
    window.downloadIntegration = {
        enhanceButton: function(selector, options = {}) {
            const element = document.querySelector(selector);
            if (element) {
                Object.assign(element.dataset, options);
                enhanceDownloadElement(element);
            }
        },
        
        enhanceAllButtons: function() {
            enhanceExistingButtons();
        },
        
        createDownloadButton: function(options = {}) {
            const {
                text = 'Download',
                url = '',
                filename = 'download',
                type = 'excel',
                className = 'btn btn-primary'
            } = options;
            
            const button = document.createElement('button');
            button.textContent = text;
            button.className = className;
            button.setAttribute('data-download', url);
            button.setAttribute('data-filename', filename);
            button.setAttribute('data-type', type);
            
            return button;
        }
    };

    // Auto-enhance new buttons added dynamically
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            mutation.addedNodes.forEach(function(node) {
                if (node.nodeType === 1) { // Element node
                    const downloadElements = node.querySelectorAll ? 
                        node.querySelectorAll('a[href*="download"], a[href*="export"], .btn-download, .download-btn') : 
                        [];
                    
                    downloadElements.forEach(enhanceDownloadElement);
                }
            });
        });
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

})();