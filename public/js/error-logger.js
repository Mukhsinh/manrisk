/**
 * Error Logger
 * Sistem logging untuk button errors dengan context lengkap
 */

class ErrorLogger {
    constructor() {
        this.logs = [];
        this.maxLogs = 100; // Simpan max 100 logs di memory
        this.logToConsole = true;
        this.logToServer = false; // Bisa diaktifkan untuk production
    }

    /**
     * Log error dengan context lengkap
     */
    logError(error, context = {}) {
        const logEntry = {
            timestamp: new Date().toISOString(),
            error: {
                message: error.message,
                name: error.name,
                stack: error.stack
            },
            context: {
                button: context.button || null,
                buttonText: context.buttonText || null,
                buttonId: context.buttonId || null,
                action: context.action || null,
                page: window.location.pathname,
                user: this.getUserInfo(),
                userAgent: navigator.userAgent,
                ...context
            },
            category: context.category || 'UNKNOWN_ERROR'
        };

        // Simpan ke memory
        this.logs.push(logEntry);
        if (this.logs.length > this.maxLogs) {
            this.logs.shift(); // Remove oldest log
        }

        // Log ke console
        if (this.logToConsole) {
            this.logToConsoleFormatted(logEntry);
        }

        // Log ke server (jika diaktifkan)
        if (this.logToServer) {
            this.logToServerAsync(logEntry);
        }

        return logEntry;
    }

    /**
     * Log ke console dengan format yang readable
     */
    logToConsoleFormatted(logEntry) {
        console.group(`🔴 Button Error: ${logEntry.error.name}`);
        console.error('Message:', logEntry.error.message);
        console.log('Timestamp:', logEntry.timestamp);
        console.log('Category:', logEntry.category);
        
        if (logEntry.context.button) {
            console.log('Button:', logEntry.context.button);
        }
        
        if (logEntry.context.buttonText) {
            console.log('Button Text:', logEntry.context.buttonText);
        }
        
        if (logEntry.context.action) {
            console.log('Action:', logEntry.context.action);
        }
        
        console.log('Page:', logEntry.context.page);
        console.log('User:', logEntry.context.user);
        
        if (logEntry.error.stack) {
            console.log('Stack Trace:', logEntry.error.stack);
        }
        
        console.groupEnd();
    }

    /**
     * Log ke server secara async
     */
    async logToServerAsync(logEntry) {
        try {
            await fetch('/api/logs/errors', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(logEntry)
            });
        } catch (err) {
            // Jangan throw error jika logging gagal
            console.warn('Failed to log error to server:', err);
        }
    }

    /**
     * Dapatkan info user saat ini
     */
    getUserInfo() {
        try {
            const userStr = localStorage.getItem('user');
            if (userStr) {
                const user = JSON.parse(userStr);
                return {
                    id: user.id,
                    email: user.email,
                    role: user.role
                };
            }
        } catch (err) {
            // Ignore error
        }
        return { id: 'anonymous' };
    }

    /**
     * Dapatkan semua logs
     */
    getLogs() {
        return [...this.logs];
    }

    /**
     * Filter logs berdasarkan criteria
     */
    filterLogs(criteria = {}) {
        return this.logs.filter(log => {
            if (criteria.category && log.category !== criteria.category) {
                return false;
            }
            
            if (criteria.page && log.context.page !== criteria.page) {
                return false;
            }
            
            if (criteria.action && log.context.action !== criteria.action) {
                return false;
            }
            
            if (criteria.startTime && new Date(log.timestamp) < new Date(criteria.startTime)) {
                return false;
            }
            
            if (criteria.endTime && new Date(log.timestamp) > new Date(criteria.endTime)) {
                return false;
            }
            
            return true;
        });
    }

    /**
     * Dapatkan error statistics
     */
    getStatistics() {
        const stats = {
            total: this.logs.length,
            byCategory: {},
            byPage: {},
            byAction: {},
            recentErrors: this.logs.slice(-10).reverse()
        };

        this.logs.forEach(log => {
            // By category
            stats.byCategory[log.category] = (stats.byCategory[log.category] || 0) + 1;
            
            // By page
            const page = log.context.page;
            stats.byPage[page] = (stats.byPage[page] || 0) + 1;
            
            // By action
            if (log.context.action) {
                const action = log.context.action;
                stats.byAction[action] = (stats.byAction[action] || 0) + 1;
            }
        });

        return stats;
    }

    /**
     * Clear semua logs
     */
    clearLogs() {
        this.logs = [];
    }

    /**
     * Export logs sebagai JSON
     */
    exportLogs() {
        const dataStr = JSON.stringify(this.logs, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `error-logs-${new Date().toISOString()}.json`;
        link.click();
        
        URL.revokeObjectURL(url);
    }
}

// Create global instance
const errorLogger = new ErrorLogger();

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ErrorLogger, errorLogger };
}
