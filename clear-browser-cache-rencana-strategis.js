/**
 * Clear Browser Cache for Rencana Strategis
 * Script ini akan memaksa browser untuk reload semua file CSS dan JS
 */

const fs = require('fs');
const path = require('path');

console.log('🧹 Clearing browser cache for Rencana Strategis...\n');

// Files to add cache-busting timestamp
const filesToUpdate = [
  'public/css/rencana-strategis.css',
  'public/js/rencana-strategis.js',
  'public/js/rencana-strategis-force-fix.js'
];

// Add timestamp comment to force reload
const timestamp = new Date().toISOString();
const cacheComment = `\n/* Cache-busted: ${timestamp} */\n`;

filesToUpdate.forEach(file => {
  const filePath = path.join(__dirname, file);
  
  if (fs.existsSync(filePath)) {
    try {
      let content = fs.readFileSync(filePath, 'utf8');
      
      // Remove old cache-busting comments
      content = content.replace(/\/\* Cache-busted:.*?\*\/\n/g, '');
      
      // Add new cache-busting comment at the top
      if (file.endsWith('.css')) {
        content = cacheComment + content;
      } else if (file.endsWith('.js')) {
        content = cacheComment + content;
      }
      
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Updated: ${file}`);
    } catch (error) {
      console.error(`❌ Error updating ${file}:`, error.message);
    }
  } else {
    console.warn(`⚠️  File not found: ${file}`);
  }
});

console.log('\n📋 INSTRUKSI UNTUK PENGGUNA:\n');
console.log('1. Tutup semua tab browser yang menampilkan halaman Rencana Strategis');
console.log('2. Buka browser dan tekan Ctrl+Shift+Delete (Windows) atau Cmd+Shift+Delete (Mac)');
console.log('3. Pilih "Cached images and files" dan klik "Clear data"');
console.log('4. Atau gunakan mode Incognito/Private untuk testing');
console.log('5. Buka URL: http://localhost:3001/test-rencana-strategis-final-verification.html');
console.log('\n✅ Cache-busting applied to all files!');
console.log('\n🔍 VERIFIKASI PERBAIKAN:');
console.log('   1. ✓ Tombol Edit TIDAK ADA di kolom aksi');
console.log('   2. ✓ Tombol Refresh: BIRU CERAH SOLID (#3b82f6)');
console.log('   3. ✓ Tombol Unduh: HIJAU CERAH SOLID (#10b981)');
console.log('   4. ✓ Kolom aksi: 100-120px (tidak overflow)');
console.log('   5. ✓ Semua tombol: ICON ONLY (tanpa teks)\n');
