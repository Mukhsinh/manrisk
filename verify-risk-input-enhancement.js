// Verifikasi Risk Input Enhancement
const fs = require('fs');
const path = require('path');

console.log('=== Verifikasi Risk Input Enhancement ===\n');

const files = [
  'public/js/risk-input-form-toggle.js',
  'public/js/risk-input-notification-patch.js',
  'public/css/risk-input-notification.css',
  'public/test-risk-input-enhanced.html'
];

let allFilesExist = true;

files.forEach(file => {
  const exists = fs.existsSync(file);
  console.log(`${exists ? '✓' : '✗'} ${file}`);
  if (!exists) allFilesExist = false;
});

console.log('\n=== Verifikasi index.html ===\n');

const indexPath = 'public/index.html';
if (fs.existsSync(indexPath)) {
  const content = fs.readFileSync(indexPath, 'utf8');
  
  const checks = [
    { name: 'risk-input-notification.css', pattern: 'risk-input-notification.css' },
    { name: 'risk-input-form-toggle.js', pattern: 'risk-input-form-toggle.js' },
    { name: 'risk-input-notification-patch.js', pattern: 'risk-input-notification-patch.js' }
  ];
  
  checks.forEach(check => {
    const found = content.includes(check.pattern);
    console.log(`${found ? '✓' : '✗'} ${check.name} referenced in index.html`);
  });
} else {
  console.log('✗ index.html tidak ditemukan');
}

console.log('\n=== Ringkasan Perbaikan ===\n');
console.log('1. Form input risiko akan tersembunyi saat pertama kali load');
console.log('2. Form hanya tampil saat tombol "Tambah Risiko" diklik');
console.log('3. Notifikasi toast muncul saat proses simpan/edit berhasil');
console.log('4. Notifikasi otomatis hilang setelah 5 detik');
console.log('5. Form otomatis tersembunyi setelah simpan berhasil');

console.log('\n=== Cara Test ===\n');
console.log('1. Buka browser: http://localhost:3002/test-risk-input-enhanced.html');
console.log('2. Klik tombol "Tambah Risiko" - form harus muncul');
console.log('3. Test notifikasi dengan tombol yang tersedia');
console.log('4. Buka halaman utama dan navigasi ke /risk-input');
console.log('5. Verifikasi form tersembunyi saat pertama load');
console.log('6. Klik "Tambah Risiko" dan isi form, lalu simpan');
console.log('7. Verifikasi notifikasi sukses muncul');

if (allFilesExist) {
  console.log('\n✓ Semua file berhasil dibuat!');
} else {
  console.log('\n✗ Beberapa file tidak ditemukan!');
}
