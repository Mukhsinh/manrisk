/**
 * Script untuk generate stub functions untuk missing button handlers
 * Berdasarkan button audit report
 */

const fs = require('fs');
const path = require('path');

// Baca audit report
const auditReport = JSON.parse(fs.readFileSync('button-audit-report.json', 'utf8'));

// Kumpulkan semua missing functions
const missingFunctions = new Set();
const noHandlerButtons = [];

auditReport.buttons.forEach(button => {
  button.issues.forEach(issue => {
    if (issue.type === 'MISSING_FUNCTION') {
      // Extract function name dari onclick
      const match = button.onclick.match(/^(\w+)\(/);
      if (match) {
        missingFunctions.add(match[1]);
      }
    }
    if (issue.type === 'NO_HANDLER') {
      noHandlerButtons.push({
        id: button.id,
        file: button.file,
        text: button.text
      });
    }
  });
});

console.log(`\n=== BUTTON HANDLER STUB GENERATOR ===\n`);
console.log(`Found ${missingFunctions.size} missing functions`);
console.log(`Found ${noHandlerButtons.length} buttons without handlers\n`);

// Generate stub functions
let stubCode = `/**
 * AUTO-GENERATED BUTTON HANDLER STUBS
 * Generated: ${new Date().toISOString()}
 * 
 * IMPORTANT: These are stub functions that need proper implementation
 * Each function includes a TODO comment for implementation
 */

// ============================================
// MISSING FUNCTION STUBS
// ============================================

`;

// Sort functions alphabetically
const sortedFunctions = Array.from(missingFunctions).sort();

sortedFunctions.forEach(funcName => {
  stubCode += `/**
 * TODO: Implement ${funcName}
 * This function is called by button onclick handlers but was not found
 */
function ${funcName}() {
  console.warn('⚠️ ${funcName}() called but not yet implemented');
  console.warn('TODO: Add proper implementation for ${funcName}');
  
  // Temporary: Show alert to user
  alert('Fitur ini sedang dalam pengembangan. Mohon maaf atas ketidaknyamanannya.');
  
  // TODO: Add your implementation here
  // Example:
  // try {
  //   // Your code here
  // } catch (error) {
  //   console.error('Error in ${funcName}:', error);
  //   showErrorMessage('Terjadi kesalahan. Silakan coba lagi.');
  // }
}

`;
});

stubCode += `
// ============================================
// BUTTONS WITHOUT HANDLERS
// ============================================
// The following buttons need event handlers added:
//
`;

noHandlerButtons.forEach(button => {
  stubCode += `// - ${button.id || 'unnamed'} in ${button.file}: "${button.text}"\n`;
});

stubCode += `
// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Show error message to user
 */
function showErrorMessage(message) {
  // TODO: Implement proper error display (modal, toast, etc)
  console.error(message);
  alert(message);
}

/**
 * Show success message to user
 */
function showSuccessMessage(message) {
  // TODO: Implement proper success display (modal, toast, etc)
  console.log(message);
  alert(message);
}

/**
 * Show loading state on button
 */
function setButtonLoading(button, isLoading) {
  if (isLoading) {
    button.disabled = true;
    button.classList.add('loading');
    button.dataset.originalText = button.textContent;
    button.textContent = 'Loading...';
  } else {
    button.disabled = false;
    button.classList.remove('loading');
    if (button.dataset.originalText) {
      button.textContent = button.dataset.originalText;
      delete button.dataset.originalText;
    }
  }
}

/**
 * Wrap async function with error handling and loading state
 */
async function withErrorHandling(button, asyncFn) {
  try {
    setButtonLoading(button, true);
    await asyncFn();
  } catch (error) {
    console.error('Error:', error);
    showErrorMessage('Terjadi kesalahan. Silakan coba lagi.');
  } finally {
    setButtonLoading(button, false);
  }
}
`;

// Write stub file
const outputPath = 'public/js/button-stubs.js';
fs.writeFileSync(outputPath, stubCode);

console.log(`✅ Generated stub functions in: ${outputPath}`);
console.log(`\nMissing functions generated:`);
sortedFunctions.forEach(func => console.log(`  - ${func}()`));

// Generate summary report
const summaryPath = 'scripts/button-stubs-summary.md';
let summary = `# Button Handler Stubs Summary

Generated: ${new Date().toISOString()}

## Overview

- **Missing Functions:** ${missingFunctions.size}
- **Buttons Without Handlers:** ${noHandlerButtons.length}
- **Total Issues:** ${missingFunctions.size + noHandlerButtons.length}

## Missing Functions

The following functions are referenced in button onclick handlers but were not found:

`;

sortedFunctions.forEach(func => {
  summary += `- \`${func}()\`\n`;
});

summary += `\n## Buttons Without Handlers

The following buttons need event handlers added:

| Button ID | File | Text |
|-----------|------|------|
`;

noHandlerButtons.forEach(button => {
  summary += `| ${button.id || 'unnamed'} | ${button.file} | ${button.text} |\n`;
});

summary += `\n## Next Steps

1. Review generated stub functions in \`public/js/button-stubs.js\`
2. Implement each TODO function with proper logic
3. Add event handlers to buttons without handlers
4. Test all button functionality
5. Remove stub warnings once implemented

## Implementation Priority

1. **Critical:** Functions used in main workflows (add, edit, delete, save)
2. **High:** Functions used in data operations (import, export, download)
3. **Medium:** Functions used in UI interactions (filter, sort, toggle)
4. **Low:** Functions used in optional features (help, info, tips)
`;

fs.writeFileSync(summaryPath, summary);
console.log(`\n✅ Generated summary report in: ${summaryPath}`);

console.log(`\n=== NEXT STEPS ===`);
console.log(`1. Include button-stubs.js in your HTML files`);
console.log(`2. Implement each TODO function`);
console.log(`3. Add event handlers to buttons without handlers`);
console.log(`4. Test all button functionality\n`);
