/**
 * Residual Risk & KRI UI/UX Fix
 * Memperbaiki tampilan sesuai dengan gambar yang diupload
 */

(function() {
    'use strict';
    
    console.log('[UI Fix] Initializing Residual Risk & KRI UI/UX fixes...');
    
    /**
     * Apply UI fixes when DOM is ready
     */
    function applyUIFixes() {
        // Load CSS fix
        loadCSSFix();
        
        // Fix page headers
        fixPageHeaders();
        
        // Fix buttons
        fixButtons();
        
        // Fix badges
        fixBadges();
        
        // Fix tables
        fixTables();
        
        // Fix cards
        fixCards();
        
        console.log('[UI Fix] All UI fixes applied successfully');
    }
    
    /**
     * Load CSS fix file
     */
    function loadCSSFix() {
        const cssId = 'residual-kri-ui-fix-css';
        
        if (!document.getElementById(cssId)) {
            const link = document.createElement('link');
            link.id = cssId;
            link.rel = 'stylesheet';
            link.href = '/css/residual-kri-ui-fix.css';
            document.head.appendChild(link);
            console.log('[UI Fix] CSS file loaded');
        }
    }
    
    /**
     * Fix page headers to match design
     */
    function fixPageHeaders() {
        const headers = document.querySelectorAll('.page-header');
        
        headers.forEach(header => {
            // Ensure white background with blue border
            header.style.background = '#ffffff';
            header.style.borderLeft = '4px solid #1e40af';
            header.style.padding = '1.5rem';
            header.style.marginBottom = '2rem';
            header.style.borderRadius = '8px';
            header.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
            
            // Fix title color
            const title = header.querySelector('.page-title');
            if (title) {
                title.style.color = '#1e40af';
                title.style.fontWeight = '700';
            }
            
            // Fix subtitle color
            const subtitle = header.querySelector('.page-subtitle');
            if (subtitle) {
                subtitle.style.color = '#64748b';
            }
        });
        
        console.log('[UI Fix] Page headers fixed:', headers.length);
    }
    
    /**
     * Fix button styles to match design
     */
    function fixButtons() {
        // Fix success buttons (green)
        document.querySelectorAll('.btn-success').forEach(btn => {
            btn.style.background = '#10b981';
            btn.style.border = 'none';
            btn.style.color = '#ffffff';
            btn.style.fontWeight = '600';
        });
        
        // Fix info buttons (blue)
        document.querySelectorAll('.btn-info').forEach(btn => {
            btn.style.background = '#3b82f6';
            btn.style.border = 'none';
            btn.style.color = '#ffffff';
            btn.style.fontWeight = '600';
        });
        
        // Fix primary buttons (dark blue)
        document.querySelectorAll('.btn-primary').forEach(btn => {
            btn.style.background = '#1e40af';
            btn.style.border = 'none';
            btn.style.color = '#ffffff';
            btn.style.fontWeight = '600';
        });
        
        // Fix action buttons
        document.querySelectorAll('.btn-action-edit').forEach(btn => {
            btn.style.background = '#3b82f6';
            btn.style.color = '#ffffff';
            btn.style.border = 'none';
            btn.style.fontWeight = '600';
        });
        
        document.querySelectorAll('.btn-action-delete').forEach(btn => {
            btn.style.background = '#ef4444';
            btn.style.color = '#ffffff';
            btn.style.border = 'none';
            btn.style.fontWeight = '600';
        });
        
        console.log('[UI Fix] Buttons fixed');
    }
    
    /**
     * Fix badge styles to match design
     */
    function fixBadges() {
        // Fix low risk / aman badges (green)
        document.querySelectorAll('.badge-low-risk, .badge-aman').forEach(badge => {
            badge.style.background = '#10b981';
            badge.style.color = '#ffffff';
            badge.style.fontWeight = '700';
        });
        
        // Fix medium risk / hati-hati badges (yellow)
        document.querySelectorAll('.badge-medium-risk, .badge-hati-hati').forEach(badge => {
            badge.style.background = '#f59e0b';
            badge.style.color = '#ffffff';
            badge.style.fontWeight = '700';
        });
        
        // Fix high risk / kritis badges (red)
        document.querySelectorAll('.badge-high-risk, .badge-kritis').forEach(badge => {
            badge.style.background = '#ef4444';
            badge.style.color = '#ffffff';
            badge.style.fontWeight = '700';
        });
        
        // Fix extreme high badges (dark red)
        document.querySelectorAll('.badge-extreme-high').forEach(badge => {
            badge.style.background = '#dc2626';
            badge.style.color = '#ffffff';
            badge.style.fontWeight = '700';
        });
        
        console.log('[UI Fix] Badges fixed');
    }
    
    /**
     * Fix table styles to match design
     */
    function fixTables() {
        // Fix table headers
        document.querySelectorAll('.table thead th').forEach(th => {
            th.style.background = '#ffffff';
            th.style.color = '#1e293b';
            th.style.fontWeight = '700';
            th.style.textTransform = 'uppercase';
            th.style.fontSize = '0.875rem';
            th.style.borderBottom = '2px solid #e2e8f0';
        });
        
        // Fix table rows
        document.querySelectorAll('.table tbody tr').forEach(tr => {
            tr.addEventListener('mouseenter', function() {
                this.style.background = '#f8fafc';
            });
            
            tr.addEventListener('mouseleave', function() {
                this.style.background = '';
            });
        });
        
        console.log('[UI Fix] Tables fixed');
    }
    
    /**
     * Fix card styles to match design
     */
    function fixCards() {
        document.querySelectorAll('.card, .chart-card, .risk-matrix-container, .chart-container').forEach(card => {
            card.style.background = '#ffffff';
            card.style.border = '1px solid #e2e8f0';
            card.style.borderRadius = '8px';
            card.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)';
        });
        
        // Fix card headers
        document.querySelectorAll('.card-header').forEach(header => {
            header.style.background = '#ffffff';
            header.style.borderBottom = '2px solid #e2e8f0';
        });
        
        // Fix card titles
        document.querySelectorAll('.card-title, .chart-title').forEach(title => {
            title.style.color = '#1e293b';
            title.style.fontWeight = '600';
        });
        
        console.log('[UI Fix] Cards fixed');
    }
    
    /**
     * Initialize on DOM ready
     */
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', applyUIFixes);
    } else {
        applyUIFixes();
    }
    
    // Re-apply fixes when content changes (for dynamic content)
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.addedNodes.length > 0) {
                // Delay to ensure content is fully rendered
                setTimeout(applyUIFixes, 100);
            }
        });
    });
    
    // Observe the entire document for changes
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
    
    console.log('[UI Fix] Mutation observer initialized');
    
})();
