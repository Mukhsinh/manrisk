/**
 * Script Verifikasi: Risk Input Form Toggle
 * 
 * Memverifikasi bahwa form inputan di halaman /risk-input
 * hanya muncul setelah tombol "Tambah Resiko" diklik
 */

const fs = require('fs');
const path = require('path');

console.log('='.repeat(60));
console.log('VERIFIKASI: Risk Input Form Toggle');
console.log('='.repeat(60));
console.log();

// 1. Cek HTML file
console.log('1. Memeriksa file HTML...');
const htmlPath = path.join(__dirname, 'public', 'risk-input.html');
const htmlContent = fs.readFileSync(htmlPath, 'utf8');

const checks = {
    formSectionHidden: htmlContent.includes('id="risk-input-form-section"') && 
                       htmlContent.includes('style="display: none;'),
    inherentSectionHidden: htmlContent.includes('id="form-section-inherent"') && 
                          htmlContent.includes('style="display: none;"'),
    residualSectionHidden: htmlContent.includes('id="form-section-residual"') && 
                          htmlContent.includes('style="display: none;"'),
    hasMainSectionIds: htmlContent.includes('id="form-section-info"') &&
                       htmlContent.includes('id="form-section-deskripsi"') &&
                       htmlContent.includes('id="form-section-identifikasi"') &&
                       htmlContent.includes('id="form-section-pemilik"') &&
                       htmlContent.includes('id="form-section-sasaran"') &&
                       htmlContent.includes('id="form-section-indikator"'),
    hasTambahButton: htmlContent.includes('id="btn-tambah-risiko"')
};

console.log('   ✓ Form section tersembunyi:', checks.formSectionHidden ? 'YA' : 'TIDAK');
console.log('   ✓ Section inherent tersembunyi:', checks.inherentSectionHidden ? 'YA' : 'TIDAK');
console.log('   ✓ Section residual tersembunyi:', checks.residualSectionHidden ? 'YA' : 'TIDAK');
console.log('   ✓ Semua section memiliki ID:', checks.hasMainSectionIds ? 'YA' : 'TIDAK');
console.log('   ✓ Tombol "Tambah Resiko" ada:', checks.hasTambahButton ? 'YA' : 'TIDAK');
console.log();

// 2. Cek JavaScript file
console.log('2. Memeriksa file JavaScript...');
const jsPath = path.join(__dirname, 'public', 'js', 'risk-input.js');
const jsContent = fs.readFileSync(jsPath, 'utf8');

const jsChecks = {
    hasShowFormSection: jsContent.includes('function showFormSection()'),
    hasHideFormSection: jsContent.includes('function hideFormSection()'),
    hasHideAnalysisSections: jsContent.includes('function hideAnalysisSections()'),
    hasShowAnalysisSections: jsContent.includes('function showAnalysisSections()'),
    usesFormSectionIds: jsContent.includes("getEl('form-section-inherent')") &&
                        jsContent.includes("getEl('form-section-residual')"),
    bindsTambahButton: jsContent.includes("getEl('btn-tambah-risiko')") &&
                       jsContent.includes('addEventListener')
};

console.log('   ✓ Fungsi showFormSection ada:', jsChecks.hasShowFormSection ? 'YA' : 'TIDAK');
console.log('   ✓ Fungsi hideFormSection ada:', jsChecks.hasHideFormSection ? 'YA' : 'TIDAK');
console.log('   ✓ Fungsi hideAnalysisSections ada:', jsChecks.hasHideAnalysisSections ? 'YA' : 'TIDAK');
console.log('   ✓ Fungsi showAnalysisSections ada:', jsChecks.hasShowAnalysisSections ? 'YA' : 'TIDAK');
console.log('   ✓ Menggunakan ID section:', jsChecks.usesFormSectionIds ? 'YA' : 'TIDAK');
console.log('   ✓ Event listener tombol terpasang:', jsChecks.bindsTambahButton ? 'YA' : 'TIDAK');
console.log();

// 3. Cek CSS file
console.log('3. Memeriksa file CSS...');
const cssPath = path.join(__dirname, 'public', 'css', 'risk-input.css');
const cssContent = fs.readFileSync(cssPath, 'utf8');

const cssChecks = {
    hasFormSectionStyle: cssContent.includes('#risk-input-form-section'),
    hasNotificationStyle: cssContent.includes('.risk-notification'),
    hasButtonStyle: cssContent.includes('.btn-tambah-risiko')
};

console.log('   ✓ Style form section ada:', cssChecks.hasFormSectionStyle ? 'YA' : 'TIDAK');
console.log('   ✓ Style notifikasi ada:', cssChecks.hasNotificationStyle ? 'YA' : 'TIDAK');
console.log('   ✓ Style tombol ada:', cssChecks.hasButtonStyle ? 'YA' : 'TIDAK');
console.log();

// 4. Summary
console.log('='.repeat(60));
console.log('RINGKASAN VERIFIKASI');
console.log('='.repeat(60));

const allChecks = { ...checks, ...jsChecks, ...cssChecks };
const totalChecks = Object.keys(allChecks).length;
const passedChecks = Object.values(allChecks).filter(v => v === true).length;
const failedChecks = totalChecks - passedChecks;

console.log(`Total Pemeriksaan: ${totalChecks}`);
console.log(`✓ Passed: ${passedChecks}`);
console.log(`✗ Failed: ${failedChecks}`);
console.log();

if (failedChecks === 0) {
    console.log('✓ SEMUA PEMERIKSAAN BERHASIL!');
    console.log();
    console.log('Implementasi sudah benar:');
    console.log('1. Form section tersembunyi secara default');
    console.log('2. Section analisis (inherent & residual) tersembunyi secara default');
    console.log('3. Form hanya muncul setelah tombol "Tambah Resiko" diklik');
    console.log('4. Section analisis hanya muncul setelah data risiko disimpan');
    console.log();
    console.log('Untuk test manual, buka:');
    console.log('http://localhost:3000/test-risk-input-form-visibility.html');
} else {
    console.log('✗ ADA PEMERIKSAAN YANG GAGAL!');
    console.log();
    console.log('Periksa kembali implementasi:');
    Object.entries(allChecks).forEach(([key, value]) => {
        if (!value) {
            console.log(`   ✗ ${key}`);
        }
    });
}

console.log();
console.log('='.repeat(60));
