/**
 * ========================================
 * TABLE SCROLL HANDLER
 * ========================================
 * Menangani scroll horizontal pada tabel
 * dan memberikan indikator visual
 */

(function () {
    'use strict';

    /**
     * Inisialisasi scroll handler untuk semua tabel
     */
    function initTableScrollHandlers() {
        // Cari semua container tabel
        const tableContainers = document.querySelectorAll(
            '.table-container, .table-responsive, .card-body > div:has(table)'
        );

        tableContainers.forEach(container => {
            setupScrollHandler(container);
            addScrollIndicators(container);
        });
    }

    /**
     * Setup scroll handler untuk container
     */
    function setupScrollHandler(container) {
        if (!container) return;

        // Update shadow indicators saat scroll
        container.addEventListener('scroll', function () {
            updateScrollShadows(this);
        });

        // Initial check
        updateScrollShadows(container);

        // Re-check saat window resize
        window.addEventListener('resize', () => {
            updateScrollShadows(container);
        });
    }

    /**
     * Update shadow indicators berdasarkan posisi scroll
     */
    function updateScrollShadows(container) {
        if (!container) return;

        const scrollLeft = container.scrollLeft;
        const scrollWidth = container.scrollWidth;
        const clientWidth = container.clientWidth;
        const maxScroll = scrollWidth - clientWidth;

        // Tambah/hapus class untuk shadow indicators
        if (scrollLeft > 10) {
            container.classList.add('has-scroll-left');
        } else {
            container.classList.remove('has-scroll-left');
        }

        if (scrollLeft < maxScroll - 10) {
            container.classList.add('has-scroll-right');
        } else {
            container.classList.remove('has-scroll-right');
        }

        // Update scroll indicator text
        updateScrollIndicatorText(container, scrollLeft, maxScroll);
    }

    /**
     * Tambahkan indikator scroll visual
     */
    function addScrollIndicators(container) {
        if (!container) return;

        // Cek apakah tabel bisa di-scroll
        const table = container.querySelector('table');
        if (!table) return;

        const isScrollable = container.scrollWidth > container.clientWidth;

        if (isScrollable && !container.querySelector('.scroll-indicator')) {
            // Tambahkan indikator scroll
            const indicator = document.createElement('div');
            indicator.className = 'scroll-indicator';
            indicator.innerHTML = `
                <div class="scroll-indicator-content">
                    <i class="fas fa-arrows-alt-h"></i>
                    <span>Geser ke kanan untuk melihat lebih banyak</span>
                </div>
            `;

            // Style inline untuk indikator
            indicator.style.cssText = `
                position: sticky;
                bottom: 0;
                left: 0;
                right: 0;
                background: linear-gradient(to top, rgba(59, 130, 246, 0.1), transparent);
                text-align: center;
                padding: 8px;
                font-size: 0.75rem;
                color: #3b82f6;
                pointer-events: none;
                z-index: 20;
                transition: opacity 0.3s ease;
            `;

            container.appendChild(indicator);

            // Sembunyikan indikator saat sudah di-scroll
            container.addEventListener('scroll', function () {
                const scrollPercentage = (this.scrollLeft / (this.scrollWidth - this.clientWidth)) * 100;
                indicator.style.opacity = scrollPercentage > 5 ? '0' : '1';
            });
        }
    }

    /**
     * Update teks indikator scroll
     */
    function updateScrollIndicatorText(container, scrollLeft, maxScroll) {
        const indicator = container.querySelector('.scroll-indicator-content span');
        if (!indicator) return;

        // Guard: jika maxScroll tidak valid, tampilkan teks default
        if (!maxScroll || maxScroll <= 0) {
            indicator.textContent = 'Geser ke kanan untuk melihat lebih banyak';
            return;
        }

        const scrollPercentage = (scrollLeft / maxScroll) * 100;

        if (scrollPercentage < 5) {
            indicator.textContent = 'Geser ke kanan untuk melihat lebih banyak';
        } else if (scrollPercentage > 95) {
            indicator.textContent = 'Geser ke kiri untuk kembali';
        } else {
            indicator.textContent = `${Math.round(scrollPercentage)}% - Geser untuk navigasi`;
        }
    }

    /**
     * Tambahkan tombol scroll cepat
     */
    function addQuickScrollButtons(container) {
        if (!container) return;

        const isScrollable = container.scrollWidth > container.clientWidth;
        if (!isScrollable) return;

        // Buat container untuk tombol
        const buttonContainer = document.createElement('div');
        buttonContainer.className = 'table-scroll-buttons';
        buttonContainer.style.cssText = `
            position: absolute;
            top: 50%;
            left: 0;
            right: 0;
            transform: translateY(-50%);
            display: flex;
            justify-content: space-between;
            pointer-events: none;
            z-index: 25;
            padding: 0 10px;
        `;

        // Tombol scroll kiri
        const leftButton = createScrollButton('left', () => {
            container.scrollBy({ left: -300, behavior: 'smooth' });
        });

        // Tombol scroll kanan
        const rightButton = createScrollButton('right', () => {
            container.scrollBy({ left: 300, behavior: 'smooth' });
        });

        buttonContainer.appendChild(leftButton);
        buttonContainer.appendChild(rightButton);

        // Tambahkan ke container (pastikan container position relative)
        if (getComputedStyle(container).position === 'static') {
            container.style.position = 'relative';
        }
        container.appendChild(buttonContainer);

        // Update visibility tombol berdasarkan posisi scroll
        container.addEventListener('scroll', function () {
            const scrollLeft = this.scrollLeft;
            const maxScroll = this.scrollWidth - this.clientWidth;

            leftButton.style.opacity = scrollLeft > 10 ? '1' : '0';
            rightButton.style.opacity = scrollLeft < maxScroll - 10 ? '1' : '0';
        });

        // Initial state
        leftButton.style.opacity = '0';
        rightButton.style.opacity = container.scrollLeft < (container.scrollWidth - container.clientWidth - 10) ? '1' : '0';
    }

    /**
     * Buat tombol scroll
     */
    function createScrollButton(direction, onClick) {
        const button = document.createElement('button');
        button.className = `table-scroll-btn table-scroll-btn-${direction}`;
        button.innerHTML = `<i class="fas fa-chevron-${direction}"></i>`;
        button.onclick = onClick;

        button.style.cssText = `
            pointer-events: auto;
            background: rgba(59, 130, 246, 0.9);
            color: white;
            border: none;
            border-radius: 50%;
            width: 36px;
            height: 36px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: all 0.3s ease;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
        `;

        button.addEventListener('mouseenter', function () {
            this.style.background = 'rgba(37, 99, 235, 1)';
            this.style.transform = 'scale(1.1)';
        });

        button.addEventListener('mouseleave', function () {
            this.style.background = 'rgba(59, 130, 246, 0.9)';
            this.style.transform = 'scale(1)';
        });

        return button;
    }

    /**
     * Tambahkan keyboard navigation
     */
    function addKeyboardNavigation() {
        document.addEventListener('keydown', function (e) {
            // Cari container tabel yang sedang di-focus atau di-hover
            const activeContainer = document.querySelector('.table-container:hover, .table-responsive:hover');
            if (!activeContainer) return;

            // Arrow keys untuk scroll
            if (e.key === 'ArrowLeft') {
                e.preventDefault();
                activeContainer.scrollBy({ left: -100, behavior: 'smooth' });
            } else if (e.key === 'ArrowRight') {
                e.preventDefault();
                activeContainer.scrollBy({ left: 100, behavior: 'smooth' });
            }
            // Home/End untuk scroll ke awal/akhir
            else if (e.key === 'Home') {
                e.preventDefault();
                activeContainer.scrollTo({ left: 0, behavior: 'smooth' });
            } else if (e.key === 'End') {
                e.preventDefault();
                activeContainer.scrollTo({ left: activeContainer.scrollWidth, behavior: 'smooth' });
            }
        });
    }

    /**
     * Tambahkan touch/swipe support untuk mobile
     */
    function addTouchSupport() {
        const tableContainers = document.querySelectorAll('.table-container, .table-responsive');

        tableContainers.forEach(container => {
            let startX = 0;
            let scrollLeft = 0;
            let isDown = false;

            container.addEventListener('touchstart', function (e) {
                isDown = true;
                startX = e.touches[0].pageX - this.offsetLeft;
                scrollLeft = this.scrollLeft;
            });

            container.addEventListener('touchmove', function (e) {
                if (!isDown) return;
                e.preventDefault();
                const x = e.touches[0].pageX - this.offsetLeft;
                const walk = (x - startX) * 2;
                this.scrollLeft = scrollLeft - walk;
            });

            container.addEventListener('touchend', function () {
                isDown = false;
            });
        });
    }

    /**
     * Inisialisasi saat DOM ready
     */
    function init() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', function () {
                initTableScrollHandlers();
                addKeyboardNavigation();
                addTouchSupport();

                // Tambahkan quick scroll buttons untuk desktop
                if (window.innerWidth > 768) {
                    document.querySelectorAll('.table-container, .table-responsive').forEach(container => {
                        addQuickScrollButtons(container);
                    });
                }
            });
        } else {
            initTableScrollHandlers();
            addKeyboardNavigation();
            addTouchSupport();

            if (window.innerWidth > 768) {
                document.querySelectorAll('.table-container, .table-responsive').forEach(container => {
                    addQuickScrollButtons(container);
                });
            }
        }

        // Re-init saat ada perubahan DOM (untuk dynamic content)
        const observer = new MutationObserver(function (mutations) {
            mutations.forEach(function (mutation) {
                if (mutation.addedNodes.length) {
                    mutation.addedNodes.forEach(function (node) {
                        if (node.nodeType === 1) { // Element node
                            if (node.matches('.table-container, .table-responsive') ||
                                node.querySelector('.table-container, .table-responsive')) {
                                setTimeout(initTableScrollHandlers, 100);
                            }
                        }
                    });
                }
            });
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    // Jalankan inisialisasi
    init();

    // Export untuk digunakan secara manual jika diperlukan
    window.TableScrollHandler = {
        init: initTableScrollHandlers,
        setupContainer: setupScrollHandler,
        addIndicators: addScrollIndicators,
        addQuickButtons: addQuickScrollButtons
    };

})();
