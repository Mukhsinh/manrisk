/**
 * Script untuk Clear Cache Monitoring & Evaluasi
 * Jalankan: node clear-monitoring-evaluasi-cache.js
 */

const fs = require('fs');
const path = require('path');

console.log('🧹 Clearing Monitoring & Evaluasi Cache...\n');

// Update version di index.html
const indexPath = path.join(__dirname, 'public', 'index.html');
let indexContent = fs.readFileSync(indexPath, 'utf8');

// Update version untuk monitoring-evaluasi.js
const newVersion = Date.now();
indexContent = indexContent.replace(
    /monitoring-evaluasi\.js\?v=\d+/g,
    `monitoring-evaluasi.js?v=${newVersion}`
);

// Update version untuk monitoring-evaluasi-fix-force.js
indexContent = indexContent.replace(
    /monitoring-evaluasi-fix-force\.js\?v=[\d.]+/g,
    `monitoring-evaluasi-fix-force.js?v=${newVersion}`
);

// Update version untuk CSS
indexContent = indexContent.replace(
    /monitoring-evaluasi-buttons-fix\.css\?v=[\d.]+/g,
    `monitoring-evaluasi-buttons-fix.css?v=${newVersion}`
);

fs.writeFileSync(indexPath, indexContent);

console.log('✅ Cache cleared successfully!');
console.log(`📝 New version: ${newVersion}`);
console.log('\n📋 Langkah selanjutnya:');
console.log('1. Restart server: Ctrl+C lalu npm start');
console.log('2. Buka browser dan tekan Ctrl+Shift+R (hard refresh)');
console.log('3. Atau buka DevTools (F12) > Network tab > centang "Disable cache"');
console.log('4. Reload halaman');
console.log('\n✨ Perbaikan yang diterapkan:');
console.log('   - Form edit akan terisi dengan data yang benar');
console.log('   - Tombol Refresh (hijau) dan Unduh Laporan (biru) dengan warna solid cerah');
console.log('   - Semua tombol memiliki teks dan icon yang jelas');
