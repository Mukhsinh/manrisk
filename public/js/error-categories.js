/**
 * Error Categories and User-Friendly Messages
 * Sistem kategorisasi error untuk button handlers
 */

const ErrorCategories = {
    HANDLER_NOT_FOUND: 'HANDLER_NOT_FOUND',
    API_ERROR: 'API_ERROR',
    VALIDATION_ERROR: 'VALIDATION_ERROR',
    NETWORK_ERROR: 'NETWORK_ERROR',
    PERMISSION_ERROR: 'PERMISSION_ERROR',
    UNKNOWN_ERROR: 'UNKNOWN_ERROR'
};

const ErrorMessages = {
    [ErrorCategories.HANDLER_NOT_FOUND]: {
        title: 'Fungsi Tidak Ditemukan',
        message: 'Tombol ini belum memiliki fungsi yang terhubung. Silakan hubungi administrator.',
        icon: 'alert-circle',
        severity: 'error',
        retryable: false
    },
    [ErrorCategories.API_ERROR]: {
        title: 'Kesalahan Server',
        message: 'Terjadi kesalahan saat memproses permintaan Anda. Silakan coba lagi.',
        icon: 'server',
        severity: 'error',
        retryable: true
    },
    [ErrorCategories.VALIDATION_ERROR]: {
        title: 'Data Tidak Valid',
        message: 'Mohon periksa kembali data yang Anda masukkan.',
        icon: 'alert-triangle',
        severity: 'warning',
        retryable: false
    },
    [ErrorCategories.NETWORK_ERROR]: {
        title: 'Koneksi Terputus',
        message: 'Tidak dapat terhubung ke server. Periksa koneksi internet Anda.',
        icon: 'wifi-off',
        severity: 'error',
        retryable: true
    },
    [ErrorCategories.PERMISSION_ERROR]: {
        title: 'Akses Ditolak',
        message: 'Anda tidak memiliki izin untuk melakukan tindakan ini.',
        icon: 'lock',
        severity: 'warning',
        retryable: false
    },
    [ErrorCategories.UNKNOWN_ERROR]: {
        title: 'Terjadi Kesalahan',
        message: 'Terjadi kesalahan yang tidak terduga. Silakan coba lagi atau hubungi administrator.',
        icon: 'x-circle',
        severity: 'error',
        retryable: true
    }
};

/**
 * Kategorisasi error berdasarkan error object
 */
function categorizeError(error) {
    // Handler not found
    if (error.message && error.message.includes('is not defined')) {
        return ErrorCategories.HANDLER_NOT_FOUND;
    }
    
    // API errors
    if (error.response) {
        const status = error.response.status;
        
        if (status === 403 || status === 401) {
            return ErrorCategories.PERMISSION_ERROR;
        }
        
        if (status >= 400 && status < 500) {
            return ErrorCategories.VALIDATION_ERROR;
        }
        
        if (status >= 500) {
            return ErrorCategories.API_ERROR;
        }
    }
    
    // Network errors
    if (error.message && (
        error.message.includes('Network') ||
        error.message.includes('fetch') ||
        error.message.includes('timeout')
    )) {
        return ErrorCategories.NETWORK_ERROR;
    }
    
    // Validation errors
    if (error.name === 'ValidationError' || 
        (error.message && error.message.includes('validation'))) {
        return ErrorCategories.VALIDATION_ERROR;
    }
    
    // Permission errors
    if (error.name === 'PermissionError' ||
        (error.message && (
            error.message.includes('permission') ||
            error.message.includes('unauthorized') ||
            error.message.includes('forbidden')
        ))) {
        return ErrorCategories.PERMISSION_ERROR;
    }
    
    // Default to unknown
    return ErrorCategories.UNKNOWN_ERROR;
}

/**
 * Dapatkan user-friendly message untuk error
 */
function getErrorMessage(error) {
    const category = categorizeError(error);
    const errorInfo = ErrorMessages[category];
    
    return {
        category,
        title: errorInfo.title,
        message: errorInfo.message,
        icon: errorInfo.icon,
        severity: errorInfo.severity,
        retryable: errorInfo.retryable,
        originalError: error
    };
}

/**
 * Format error untuk display
 */
function formatErrorForDisplay(error) {
    const errorInfo = getErrorMessage(error);
    
    return `
        <div class="error-message error-${errorInfo.severity}">
            <div class="error-icon">
                <i data-lucide="${errorInfo.icon}"></i>
            </div>
            <div class="error-content">
                <h4 class="error-title">${errorInfo.title}</h4>
                <p class="error-text">${errorInfo.message}</p>
                ${errorInfo.retryable ? '<button class="btn-retry">Coba Lagi</button>' : ''}
            </div>
        </div>
    `;
}

// Export untuk digunakan di module lain
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        ErrorCategories,
        ErrorMessages,
        categorizeError,
        getErrorMessage,
        formatErrorForDisplay
    };
}
