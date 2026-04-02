/**
 * Risk Profile - Perbaikan Lengkap
 * 1. Hapus tulisan "Detail Inherent Risk Analysis" di atas tabel
 * 2. Perbaiki tampilan kartu dan grafik (race condition, CSS)
 * 3. Perbaiki fungsi filtering yang tidak bekerja
 */

(function() {
  'use strict';

  console.log('🔧 Risk Profile Fix - Initializing...');

  // Fix 1: Hapus tulisan "Detail Inherent Risk Analysis" di atas tabel
  function removeDetailInherentRiskTitle() {
    // Cari semua elemen yang mengandung teks "Detail Inherent Risk Analysis"
    const elements = document.querySelectorAll('h4, h5, h3, .card-title, .section-title');
    
    elements.forEach(el => {
      if (el.textContent.includes('Detail Inherent Risk Analysis') || 
          el.textContent.includes('Detail Inherent Risk')) {
        console.log('✅ Menghapus judul:', el.textContent);
        el.remove();
      }
    });

    // Juga cari di dalam renderActionButtons
    const actionButtonsContainer = document.querySelector('.btn-success, .btn-primary')?.closest('div');
    if (actionButtonsContainer) {
      const h4 = actionButtonsContainer.querySelector('h4');
      if (h4 && h4.textContent.includes('Detail Inherent Risk')) {
        console.log('✅ Menghapus judul di action buttons');
        h4.remove();
      }
    }
  }

  // Fix 2: Perbaiki race condition untuk kartu dan grafik
  function fixCardsAndChartsRaceCondition() {
    console.log('🔄 Memperbaiki race condition untuk kartu dan grafik...');

    // Tunggu hingga DOM siap dan data tersedia
    const checkAndRender = () => {
      // Cek apakah RiskProfileModule sudah ada
      if (typeof window.RiskProfileModule === 'undefined') {
        console.log('⏳ Menunggu RiskProfileModule...');
        setTimeout(checkAndRender, 100);
        return;
      }

      // Cek apakah Chart.js sudah loaded
      if (typeof Chart === 'undefined') {
        console.log('⏳ Menunggu Chart.js...');
        setTimeout(checkAndRender, 100);
        return;
      }

      // Cek apakah container sudah ada
      const container = document.getElementById('risk-profile-content');
      if (!container) {
        console.log('⏳ Menunggu container...');
        setTimeout(checkAndRender, 100);
        return;
      }

      console.log('✅ Semua dependency siap, rendering kartu dan grafik...');
      
      // Force render statistics cards
      renderStatisticsCards();
      
      // Force render pie charts dengan delay untuk memastikan canvas sudah ada
      setTimeout(() => {
        renderPieCharts();
      }, 200);
    };

    checkAndRender();
  }

  // Render statistics cards dengan data yang benar
  function renderStatisticsCards() {
    console.log('📊 Rendering statistics cards...');
    
    const data = window.RiskProfileModule?.state?.data || [];
    
    const stats = {
      total: data.length,
      extreme: data.filter(d => 
        d.risk_level === 'EXTREME HIGH' || 
        d.risk_level === 'Very High' || 
        d.risk_level === 'Sangat Tinggi'
      ).length,
      high: data.filter(d => 
        d.risk_level === 'HIGH RISK' || 
        d.risk_level === 'Tinggi'
      ).length,
      medium: data.filter(d => 
        d.risk_level === 'MEDIUM RISK' || 
        d.risk_level === 'Sedang'
      ).length,
      low: data.filter(d => 
        d.risk_level === 'LOW RISK' || 
        d.risk_level === 'Rendah'
      ).length
    };

    // Update card values
    const totalEl = document.getElementById('total-profiles');
    const highEl = document.getElementById('high-risk-profiles');
    const mediumEl = document.getElementById('medium-risk-profiles');
    const lowEl = document.getElementById('low-risk-profiles');

    if (totalEl) {
      totalEl.textContent = stats.total;
      console.log('✅ Total profiles updated:', stats.total);
    }
    if (highEl) {
      highEl.textContent = stats.extreme + stats.high;
      console.log('✅ High risk profiles updated:', stats.extreme + stats.high);
    }
    if (mediumEl) {
      mediumEl.textContent = stats.medium;
      console.log('✅ Medium risk profiles updated:', stats.medium);
    }
    if (lowEl) {
      lowEl.textContent = stats.low;
      console.log('✅ Low risk profiles updated:', stats.low);
    }
  }

  // Render pie charts dengan data yang benar
  function renderPieCharts() {
    console.log('📈 Rendering pie charts...');
    
    if (typeof Chart === 'undefined') {
      console.error('❌ Chart.js tidak tersedia');
      return;
    }

    const data = window.RiskProfileModule?.state?.data || [];
    
    if (data.length === 0) {
      console.warn('⚠️ Tidak ada data untuk grafik');
      return;
    }

    // Risk Level Pie Chart
    renderRiskLevelPieChart(data);
    
    // Category Pie Chart
    renderCategoryPieChart(data);
    
    // Unit Kerja Pie Chart
    renderUnitPieChart(data);
  }

  function renderRiskLevelPieChart(data) {
    const canvas = document.getElementById('risk-level-pie-chart');
    if (!canvas) {
      console.warn('⚠️ Canvas risk-level-pie-chart tidak ditemukan');
      return;
    }

    // Destroy existing chart
    const existingChart = Chart.getChart(canvas);
    if (existingChart) {
      existingChart.destroy();
    }

    const stats = {
      extreme: data.filter(d => 
        d.risk_level === 'EXTREME HIGH' || 
        d.risk_level === 'Very High' || 
        d.risk_level === 'Sangat Tinggi'
      ).length,
      high: data.filter(d => 
        d.risk_level === 'HIGH RISK' || 
        d.risk_level === 'Tinggi'
      ).length,
      medium: data.filter(d => 
        d.risk_level === 'MEDIUM RISK' || 
        d.risk_level === 'Sedang'
      ).length,
      low: data.filter(d => 
        d.risk_level === 'LOW RISK' || 
        d.risk_level === 'Rendah'
      ).length
    };

    new Chart(canvas, {
      type: 'pie',
      data: {
        labels: ['Extreme High', 'High Risk', 'Medium Risk', 'Low Risk'],
        datasets: [{
          data: [stats.extreme, stats.high, stats.medium, stats.low],
          backgroundColor: ['#dc3545', '#ffc107', '#17a2b8', '#28a745'],
          borderWidth: 2,
          borderColor: '#fff'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              padding: 10,
              font: { size: 11 }
            }
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                const label = context.label || '';
                const value = context.parsed || 0;
                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                return `${label}: ${value} (${percentage}%)`;
              }
            }
          }
        }
      }
    });

    console.log('✅ Risk Level Pie Chart rendered');
  }

  function renderCategoryPieChart(data) {
    const canvas = document.getElementById('risk-category-pie-chart');
    if (!canvas) {
      console.warn('⚠️ Canvas risk-category-pie-chart tidak ditemukan');
      return;
    }

    // Destroy existing chart
    const existingChart = Chart.getChart(canvas);
    if (existingChart) {
      existingChart.destroy();
    }

    const categoryData = {};
    data.forEach(item => {
      const category = item.risk_inputs?.master_risk_categories?.name || 'Tidak Dikategorikan';
      categoryData[category] = (categoryData[category] || 0) + 1;
    });

    const labels = Object.keys(categoryData);
    const values = Object.values(categoryData);
    const colors = generateColors(labels.length);

    new Chart(canvas, {
      type: 'pie',
      data: {
        labels: labels,
        datasets: [{
          data: values,
          backgroundColor: colors,
          borderWidth: 2,
          borderColor: '#fff'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              padding: 10,
              font: { size: 11 }
            }
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                const label = context.label || '';
                const value = context.parsed || 0;
                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                return `${label}: ${value} (${percentage}%)`;
              }
            }
          }
        }
      }
    });

    console.log('✅ Category Pie Chart rendered');
  }

  function renderUnitPieChart(data) {
    const canvas = document.getElementById('risk-unit-pie-chart');
    if (!canvas) {
      console.warn('⚠️ Canvas risk-unit-pie-chart tidak ditemukan');
      return;
    }

    // Destroy existing chart
    const existingChart = Chart.getChart(canvas);
    if (existingChart) {
      existingChart.destroy();
    }

    const unitData = {};
    data.forEach(item => {
      const unit = item.risk_inputs?.master_work_units?.name || 'Tidak Ada Unit';
      unitData[unit] = (unitData[unit] || 0) + 1;
    });

    const labels = Object.keys(unitData);
    const values = Object.values(unitData);
    const colors = generateColors(labels.length);

    new Chart(canvas, {
      type: 'pie',
      data: {
        labels: labels,
        datasets: [{
          data: values,
          backgroundColor: colors,
          borderWidth: 2,
          borderColor: '#fff'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              padding: 10,
              font: { size: 11 }
            }
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                const label = context.label || '';
                const value = context.parsed || 0;
                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                return `${label}: ${value} (${percentage}%)`;
              }
            }
          }
        }
      }
    });

    console.log('✅ Unit Pie Chart rendered');
  }

  function generateColors(count) {
    const colors = [
      '#3498db', '#e74c3c', '#f39c12', '#27ae60', '#9b59b6',
      '#1abc9c', '#34495e', '#e67e22', '#95a5a6', '#16a085',
      '#2980b9', '#8e44ad', '#2c3e50', '#f1c40f', '#d35400'
    ];
    
    const result = [];
    for (let i = 0; i < count; i++) {
      result.push(colors[i % colors.length]);
    }
    return result;
  }

  // Fix 3: Perbaiki fungsi filtering
  function fixFilteringFunction() {
    console.log('🔍 Memperbaiki fungsi filtering...');

    // Override applyFilter function
    if (window.RiskProfileModule) {
      const originalApplyFilter = window.RiskProfileModule.applyFilter;
      
      window.RiskProfileModule.applyFilter = async function() {
        console.log('=== FILTER DIPANGGIL ===');
        
        try {
          // Panggil fungsi original
          await originalApplyFilter.call(this);
          
          // Update kartu dan grafik setelah filter
          setTimeout(() => {
            renderStatisticsCards();
            renderPieCharts();
            removeDetailInherentRiskTitle();
          }, 300);
          
          console.log('✅ Filter berhasil diterapkan dan UI diupdate');
        } catch (error) {
          console.error('❌ Error saat apply filter:', error);
        }
      };
    }

    // Tambahkan event listener untuk filter dropdowns
    const filterElements = [
      'filter-rencana',
      'filter-unit',
      'filter-kategori',
      'filter-level',
      'filter-rencana-strategis',
      'filter-unit-kerja',
      'filter-kategori-risiko',
      'filter-risk-level'
    ];

    filterElements.forEach(id => {
      const element = document.getElementById(id);
      if (element) {
        // Remove existing listeners
        const newElement = element.cloneNode(true);
        element.parentNode.replaceChild(newElement, element);
        
        // Add new listener
        newElement.addEventListener('change', async function() {
          console.log(`🔄 Filter ${id} berubah:`, this.value);
          
          if (window.RiskProfileModule && window.RiskProfileModule.applyFilter) {
            await window.RiskProfileModule.applyFilter();
          }
        });
        
        console.log(`✅ Event listener ditambahkan untuk ${id}`);
      }
    });
  }

  // Initialize all fixes
  function initializeFixes() {
    console.log('🚀 Menginisialisasi semua perbaikan...');
    
    // Fix 1: Remove title
    removeDetailInherentRiskTitle();
    
    // Fix 2: Fix race condition
    fixCardsAndChartsRaceCondition();
    
    // Fix 3: Fix filtering
    fixFilteringFunction();
    
    // Monitor untuk perubahan DOM
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.addedNodes.length) {
          // Cek jika ada node baru yang ditambahkan
          removeDetailInherentRiskTitle();
        }
      });
    });

    // Observe document body
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    console.log('✅ Semua perbaikan berhasil diinisialisasi');
  }

  // Run fixes when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeFixes);
  } else {
    initializeFixes();
  }

  // Also run after a delay to catch late-loaded content
  setTimeout(initializeFixes, 1000);
  setTimeout(initializeFixes, 2000);

  // Export functions for manual use
  window.riskProfileFix = {
    removeTitle: removeDetailInherentRiskTitle,
    fixCards: renderStatisticsCards,
    fixCharts: renderPieCharts,
    fixFilters: fixFilteringFunction,
    reinitialize: initializeFixes
  };

  console.log('✅ Risk Profile Fix loaded successfully');
})();
