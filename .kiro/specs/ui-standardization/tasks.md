# Implementation Plan: UI Standardization

## Overview

Implementasi standarisasi UI/UX menyeluruh dengan pendekatan CSS-first + JS enhancement. Satu file CSS global dan satu JS global menggantikan puluhan patch file yang ada.

## Tasks

- [x] 1. Buat CSS global standarisasi (`public/css/ui-standardization.css`)
  - Definisikan CSS variables untuk warna tombol, tipografi, spacing
  - Implementasikan action button styles (edit=biru, delete=merah, view=hijau, warning=kuning)
  - Implementasikan page title styles dengan ikon Lucide
  - Implementasikan typography system (Inter/Poppins, hierarki heading)
  - Implementasikan overflow prevention (text-overflow, table scroll)
  - Implementasikan mobile-first responsive breakpoints (< 768px, 768-1024px, > 1024px)
  - _Requirements: 1.1, 1.3, 1.4, 2.1, 2.2, 2.3, 4.1, 4.2, 4.4, 4.5, 5.1, 5.2, 5.4, 6.4, 6.5_

- [x] 2. Buat JS global standarisasi (`public/js/ui-standardization.js`)
  - [x] 2.1 Implementasikan icon mapping untuk semua halaman dan tombol aksi
    - Definisikan `PAGE_ICONS` dan `ACTION_ICONS` mapping
    - _Requirements: 3.1, 3.2, 3.3, 4.2_

  - [x] 2.2 Implementasikan fungsi `applyActionButtonStyles()`
    - Scan semua tombol di DOM dan terapkan class standar
    - Inject ikon Lucide ke dalam tombol yang belum memiliki ikon
    - _Requirements: 1.1, 1.2, 1.3, 3.1_

  - [x]* 2.3 Tulis property test untuk konsistensi warna tombol
    - **Property 2: Konsistensi Warna Tombol Aksi**
    - **Validates: Requirements 1.1, 1.3**

  - [x] 2.4 Implementasikan fungsi `applyPageTitles()`
    - Inject ikon Lucide ke judul halaman berdasarkan `PAGE_ICONS` mapping
    - Pastikan format: ikon + teks judul
    - _Requirements: 4.1, 4.2, 3.1_

  - [x]* 2.5 Tulis property test untuk tipografi konsisten
    - **Property 4: Tipografi Konsisten**
    - **Validates: Requirements 2.2, 2.3, 4.5**

  - [x] 2.6 Implementasikan MutationObserver untuk konten dinamis
    - Observe perubahan DOM dan terapkan styling ke elemen baru
    - _Requirements: 1.2, 3.1, 6.1_

  - [x]* 2.7 Tulis property test untuk ikon Lucide
    - **Property 3: Semua Ikon Menggunakan Lucide**
    - **Validates: Requirements 3.1, 3.3**

- [x] 3. Checkpoint - Pastikan CSS dan JS dasar berjalan
  - Pastikan semua tests pass, tanyakan ke user jika ada pertanyaan.

- [x] 4. Integrasi ke HTML utama dan semua halaman
  - [x] 4.1 Tambahkan `ui-standardization.css` ke `index.html` atau template utama
    - Load setelah semua CSS lain agar bisa override
    - _Requirements: 6.1_

  - [x] 4.2 Tambahkan `ui-standardization.js` ke `index.html` atau template utama
    - Load setelah Lucide library
    - _Requirements: 6.1_

  - [x]* 4.3 Tulis property test untuk overflow prevention
    - **Property 1: Tidak Ada Overflow pada Elemen UI**
    - **Validates: Requirements 1.4, 3.5, 4.4, 5.1**

  - [x]* 4.4 Tulis property test untuk tabel responsif
    - **Property 5: Tabel Responsif**
    - **Validates: Requirements 5.4**

- [x] 5. Perbaikan per-modul: halaman utama
  - [x] 5.1 Perbaiki tombol aksi di halaman Dashboard, Visi Misi, Analisis SWOT
    - Ganti class tombol lama dengan class standar baru
    - Pastikan ikon Lucide terpasang
    - _Requirements: 1.1, 1.2, 3.1, 6.1_

  - [x] 5.2 Perbaiki tombol aksi di halaman Matriks TOWS, Diagram Kartesius, Sasaran Strategi
    - _Requirements: 1.1, 1.2, 3.1, 6.1_

  - [x] 5.3 Perbaiki tombol aksi di halaman IKU, Rencana Strategis, Renstra
    - _Requirements: 1.1, 1.2, 3.1, 6.1_

- [x] 6. Perbaikan per-modul: halaman risiko
  - [x] 6.1 Perbaiki tombol aksi di `public/js/risk-input.js` dan `public/js/risk-register.js`
    - Ganti `fas fa-edit/trash/eye` dengan ikon Lucide (`data-lucide`)
    - Ganti class `btn-view/btn-edit/btn-delete` dengan `btn-action-view/btn-action-edit/btn-action-delete`
    - _Requirements: 1.1, 1.2, 3.1, 3.3, 6.1_

  - [x] 6.2 Perbaiki tombol aksi di `public/js/kri.js` dan `public/js/residual-risk.js`
    - Ganti `fas fa-` dengan ikon Lucide di tombol aksi tabel
    - Ganti class `btn-action btn-edit/btn-delete` dengan class standar
    - _Requirements: 1.1, 1.2, 3.1, 3.3, 6.1_

  - [x] 6.3 Perbaiki tombol aksi di `public/js/monitoring-evaluasi.js` dan `public/js/peluang.js`
    - Ganti `fas fa-edit/trash` dengan ikon Lucide di tombol aksi tabel
    - Seragamkan class tombol dengan standar baru
    - _Requirements: 1.1, 1.2, 3.1, 3.3, 6.1_

- [x] 7. Perbaikan per-modul: halaman admin
  - [x] 7.1 Perbaiki tombol aksi di `public/js/master-data.js`
    - Ganti `fas fa-edit/trash` dengan ikon Lucide
    - Ganti class `btn-edit/btn-delete` dengan `btn-action-edit/btn-action-delete`
    - _Requirements: 1.1, 1.2, 3.1, 3.3, 6.1_

  - [x] 7.2 Perbaiki form input dan modal di semua halaman
    - Pastikan form input memiliki styling seragam via CSS variables
    - Pastikan modal responsif di mobile
    - _Requirements: 5.6, 6.5_

  - [x]* 7.3 Tulis property test untuk konsistensi ukuran tombol
    - **Property 6: Konsistensi Ukuran Tombol Aksi**
    - **Validates: Requirements 1.3, 6.5**

- [x] 8. Test build dan validasi akhir
  - Jalankan `node server.js` dan pastikan tidak ada error
  - Verifikasi tidak ada CSS/JS yang konflik
  - Pastikan semua tests pass
  - _Requirements: semua_

- [x] 9. Checkpoint akhir - Pastikan semua tests pass
  - Pastikan semua tests pass, tanyakan ke user jika ada pertanyaan.

## Notes

- Tasks bertanda `*` adalah opsional (tests) dan bisa dilewati untuk MVP lebih cepat
- Setiap task harus mempertahankan fungsi JavaScript yang sudah ada
- Gunakan `!important` dengan bijak hanya jika diperlukan untuk override
- MutationObserver memastikan styling diterapkan ke konten yang dirender secara dinamis
- Task 6 dan 7 fokus pada penggantian `fas fa-` (Font Awesome) dengan Lucide di file JS modul
