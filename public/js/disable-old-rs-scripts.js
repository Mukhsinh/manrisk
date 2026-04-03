/**
 * DISABLE OLD RS SCRIPTS
 * Menonaktifkan script RS lama yang menyebabkan konflik
 * Version: 8.0
 */

(function() {
  'use strict';
  
  console.log('[RS Disable] Disabling old RS scripts...');
  
  // Disable semua modul RS lama
  window._rsUnifiedLoaded = true;
  window._rsCleanLoaded = true;
  window._rsFastLoaded = true;
  window._rsOptimizedLoaded = true;
  window._rsEnhancedLoaded = true;
  window.RencanaStrategisCleanLoaded = true;
  
  // Prevent multiple initialization
  if (window._rsDisableScriptLoaded) {
    console.log('[RS Disable] Already loaded, skipping');
    return;
  }
  window._rsDisableScriptLoaded = true;
  
  console.log('[RS Disable] Old RS scripts disabled');
})();
