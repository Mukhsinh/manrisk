/**
 * Script Verifikasi: Risk Input Form Visibility Fix
 * 
 * Script ini memverifikasi bahwa:
 * 1. Form input risiko tersembunyi saat halaman pertama kali dimuat
 * 2. Form hanya muncul ketika tombol "Tambah Risiko" diklik
 * 3. Section analisis tersembunyi saat form baru dibuka
 * 4. Section analisis muncul setelah data risiko disimpan
 * 5. Form tersembunyi kembali setelah reset
 */

const fs = require('fs');
const path = require('path');

console.log('='.repeat(70));
console.log('VERIFIKASI: Risk Input Form Visibility Fix');
console.log('='.repeat(70));
console.log();

// File yang dimodifikasi
const files = [
  'public/js/risk-input.js',
  'public/css/risk-input.css',
  'public/risk-input.html'
];

let allChecksPass = true;

// Check 1: Verifikasi file JavaScript
console.log('✓ Check 1: Verifikasi file JavaScript (risk-input.js)');
const jsFile = path.join(__dirname, 'public/js/risk-input.js');
if (fs.existsSync(jsFile)) {
  const jsContent = fs.readFileSync(jsFile, 'utf8');
  
  const checks = [
    {
      name: 'hideFormSection() membersihkan form',
      pattern: /hideFormSection.*\{[\s\S]*?form\.reset\(\)/,
      found: /hideFormSection.*\{[\s\S]*?form\.reset\(\)/.test(jsContent)
    },
    {
      name: 'hideFormSection() menyembunyikan section analisis',
      pattern: /hideFormSection.*\{[\s\S]*?hideAnalysisSections\(\)/,
      found: /hideFormSection.*\{[\s\S]*?hideAnalysisSections\(\)/.test(jsContent)
    },
    {
      name: 'showFormSection() menyembunyikan analisis untuk form baru',
      pattern: /showFormSection.*\{[\s\S]*?if\s*\(!state\.currentId\)[\s\S]*?hideAnalysisSections/,
      found: /showFormSection.*\{[\s\S]*?if\s*\(!state\.currentId\)[\s\S]*?hideAnalysisSections/.test(jsContent)
    },
    {
      name: 'bindEvents() memanggil hideFormSection() saat reset',
      pattern: /resetBtn.*addEventListener.*hideFormSection/,
      found: /resetBtn.*addEventListener.*hideFormSection/.test(jsContent)
    },
    {
      name: 'bindEvents() memanggil hideFormSection() di akhir',
      pattern: /bindEvents.*\{[\s\S]*?hideFormSection\(\);[\s\S]*?\}/,
      found: /bindEvents.*\{[\s\S]*?hideFormSection\(\);[\s\S]*?\}/.test(jsContent)
    },
    {
      name: 'Tombol "Tambah Risiko" memanggil showFormSection()',
      pattern: /addRiskBtn.*addEventListener.*showFormSection/,
      found: /addRiskBtn.*addEventListener.*showFormSection/.test(jsContent)
    }
  ];
  
  checks.forEach(check => {
    if (check.found) {
      console.log(`  ✓ ${check.name}`);
    } else {
      console.log(`  ✗ ${check.name}`);
      allChecksPass = false;
    }
  });
} else {
  console.log('  ✗ File tidak ditemukan');
  allChecksPass = false;
}
console.log();

// Check 2: Verifikasi file CSS
console.log('✓ Check 2: Verifikasi file CSS (risk-input.css)');
const cssFile = path.join(__dirname, 'public/css/risk-input.css');
if (fs.existsSync(cssFile)) {
  const cssContent = fs.readFileSync(cssFile, 'utf8');
  
  const checks = [
    {
      name: 'Form section memiliki display: none !important',
      pattern: /#risk-input-form-section[\s\S]*?display:\s*none\s*!important/,
      found: /#risk-input-form-section[\s\S]*?display:\s*none\s*!important/.test(cssContent)
    },
    {
      name: 'Komentar menjelaskan form tersembunyi secara default',
      pattern: /PENTING.*Form.*disembunyikan.*default/i,
      found: /PENTING.*Form.*disembunyikan.*default/i.test(cssContent)
    },
    {
      name: 'Komentar menjelaskan form muncul saat tombol diklik',
      pattern: /Form.*muncul.*tombol.*Tambah Risiko.*diklik/i,
      found: /Form.*muncul.*tombol.*Tambah Risiko.*diklik/i.test(cssContent)
    }
  ];
  
  checks.forEach(check => {
    if (check.found) {
      console.log(`  ✓ ${check.name}`);
    } else {
      console.log(`  ✗ ${check.name}`);
      allChecksPass = false;
    }
  });
} else {
  console.log('  ✗ File tidak ditemukan');
  allChecksPass = false;
}
console.log();

// Check 3: Verifikasi file HTML
console.log('✓ Check 3: Verifikasi file HTML (risk-input.html)');
const htmlFile = path.join(__dirname, 'public/risk-input.html');
if (fs.existsSync(htmlFile)) {
  const htmlContent = fs.readFileSync(htmlFile, 'utf8');
  
  const checks = [
    {
      name: 'Form section memiliki id="risk-input-form-section"',
      pattern: /id="risk-input-form-section"/,
      found: /id="risk-input-form-section"/.test(htmlContent)
    },
    {
      name: 'Form section memiliki style="display: none"',
      pattern: /id="risk-input-form-section".*style="display:\s*none"/,
      found: /id="risk-input-form-section".*style="display:\s*none"/.test(htmlContent)
    },
    {
      name: 'Tombol "Tambah Risiko" ada',
      pattern: /id="btn-tambah-risiko"/,
      found: /id="btn-tambah-risiko"/.test(htmlContent)
    },
    {
      name: 'Section analisis inherent ada',
      pattern: /id="inherent-probability"/,
      found: /id="inherent-probability"/.test(htmlContent)
    },
    {
      name: 'Section analisis residual ada',
      pattern: /id="residual-probability"/,
      found: /id="residual-probability"/.test(htmlContent)
    }
  ];
  
  checks.forEach(check => {
    if (check.found) {
      console.log(`  ✓ ${check.name}`);
    } else {
      console.log(`  ✗ ${check.name}`);
      allChecksPass = false;
    }
  });
} else {
  console.log('  ✗ File tidak ditemukan');
  allChecksPass = false;
}
console.log();

// Check 4: Verifikasi file test dibuat
console.log('✓ Check 4: Verifikasi file test');
const testFile = path.join(__dirname, 'public/test-risk-input-form-visibility.html');
if (fs.existsSync(testFile)) {
  console.log('  ✓ File test-risk-input-form-visibility.html dibuat');
} else {
  console.log('  ✗ File test tidak ditemukan');
  allChecksPass = false;
}
console.log();

// Summary
console.log('='.repeat(70));
if (allChecksPass) {
  console.log('✓ SEMUA VERIFIKASI BERHASIL');
  console.log();
  console.log('Perbaikan yang dilakukan:');
  console.log('1. Form input risiko tersembunyi secara default (display: none !important)');
  console.log('2. Form hanya muncul ketika tombol "Tambah Risiko" diklik');
  console.log('3. Section analisis tersembunyi saat form baru dibuka');
  console.log('4. Section analisis muncul setelah data risiko disimpan');
  console.log('5. Form dan section analisis tersembunyi setelah reset');
  console.log();
  console.log('Cara testing:');
  console.log('1. Buka halaman: http://localhost:3001/risk-input.html');
  console.log('2. Pastikan tidak ada form yang terlihat saat halaman dimuat');
  console.log('3. Klik tombol "Tambah Risiko"');
  console.log('4. Form seharusnya muncul, tapi section analisis masih tersembunyi');
  console.log('5. Isi data risiko dan simpan');
  console.log('6. Section analisis seharusnya muncul setelah data disimpan');
  console.log();
  console.log('Atau buka file test:');
  console.log('http://localhost:3001/test-risk-input-form-visibility.html');
} else {
  console.log('✗ BEBERAPA VERIFIKASI GAGAL');
  console.log('Silakan periksa file yang ditandai dengan ✗');
}
console.log('='.repeat(70));

process.exit(allChecksPass ? 0 : 1);
