/**
 * Risk Profile Chart Fix
 * Memperbaiki masalah tampilan kartu statistik dan grafik pie chart
 */

(function() {
    'use strict';

    console.log('🔧 Risk Profile Chart Fix loaded');

    // Tunggu DOM dan Chart.js siap
    function waitForChartJS(callback, maxAttempts = 50) {
        let attempts = 0;
        const checkInterval = setInterval(() => {
            attempts++;
            if (typeof Chart !== 'undefined') {
                clearInterval(checkInterval);
                console.log('✅ Chart.js siap setelah', attempts, 'percobaan');
                callback();
            } else if (attempts >= maxAttempts) {
                clearInterval(checkInterval);
                console.error('❌ Chart.js gagal dimuat setelah', maxAttempts, 'percobaan');
            }
        }, 100);
    }

    // Override fungsi renderPieCharts untuk menambahkan error handling
    if (window.renderPieCharts) {
        const originalRenderPieCharts = window.renderPieCharts;
        window.renderPieCharts = function() {
            console.log('🎨 Rendering pie charts dengan fix...');
            
            if (typeof Chart === 'undefined') {
                console.warn('⚠️ Chart.js belum siap, menunggu...');
                waitForChartJS(() => {
                    console.log('✅ Chart.js siap, rendering charts...');
                    originalRenderPieCharts();
                });
                return;
            }
            
            try {
                originalRenderPieCharts();
                console.log('✅ Pie charts berhasil di-render');
            } catch (error) {
                console.error('❌ Error rendering pie charts:', error);
            }
        };
    }

    // Override fungsi updateStatistics untuk menambahkan validasi
    if (window.updateStatistics) {
        const originalUpdateStatistics = window.updateStatistics;
        window.updateStatistics = function() {
            console.log('📊 Updating statistics dengan fix...');
            
            try {
                // Pastikan elemen DOM ada
                const elements = {
                    total: document.getElementById('total-profiles'),
                    high: document.getElementById('high-risk-profiles'),
                    medium: document.getElementById('medium-risk-profiles'),
                    low: document.getElementById('low-risk-profiles')
                };

                const missingElements = Object.entries(elements)
                    .filter(([key, el]) => !el)
                    .map(([key]) => key);

                if (missingElements.length > 0) {
                    console.warn('⚠️ Elemen tidak ditemukan:', missingElements);
                }

                originalUpdateStatistics();
                console.log('✅ Statistics berhasil di-update');
            } catch (error) {
                console.error('❌ Error updating statistics:', error);
            }
        };
    }

    // Fungsi helper untuk memastikan charts di-render dengan benar
    window.ensureChartsRendered = function() {
        console.log('🔄 Memastikan charts di-render...');
        
        if (typeof Chart === 'undefined') {
            console.warn('⚠️ Chart.js tidak tersedia');
            return false;
        }

        const canvasIds = [
            'risk-level-pie-chart',
            'risk-category-pie-chart', 
            'risk-unit-pie-chart'
        ];

        const missingCanvas = canvasIds.filter(id => !document.getElementById(id));
        
        if (missingCanvas.length > 0) {
            console.warn('⚠️ Canvas tidak ditemukan:', missingCanvas);
            return false;
        }

        console.log('✅ Semua canvas tersedia');
        return true;
    };

    // Auto-fix saat halaman dimuat
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            console.log('📄 DOM loaded, menjalankan auto-fix...');
            setTimeout(() => {
                if (window.ensureChartsRendered()) {
                    if (typeof window.renderPieCharts === 'function') {
                        window.renderPieCharts();
                    }
                }
            }, 500);
        });
    } else {
        console.log('📄 DOM sudah loaded, menjalankan auto-fix...');
        setTimeout(() => {
            if (window.ensureChartsRendered()) {
                if (typeof window.renderPieCharts === 'function') {
                    window.renderPieCharts();
                }
            }
        }, 500);
    }

    // Tambahkan fungsi debug
    window.debugRiskProfileCharts = function() {
        console.log('🔍 Debug Risk Profile Charts:');
        console.log('- Chart.js loaded:', typeof Chart !== 'undefined');
        console.log('- filteredData:', window.filteredData?.length || 0, 'items');
        console.log('- Canvas elements:');
        
        const canvasIds = [
            'risk-level-pie-chart',
            'risk-category-pie-chart',
            'risk-unit-pie-chart'
        ];
        
        canvasIds.forEach(id => {
            const canvas = document.getElementById(id);
            console.log(`  - ${id}:`, canvas ? '✅ Found' : '❌ Not found');
        });

        console.log('- Chart instances:');
        console.log('  - riskLevelChart:', window.riskLevelChart ? '✅ Created' : '❌ Not created');
        console.log('  - categoryChart:', window.categoryChart ? '✅ Created' : '❌ Not created');
        console.log('  - unitChart:', window.unitChart ? '✅ Created' : '❌ Not created');
    };

    console.log('✅ Risk Profile Chart Fix initialized');
    console.log('💡 Gunakan window.debugRiskProfileCharts() untuk debug');
})();
