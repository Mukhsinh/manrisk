/**
 * ============================================
 * TABLE SCROLL ENHANCER
 * ============================================
 * Meningkatkan pengalaman scroll horizontal pada tabel
 * dengan indikator visual dan smooth scrolling
 */

(function() {
    'use strict';

    // Konfigurasi
    const CONFIG = {
        scrollIndicatorDelay: 2000,
        smoothScrollDuration: 300,
        scrollButtonSize: 40,
        scrollStep: 200
    };

    /**
     * Inisialisasi scroll enhancer untuk semua tabel
     */
    function initTableScrollEnhancer() {
        // Tunggu DOM ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', enhanceAllTables);
        } else {
            enhanceAllTables();
        }
    }

    /**
     * Enhance semua tabel yang ada di halaman
     */
    function enhanceAllTables() {
        const containers = document.querySelectorAll(
            '.table-container, .table-responsive, .iku-table-container, ' +
            '.swot-table-container, .risk-table-container, ' +
            '.strategic-map-table-container, .user-table-container'
        );

        containers.forEach(container => {
            enhanceTableContainer(container);
        });

        // Observer untuk tabel yang ditambahkan secara dinamis
        observeNewTables();
    }

    /**
     * Enhance single table container
     */
    function enhanceTableContainer(container) {
        // Skip jika sudah di-enhance
        if (container.dataset.scrollEnhanced === 'true') {
            return;
        }

        // Tandai sebagai sudah di-enhance
        container.dataset.scrollEnhanced = 'true';

        // Tambahkan scroll indicators
        addScrollIndicators(container);

        // Tambahkan scroll buttons
        addScrollButtons(container);

        // Tambahkan scroll event listeners
        addScrollListeners(container);

        // Tambahkan keyboard navigation
        addKeyboardNavigation(container);

        // Check initial scroll state
        updateScrollIndicators(container);
    }

    /**
     * Tambahkan indikator scroll (shadow di kiri/kanan)
     */
    function addScrollIndicators(container) {
        container.classList.add('scroll-enhanced');

        // Tambahkan wrapper untuk shadow effect
        if (!container.querySelector('.scroll-shadow-left')) {
            const shadowLeft = document.createElement('div');
            shadowLeft.className = 'scroll-shadow scroll-shadow-left';
            container.appendChild(shadowLeft);

            const shadowRight = document.createElement('div');
            shadowRight.className = 'scroll-shadow scroll-shadow-right';
            container.appendChild(shadowRight);
        }
    }

    /**
     * Tambahkan tombol scroll kiri/kanan
     */
    function addScrollButtons(container) {
        // Skip jika sudah ada tombol
        if (container.querySelector('.scroll-btn')) {
            return;
        }

        // Tombol scroll kiri
        const btnLeft = createScrollButton('left', () => {
            smoothScrollBy(container, -CONFIG.scrollStep);
        });

        // Tombol scroll kanan
        const btnRight = createScrollButton('right', () => {
            smoothScrollBy(container, CONFIG.scrollStep);
        });

        container.appendChild(btnLeft);
        container.appendChild(btnRight);
    }

    /**
     * Buat tombol scroll
     */
    function createScrollButton(direction, onClick) {
        const btn = document.createElement('button');
        btn.className = `scroll-btn scroll-btn-${direction}`;
        btn.innerHTML = direction === 'left' 
            ? '<i class="fas fa-chevron-left"></i>' 
            : '<i class="fas fa-chevron-right"></i>';
        btn.setAttribute('aria-label', `Scroll ${direction}`);
        btn.addEventListener('click', onClick);
        return btn;
    }

    /**
     * Smooth scroll dengan animasi
     */
    function smoothScrollBy(container, distance) {
        const start = container.scrollLeft;
        const target = start + distance;
        const startTime = performance.now();

        function animate(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / CONFIG.smoothScrollDuration, 1);
            
            // Easing function (ease-in-out)
            const easeProgress = progress < 0.5
                ? 2 * progress * progress
                : 1 - Math.pow(-2 * progress + 2, 2) / 2;

            container.scrollLeft = start + (distance * easeProgress);

            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        }

        requestAnimationFrame(animate);
    }

    /**
     * Tambahkan scroll event listeners
     */
    function addScrollListeners(container) {
        let scrollTimeout;

        container.addEventListener('scroll', () => {
            // Update indicators
            updateScrollIndicators(container);

            // Show scroll hint
            clearTimeout(scrollTimeout);
            container.classList.add('scrolling');
            
            scrollTimeout = setTimeout(() => {
                container.classList.remove('scrolling');
            }, 1000);
        });

        // Touch events untuk mobile
        let touchStartX = 0;
        
        container.addEventListener('touchstart', (e) => {
            touchStartX = e.touches[0].clientX;
        });

        container.addEventListener('touchmove', (e) => {
            const touchCurrentX = e.touches[0].clientX;
            const diff = touchStartX - touchCurrentX;
            
            if (Math.abs(diff) > 10) {
                e.preventDefault();
                container.scrollLeft += diff;
                touchStartX = touchCurrentX;
            }
        }, { passive: false });
    }

    /**
     * Update scroll indicators berdasarkan posisi scroll
     */
    function updateScrollIndicators(container) {
        const scrollLeft = container.scrollLeft;
        const scrollWidth = container.scrollWidth;
        const clientWidth = container.clientWidth;
        const maxScroll = scrollWidth - clientWidth;

        // Update shadow indicators
        const shadowLeft = container.querySelector('.scroll-shadow-left');
        const shadowRight = container.querySelector('.scroll-shadow-right');

        if (shadowLeft) {
            shadowLeft.style.opacity = scrollLeft > 10 ? '1' : '0';
        }

        if (shadowRight) {
            shadowRight.style.opacity = scrollLeft < maxScroll - 10 ? '1' : '0';
        }

        // Update scroll buttons
        const btnLeft = container.querySelector('.scroll-btn-left');
        const btnRight = container.querySelector('.scroll-btn-right');

        if (btnLeft) {
            btnLeft.style.display = scrollLeft > 10 ? 'flex' : 'none';
        }

        if (btnRight) {
            btnRight.style.display = scrollLeft < maxScroll - 10 ? 'flex' : 'none';
        }

        // Update container class
        if (scrollWidth > clientWidth) {
            container.classList.add('has-horizontal-scroll');
        } else {
            container.classList.remove('has-horizontal-scroll');
        }
    }

    /**
     * Tambahkan keyboard navigation
     */
    function addKeyboardNavigation(container) {
        container.setAttribute('tabindex', '0');
        
        container.addEventListener('keydown', (e) => {
            switch(e.key) {
                case 'ArrowLeft':
                    e.preventDefault();
                    smoothScrollBy(container, -CONFIG.scrollStep);
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    smoothScrollBy(container, CONFIG.scrollStep);
                    break;
                case 'Home':
                    e.preventDefault();
                    container.scrollLeft = 0;
                    break;
                case 'End':
                    e.preventDefault();
                    container.scrollLeft = container.scrollWidth;
                    break;
            }
        });
    }

    /**
     * Observer untuk tabel yang ditambahkan secara dinamis
     */
    function observeNewTables() {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === 1) { // Element node
                        // Check if node itself is a table container
                        if (node.matches('.table-container, .table-responsive')) {
                            enhanceTableContainer(node);
                        }
                        
                        // Check for table containers in children
                        const containers = node.querySelectorAll(
                            '.table-container, .table-responsive'
                        );
                        containers.forEach(enhanceTableContainer);
                    }
                });
            });
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    /**
     * Utility: Detect if table needs horizontal scroll
     */
    function tableNeedsScroll(container) {
        return container.scrollWidth > container.clientWidth;
    }

    /**
     * Public API
     */
    window.TableScrollEnhancer = {
        init: initTableScrollEnhancer,
        enhance: enhanceTableContainer,
        updateIndicators: updateScrollIndicators
    };

    // Auto-initialize
    initTableScrollEnhancer();

    // Re-check on window resize
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            document.querySelectorAll('[data-scroll-enhanced="true"]').forEach(container => {
                updateScrollIndicators(container);
            });
        }, 250);
    });

})();
