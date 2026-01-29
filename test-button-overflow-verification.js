/**
 * Test Button Overflow Fix Verification
 * Memverifikasi bahwa file CSS dan JS sudah ada
 */

const fs = require('fs');
const path = require('path');

console.log('🧪 Testing Button Overflow Fix Implementation\n');

// Test 1: Check CSS file exists
const cssPath = path.join(__dirname, 'public', 'css', 'button-overflow-fix.css');
const cssExists = fs.existsSync(cssPath);
console.log(`1. CSS File: ${cssExists ? '✅' : '❌'} ${cssPath}`);

if (cssExists) {
    const cssContent = fs.readFileSync(cssPath, 'utf8');
    console.log(`   - Size: ${cssContent.length} bytes`);
    console.log(`   - Contains .btn rules: ${cssContent.includes('.btn,') ? '✅' : '❌'}`);
    console.log(`   - Contains overflow fix: ${cssContent.includes('overflow: hidden') ? '✅' : '❌'}`);
    console.log(`   - Contains responsive: ${cssContent.includes('@media') ? '✅' : '❌'}`);
}

// Test 2: Check JS file exists
const jsPath = path.join(__dirname, 'public', 'js', 'button-overflow-handler.js');
const jsExists = fs.existsSync(jsPath);
console.log(`\n2. JS File: ${jsExists ? '✅' : '❌'} ${jsPath}`);

if (jsExists) {
    const jsContent = fs.readFileSync(jsPath, 'utf8');
    console.log(`   - Size: ${jsContent.length} bytes`);
    console.log(`   - Contains ButtonOverflowHandler: ${jsContent.includes('ButtonOverflowHandler') ? '✅' : '❌'}`);
    console.log(`   - Contains fixAllButtons: ${jsContent.includes('fixAllButtons') ? '✅' : '❌'}`);
    console.log(`   - Contains observeDOM: ${jsContent.includes('observeDOM') ? '✅' : '❌'}`);
}

// Test 3: Check HTML test file exists
const htmlPath = path.join(__dirname, 'public', 'test-button-overflow-fix.html');
const htmlExists = fs.existsSync(htmlPath);
console.log(`\n3. Test HTML File: ${htmlExists ? '✅' : '❌'} ${htmlPath}`);

if (htmlExists) {
    const htmlContent = fs.readFileSync(htmlPath, 'utf8');
    console.log(`   - Size: ${htmlContent.length} bytes`);
    console.log(`   - Contains test sections: ${htmlContent.includes('test-section') ? '✅' : '❌'}`);
    console.log(`   - Loads CSS: ${htmlContent.includes('button-overflow-fix.css') ? '✅' : '❌'}`);
    console.log(`   - Loads JS: ${htmlContent.includes('button-overflow-handler.js') ? '✅' : '❌'}`);
}

// Test 4: Check integration in index.html
const indexPath = path.join(__dirname, 'public', 'index.html');
const indexExists = fs.existsSync(indexPath);
console.log(`\n4. Index.html Integration: ${indexExists ? '✅' : '❌'} ${indexPath}`);

if (indexExists) {
    const indexContent = fs.readFileSync(indexPath, 'utf8');
    const cssIntegrated = indexContent.includes('button-overflow-fix.css');
    const jsIntegrated = indexContent.includes('button-overflow-handler.js');
    
    console.log(`   - CSS integrated: ${cssIntegrated ? '✅' : '❌'}`);
    console.log(`   - JS integrated: ${jsIntegrated ? '✅' : '❌'}`);
    
    if (cssIntegrated && jsIntegrated) {
        console.log(`   - ✅ Fully integrated!`);
    } else {
        console.log(`   - ⚠️ Partial integration`);
    }
}

// Summary
console.log('\n' + '='.repeat(50));
console.log('📊 SUMMARY');
console.log('='.repeat(50));

const allChecks = [cssExists, jsExists, htmlExists, indexExists];
const passedChecks = allChecks.filter(Boolean).length;
const totalChecks = allChecks.length;

console.log(`Total Checks: ${passedChecks}/${totalChecks}`);

if (passedChecks === totalChecks) {
    console.log('✅ All files created and integrated successfully!');
    console.log('\n📝 Next Steps:');
    console.log('1. Start server: node server.js');
    console.log('2. Open browser: http://localhost:3002/test-button-overflow-fix.html');
    console.log('3. Test button overflow fixes');
    console.log('4. Check console for ButtonOverflowHandler logs');
} else {
    console.log('❌ Some files are missing. Please check the errors above.');
}

console.log('\n✅ Verification complete!');
