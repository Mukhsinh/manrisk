/**
 * Retry Handler
 * Sistem untuk retry operations yang gagal
 */

class RetryHandler {
    constructor() {
        this.retryQueue = new Map();
        this.maxRetries = 3;
        this.retryDelay = 1000; // 1 second
        this.exponentialBackoff = true;
    }

    /**
     * Execute operation dengan retry logic
     */
    async executeWithRetry(operation, options = {}) {
        const {
            maxRetries = this.maxRetries,
            retryDelay = this.retryDelay,
            exponentialBackoff = this.exponentialBackoff,
            onRetry = null,
            shouldRetry = null
        } = options;

        let lastError;
        
        for (let attempt = 0; attempt <= maxRetries; attempt++) {
            try {
                const result = await operation();
                return { success: true, result, attempts: attempt + 1 };
            } catch (error) {
                lastError = error;
                
                // Check apakah error ini retryable
                if (shouldRetry && !shouldRetry(error)) {
                    throw error;
                }
                
                // Jika masih ada retry attempts
                if (attempt < maxRetries) {
                    // Calculate delay dengan exponential backoff
                    const delay = exponentialBackoff 
                        ? retryDelay * Math.pow(2, attempt)
                        : retryDelay;
                    
                    // Callback sebelum retry
                    if (onRetry) {
                        onRetry(attempt + 1, maxRetries, delay);
                    }
                    
                    // Wait sebelum retry
                    await this.sleep(delay);
                } else {
                    // Max retries reached
                    throw new Error(`Operation failed after ${maxRetries + 1} attempts: ${lastError.message}`);
                }
            }
        }
    }

    /**
     * Retry button click operation
     */
    async retryButtonOperation(button, operation, errorInfo) {
        const retryId = this.generateRetryId(button);
        
        // Cek apakah sudah ada retry untuk button ini
        if (this.retryQueue.has(retryId)) {
            console.warn('Retry already in progress for this button');
            return;
        }

        // Add ke retry queue
        this.retryQueue.set(retryId, {
            button,
            operation,
            errorInfo,
            startTime: Date.now()
        });

        try {
            // Show loading state
            button.classList.add('loading');
            button.disabled = true;

            // Execute dengan retry
            const result = await this.executeWithRetry(operation, {
                maxRetries: 2, // 2 retries untuk button operations
                shouldRetry: (error) => {
                    // Hanya retry untuk network dan API errors
                    return error.message.includes('Network') ||
                           error.message.includes('fetch') ||
                           (error.response && error.response.status >= 500);
                },
                onRetry: (attempt, maxRetries, delay) => {
                    this.showRetryNotification(attempt, maxRetries, delay);
                }
            });

            // Success
            this.showSuccessNotification();
            return result;

        } catch (error) {
            // Failed after retries
            this.showFailureNotification(error);
            throw error;

        } finally {
            // Remove dari retry queue
            this.retryQueue.delete(retryId);
            
            // Remove loading state
            button.classList.remove('loading');
            button.disabled = false;
        }
    }

    /**
     * Generate unique retry ID untuk button
     */
    generateRetryId(button) {
        const id = button.id || button.getAttribute('data-action') || 'unknown';
        const text = button.textContent.trim();
        return `${id}-${text}`;
    }

    /**
     * Show retry notification
     */
    showRetryNotification(attempt, maxRetries, delay) {
        const message = `Mencoba lagi (${attempt}/${maxRetries})... Tunggu ${delay}ms`;
        this.showToast(message, 'info');
    }

    /**
     * Show success notification
     */
    showSuccessNotification() {
        this.showToast('Operasi berhasil!', 'success');
    }

    /**
     * Show failure notification
     */
    showFailureNotification(error) {
        this.showToast(`Operasi gagal: ${error.message}`, 'error');
    }

    /**
     * Show toast notification
     */
    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 20px;
            background: ${type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : '#17a2b8'};
            color: white;
            border-radius: 4px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.2);
            z-index: 10000;
            animation: slideIn 0.3s ease-out;
        `;

        document.body.appendChild(toast);

        setTimeout(() => {
            toast.style.animation = 'slideOut 0.3s ease-out';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    /**
     * Sleep utility
     */
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Check apakah error retryable
     */
    isRetryableError(error) {
        // Network errors
        if (error.message && (
            error.message.includes('Network') ||
            error.message.includes('fetch') ||
            error.message.includes('timeout')
        )) {
            return true;
        }

        // Server errors (5xx)
        if (error.response && error.response.status >= 500) {
            return true;
        }

        // Rate limit errors
        if (error.response && error.response.status === 429) {
            return true;
        }

        return false;
    }

    /**
     * Get retry statistics
     */
    getStatistics() {
        return {
            activeRetries: this.retryQueue.size,
            retries: Array.from(this.retryQueue.values()).map(retry => ({
                button: retry.button.textContent.trim(),
                duration: Date.now() - retry.startTime
            }))
        };
    }
}

// Create global instance
const retryHandler = new RetryHandler();

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { RetryHandler, retryHandler };
}
