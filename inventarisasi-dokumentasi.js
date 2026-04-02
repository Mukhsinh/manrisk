const fs = require('fs');
const path = require('path');

console.log('=== INVENTARISASI DOKUMENTASI STAGING ===\n');

// Daftar file dokumentasi yang akan dihapus
const docsToDelete = {
  markdownDocs: [
    'CLEANUP_REPORT.md', 'DATABASE_SCHEMA.md', 'DEPLOYMENT.md',
    'INTEGRASI_SUPABASE.md', 'MCP_INTEGRATION.md', 'PROJECT_RULES.md',
    'QUICK_START_GUIDE.md', 'FIX_AMBIGUOUS_USER_ID.md',
    'PERBAIKAN_MASALAH_APLIKASI.md', 'CHART_SIZE_FIX_SUMMARY.md'
  ],
  testFiles: [
    'test-agregasi-comprehensive.js', 'test-ai-assistant.js',
    'test-comprehensive-fixes.js', 'test-dashboard-fix.js'
  ],
  verifyFiles: [
    'verify-button-fixes.js', 'verify-monitoring-system.js'
  ],
  directories: ['backup-button-fixes', 'backup-rencana-strategis', 'docs']
};

// Fungsi helper
function getFileSize(filePath) {
  try { return fs.statSync(filePath).size; } catch { return 0; }
}

function formatSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024, sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

let totalSize = 0, totalFiles = 0;

// Hitung ukuran
Object.values(docsToDelete).flat().forEach(item => {
  const itemPath = path.join(__dirname, item);
  const size = getFileSize(itemPath);
  if (size > 0) { totalSize += size; totalFiles++; }
});

console.log(`Total File: ${totalFiles}`);
console.log(`Total Ukuran: ${formatSize(totalSize)}`);
console.log('\n✅ Inventarisasi selesai');
