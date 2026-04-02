# Panduan Manual Testing untuk Button System

Dokumen ini berisi checklist lengkap untuk manual testing semua tombol dalam aplikasi.

## Persiapan Testing

### Tools yang Dibutuhkan
- Browser modern (Chrome/Firefox/Edge)
- DevTools (F12)
- Screen reader (NVDA/JAWS) untuk accessibility testing
- Koneksi internet

### Sebelum Memulai
1. Buka aplikasi di browser
2. Login dengan user yang memiliki akses penuh
3. Buka DevTools (F12) dan monitor Console tab
4. Siapkan checklist ini untuk dicek satu per satu

---

## Testing Checklist

### ✅ Task 19.1: Dashboard

**Tombol yang Harus Ditest:**

- [ ] **Tombol Refresh**
  - Klik tombol refresh
  - Verifikasi: Data dashboard ter-refresh
  - Verifikasi: Loading indicator muncul
  - Verifikasi: Tidak ada error di console

- [ ] **Tombol Filter Tahun**
  - Pilih tahun berbeda
  - Klik "Terapkan Filter"
  - Verifikasi: Data berubah sesuai tahun
  - Verifikasi: URL ter-update dengan parameter filter

- [ ] **Tombol Reset Filter**
  - Klik "Reset Filter"
  - Verifikasi: Filter kembali ke default
  - Verifikasi: URL parameter terhapus

- [ ] **Tombol Navigasi ke Halaman Lain**
  - Klik setiap card/menu navigasi
  - Verifikasi: Berpindah ke halaman yang benar
  - Verifikasi: Tidak ada error

**Status:** ⬜ Belum / ✅ Selesai / ❌ Ada Masalah

**Catatan:**
```
[Tulis catatan jika ada masalah]
```

---

### ✅ Task 19.2: Master Data

**Tombol yang Harus Ditest:**

- [ ] **Tombol Tambah**
  - Klik "Tambah"
  - Verifikasi: Modal/form terbuka
  - Verifikasi: Form kosong

- [ ] **Tombol Edit**
  - Klik icon edit pada salah satu row
  - Verifikasi: Modal/form terbuka
  - Verifikasi: Data ter-populate dengan benar

- [ ] **Tombol Hapus**
  - Klik icon hapus
  - Verifikasi: Muncul konfirmasi
  - Klik "Ya"
  - Verifikasi: Data terhapus
  - Verifikasi: Notifikasi sukses muncul

- [ ] **Tombol Import**
  - Klik "Import"
  - Verifikasi: File picker terbuka
  - Pilih file Excel
  - Verifikasi: Loading indicator muncul
  - Verifikasi: Data ter-import
  - Verifikasi: Notifikasi sukses muncul

- [ ] **Tombol Export**
  - Klik "Export Excel"
  - Verifikasi: File ter-download
  - Verifikasi: File dapat dibuka
  - Verifikasi: Data sesuai

- [ ] **Tombol Download Template**
  - Klik "Download Template"
  - Verifikasi: Template ter-download
  - Verifikasi: Template format benar

**Status:** ⬜ Belum / ✅ Selesai / ❌ Ada Masalah

**Catatan:**
```
[Tulis catatan jika ada masalah]
```

---

### ✅ Task 19.3: Risk Input

**Tombol yang Harus Ditest:**

- [ ] **Tombol Tambah Risiko**
  - Klik "Tambah Risiko"
  - Verifikasi: Form terbuka
  - Isi form dan klik "Simpan"
  - Verifikasi: Data tersimpan
  - Verifikasi: Notifikasi sukses

- [ ] **Tombol Edit Risiko**
  - Klik icon edit
  - Verifikasi: Form terbuka dengan data
  - Ubah data dan klik "Simpan"
  - Verifikasi: Data ter-update

- [ ] **Tombol Hapus Risiko**
  - Klik icon hapus
  - Verifikasi: Konfirmasi muncul
  - Konfirmasi hapus
  - Verifikasi: Data terhapus

- [ ] **Tombol Filter**
  - Set filter (kategori, level, dll)
  - Klik "Terapkan"
  - Verifikasi: Data ter-filter

- [ ] **Tombol Import/Export**
  - Test import Excel
  - Test export Excel
  - Verifikasi: Berfungsi dengan benar

**Status:** ⬜ Belum / ✅ Selesai / ❌ Ada Masalah

**Catatan:**
```
[Tulis catatan jika ada masalah]
```

---

### ✅ Task 19.4: Risk Profile

**Tombol yang Harus Ditest:**

- [ ] **Tombol Filter Organisasi**
  - Pilih organisasi
  - Verifikasi: Data berubah

- [ ] **Tombol Filter Tahun**
  - Pilih tahun
  - Verifikasi: Data berubah

- [ ] **Tombol Download PDF**
  - Klik "Download PDF"
  - Verifikasi: PDF ter-generate
  - Verifikasi: PDF dapat dibuka
  - Verifikasi: Konten sesuai

- [ ] **Tombol Download Excel**
  - Klik "Download Excel"
  - Verifikasi: Excel ter-download
  - Verifikasi: Data sesuai

- [ ] **Tombol Refresh**
  - Klik refresh
  - Verifikasi: Data ter-refresh

**Status:** ⬜ Belum / ✅ Selesai / ❌ Ada Masalah

**Catatan:**
```
[Tulis catatan jika ada masalah]
```

---

### ✅ Task 19.5: KRI (Key Risk Indicator)

**Tombol yang Harus Ditest:**

- [ ] **Tombol Tambah KRI**
  - Klik "Tambah"
  - Isi form
  - Klik "Simpan"
  - Verifikasi: Data tersimpan

- [ ] **Tombol Edit KRI**
  - Klik edit
  - Ubah data
  - Simpan
  - Verifikasi: Data ter-update

- [ ] **Tombol Hapus KRI**
  - Klik hapus
  - Konfirmasi
  - Verifikasi: Data terhapus

- [ ] **Tombol Import/Export**
  - Test import
  - Test export
  - Verifikasi: Berfungsi

- [ ] **Tombol Filter**
  - Apply filter
  - Verifikasi: Data ter-filter

**Status:** ⬜ Belum / ✅ Selesai / ❌ Ada Masalah

**Catatan:**
```
[Tulis catatan jika ada masalah]
```

---

### ✅ Task 19.6: Residual Risk

**Tombol yang Harus Ditest:**

- [ ] **Tombol Tambah**
  - Tambah data residual risk
  - Verifikasi: Tersimpan

- [ ] **Tombol Edit**
  - Edit data
  - Verifikasi: Ter-update

- [ ] **Tombol Hapus**
  - Hapus data
  - Verifikasi: Terhapus

- [ ] **Tombol View Matrix**
  - Klik "View Matrix"
  - Verifikasi: Matrix ditampilkan
  - Verifikasi: Data sesuai

- [ ] **Tombol Download Laporan**
  - Klik "Download Laporan"
  - Verifikasi: Laporan ter-download

**Status:** ⬜ Belum / ✅ Selesai / ❌ Ada Masalah

**Catatan:**
```
[Tulis catatan jika ada masalah]
```

---

### ✅ Task 19.7: Analisis SWOT

**Tombol yang Harus Ditest:**

- [ ] **Tombol Tambah SWOT**
  - Tambah Strength/Weakness/Opportunity/Threat
  - Verifikasi: Tersimpan

- [ ] **Tombol Edit SWOT**
  - Edit data
  - Verifikasi: Ter-update

- [ ] **Tombol Hapus SWOT**
  - Hapus data
  - Verifikasi: Terhapus

- [ ] **Tombol Generate Diagram**
  - Klik "Generate Diagram"
  - Verifikasi: Diagram Kartesius muncul
  - Verifikasi: Posisi data benar

- [ ] **Tombol Download Diagram**
  - Klik "Download Diagram"
  - Verifikasi: Diagram ter-download sebagai image

**Status:** ⬜ Belum / ✅ Selesai / ❌ Ada Masalah

**Catatan:**
```
[Tulis catatan jika ada masalah]
```

---

### ✅ Task 19.8: Rencana Strategis

**Tombol yang Harus Ditest:**

- [ ] **Tombol Tambah**
  - Tambah rencana strategis
  - Verifikasi: Tersimpan

- [ ] **Tombol Edit**
  - Edit data
  - Verifikasi: Ter-update

- [ ] **Tombol Hapus**
  - Hapus data
  - Verifikasi: Terhapus

- [ ] **Tombol Toggle View (Table/Form)**
  - Klik toggle
  - Verifikasi: View berubah
  - Verifikasi: Data tetap sama

- [ ] **Tombol Download Strategic Map**
  - Klik "Download Strategic Map"
  - Verifikasi: Map ter-download

**Status:** ⬜ Belum / ✅ Selesai / ❌ Ada Masalah

**Catatan:**
```
[Tulis catatan jika ada masalah]
```

---

### ✅ Task 19.9: Monitoring & Evaluasi

**Tombol yang Harus Ditest:**

- [ ] **Tombol Tambah**
  - Tambah data monitoring
  - Verifikasi: Tersimpan

- [ ] **Tombol Edit**
  - Edit data
  - Verifikasi: Ter-update

- [ ] **Tombol Hapus**
  - Hapus data
  - Verifikasi: Terhapus

- [ ] **Tombol Download Laporan**
  - Download laporan
  - Verifikasi: Laporan ter-download

- [ ] **Tombol Filter**
  - Apply filter
  - Verifikasi: Data ter-filter

**Status:** ⬜ Belum / ✅ Selesai / ❌ Ada Masalah

**Catatan:**
```
[Tulis catatan jika ada masalah]
```

---

### ✅ Task 19.10: Laporan

**Tombol yang Harus Ditest:**

- [ ] **Tombol Generate Laporan**
  - Pilih jenis laporan
  - Klik "Generate"
  - Verifikasi: Laporan ter-generate

- [ ] **Tombol Download PDF**
  - Download laporan PDF
  - Verifikasi: PDF ter-download
  - Verifikasi: Konten benar

- [ ] **Tombol Download Excel**
  - Download laporan Excel
  - Verifikasi: Excel ter-download
  - Verifikasi: Data benar

- [ ] **Tombol Print**
  - Klik "Print"
  - Verifikasi: Print dialog muncul
  - Verifikasi: Preview benar

**Status:** ⬜ Belum / ✅ Selesai / ❌ Ada Masalah

**Catatan:**
```
[Tulis catatan jika ada masalah]
```

---

### ✅ Task 19.11: Pengaturan

**Tombol yang Harus Ditest:**

- [ ] **Tombol Tambah User**
  - Tambah user baru
  - Verifikasi: User tersimpan

- [ ] **Tombol Edit User**
  - Edit user
  - Verifikasi: Data ter-update

- [ ] **Tombol Hapus User**
  - Hapus user
  - Verifikasi: User terhapus

- [ ] **Tombol Reset Password**
  - Klik "Reset Password"
  - Verifikasi: Password ter-reset
  - Verifikasi: Notifikasi muncul

- [ ] **Tombol Tambah Organisasi**
  - Tambah organisasi
  - Verifikasi: Tersimpan

- [ ] **Tombol Edit Organisasi**
  - Edit organisasi
  - Verifikasi: Ter-update

**Status:** ⬜ Belum / ✅ Selesai / ❌ Ada Masalah

**Catatan:**
```
[Tulis catatan jika ada masalah]
```

---

### ✅ Task 19.12: Visi Misi

**Tombol yang Harus Ditest:**

- [ ] **Tombol Edit Visi**
  - Klik "Edit"
  - Ubah visi
  - Klik "Simpan"
  - Verifikasi: Visi ter-update

- [ ] **Tombol Edit Misi**
  - Klik "Edit"
  - Ubah misi
  - Klik "Simpan"
  - Verifikasi: Misi ter-update

- [ ] **Tombol Batal**
  - Klik "Edit"
  - Klik "Batal"
  - Verifikasi: Perubahan tidak tersimpan
  - Verifikasi: Form kembali ke view mode

**Status:** ⬜ Belum / ✅ Selesai / ❌ Ada Masalah

**Catatan:**
```
[Tulis catatan jika ada masalah]
```

---

### ✅ Task 19.13: Keyboard Navigation

**Testing Steps:**

1. **Tab Navigation**
   - [ ] Tekan Tab berulang kali
   - [ ] Verifikasi: Focus berpindah ke setiap button
   - [ ] Verifikasi: Focus indicator terlihat jelas
   - [ ] Verifikasi: Urutan focus logis

2. **Enter/Space Activation**
   - [ ] Focus ke button dengan Tab
   - [ ] Tekan Enter
   - [ ] Verifikasi: Button ter-activate
   - [ ] Tekan Space
   - [ ] Verifikasi: Button ter-activate

3. **Disabled Button**
   - [ ] Tab ke disabled button
   - [ ] Verifikasi: Disabled button di-skip
   - [ ] Verifikasi: Tidak dapat di-activate

**Status:** ⬜ Belum / ✅ Selesai / ❌ Ada Masalah

**Catatan:**
```
[Tulis catatan jika ada masalah]
```

---

### ✅ Task 19.14: Screen Reader Compatibility

**Testing Steps:**

1. **Setup**
   - [ ] Install NVDA (https://www.nvaccess.org/)
   - [ ] Aktifkan NVDA (Ctrl+Alt+N)

2. **Button Labels**
   - [ ] Navigate ke setiap button dengan arrow keys
   - [ ] Verifikasi: Label dibaca dengan jelas
   - [ ] Verifikasi: Icon-only button memiliki aria-label

3. **Button State**
   - [ ] Navigate ke disabled button
   - [ ] Verifikasi: State "disabled" dibaca
   - [ ] Navigate ke loading button
   - [ ] Verifikasi: State "busy" dibaca

4. **Form Fields**
   - [ ] Navigate ke form
   - [ ] Verifikasi: Label dan required state dibaca
   - [ ] Submit form dengan error
   - [ ] Verifikasi: Error messages dibaca

**Status:** ⬜ Belum / ✅ Selesai / ❌ Ada Masalah

**Catatan:**
```
[Tulis catatan jika ada masalah]
```

---

## Laporan Testing

### Summary

**Total Halaman Ditest:** ___ / 12
**Total Tombol Ditest:** ___ / ___
**Tombol Berfungsi:** ___ / ___
**Tombol Bermasalah:** ___ / ___

### Issues Found

| No | Halaman | Tombol | Masalah | Severity | Status |
|----|---------|--------|---------|----------|--------|
| 1  |         |        |         | High/Med/Low | Open/Fixed |
| 2  |         |        |         |          |        |
| 3  |         |        |         |          |        |

### Rekomendasi

```
[Tulis rekomendasi untuk perbaikan]
```

### Kesimpulan

```
[Tulis kesimpulan testing]
- Apakah semua tombol berfungsi?
- Apakah ada masalah kritis?
- Apakah siap untuk production?
```

---

## Sign Off

**Tester:** ___________________
**Tanggal:** ___________________
**Signature:** ___________________

