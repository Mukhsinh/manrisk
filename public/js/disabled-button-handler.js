/**
 * Disabled Button Handler
 * Menangani disabled buttons untuk accessibility
 * 
 * Features:
 * - Remove dari tab order saat disabled
 * - Add aria-disabled attribute
 * - Prevent click events
 * - Visual indicator untuk disabled state
 */

class DisabledButtonHandler {
    constructor() {
        this.init();
    }

    init() {
        // Process semua buttons saat page load
        this.processAllButtons();
        
        // Setup MutationObserver untuk detect changes
        this.setupMutationObserver();
        
        // Setup global click handler untuk prevent clicks pada disabled buttons
        this.setupClickPrevention();
        
        console.log('✅ Disabled Button Handler initialized');
    }

    /**
     * Process semua buttons di page
     */
    processAllButtons() {
        const buttons = document.querySelectorAll('button, [role="button"], [data-action]');
        let processed = 0;
        
        buttons.forEach(button => {
            this.processButton(button);
            processed++;
        });
        
        console.log(`📋 Processed ${processed} buttons for disabled state`);
    }

    /**
     * Process single button
     */
    processButton(button) {
        const isDisabled = this.isButtonDisabled(button);
        
        if (isDisabled) {
            this.disableButton(button);
        } else {
            this.enableButton(button);
        }
    }

    /**
     * Check jika button disabled
     */
    isButtonDisabled(button) {
        return button.disabled || 
               button.hasAttribute('disabled') ||
               button.classList.contains('disabled') ||
               button.getAttribute('aria-disabled') === 'true';
    }

    /**
     * Disable button
     */
    disableButton(button) {
        // Set disabled attribute
        if (button.tagName === 'BUTTON') {
            button.disabled = true;
        } else {
            button.setAttribute('disabled', 'disabled');
        }
        
        // Add aria-disabled
        button.setAttribute('aria-disabled', 'true');
        
        // Remove dari tab order
        button.setAttribute('tabindex', '-1');
        
        // Add disabled class
        if (!button.classList.contains('disabled')) {
            button.classList.add('disabled');
        }
        
        // Add visual indicator
        this.addDisabledStyles(button);
        
        // Store original onclick untuk restore nanti
        if (button.onclick && !button.dataset.originalOnclick) {
            button.dataset.originalOnclick = button.onclick.toString();
            button.onclick = null;
        }
    }

    /**
     * Enable button
     */
    enableButton(button) {
        // Remove disabled attribute
        if (button.tagName === 'BUTTON') {
            button.disabled = false;
        } else {
            button.removeAttribute('disabled');
        }
        
        // Remove aria-disabled
        button.setAttribute('aria-disabled', 'false');
        
        // Restore tab order
        if (button.getAttribute('tabindex') === '-1') {
            button.removeAttribute('tabindex');
        }
        
        // Remove disabled class
        button.classList.remove('disabled');
        
        // Remove visual indicator
        this.removeDisabledStyles(button);
        
        // Restore original onclick
        if (button.dataset.originalOnclick) {
            try {
                button.onclick = new Function('return ' + button.dataset.originalOnclick)();
            } catch (e) {
                console.warn('Failed to restore onclick:', e);
            }
            delete button.dataset.originalOnclick;
        }
    }

    /**
     * Add disabled styles
     */
    addDisabledStyles(button) {
        // Store original styles
        if (!button.dataset.originalOpacity) {
            button.dataset.originalOpacity = window.getComputedStyle(button).opacity;
        }
        if (!button.dataset.originalCursor) {
            button.dataset.originalCursor = window.getComputedStyle(button).cursor;
        }
        if (!button.dataset.originalPointerEvents) {
            button.dataset.originalPointerEvents = window.getComputedStyle(button).pointerEvents;
        }
        
        // Apply disabled styles
        button.style.opacity = '0.6';
        button.style.cursor = 'not-allowed';
        button.style.pointerEvents = 'none';
    }

    /**
     * Remove disabled styles
     */
    removeDisabledStyles(button) {
        // Restore original styles
        if (button.dataset.originalOpacity) {
            button.style.opacity = button.dataset.originalOpacity;
            delete button.dataset.originalOpacity;
        }
        if (button.dataset.originalCursor) {
            button.style.cursor = button.dataset.originalCursor;
            delete button.dataset.originalCursor;
        }
        if (button.dataset.originalPointerEvents) {
            button.style.pointerEvents = button.dataset.originalPointerEvents;
            delete button.dataset.originalPointerEvents;
        }
    }

    /**
     * Setup MutationObserver untuk detect changes
     */
    setupMutationObserver() {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach(mutation => {
                // Check for attribute changes
                if (mutation.type === 'attributes') {
                    const button = mutation.target;
                    
                    if (button.matches('button, [role="button"], [data-action]')) {
                        if (mutation.attributeName === 'disabled' ||
                            mutation.attributeName === 'aria-disabled' ||
                            mutation.attributeName === 'class') {
                            this.processButton(button);
                        }
                    }
                }
                
                // Check for new buttons
                if (mutation.type === 'childList') {
                    mutation.addedNodes.forEach(node => {
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            if (node.matches('button, [role="button"], [data-action]')) {
                                this.processButton(node);
                            }
                            
                            const buttons = node.querySelectorAll('button, [role="button"], [data-action]');
                            buttons.forEach(button => this.processButton(button));
                        }
                    });
                }
            });
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['disabled', 'aria-disabled', 'class']
        });
    }

    /**
     * Setup global click handler untuk prevent clicks pada disabled buttons
     */
    setupClickPrevention() {
        document.addEventListener('click', (event) => {
            const button = event.target.closest('button, [role="button"], [data-action]');
            
            if (button && this.isButtonDisabled(button)) {
                event.preventDefault();
                event.stopPropagation();
                event.stopImmediatePropagation();
                
                console.warn('Click prevented on disabled button:', button);
                
                // Show visual feedback
                this.showDisabledFeedback(button);
                
                return false;
            }
        }, true); // Use capture phase
    }

    /**
     * Show visual feedback untuk disabled button click
     */
    showDisabledFeedback(button) {
        // Add shake animation
        button.classList.add('disabled-shake');
        
        setTimeout(() => {
            button.classList.remove('disabled-shake');
        }, 500);
    }

    /**
     * Disable button programmatically
     */
    disable(selector) {
        const buttons = typeof selector === 'string' 
            ? document.querySelectorAll(selector)
            : [selector];
        
        buttons.forEach(button => {
            this.disableButton(button);
        });
    }

    /**
     * Enable button programmatically
     */
    enable(selector) {
        const buttons = typeof selector === 'string' 
            ? document.querySelectorAll(selector)
            : [selector];
        
        buttons.forEach(button => {
            this.enableButton(button);
        });
    }

    /**
     * Toggle button disabled state
     */
    toggle(selector) {
        const buttons = typeof selector === 'string' 
            ? document.querySelectorAll(selector)
            : [selector];
        
        buttons.forEach(button => {
            if (this.isButtonDisabled(button)) {
                this.enableButton(button);
            } else {
                this.disableButton(button);
            }
        });
    }

    /**
     * Disable buttons during async operation
     */
    async disableDuring(selector, asyncFn) {
        const buttons = typeof selector === 'string' 
            ? document.querySelectorAll(selector)
            : [selector];
        
        // Disable buttons
        buttons.forEach(button => this.disableButton(button));
        
        try {
            // Execute async function
            const result = await asyncFn();
            return result;
        } finally {
            // Re-enable buttons
            buttons.forEach(button => this.enableButton(button));
        }
    }

    /**
     * Generate report
     */
    generateReport() {
        const buttons = document.querySelectorAll('button, [role="button"], [data-action]');
        const disabled = Array.from(buttons).filter(b => this.isButtonDisabled(b));
        const enabled = buttons.length - disabled.length;
        
        const issues = [];
        
        // Check for disabled buttons yang masih bisa di-focus
        disabled.forEach(button => {
            const tabindex = button.getAttribute('tabindex');
            if (tabindex !== '-1') {
                issues.push({
                    element: button,
                    issue: 'Disabled button masih bisa di-focus (tabindex !== -1)',
                    severity: 'ERROR'
                });
            }
            
            if (!button.hasAttribute('aria-disabled')) {
                issues.push({
                    element: button,
                    issue: 'Disabled button tidak memiliki aria-disabled',
                    severity: 'WARNING'
                });
            }
        });
        
        return {
            total: buttons.length,
            disabled: disabled.length,
            enabled,
            issues: issues.length,
            details: issues
        };
    }
}

// Initialize Disabled Button Handler
let disabledButtonHandler;

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        disabledButtonHandler = new DisabledButtonHandler();
    });
} else {
    disabledButtonHandler = new DisabledButtonHandler();
}

// Export untuk digunakan di module lain
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DisabledButtonHandler;
}
