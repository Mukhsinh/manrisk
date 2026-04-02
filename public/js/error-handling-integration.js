/**
 * Error Handling Integration
 * Menggabungkan semua komponen error handling menjadi satu sistem
 */

class ErrorHandlingSystem {
    constructor() {
        this.initialized = false;
    }

    /**
     * Initialize error handling system
     */
    initialize() {
        if (this.initialized) {
            return;
        }

        // Load dependencies
        this.loadDependencies();

        // Setup global error handler
        this.setupGlobalErrorHandler();

        // Setup unhandled rejection handler
        this.setupUnhandledRejectionHandler();

        this.initialized = true;
        console.log('✅ Error Handling System initialized');
    }

    /**
     * Load dependencies
     */
    loadDependencies() {
        const dependencies = [
            '/js/error-categories.js',
            '/js/error-logger.js',
            '/js/retry-handler.js',
            '/js/error-help-system.js',
            '/css/error-messages.css',
            '/css/error-help-system.css'
        ];

        dependencies.forEach(dep => {
            if (dep.endsWith('.js')) {
                const script = document.createElement('script');
                script.src = dep;
                document.head.appendChild(script);
            } else if (dep.endsWith('.css')) {
                const link = document.createElement('link');
                link.rel = 'stylesheet';
                link.href = dep;
                document.head.appendChild(link);
            }
        });
    }

    /**
     * Setup global error handler
     */
    setupGlobalErrorHandler() {
        window.addEventListener('error', (event) => {
            this.handleError(event.error, {
                type: 'global',
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno
            });
        });
    }

    /**
     * Setup unhandled rejection handler
     */
    setupUnhandledRejectionHandler() {
        window.addEventListener('unhandledrejection', (event) => {
            this.handleError(event.reason, {
                type: 'unhandled-rejection',
                promise: event.promise
            });
        });
    }

    /**
     * Handle error dengan semua komponen
     */
    handleError(error, context = {}) {
        try {
            // 1. Categorize error
            const errorInfo = getErrorMessage(error);

            // 2. Log error
            errorLogger.logError(error, {
                ...context,
                category: errorInfo.category
            });

            // 3. Show error message
            this.showErrorMessage(errorInfo, context);

            // 4. Return error info untuk further processing
            return errorInfo;

        } catch (err) {
            console.error('Error in error handler:', err);
        }
    }

    /**
     * Show error message dengan help system
     */
    showErrorMessage(errorInfo, context = {}) {
        const container = context.container || document.body;

        // Create error element
        const errorElement = document.createElement('div');
        errorElement.innerHTML = formatErrorForDisplay(errorInfo.originalError);

        // Add help button
        const errorDiv = errorElement.firstElementChild;
        errorHelpSystem.addHelpButton(errorDiv, errorInfo.category, errorInfo);

        // Add retry button jika retryable
        if (errorInfo.retryable && context.retryOperation) {
            const retryBtn = errorDiv.querySelector('.btn-retry');
            if (retryBtn) {
                retryBtn.addEventListener('click', async () => {
                    try {
                        retryBtn.classList.add('loading');
                        await retryHandler.retryButtonOperation(
                            context.button || retryBtn,
                            context.retryOperation,
                            errorInfo
                        );
                        errorElement.remove();
                    } catch (err) {
                        console.error('Retry failed:', err);
                    } finally {
                        retryBtn.classList.remove('loading');
                    }
                });
            }
        }

        // Add close button
        const closeBtn = document.createElement('button');
        closeBtn.className = 'error-close';
        closeBtn.innerHTML = '<i data-lucide="x"></i>';
        closeBtn.addEventListener('click', () => errorElement.remove());
        errorDiv.appendChild(closeBtn);

        // Add to container
        container.appendChild(errorElement);

        // Initialize Lucide icons
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }

        // Auto remove setelah 10 detik jika bukan error severity
        if (errorInfo.severity !== 'error') {
            setTimeout(() => {
                if (errorElement.parentNode) {
                    errorElement.remove();
                }
            }, 10000);
        }
    }

    /**
     * Wrap button handler dengan error handling
     */
    wrapButtonHandler(handler, button) {
        return async (...args) => {
            try {
                return await handler(...args);
            } catch (error) {
                this.handleError(error, {
                    button,
                    buttonText: button.textContent.trim(),
                    buttonId: button.id,
                    action: button.getAttribute('data-action'),
                    retryOperation: () => handler(...args)
                });
                throw error;
            }
        };
    }

    /**
     * Apply error handling ke semua buttons
     */
    applyToAllButtons() {
        const buttons = document.querySelectorAll('button[onclick], button[data-action]');
        
        buttons.forEach(button => {
            // Get original handler
            const onclickAttr = button.getAttribute('onclick');
            if (onclickAttr) {
                // Wrap onclick handler
                button.removeAttribute('onclick');
                button.addEventListener('click', (e) => {
                    try {
                        // Execute original onclick
                        const func = new Function(onclickAttr);
                        func.call(button);
                    } catch (error) {
                        this.handleError(error, {
                            button,
                            buttonText: button.textContent.trim(),
                            buttonId: button.id
                        });
                    }
                });
            }
        });

        console.log(`✅ Applied error handling to ${buttons.length} buttons`);
    }

    /**
     * Show error statistics
     */
    showStatistics() {
        const stats = errorLogger.getStatistics();
        console.group('📊 Error Statistics');
        console.log('Total Errors:', stats.total);
        console.log('By Category:', stats.byCategory);
        console.log('By Page:', stats.byPage);
        console.log('By Action:', stats.byAction);
        console.log('Recent Errors:', stats.recentErrors);
        console.groupEnd();
        return stats;
    }

    /**
     * Export error logs
     */
    exportLogs() {
        errorLogger.exportLogs();
    }

    /**
     * Clear all error logs
     */
    clearLogs() {
        errorLogger.clearLogs();
        console.log('✅ Error logs cleared');
    }
}

// Create global instance
const errorHandlingSystem = new ErrorHandlingSystem();

// Auto initialize on DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        errorHandlingSystem.initialize();
    });
} else {
    errorHandlingSystem.initialize();
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ErrorHandlingSystem, errorHandlingSystem };
}
