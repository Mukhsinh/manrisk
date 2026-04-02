/**
 * Navigation Button Handler
 * Menangani semua operasi navigation button di aplikasi
 * 
 * Features:
 * - Proper navigation dengan state management
 * - Loading indicator saat navigate
 * - Back button handling
 * - Error handling untuk navigation
 * - State persistence
 */

class NavigationButtonHandler {
    constructor() {
        this.navigationHistory = [];
        this.currentState = null;
        this.init();
    }

    init() {
        // Setup event listeners untuk navigation buttons
        this.setupNavigationButtons();
        
        // Setup back button handling
        this.setupBackButton();
        
        // Setup popstate event untuk browser back/forward
        this.setupPopState();
        
        // Save initial state
        this.saveCurrentState();
    }

    /**
     * Setup event listeners untuk navigation buttons
     */
    setupNavigationButtons() {
        document.addEventListener('click', async (e) => {
            const navBtn = e.target.closest('[data-navigate]');
            if (!navBtn) return;

            e.preventDefault();
            
            const targetPage = navBtn.dataset.navigate;
            const saveState = navBtn.dataset.saveState !== 'false';
            
            await this.navigateTo(targetPage, saveState);
        });
    }

    /**
     * Setup back button handling
     */
    setupBackButton() {
        document.addEventListener('click', async (e) => {
            const backBtn = e.target.closest('[data-navigate-back]');
            if (!backBtn) return;

            e.preventDefault();
            await this.navigateBack();
        });
    }

    /**
     * Setup popstate event untuk browser back/forward
     */
    setupPopState() {
        window.addEventListener('popstate', (e) => {
            if (e.state) {
                this.restoreState(e.state);
            }
        });
    }

    /**
     * Navigate ke halaman baru
     */
    async navigateTo(targetPage, saveState = true) {
        try {
            // Save current state sebelum navigate
            if (saveState) {
                this.saveCurrentState();
            }
            
            // Show loading indicator
            this.showLoadingIndicator();
            
            // Validate target page
            if (!this.isValidPage(targetPage)) {
                throw new Error(`Invalid page: ${targetPage}`);
            }
            
            // Load target page
            await this.loadPage(targetPage);
            
            // Update URL
            this.updateURL(targetPage);
            
            // Hide loading indicator
            this.hideLoadingIndicator();
            
            // Trigger navigation event
            this.triggerNavigationEvent('navigate', { targetPage });
            
        } catch (error) {
            console.error('Navigation error:', error);
            this.hideLoadingIndicator();
            this.showNavigationError(error.message);
        }
    }

    /**
     * Navigate back ke halaman sebelumnya
     */
    async navigateBack() {
        try {
            if (this.navigationHistory.length === 0) {
                console.warn('No navigation history');
                return;
            }
            
            // Show loading indicator
            this.showLoadingIndicator();
            
            // Get previous state
            const previousState = this.navigationHistory.pop();
            
            // Restore previous state
            await this.restoreState(previousState);
            
            // Update URL
            window.history.back();
            
            // Hide loading indicator
            this.hideLoadingIndicator();
            
            // Trigger navigation event
            this.triggerNavigationEvent('back', { previousState });
            
        } catch (error) {
            console.error('Back navigation error:', error);
            this.hideLoadingIndicator();
            this.showNavigationError(error.message);
        }
    }

    /**
     * Save current state
     */
    saveCurrentState() {
        const state = {
            url: window.location.href,
            scrollPosition: window.scrollY,
            formData: this.captureFormData(),
            timestamp: Date.now()
        };
        
        this.navigationHistory.push(state);
        this.currentState = state;
        
        // Push state ke browser history
        window.history.pushState(state, '', window.location.href);
    }

    /**
     * Restore state
     */
    async restoreState(state) {
        if (!state) return;
        
        try {
            // Restore scroll position
            window.scrollTo(0, state.scrollPosition || 0);
            
            // Restore form data
            if (state.formData) {
                this.restoreFormData(state.formData);
            }
            
            this.currentState = state;
            
        } catch (error) {
            console.error('Error restoring state:', error);
        }
    }

    /**
     * Capture form data dari current page
     */
    captureFormData() {
        const formData = {};
        
        document.querySelectorAll('input, select, textarea').forEach(element => {
            if (element.name) {
                if (element.type === 'checkbox' || element.type === 'radio') {
                    formData[element.name] = element.checked;
                } else {
                    formData[element.name] = element.value;
                }
            }
        });
        
        return formData;
    }

    /**
     * Restore form data
     */
    restoreFormData(formData) {
        Object.entries(formData).forEach(([name, value]) => {
            const elements = document.querySelectorAll(`[name="${name}"]`);
            
            elements.forEach(element => {
                if (element.type === 'checkbox' || element.type === 'radio') {
                    element.checked = value;
                } else {
                    element.value = value;
                }
            });
        });
    }

    /**
     * Validate page
     */
    isValidPage(page) {
        // List of valid pages
        const validPages = [
            'dashboard', 'master-data', 'risk-input', 'risk-profile',
            'kri', 'residual-risk', 'analisis-swot', 'rencana-strategis',
            'monitoring-evaluasi', 'laporan', 'pengaturan', 'visi-misi'
        ];
        
        return validPages.includes(page) || page.startsWith('/');
    }

    /**
     * Load page
     */
    async loadPage(page) {
        // Jika page adalah URL lengkap, redirect
        if (page.startsWith('http') || page.startsWith('/')) {
            window.location.href = page;
            return;
        }
        
        // Jika page adalah nama halaman, construct URL
        const url = `/${page}.html`;
        
        // Simulate loading delay
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // Navigate
        window.location.href = url;
    }

    /**
     * Update URL
     */
    updateURL(page) {
        const url = page.startsWith('/') ? page : `/${page}.html`;
        window.history.pushState(this.currentState, '', url);
    }

    /**
     * Show loading indicator
     */
    showLoadingIndicator() {
        // Create loading overlay jika belum ada
        let overlay = document.getElementById('navigation-loading-overlay');
        
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'navigation-loading-overlay';
            overlay.innerHTML = `
                <div class="navigation-loading-spinner">
                    <div class="spinner-border text-primary" role="status">
                        <span class="visually-hidden">Loading...</span>
                    </div>
                    <p class="mt-2">Memuat halaman...</p>
                </div>
            `;
            document.body.appendChild(overlay);
        }
        
        overlay.style.display = 'flex';
        
        // Disable navigation buttons
        document.querySelectorAll('[data-navigate], [data-navigate-back]').forEach(btn => {
            btn.disabled = true;
        });
    }

    /**
     * Hide loading indicator
     */
    hideLoadingIndicator() {
        const overlay = document.getElementById('navigation-loading-overlay');
        if (overlay) {
            overlay.style.display = 'none';
        }
        
        // Enable navigation buttons
        document.querySelectorAll('[data-navigate], [data-navigate-back]').forEach(btn => {
            btn.disabled = false;
        });
    }

    /**
     * Show navigation error
     */
    showNavigationError(message) {
        const errorHtml = `
            <div class="alert alert-danger alert-dismissible fade show" role="alert">
                <strong>Navigation Error:</strong> ${message}
                <button type="button" class="btn btn-sm btn-outline-danger ms-3" onclick="location.reload()">
                    Retry
                </button>
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            </div>
        `;
        
        // Insert error message at top of page
        const container = document.querySelector('.container, .container-fluid, body');
        if (container) {
            const errorDiv = document.createElement('div');
            errorDiv.innerHTML = errorHtml;
            container.insertBefore(errorDiv, container.firstChild);
        }
        
        // Gunakan sistem notifikasi yang ada jika tersedia
        if (window.showNotification) {
            window.showNotification(message, 'error');
        }
    }

    /**
     * Trigger navigation event
     */
    triggerNavigationEvent(type, detail) {
        const event = new CustomEvent('navigation', {
            detail: { type, ...detail }
        });
        window.dispatchEvent(event);
    }

    /**
     * Get navigation history
     */
    getNavigationHistory() {
        return [...this.navigationHistory];
    }

    /**
     * Clear navigation history
     */
    clearNavigationHistory() {
        this.navigationHistory = [];
    }

    /**
     * Can navigate back
     */
    canNavigateBack() {
        return this.navigationHistory.length > 0;
    }
}

// Add CSS untuk loading overlay
const style = document.createElement('style');
style.textContent = `
    #navigation-loading-overlay {
        display: none;
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(255, 255, 255, 0.9);
        z-index: 9999;
        justify-content: center;
        align-items: center;
    }
    
    .navigation-loading-spinner {
        text-align: center;
    }
    
    .navigation-loading-spinner p {
        color: #666;
        font-size: 14px;
    }
`;
document.head.appendChild(style);

// Initialize global navigation handler
window.navigationHandler = new NavigationButtonHandler();

// Export untuk module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = NavigationButtonHandler;
}
