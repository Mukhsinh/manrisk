/**
 * Filter Button Handler
 * Menangani semua operasi filter button di aplikasi
 * 
 * Features:
 * - Apply filter ke data yang ditampilkan
 * - Update URL dengan filter parameters
 * - Show loading state saat apply filter
 * - Filter persistence via URL
 * - Filter reset functionality
 */

class FilterButtonHandler {
    constructor() {
        this.activeFilters = {};
        this.filterCallbacks = new Map();
        this.init();
    }

    init() {
        // Load filters dari URL saat page load
        this.loadFiltersFromURL();
        
        // Setup event listeners untuk filter buttons
        this.setupFilterButtons();
        
        // Setup event listeners untuk reset button
        this.setupResetButton();
    }

    /**
     * Load filters dari URL parameters
     */
    loadFiltersFromURL() {
        const urlParams = new URLSearchParams(window.location.search);
        
        urlParams.forEach((value, key) => {
            if (key.startsWith('filter_')) {
                const filterName = key.replace('filter_', '');
                this.activeFilters[filterName] = value;
            }
        });
        
        // Apply filters yang ada di URL
        if (Object.keys(this.activeFilters).length > 0) {
            this.applyFilters(false); // false = jangan update URL lagi
        }
    }

    /**
     * Setup event listeners untuk filter buttons
     */
    setupFilterButtons() {
        // Handle filter buttons dengan data-filter attribute
        document.addEventListener('click', (e) => {
            const filterBtn = e.target.closest('[data-filter]');
            if (!filterBtn) return;

            e.preventDefault();
            
            const filterName = filterBtn.dataset.filter;
            const filterValue = filterBtn.dataset.filterValue || filterBtn.value;
            
            this.setFilter(filterName, filterValue);
        });

        // Handle filter form submissions
        document.addEventListener('submit', (e) => {
            if (!e.target.classList.contains('filter-form')) return;
            
            e.preventDefault();
            this.applyFormFilters(e.target);
        });

        // Handle filter input changes (untuk real-time filtering)
        document.addEventListener('change', (e) => {
            const filterInput = e.target.closest('[data-filter-input]');
            if (!filterInput) return;

            const filterName = filterInput.dataset.filterInput;
            const filterValue = filterInput.value;
            
            this.setFilter(filterName, filterValue);
        });
    }

    /**
     * Setup event listeners untuk reset button
     */
    setupResetButton() {
        document.addEventListener('click', (e) => {
            const resetBtn = e.target.closest('[data-filter-reset]');
            if (!resetBtn) return;

            e.preventDefault();
            this.resetFilters();
        });
    }

    /**
     * Set single filter
     */
    setFilter(name, value) {
        if (!value || value === '' || value === 'all') {
            delete this.activeFilters[name];
        } else {
            this.activeFilters[name] = value;
        }
        
        this.applyFilters();
    }

    /**
     * Apply filters dari form
     */
    applyFormFilters(form) {
        const formData = new FormData(form);
        
        formData.forEach((value, key) => {
            if (value && value !== '' && value !== 'all') {
                this.activeFilters[key] = value;
            } else {
                delete this.activeFilters[key];
            }
        });
        
        this.applyFilters();
    }

    /**
     * Apply semua active filters
     */
    async applyFilters(updateURL = true) {
        try {
            // Show loading state
            this.showLoadingState();
            
            // Update URL dengan filter parameters
            if (updateURL) {
                this.updateURL();
            }
            
            // Update visual indicators
            this.updateFilterIndicators();
            
            // Execute registered filter callbacks
            for (const [name, callback] of this.filterCallbacks) {
                try {
                    await callback(this.activeFilters);
                } catch (error) {
                    console.error(`Error executing filter callback ${name}:`, error);
                }
            }
            
            // Hide loading state
            this.hideLoadingState();
            
        } catch (error) {
            console.error('Error applying filters:', error);
            this.hideLoadingState();
            this.showError('Gagal menerapkan filter. Silakan coba lagi.');
        }
    }

    /**
     * Reset semua filters
     */
    resetFilters() {
        this.activeFilters = {};
        
        // Clear form inputs
        document.querySelectorAll('[data-filter-input]').forEach(input => {
            if (input.type === 'checkbox' || input.type === 'radio') {
                input.checked = false;
            } else {
                input.value = '';
            }
        });
        
        // Clear select dropdowns
        document.querySelectorAll('select[data-filter-input]').forEach(select => {
            select.selectedIndex = 0;
        });
        
        this.applyFilters();
    }

    /**
     * Update URL dengan filter parameters
     */
    updateURL() {
        const url = new URL(window.location);
        
        // Remove existing filter parameters
        const keysToDelete = [];
        url.searchParams.forEach((value, key) => {
            if (key.startsWith('filter_')) {
                keysToDelete.push(key);
            }
        });
        keysToDelete.forEach(key => url.searchParams.delete(key));
        
        // Add active filters
        Object.entries(this.activeFilters).forEach(([name, value]) => {
            url.searchParams.set(`filter_${name}`, value);
        });
        
        // Update URL tanpa reload page
        window.history.pushState({}, '', url);
    }

    /**
     * Update visual indicators untuk active filters
     */
    updateFilterIndicators() {
        const filterCount = Object.keys(this.activeFilters).length;
        
        // Update filter count badge
        document.querySelectorAll('[data-filter-count]').forEach(badge => {
            badge.textContent = filterCount;
            badge.style.display = filterCount > 0 ? 'inline-block' : 'none';
        });
        
        // Highlight active filter buttons
        document.querySelectorAll('[data-filter]').forEach(btn => {
            const filterName = btn.dataset.filter;
            const filterValue = btn.dataset.filterValue;
            
            if (this.activeFilters[filterName] === filterValue) {
                btn.classList.add('active', 'btn-primary');
                btn.classList.remove('btn-outline-primary');
            } else {
                btn.classList.remove('active', 'btn-primary');
                btn.classList.add('btn-outline-primary');
            }
        });
        
        // Update filter input values
        document.querySelectorAll('[data-filter-input]').forEach(input => {
            const filterName = input.dataset.filterInput;
            const activeValue = this.activeFilters[filterName];
            
            if (activeValue) {
                if (input.type === 'checkbox' || input.type === 'radio') {
                    input.checked = input.value === activeValue;
                } else {
                    input.value = activeValue;
                }
            }
        });
    }

    /**
     * Show loading state
     */
    showLoadingState() {
        // Add loading class ke filter container
        document.querySelectorAll('[data-filter-container]').forEach(container => {
            container.classList.add('loading');
        });
        
        // Disable filter buttons
        document.querySelectorAll('[data-filter], [data-filter-reset]').forEach(btn => {
            btn.disabled = true;
        });
        
        // Show loading spinner
        const spinner = document.querySelector('[data-filter-loading]');
        if (spinner) {
            spinner.style.display = 'block';
        }
    }

    /**
     * Hide loading state
     */
    hideLoadingState() {
        // Remove loading class
        document.querySelectorAll('[data-filter-container]').forEach(container => {
            container.classList.remove('loading');
        });
        
        // Enable filter buttons
        document.querySelectorAll('[data-filter], [data-filter-reset]').forEach(btn => {
            btn.disabled = false;
        });
        
        // Hide loading spinner
        const spinner = document.querySelector('[data-filter-loading]');
        if (spinner) {
            spinner.style.display = 'none';
        }
    }

    /**
     * Show error message
     */
    showError(message) {
        // Gunakan sistem notifikasi yang ada atau fallback ke alert
        if (window.showNotification) {
            window.showNotification(message, 'error');
        } else {
            alert(message);
        }
    }

    /**
     * Register callback untuk filter changes
     * Callback akan dipanggil setiap kali filter berubah
     */
    registerFilterCallback(name, callback) {
        this.filterCallbacks.set(name, callback);
    }

    /**
     * Unregister callback
     */
    unregisterFilterCallback(name) {
        this.filterCallbacks.delete(name);
    }

    /**
     * Get active filters
     */
    getActiveFilters() {
        return { ...this.activeFilters };
    }

    /**
     * Check if filter is active
     */
    isFilterActive(name, value = null) {
        if (value === null) {
            return name in this.activeFilters;
        }
        return this.activeFilters[name] === value;
    }

    /**
     * Get filter value
     */
    getFilterValue(name) {
        return this.activeFilters[name];
    }
}

// Initialize global filter handler
window.filterHandler = new FilterButtonHandler();

// Export untuk module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FilterButtonHandler;
}
