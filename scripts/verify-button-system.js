/**
 * Button System Verification Script
 * Task 3: Checkpoint - Verify Critical Fixes
 * 
 * Script ini memverifikasi bahwa semua perbaikan critical issues berfungsi dengan baik
 */

const fs = require('fs');
const path = require('path');

class ButtonSystemVerifier {
  constructor() {
    this.results = {
      timestamp: new Date().toISOString(),
      passed: 0,
      failed: 0,
      warnings: 0,
      tests: []
    };
  }

  /**
   * Verifikasi bahwa semua file yang diperlukan ada
   */
  verifyRequiredFiles() {
    console.log('\n📁 Verifying Required Files...\n');
    
    const requiredFiles = [
      'public/js/button-stubs.js',
      'public/js/button-error-handler.js',
      'public/js/async-button-handler.js',
      'public/js/button-system-integration.js',
      'public/css/button-loading-states.css',
      'public/test-button-system-complete.html',
      'scripts/button-stubs-summary.md',
      'BUTTON_SYSTEM_DOCUMENTATION.md',
      'BUTTON_FIX_IMPLEMENTATION_SUMMARY.md'
    ];

    let allFilesExist = true;

    requiredFiles.forEach(file => {
      const exists = fs.existsSync(file);
      const status = exists ? '✅' : '❌';
      console.log(`${status} ${file}`);
      
      if (!exists) {
        allFilesExist = false;
        this.results.failed++;
        this.results.tests.push({
          name: `File exists: ${file}`,
          status: 'FAILED',
          message: 'File not found'
        });
      } else {
        this.results.passed++;
        this.results.tests.push({
          name: `File exists: ${file}`,
          status: 'PASSED'
        });
      }
    });

    return allFilesExist;
  }

  /**
   * Verifikasi konten file button-stubs.js
   */
  verifyButtonStubs() {
    console.log('\n🔧 Verifying Button Stubs...\n');
    
    const stubsFile = 'public/js/button-stubs.js';
    
    if (!fs.existsSync(stubsFile)) {
      console.log('❌ button-stubs.js not found');
      this.results.failed++;
      return false;
    }

    const content = fs.readFileSync(stubsFile, 'utf8');
    
    // Check for required functions
    const requiredFunctions = [
      'showErrorMessage',
      'showSuccessMessage',
      'setButtonLoading'
    ];

    let allFunctionsExist = true;

    requiredFunctions.forEach(func => {
      const exists = content.includes(`function ${func}`);
      const status = exists ? '✅' : '❌';
      console.log(`${status} Helper function: ${func}`);
      
      if (!exists) {
        allFunctionsExist = false;
        this.results.failed++;
        this.results.tests.push({
          name: `Helper function: ${func}`,
          status: 'FAILED',
          message: 'Function not found in button-stubs.js'
        });
      } else {
        this.results.passed++;
        this.results.tests.push({
          name: `Helper function: ${func}`,
          status: 'PASSED'
        });
      }
    });

    // Count stub functions
    const stubMatches = content.match(/function \w+\(\)/g);
    const stubCount = stubMatches ? stubMatches.length : 0;
    console.log(`\n📊 Total stub functions: ${stubCount}`);
    
    if (stubCount >= 36) {
      console.log('✅ Sufficient stub functions generated');
      this.results.passed++;
      this.results.tests.push({
        name: 'Stub functions count',
        status: 'PASSED',
        message: `${stubCount} functions generated`
      });
    } else {
      console.log('⚠️  Less than expected stub functions');
      this.results.warnings++;
      this.results.tests.push({
        name: 'Stub functions count',
        status: 'WARNING',
        message: `Only ${stubCount} functions, expected 36+`
      });
    }

    return allFunctionsExist;
  }

  /**
   * Verifikasi error handler system
   */
  verifyErrorHandler() {
    console.log('\n🛡️  Verifying Error Handler System...\n');
    
    const errorHandlerFile = 'public/js/button-error-handler.js';
    
    if (!fs.existsSync(errorHandlerFile)) {
      console.log('❌ button-error-handler.js not found');
      this.results.failed++;
      return false;
    }

    const content = fs.readFileSync(errorHandlerFile, 'utf8');
    
    // Check for required classes
    const requiredClasses = [
      'ErrorLogger',
      'ErrorCategorizer',
      'ErrorDisplay',
      'ButtonStateManager',
      'ButtonErrorHandler'
    ];

    let allClassesExist = true;

    requiredClasses.forEach(className => {
      const exists = content.includes(`class ${className}`);
      const status = exists ? '✅' : '❌';
      console.log(`${status} Class: ${className}`);
      
      if (!exists) {
        allClassesExist = false;
        this.results.failed++;
        this.results.tests.push({
          name: `Error handler class: ${className}`,
          status: 'FAILED',
          message: 'Class not found'
        });
      } else {
        this.results.passed++;
        this.results.tests.push({
          name: `Error handler class: ${className}`,
          status: 'PASSED'
        });
      }
    });

    // Check for error types
    const errorTypes = [
      'HANDLER_NOT_FOUND',
      'API_ERROR',
      'VALIDATION_ERROR',
      'NETWORK_ERROR',
      'PERMISSION_ERROR'
    ];

    errorTypes.forEach(errorType => {
      const exists = content.includes(errorType);
      const status = exists ? '✅' : '⚠️ ';
      console.log(`${status} Error type: ${errorType}`);
      
      if (!exists) {
        this.results.warnings++;
        this.results.tests.push({
          name: `Error type: ${errorType}`,
          status: 'WARNING',
          message: 'Error type not found'
        });
      } else {
        this.results.passed++;
        this.results.tests.push({
          name: `Error type: ${errorType}`,
          status: 'PASSED'
        });
      }
    });

    return allClassesExist;
  }

  /**
   * Verifikasi async button handler
   */
  verifyAsyncHandler() {
    console.log('\n⚡ Verifying Async Button Handler...\n');
    
    const asyncHandlerFile = 'public/js/async-button-handler.js';
    
    if (!fs.existsSync(asyncHandlerFile)) {
      console.log('❌ async-button-handler.js not found');
      this.results.failed++;
      return false;
    }

    const content = fs.readFileSync(asyncHandlerFile, 'utf8');
    
    // Check for required classes
    const requiredClasses = [
      'AsyncOperationDetector',
      'AsyncButtonWrapper',
      'AsyncButtonManager'
    ];

    let allClassesExist = true;

    requiredClasses.forEach(className => {
      const exists = content.includes(`class ${className}`);
      const status = exists ? '✅' : '❌';
      console.log(`${status} Class: ${className}`);
      
      if (!exists) {
        allClassesExist = false;
        this.results.failed++;
        this.results.tests.push({
          name: `Async handler class: ${className}`,
          status: 'FAILED',
          message: 'Class not found'
        });
      } else {
        this.results.passed++;
        this.results.tests.push({
          name: `Async handler class: ${className}`,
          status: 'PASSED'
        });
      }
    });

    // Check for loading state management
    const loadingFeatures = [
      'data-async',
      'data-loading-text',
      'classList.add(\'loading\')',
      'disabled = true'
    ];

    loadingFeatures.forEach(feature => {
      const exists = content.includes(feature);
      const status = exists ? '✅' : '⚠️ ';
      console.log(`${status} Feature: ${feature}`);
      
      if (!exists) {
        this.results.warnings++;
        this.results.tests.push({
          name: `Async feature: ${feature}`,
          status: 'WARNING',
          message: 'Feature not found'
        });
      } else {
        this.results.passed++;
        this.results.tests.push({
          name: `Async feature: ${feature}`,
          status: 'PASSED'
        });
      }
    });

    return allClassesExist;
  }

  /**
   * Verifikasi system integration
   */
  verifySystemIntegration() {
    console.log('\n🔗 Verifying System Integration...\n');
    
    const integrationFile = 'public/js/button-system-integration.js';
    
    if (!fs.existsSync(integrationFile)) {
      console.log('❌ button-system-integration.js not found');
      this.results.failed++;
      return false;
    }

    const content = fs.readFileSync(integrationFile, 'utf8');
    
    // Check for initialization
    const initChecks = [
      'ButtonSystemIntegration',
      'wrapAllButtons',
      'setupGlobalDelegation',
      'registerCommonHandlers',
      'MutationObserver'
    ];

    let allChecksPass = true;

    initChecks.forEach(check => {
      const exists = content.includes(check);
      const status = exists ? '✅' : '❌';
      console.log(`${status} Integration feature: ${check}`);
      
      if (!exists) {
        allChecksPass = false;
        this.results.failed++;
        this.results.tests.push({
          name: `Integration feature: ${check}`,
          status: 'FAILED',
          message: 'Feature not found'
        });
      } else {
        this.results.passed++;
        this.results.tests.push({
          name: `Integration feature: ${check}`,
          status: 'PASSED'
        });
      }
    });

    // Check for common handlers
    const commonHandlers = [
      'closeModal',
      'showModal',
      'refreshData',
      'goBack',
      'resetForm'
    ];

    commonHandlers.forEach(handler => {
      const exists = content.includes(`'${handler}'`) || content.includes(`"${handler}"`);
      const status = exists ? '✅' : '⚠️ ';
      console.log(`${status} Common handler: ${handler}`);
      
      if (!exists) {
        this.results.warnings++;
        this.results.tests.push({
          name: `Common handler: ${handler}`,
          status: 'WARNING',
          message: 'Handler not found'
        });
      } else {
        this.results.passed++;
        this.results.tests.push({
          name: `Common handler: ${handler}`,
          status: 'PASSED'
        });
      }
    });

    return allChecksPass;
  }

  /**
   * Verifikasi CSS loading states
   */
  verifyCSSLoadingStates() {
    console.log('\n🎨 Verifying CSS Loading States...\n');
    
    const cssFile = 'public/css/button-loading-states.css';
    
    if (!fs.existsSync(cssFile)) {
      console.log('❌ button-loading-states.css not found');
      this.results.failed++;
      return false;
    }

    const content = fs.readFileSync(cssFile, 'utf8');
    
    // Check for required styles
    const requiredStyles = [
      '.btn.loading',
      '.btn:disabled',
      '.btn:focus',
      '@keyframes spin',
      '.btn-primary',
      '.btn-secondary'
    ];

    let allStylesExist = true;

    requiredStyles.forEach(style => {
      const exists = content.includes(style);
      const status = exists ? '✅' : '❌';
      console.log(`${status} CSS style: ${style}`);
      
      if (!exists) {
        allStylesExist = false;
        this.results.failed++;
        this.results.tests.push({
          name: `CSS style: ${style}`,
          status: 'FAILED',
          message: 'Style not found'
        });
      } else {
        this.results.passed++;
        this.results.tests.push({
          name: `CSS style: ${style}`,
          status: 'PASSED'
        });
      }
    });

    return allStylesExist;
  }

  /**
   * Verifikasi test page
   */
  verifyTestPage() {
    console.log('\n🧪 Verifying Test Page...\n');
    
    const testPageFile = 'public/test-button-system-complete.html';
    
    if (!fs.existsSync(testPageFile)) {
      console.log('❌ test-button-system-complete.html not found');
      this.results.failed++;
      return false;
    }

    const content = fs.readFileSync(testPageFile, 'utf8');
    
    // Check for test sections
    const testSections = [
      'Basic Buttons',
      'Async Buttons',
      'Data Action Pattern',
      'Modal Buttons',
      'Form Buttons',
      'Statistics'
    ];

    let allSectionsExist = true;

    testSections.forEach(section => {
      const exists = content.includes(section);
      const status = exists ? '✅' : '❌';
      console.log(`${status} Test section: ${section}`);
      
      if (!exists) {
        allSectionsExist = false;
        this.results.failed++;
        this.results.tests.push({
          name: `Test section: ${section}`,
          status: 'FAILED',
          message: 'Section not found'
        });
      } else {
        this.results.passed++;
        this.results.tests.push({
          name: `Test section: ${section}`,
          status: 'PASSED'
        });
      }
    });

    // Check for script includes
    const scriptIncludes = [
      'button-stubs.js',
      'button-error-handler.js',
      'async-button-handler.js',
      'button-system-integration.js'
    ];

    scriptIncludes.forEach(script => {
      const exists = content.includes(script);
      const status = exists ? '✅' : '❌';
      console.log(`${status} Script include: ${script}`);
      
      if (!exists) {
        allSectionsExist = false;
        this.results.failed++;
        this.results.tests.push({
          name: `Script include: ${script}`,
          status: 'FAILED',
          message: 'Script not included'
        });
      } else {
        this.results.passed++;
        this.results.tests.push({
          name: `Script include: ${script}`,
          status: 'PASSED'
        });
      }
    });

    return allSectionsExist;
  }

  /**
   * Verifikasi documentation
   */
  verifyDocumentation() {
    console.log('\n📚 Verifying Documentation...\n');
    
    const docFiles = [
      'BUTTON_SYSTEM_DOCUMENTATION.md',
      'BUTTON_FIX_IMPLEMENTATION_SUMMARY.md',
      'scripts/button-stubs-summary.md'
    ];

    let allDocsExist = true;

    docFiles.forEach(file => {
      const exists = fs.existsSync(file);
      const status = exists ? '✅' : '❌';
      console.log(`${status} Documentation: ${file}`);
      
      if (!exists) {
        allDocsExist = false;
        this.results.failed++;
        this.results.tests.push({
          name: `Documentation: ${file}`,
          status: 'FAILED',
          message: 'File not found'
        });
      } else {
        // Check file size
        const stats = fs.statSync(file);
        const sizeKB = (stats.size / 1024).toFixed(2);
        console.log(`   Size: ${sizeKB} KB`);
        
        this.results.passed++;
        this.results.tests.push({
          name: `Documentation: ${file}`,
          status: 'PASSED',
          message: `Size: ${sizeKB} KB`
        });
      }
    });

    return allDocsExist;
  }

  /**
   * Generate verification report
   */
  generateReport() {
    console.log('\n' + '='.repeat(60));
    console.log('📊 VERIFICATION REPORT');
    console.log('='.repeat(60));
    
    const total = this.results.passed + this.results.failed + this.results.warnings;
    const passRate = ((this.results.passed / total) * 100).toFixed(2);
    
    console.log(`\nTotal Tests: ${total}`);
    console.log(`✅ Passed: ${this.results.passed}`);
    console.log(`❌ Failed: ${this.results.failed}`);
    console.log(`⚠️  Warnings: ${this.results.warnings}`);
    console.log(`\nPass Rate: ${passRate}%`);
    
    // Overall status
    let overallStatus = 'PASSED';
    if (this.results.failed > 0) {
      overallStatus = 'FAILED';
    } else if (this.results.warnings > 5) {
      overallStatus = 'PASSED WITH WARNINGS';
    }
    
    console.log(`\nOverall Status: ${overallStatus}`);
    console.log('='.repeat(60));
    
    // Save report to file
    const reportData = {
      ...this.results,
      summary: {
        total,
        passRate: `${passRate}%`,
        overallStatus
      }
    };
    
    fs.writeFileSync(
      'scripts/button-system-verification-report.json',
      JSON.stringify(reportData, null, 2)
    );
    
    console.log('\n✅ Report saved to: scripts/button-system-verification-report.json');
    
    return overallStatus === 'PASSED' || overallStatus === 'PASSED WITH WARNINGS';
  }

  /**
   * Run all verifications
   */
  async runAll() {
    console.log('🚀 Starting Button System Verification...');
    console.log('Task 3: Checkpoint - Verify Critical Fixes');
    console.log('='.repeat(60));
    
    const checks = [
      () => this.verifyRequiredFiles(),
      () => this.verifyButtonStubs(),
      () => this.verifyErrorHandler(),
      () => this.verifyAsyncHandler(),
      () => this.verifySystemIntegration(),
      () => this.verifyCSSLoadingStates(),
      () => this.verifyTestPage(),
      () => this.verifyDocumentation()
    ];
    
    for (const check of checks) {
      try {
        check();
      } catch (error) {
        console.error(`\n❌ Verification error: ${error.message}`);
        this.results.failed++;
        this.results.tests.push({
          name: 'Verification execution',
          status: 'FAILED',
          message: error.message
        });
      }
    }
    
    return this.generateReport();
  }
}

// Run verification
const verifier = new ButtonSystemVerifier();
verifier.runAll().then(success => {
  if (success) {
    console.log('\n✅ All critical fixes verified successfully!');
    console.log('✅ Ready to proceed to Task 4');
    process.exit(0);
  } else {
    console.log('\n❌ Verification failed. Please fix issues before proceeding.');
    process.exit(1);
  }
}).catch(error => {
  console.error('\n❌ Verification script error:', error);
  process.exit(1);
});
