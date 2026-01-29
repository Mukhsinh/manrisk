/**
 * Button Overflow Handler
 * Menangani overflow pada tombol-tombol di seluruh aplikasi
 */

(function() {
    'use strict';

    const ButtonOverflowHandler = {
        // Konfigurasi
        config: {
            maxButtonWidth: 200,
            minButtonWidth: 60,
            checkInterval: 1000,
            selectors: [
                '.btn',
                'button',
                '[type="button"]',
                '[type="submit"]',
                '[type="reset"]',
                '.button'
            ]
        },

        // Inisialisasi
        init() {
            console.log('🔧 Button Overflow Handler initialized');
            
            // Jalankan saat DOM ready
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => this.fixAllButtons());
            } else {
                this.fixAllButtons();
            }

            // Monitor perubahan DOM
            this.observeDOM();

            // Periodic check
            setInterval(() => this.fixAllButtons(), this.config.checkInterval);

            // Fix saat resize
            window.addEventListener('resize', () => this.debounce(() => this.fixAllButtons(), 250));
        },

        // Fix semua tombol
        fixAllButtons() {
            const buttons = document.querySelectorAll(this.config.selectors.join(','));
            
            buttons.forEach(button => {
                this.fixButton(button);
            });

            console.log(`✅ Fixed ${buttons.length} buttons`);
        },

        // Fix individual button
        fixButton(button) {
            if (!button || button.dataset.overflowFixed === 'true') {
                return;
            }

            try {
                // Skip jika button tidak visible
                if (button.offsetParent === null) {
                    return;
                }

                // Dapatkan text content
                const text = this.getButtonText(button);
                
                if (!text || text.trim().length === 0) {
                    return;
                }

                // Check overflow
                if (this.isOverflowing(button)) {
                    this.applyFix(button, text);
                }

                // Tambahkan tooltip jika text terpotong
                if (this.isTextTruncated(button)) {
                    this.addTooltip(button, text);
                }

                // Mark sebagai fixed
                button.dataset.overflowFixed = 'true';

            } catch (error) {
                console.error('Error fixing button:', error);
            }
        },

        // Dapatkan text dari button
        getButtonText(button) {
            // Clone button untuk mendapatkan text tanpa children
            const clone = button.cloneNode(true);
            
            // Remove icon elements
            const icons = clone.querySelectorAll('i, svg, .icon');
            icons.forEach(icon => icon.remove());

            return clone.textContent.trim();
        },

        // Check apakah button overflow
        isOverflowing(button) {
            return button.scrollWidth > button.clientWidth;
        },

        // Check apakah text terpotong
        isTextTruncated(button) {
            const style = window.getComputedStyle(button);
            return style.textOverflow === 'ellipsis' && this.isOverflowing(button);
        },

        // Apply fix untuk button
        applyFix(button, text) {
            // Ensure proper styles
            button.style.overflow = 'hidden';
            button.style.textOverflow = 'ellipsis';
            button.style.whiteSpace = 'nowrap';
            button.style.maxWidth = '100%';
            button.style.boxSizing = 'border-box';

            // Adjust padding jika terlalu panjang
            const currentWidth = button.offsetWidth;
            if (currentWidth > this.config.maxButtonWidth) {
                button.style.maxWidth = this.config.maxButtonWidth + 'px';
            }

            // Ensure minimum width
            if (currentWidth < this.config.minButtonWidth && text.length > 0) {
                button.style.minWidth = this.config.minButtonWidth + 'px';
            }

            console.log(`🔧 Fixed button: "${text.substring(0, 20)}..."`);
        },

        // Tambahkan tooltip
        addTooltip(button, text) {
            if (!button.hasAttribute('title') && !button.hasAttribute('data-tooltip')) {
                button.setAttribute('title', text);
                button.style.cursor = 'help';
            }
        },

        // Observe DOM changes
        observeDOM() {
            const observer = new MutationObserver((mutations) => {
                let shouldFix = false;

                mutations.forEach(mutation => {
                    if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                        mutation.addedNodes.forEach(node => {
                            if (node.nodeType === 1) { // Element node
                                // Check jika node adalah button atau mengandung button
                                if (this.isButton(node) || node.querySelector(this.config.selectors.join(','))) {
                                    shouldFix = true;
                                }
                            }
                        });
                    }
                });

                if (shouldFix) {
                    setTimeout(() => this.fixAllButtons(), 100);
                }
            });

            observer.observe(document.body, {
                childList: true,
                subtree: true
            });
        },

        // Check apakah element adalah button
        isButton(element) {
            return this.config.selectors.some(selector => {
                if (selector.startsWith('.')) {
                    return element.classList.contains(selector.substring(1));
                } else if (selector.startsWith('[')) {
                    const attr = selector.match(/\[(.+?)(?:=|])/)[1];
                    return element.hasAttribute(attr);
                } else {
                    return element.tagName.toLowerCase() === selector;
                }
            });
        },

        // Debounce helper
        debounce(func, wait) {
            let timeout;
            return function executedFunction(...args) {
                const later = () => {
                    clearTimeout(timeout);
                    func(...args);
                };
                clearTimeout(timeout);
                timeout = setTimeout(later, wait);
            };
        },

        // Fix button groups
        fixButtonGroups() {
            const buttonGroups = document.querySelectorAll('.btn-group, .button-group, .action-buttons, .form-actions');
            
            buttonGroups.forEach(group => {
                const buttons = group.querySelectorAll(this.config.selectors.join(','));
                const groupWidth = group.offsetWidth;
                const buttonCount = buttons.length;

                if (buttonCount > 0) {
                    const maxButtonWidth = Math.floor(groupWidth / buttonCount) - 10; // 10px untuk margin

                    buttons.forEach(button => {
                        if (button.offsetWidth > maxButtonWidth) {
                            button.style.maxWidth = maxButtonWidth + 'px';
                            this.fixButton(button);
                        }
                    });
                }
            });
        },

        // Fix responsive buttons
        fixResponsiveButtons() {
            const isMobile = window.innerWidth < 768;
            const isSmallMobile = window.innerWidth < 480;

            if (isMobile || isSmallMobile) {
                const buttons = document.querySelectorAll(this.config.selectors.join(','));
                
                buttons.forEach(button => {
                    // Skip jika sudah full width
                    if (button.classList.contains('btn-block') || button.classList.contains('btn-full-width')) {
                        return;
                    }

                    // Adjust font size
                    if (isSmallMobile) {
                        button.style.fontSize = '0.75rem';
                        button.style.padding = '0.5rem';
                    } else if (isMobile) {
                        button.style.fontSize = '0.8125rem';
                        button.style.padding = '0.5rem 0.75rem';
                    }
                });
            }
        },

        // Public method untuk manual fix
        fixSpecificButton(buttonElement) {
            if (buttonElement) {
                buttonElement.dataset.overflowFixed = 'false';
                this.fixButton(buttonElement);
            }
        },

        // Reset all fixes
        resetAllFixes() {
            const buttons = document.querySelectorAll('[data-overflow-fixed="true"]');
            buttons.forEach(button => {
                button.dataset.overflowFixed = 'false';
                button.removeAttribute('style');
            });
            this.fixAllButtons();
        }
    };

    // Auto-initialize
    ButtonOverflowHandler.init();

    // Expose ke global scope
    window.ButtonOverflowHandler = ButtonOverflowHandler;

    console.log('✅ Button Overflow Handler loaded');

})();
