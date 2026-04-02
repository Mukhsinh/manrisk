/**
 * Risk Profile - Layout Fix
 * Memperbaiki penataan halaman risk profile agar lebih rapi dan sesuai
 */

(function() {
  'use strict';

  console.log('🎨 Risk Profile Layout Fix - Initializing...');

  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initLayoutFix);
  } else {
    initLayoutFix();
  }

  function initLayoutFix() {
    console.log('✅ DOM Ready - Applying layout fixes...');

    // Fix 1: Reorganize filter section
    fixFilterSection();

    // Fix 2: Adjust statistics cards
    fixStatisticsCards();

    // Fix 3: Reorganize pie charts
    fixPieChartsLayout();

    // Fix 4: Fix main content grid
    fixMainContentGrid();

    // Fix 5: Improve table layout
    fixTableLayout();

    // Fix 6: Adjust heat map and analysis panel
    fixSidebarLayout();

    // Fix 7: Add responsive handlers
    addResponsiveHandlers();

    console.log('✅ Layout fixes applied successfully');
  }

  /**
   * Fix 1: Reorganize filter section
   */
  function fixFilterSection() {
    const filterSection = document.querySelector('.bg-white.rounded-lg.shadow-sm.p-3.mb-3');
    if (!filterSection) return;

    filterSection.classList.add('filter-section');
    filterSection.classList.remove('p-3', 'mb-3');

    // Adjust grid layout
    const filterGrid = filterSection.querySelector('.grid');
    if (filterGrid) {
      filterGrid.classList.remove('gap-3');
      filterGrid.classList.add('gap-2');
    }

    // Adjust buttons
    const buttonContainer = filterSection.querySelector('.flex.gap-2.mt-3');
    if (buttonContainer) {
      buttonContainer.classList.remove('mt-3');
      buttonContainer.classList.add('mt-2');
    }

    console.log('✓ Filter section fixed');
  }

  /**
   * Fix 2: Adjust statistics cards
   */
  function fixStatisticsCards() {
    const statsContainer = document.querySelector('.grid.grid-cols-1.sm\\:grid-cols-2.lg\\:grid-cols-4');
    if (!statsContainer) return;

    statsContainer.classList.add('stats-grid');
    
    // Ensure consistent card heights
    const cards = statsContainer.querySelectorAll('.bg-white.rounded-2xl');
    cards.forEach(card => {
      card.style.minHeight = '120px';
      card.style.display = 'flex';
      card.style.flexDirection = 'column';
      card.style.justifyContent = 'space-between';
    });

    console.log('✓ Statistics cards fixed');
  }

  /**
   * Fix 3: Reorganize pie charts
   */
  function fixPieChartsLayout() {
    const pieChartsContainer = document.querySelector('.grid.grid-cols-1.md\\:grid-cols-3');
    if (!pieChartsContainer) return;

    pieChartsContainer.classList.add('pie-charts-container');
    
    // Ensure consistent chart container heights
    const chartCards = pieChartsContainer.querySelectorAll('.bg-white.rounded-2xl');
    chartCards.forEach(card => {
      card.style.minHeight = '320px';
      card.style.display = 'flex';
      card.style.flexDirection = 'column';
      
      // Adjust canvas container
      const canvasContainer = card.querySelector('.relative');
      if (canvasContainer) {
        canvasContainer.style.flex = '1';
        canvasContainer.style.display = 'flex';
        canvasContainer.style.alignItems = 'center';
        canvasContainer.style.justifyContent = 'center';
        canvasContainer.style.minHeight = '250px';
      }
    });

    console.log('✓ Pie charts layout fixed');
  }

  /**
   * Fix 4: Fix main content grid
   */
  function fixMainContentGrid() {
    const mainGrid = document.querySelector('.grid.grid-cols-1.xl\\:grid-cols-12');
    if (!mainGrid) return;

    mainGrid.classList.add('main-content-grid');
    mainGrid.classList.remove('grid-cols-1', 'xl:grid-cols-12');
    
    // Adjust table section
    const tableSection = mainGrid.querySelector('.xl\\:col-span-8');
    if (tableSection) {
      tableSection.classList.remove('xl:col-span-8');
      tableSection.classList.add('table-section');
    }

    // Adjust sidebar section
    const sidebarSection = mainGrid.querySelector('.xl\\:col-span-4');
    if (sidebarSection) {
      sidebarSection.classList.remove('xl:col-span-4');
      sidebarSection.classList.add('sidebar-section');
    }

    console.log('✓ Main content grid fixed');
  }

  /**
   * Fix 5: Improve table layout
   */
  function fixTableLayout() {
    const tableContainer = document.querySelector('.overflow-x-auto');
    if (!tableContainer) return;

    // Add smooth scrolling
    tableContainer.style.scrollBehavior = 'smooth';
    
    // Ensure table has minimum width
    const table = tableContainer.querySelector('table');
    if (table) {
      table.style.minWidth = '900px';
    }

    // Make thead sticky
    const thead = table?.querySelector('thead');
    if (thead) {
      thead.style.position = 'sticky';
      thead.style.top = '0';
      thead.style.zIndex = '10';
      thead.style.background = '#f8fafc';
    }

    console.log('✓ Table layout fixed');
  }

  /**
   * Fix 6: Adjust heat map and analysis panel
   */
  function fixSidebarLayout() {
    const sidebarSection = document.querySelector('.sidebar-section');
    if (!sidebarSection) return;

    // Make sidebar sticky on desktop
    if (window.innerWidth >= 1280) {
      sidebarSection.style.position = 'sticky';
      sidebarSection.style.top = '1rem';
    }

    // Adjust heat map container
    const heatMapContainer = sidebarSection.querySelector('.bg-white.rounded-2xl.shadow-card');
    if (heatMapContainer) {
      heatMapContainer.classList.add('heat-map-container');
      
      const heatMap = heatMapContainer.querySelector('#heat-map');
      if (heatMap) {
        heatMap.style.maxWidth = '280px';
        heatMap.style.width = '100%';
        heatMap.style.aspectRatio = '1';
        heatMap.style.margin = '0 auto';
      }
    }

    // Adjust analysis panel
    const analysisPanel = sidebarSection.querySelectorAll('.bg-white.rounded-2xl.shadow-card')[1];
    if (analysisPanel) {
      analysisPanel.classList.add('risk-analysis-panel');
      analysisPanel.style.maxHeight = '600px';
      analysisPanel.style.overflowY = 'auto';
    }

    console.log('✓ Sidebar layout fixed');
  }

  /**
   * Fix 7: Add responsive handlers
   */
  function addResponsiveHandlers() {
    let resizeTimer;
    
    window.addEventListener('resize', function() {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function() {
        handleResponsiveLayout();
      }, 250);
    });

    // Initial call
    handleResponsiveLayout();

    console.log('✓ Responsive handlers added');
  }

  /**
   * Handle responsive layout changes
   */
  function handleResponsiveLayout() {
    const width = window.innerWidth;
    const sidebarSection = document.querySelector('.sidebar-section');
    
    if (!sidebarSection) return;

    if (width >= 1280) {
      // Desktop: sidebar is sticky
      sidebarSection.style.position = 'sticky';
      sidebarSection.style.top = '1rem';
      sidebarSection.style.display = 'flex';
      sidebarSection.style.flexDirection = 'column';
      sidebarSection.style.gridTemplateColumns = '';
    } else if (width >= 768) {
      // Tablet: sidebar is grid 2 columns
      sidebarSection.style.position = 'static';
      sidebarSection.style.display = 'grid';
      sidebarSection.style.gridTemplateColumns = 'repeat(2, 1fr)';
      sidebarSection.style.flexDirection = '';
    } else {
      // Mobile: sidebar is single column
      sidebarSection.style.position = 'static';
      sidebarSection.style.display = 'grid';
      sidebarSection.style.gridTemplateColumns = '1fr';
      sidebarSection.style.flexDirection = '';
    }
  }

  /**
   * Utility: Add class if not exists
   */
  function addClassIfNotExists(element, className) {
    if (element && !element.classList.contains(className)) {
      element.classList.add(className);
    }
  }

  /**
   * Utility: Remove class if exists
   */
  function removeClassIfExists(element, className) {
    if (element && element.classList.contains(className)) {
      element.classList.remove(className);
    }
  }

  // Export for debugging
  window.riskProfileLayoutFix = {
    init: initLayoutFix,
    fixFilterSection,
    fixStatisticsCards,
    fixPieChartsLayout,
    fixMainContentGrid,
    fixTableLayout,
    fixSidebarLayout,
    handleResponsiveLayout
  };

  console.log('✅ Risk Profile Layout Fix - Ready');
})();
