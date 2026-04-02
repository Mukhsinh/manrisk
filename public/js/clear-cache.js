// Force clear cache and reload
(function() {
    'use strict';
    
    // Clear all caches
    if ('caches' in window) {
        caches.keys().then(function(names) {
            names.forEach(function(name) {
                caches.delete(name);
            });
        });
    }
    
    // Clear localStorage
    try {
        localStorage.clear();
    } catch(e) {
        console.log('Cannot clear localStorage:', e);
    }
    
    // Clear sessionStorage
    try {
        sessionStorage.clear();
    } catch(e) {
        console.log('Cannot clear sessionStorage:', e);
    }
    
    console.log('Cache cleared successfully');
})();
