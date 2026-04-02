/**
 * Keyboard Navigation Handler
 * Menangani navigasi keyboard untuk semua tombol di aplikasi
 * 
 * Features:
 * - Tab navigation untuk semua tombol
 * - Enter/Space activation untuk tombol
 * - Visible focus indicator
 * - Skip disabled buttons
 */

class KeyboardNavigationHandler {
    constructor() {
        this.focusableElements = [];
        this.currentFocusIndex = -1;
        this.init();
    }

    init() {
        // Setup keyboard event listeners
        document.addEventListener('keydown', this.handleKeyDown.bind(this));
        
        // Setup focus tracking
        document.addEventListener('focusin', this.handleFocusIn.bind(this));
        
        // Update focusable elements saat DOM berubah
        this.updateFocusableElements();
        
        // Setup MutationObserver untuk detect DOM changes
        this.setupMutationObserver();
        
        console.log('✅ Keyboard Navigation Handler initialized');
    }

    /**
     * Update daftar elemen yang dapat di-focus
     */
    updateFocusableElements() {
        // Selector untuk semua elemen yang dapat di-focus
        const selector = [
            'button:not([disabled])',
            'a[href]:not([disabled])',
            'input:not([disabled])',
            'select:not([disabled])',
            'textarea:not([disabled])',
            '[tabindex]:not([tabindex="-1"]):not([disabled])',
            '[data-action]:not([disabled])'
        ].join(', ');

        this.focusableElements = Array.from(document.querySelectorAll(selector))
            .filter(el => {
                // Filter elemen yang visible
                return el.offsetParent !== null && 
                       !el.hasAttribute('aria-hidden') &&
                       window.getComputedStyle(el).display !== 'none' &&
                       window.getComputedStyle(el).visibility !== 'hidden';
            });

        console.log(`📋 Found ${this.focusableElements.length} focusable elements`);
    }

    /**
     * Setup MutationObserver untuk detect DOM changes
     */
    setupMutationObserver() {
        const observer = new MutationObserver(() => {
            this.updateFocusableElements();
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['disabled', 'tabindex', 'aria-hidden']
        });
    }

    /**
     * Handle keyboard events
     */
    handleKeyDown(event) {
        const key = event.key;
        const target = event.target;

        // Handle Tab navigation
        if (key === 'Tab') {
            this.handleTabNavigation(event);
        }

        // Handle Enter/Space activation untuk buttons
        if ((key === 'Enter' || key === ' ') && this.isButton(target)) {
            this.handleButtonActivation(event);
        }

        // Handle Escape untuk close modals
        if (key === 'Escape') {
            this.handleEscape(event);
        }
    }

    /**
     * Handle Tab navigation
     */
    handleTabNavigation(event) {
        this.updateFocusableElements();

        if (this.focusableElements.length === 0) {
            return;
        }

        const currentElement = document.activeElement;
        const currentIndex = this.focusableElements.indexOf(currentElement);

        let nextIndex;
        if (event.shiftKey) {
            // Shift+Tab: navigate backwards
            nextIndex = currentIndex <= 0 ? this.focusableElements.length - 1 : currentIndex - 1;
        } else {
            // Tab: navigate forwards
            nextIndex = currentIndex >= this.focusableElements.length - 1 ? 0 : currentIndex + 1;
        }

        // Focus next element
        const nextElement = this.focusableElements[nextIndex];
        if (nextElement) {
            event.preventDefault();
            nextElement.focus();
            this.currentFocusIndex = nextIndex;
        }
    }

    /**
     * Handle button activation dengan Enter/Space
     */
    handleButtonActivation(event) {
        const button = event.target;

        // Prevent default untuk Space (prevent page scroll)
        if (event.key === ' ') {
            event.preventDefault();
        }

        // Check jika button disabled atau loading
        if (button.disabled || 
            button.classList.contains('loading') ||
            button.classList.contains('disabled')) {
            return;
        }

        // Trigger click event
        button.click();
    }

    /**
     * Handle Escape key untuk close modals
     */
    handleEscape(event) {
        // Find open modal
        const modal = document.querySelector('.modal.show, .modal.active, [role="dialog"][aria-hidden="false"]');
        
        if (modal) {
            // Find close button
            const closeButton = modal.querySelector('[data-dismiss="modal"], .modal-close, .btn-close');
            
            if (closeButton) {
                closeButton.click();
            } else {
                // Fallback: hide modal
                modal.classList.remove('show', 'active');
                modal.setAttribute('aria-hidden', 'true');
            }
        }
    }

    /**
     * Handle focus in event
     */
    handleFocusIn(event) {
        const element = event.target;
        
        // Add visible focus indicator
        if (this.isButton(element)) {
            element.classList.add('keyboard-focus');
        }

        // Update current focus index
        this.currentFocusIndex = this.focusableElements.indexOf(element);
    }

    /**
     * Check jika element adalah button
     */
    isButton(element) {
        return element.tagName === 'BUTTON' || 
               element.getAttribute('role') === 'button' ||
               element.hasAttribute('data-action');
    }

    /**
     * Focus first focusable element
     */
    focusFirst() {
        this.updateFocusableElements();
        
        if (this.focusableElements.length > 0) {
            this.focusableElements[0].focus();
            this.currentFocusIndex = 0;
        }
    }

    /**
     * Focus last focusable element
     */
    focusLast() {
        this.updateFocusableElements();
        
        if (this.focusableElements.length > 0) {
            const lastIndex = this.focusableElements.length - 1;
            this.focusableElements[lastIndex].focus();
            this.currentFocusIndex = lastIndex;
        }
    }

    /**
     * Focus element by selector
     */
    focusElement(selector) {
        const element = document.querySelector(selector);
        
        if (element && this.focusableElements.includes(element)) {
            element.focus();
            this.currentFocusIndex = this.focusableElements.indexOf(element);
            return true;
        }
        
        return false;
    }

    /**
     * Get currently focused element
     */
    getCurrentFocus() {
        return this.focusableElements[this.currentFocusIndex];
    }

    /**
     * Trap focus dalam container (untuk modals)
     */
    trapFocus(container) {
        const focusableInContainer = Array.from(
            container.querySelectorAll(
                'button:not([disabled]), a[href]:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"]):not([disabled])'
            )
        );

        if (focusableInContainer.length === 0) {
            return;
        }

        const firstFocusable = focusableInContainer[0];
        const lastFocusable = focusableInContainer[focusableInContainer.length - 1];

        // Focus first element
        firstFocusable.focus();

        // Setup trap
        const trapHandler = (event) => {
            if (event.key !== 'Tab') {
                return;
            }

            if (event.shiftKey) {
                // Shift+Tab
                if (document.activeElement === firstFocusable) {
                    event.preventDefault();
                    lastFocusable.focus();
                }
            } else {
                // Tab
                if (document.activeElement === lastFocusable) {
                    event.preventDefault();
                    firstFocusable.focus();
                }
            }
        };

        container.addEventListener('keydown', trapHandler);

        // Return cleanup function
        return () => {
            container.removeEventListener('keydown', trapHandler);
        };
    }
}

// Initialize keyboard navigation handler
let keyboardNavigationHandler;

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        keyboardNavigationHandler = new KeyboardNavigationHandler();
    });
} else {
    keyboardNavigationHandler = new KeyboardNavigationHandler();
}

// Export untuk digunakan di module lain
if (typeof module !== 'undefined' && module.exports) {
    module.exports = KeyboardNavigationHandler;
}
