# Inventarisasi Dokumentasi Staging untuk Deployment

## Ringkasan
Dokumen ini berisi inventarisasi lengkap file dokumentasi, test, dan backup yang perlu dihapus sebelum deployment ke production untuk mengurangi beban aplikasi.

## Kategori File yang Akan Dihapus

### 1. File Dokumentasi Markdown (30+ file)
File-file dokumentasi pengembangan yang tidak diperlukan di production:

- CLEANUP_REPORT.md
- DATABASE_SCHEMA.md  
- DEPLOYMENT.md
- INTEGRASI_SUPABASE.md
- MCP_INTEGRATION.md
- PROJECT_RULES.md
- QUICK_START_GUIDE.md
- FIX_AMBIGUOUS_USER_ID.md
- PERBAIKAN_MASALAH_APLIKASI.md
- CHART_SIZE_FIX_SUMMARY.md
- FRONTEND_LOGIN_FIX_SUMMARY.md
- LOGIN_SYSTEM_FIX_SUMMARY.md
- MONITORING_PELUANG_BUTTON_FIX_COMPLETE.md
- COMPREHENSIVE_FIXES_IMPLEMENTATION_SUMMARY.md
- MODERN_UI_PORT_SOLUTION_SUMMARY.md
- BUTTON_SYSTEM_FINAL_REPORT.md
- BUTTON_FIX_COMPLETION_SUMMARY.md
- BUTTON_FIX_DEPLOYMENT_GUIDE.md
- BUTTON_FIX_FINAL_REPORT.md
- MANUAL_TESTING_ALL_PAGES.md
- MANUAL_TESTING_MASTER_DATA.md
- MANUAL_TESTING_DASHBOARD.md
- BUTTON_FIX_IMPLEMENTATION_SUMMARY.md
- BUTTON_FIXES_FINAL_SUMMARY.md
- BUTTON_FIXES_IMPLEMENTATION_COMPLETE.md
- SUMMARY_AUDIT_FINAL.md
- AUDIT_KOMPREHENSIF_TOMBOL_DAN_OVERFLOW.md
- COMPREHENSIVE_BUTTON_AUDIT_SUMMARY.md
- DIAGRAM_KARTESIUS_BUTTONS_FIX_COMPLETE.md
- Dan 100+ file dokumentasi lainnya

### 2. File Test JavaScript (200+ file)
File-file testing yang hanya diperlukan untuk development:


- test-agregasi-comprehensive.js
- test-ai-assistant.js
- test-comprehensive-fixes.js
- test-dashboard-fix.js
- test-login-fix.js
- test-rencana-strategis-*.js (50+ file)
- test-risk-profile-*.js (30+ file)
- test-swot-*.js (20+ file)
- test-residual-*.js (25+ file)
- Dan 100+ file test lainnya

### 3. File Verify JavaScript (30+ file)
File-file verifikasi yang hanya untuk QA:

- verify-accessibility-navigation.js
- verify-button-fixes.js
- verify-monitoring-system.js
- verify-risk-profile-*.js
- verify-swot-*.js
- Dan 25+ file verify lainnya

### 4. File Debug JavaScript (10+ file)
File-file debugging development:

- debug-login-response.js
- debug-residual-auth.js
- debug-swot-summary.js
- debug-swot-weakness.js
- Dan file debug lainnya

### 5. File Create Data JavaScript (15+ file)
Script untuk membuat data testing:

- create-admin-user.js
- create-all-iku-data.js
- create-professional-*.js (10+ file)
- create-swot-data-*.js
- create-test-data-*.js
- insert-all-swot-tows-data.js
- display-swot-samples.js

### 6. File Apply/Fix/Integrate JavaScript (50+ file)
Script one-time untuk perbaikan:

- apply-button-standardization-all.js
- apply-rencana-strategis-improvements.js
- apply-swot-fixes-final.js
- fix-*.js (40+ file)
- integrate-*.js (10+ file)
- enforce-*.js
- force-*.js
- implement-*.js


### 7. Direktori Backup (4 direktori)
Direktori backup yang tidak diperlukan:

- **backup-button-fixes/** - Backup file HTML perbaikan tombol (200+ file)
- **backup-rencana-strategis/** - Backup file rencana strategis
- **docs/** - Dokumentasi development (MANUAL_TESTING_GUIDE.md, BUTTON_API_REFERENCE.md, dll)
- **test-results/** - Hasil testing

### 8. File Konfigurasi Test (5 file)
File konfigurasi untuk testing:

- jest.button-fix.config.js
- jest.router.config.js
- jest.ui-standardization.config.js
- jest.ui-test.config.js
- run-property-tests.js

### 9. File Batch Windows (5 file)
Script batch untuk development:

- fix-dns-supabase-complete.bat
- fix-dns-windows-complete.bat
- fix-dns-windows.bat
- install-dependencies.bat
- start-dev-auto-port.bat
- start-dev-port-3001.bat
- start-dev-port-3033.bat
- start-dev.bat

### 10. File HTML Test (100+ file di public/)
File HTML untuk testing di direktori public/:

- test-*.html (100+ file)
- debug-*.html (10+ file)
- public/test-* (semua file test)

## Estimasi Ukuran Total

Berdasarkan inventarisasi:
- **File Dokumentasi MD**: ~2-3 MB
- **File Test JS**: ~5-7 MB
- **File Verify JS**: ~1-2 MB
- **File Debug/Create/Fix JS**: ~3-5 MB
- **Direktori Backup**: ~50-100 MB
- **File HTML Test**: ~10-15 MB
- **File Konfigurasi Test**: ~100 KB

**Total Estimasi**: ~70-130 MB

## Rekomendasi Penghapusan

### Prioritas Tinggi (Wajib Dihapus)
1. Direktori `backup-button-fixes/` dan `backup-rencana-strategis/`
2. Semua file `test-*.js` di root
3. Semua file `verify-*.js` di root
4. Semua file `debug-*.js` di root
5. Direktori `test-results/`
6. Semua file `test-*.html` di public/


### Prioritas Sedang (Disarankan Dihapus)
1. File dokumentasi MD yang bukan README.md
2. File `create-*.js` untuk data testing
3. File `apply-*.js`, `fix-*.js`, `integrate-*.js`
4. File batch `.bat`
5. Direktori `docs/` (kecuali dokumentasi API yang diperlukan)

### Prioritas Rendah (Opsional)
1. File `cleanup-documentation.js` dan sejenisnya
2. File `list-available-models.js`
3. File screenshot `.png` untuk testing

## File yang HARUS DIPERTAHANKAN

### File Penting untuk Production:
- ✅ server.js
- ✅ package.json & package-lock.json
- ✅ vercel.json
- ✅ .env.example
- ✅ README.md
- ✅ Semua file di routes/
- ✅ Semua file di public/js/ (kecuali test)
- ✅ Semua file di public/css/ (kecuali test)
- ✅ Semua file di middleware/
- ✅ Semua file di utils/
- ✅ Semua file di config/
- ✅ File HTML production di public/ (bukan test-*.html)

## Cara Menjalankan Cleanup

### Opsi 1: Manual
Hapus file dan direktori sesuai daftar di atas secara manual.

### Opsi 2: Menggunakan Script
Jalankan script cleanup yang telah dibuat:

```bash
node cleanup-staging-docs.js
```

Script akan:
1. Menampilkan inventarisasi lengkap
2. Menghitung total ukuran
3. Meminta konfirmasi sebelum menghapus
4. Menghapus semua file dan direktori yang ditentukan
5. Membuat laporan hasil cleanup

## Catatan Penting

⚠️ **PERINGATAN**: 
- Pastikan backup kode sebelum menghapus
- Jangan hapus file yang masih digunakan di production
- Review daftar file sebelum konfirmasi penghapusan
- Simpan file `STAGING_CLEANUP_INVENTORY.json` sebagai referensi

## Hasil yang Diharapkan

Setelah cleanup:
- ✅ Ukuran aplikasi berkurang 70-130 MB
- ✅ Deployment lebih cepat
- ✅ Struktur folder lebih bersih
- ✅ Hanya file production yang tersisa
- ✅ Performa aplikasi lebih optimal

---

**Tanggal Inventarisasi**: 2 April 2026
**Status**: Siap untuk cleanup
**Estimasi Waktu Cleanup**: 5-10 menit
