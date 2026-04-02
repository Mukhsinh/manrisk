# Requirements Document

## Introduction

Perbaikan dan standarisasi tampilan UI/UX secara menyeluruh pada seluruh halaman aplikasi Manajemen Risiko, mencakup tombol aksi, tipografi, ikon Lucide, judul halaman, dan responsivitas mobile-first. Tujuannya adalah tampilan yang konsisten, profesional, modern, dan bebas overflow di semua halaman dan sub-halaman.

## Glossary

- **Action_Button**: Tombol di kolom aksi tabel (Edit, Hapus, Lihat, dll)
- **Page_Title**: Judul utama setiap halaman/modul
- **Icon_System**: Sistem ikon berbasis Lucide Icons
- **Typography**: Sistem huruf formal, modern, dan profesional
- **Overflow**: Kondisi teks/ikon melampaui batas kontainer
- **Mobile_First**: Pendekatan desain yang mengutamakan tampilan mobile
- **UI_System**: Sistem antarmuka pengguna terpadu
- **App**: Aplikasi Manajemen Risiko

## Requirements

### Requirement 1: Standarisasi Tombol Aksi

**User Story:** Sebagai pengguna, saya ingin tombol aksi di kolom tabel memiliki tampilan yang seragam dengan ikon dan warna solid yang cerah, sehingga saya dapat dengan mudah mengidentifikasi fungsi setiap tombol di seluruh halaman.

#### Acceptance Criteria

1. THE UI_System SHALL menggunakan warna solid dan cerah untuk setiap jenis tombol aksi: biru untuk Edit/Lihat, merah untuk Hapus, hijau untuk Tambah/Simpan, kuning/oranye untuk Peringatan/Review
2. WHEN tombol aksi ditampilkan di kolom tabel, THE UI_System SHALL menampilkan ikon Lucide yang relevan di dalam setiap tombol
3. THE UI_System SHALL menyeragamkan ukuran tombol aksi (padding, font-size, border-radius) di seluruh halaman
4. WHEN tombol aksi dirender, THE UI_System SHALL memastikan ikon dan teks tidak overflow dari batas tombol
5. THE UI_System SHALL mempertahankan semua fungsi JavaScript yang sudah ada pada tombol aksi tanpa perubahan logika

### Requirement 2: Standarisasi Tipografi

**User Story:** Sebagai pengguna, saya ingin semua teks di aplikasi menggunakan gaya huruf yang formal, modern, dan profesional secara konsisten, sehingga aplikasi terlihat kredibel dan mudah dibaca.

#### Acceptance Criteria

1. THE UI_System SHALL menggunakan font Inter atau Poppins sebagai font utama di seluruh halaman
2. THE UI_System SHALL menetapkan hierarki tipografi yang konsisten: judul halaman (h1), sub-judul (h2/h3), label form, teks tabel, dan teks tombol
3. THE UI_System SHALL memastikan font-weight yang tepat: bold untuk judul, semi-bold untuk label, regular untuk konten
4. WHEN teks ditampilkan di seluruh halaman, THE UI_System SHALL memastikan line-height dan letter-spacing yang nyaman dibaca
5. THE UI_System SHALL menghapus penggunaan font yang tidak konsisten atau tidak profesional di seluruh halaman

### Requirement 3: Implementasi Lucide Icons

**User Story:** Sebagai pengguna, saya ingin semua ikon di aplikasi menggunakan Lucide Icons secara konsisten, sehingga tampilan ikon seragam dan modern di seluruh halaman.

#### Acceptance Criteria

1. THE Icon_System SHALL menggunakan Lucide Icons untuk semua ikon di seluruh halaman termasuk sidebar, tombol, judul, dan badge
2. WHEN ikon ditampilkan, THE Icon_System SHALL memastikan ukuran ikon konsisten sesuai konteks (16px untuk inline, 20px untuk tombol, 24px untuk judul)
3. THE Icon_System SHALL mengganti semua ikon emoji, Font Awesome, atau ikon non-Lucide dengan padanan Lucide yang sesuai
4. IF ikon Lucide tidak tersedia untuk suatu fungsi, THEN THE Icon_System SHALL menggunakan ikon Lucide terdekat yang relevan
5. THE Icon_System SHALL memastikan ikon tidak overflow dari kontainernya di semua ukuran layar

### Requirement 4: Tampilan Judul Halaman

**User Story:** Sebagai pengguna, saya ingin setiap halaman memiliki judul yang jelas, konsisten, dan mudah dibaca, sehingga saya selalu tahu sedang berada di halaman mana.

#### Acceptance Criteria

1. THE UI_System SHALL menampilkan judul halaman yang jelas dan deskriptif di setiap halaman dan sub-halaman
2. THE UI_System SHALL menyeragamkan format judul halaman: ikon Lucide + teks judul + breadcrumb jika diperlukan
3. WHEN judul halaman ditampilkan, THE UI_System SHALL memastikan kontras warna yang cukup antara judul dan latar belakang
4. THE UI_System SHALL memastikan judul halaman tidak terpotong atau overflow di semua ukuran layar
5. THE UI_System SHALL menggunakan ukuran font yang proporsional untuk judul (min 1.25rem, max 2rem)

### Requirement 5: Pencegahan Overflow dan Mobile-First

**User Story:** Sebagai pengguna mobile, saya ingin semua elemen UI tampil dengan baik di layar kecil tanpa ada teks atau ikon yang terpotong, sehingga saya dapat menggunakan aplikasi dengan nyaman di perangkat apapun.

#### Acceptance Criteria

1. THE UI_System SHALL memastikan semua teks menggunakan text-overflow: ellipsis atau word-wrap yang tepat agar tidak overflow
2. THE UI_System SHALL mengimplementasikan responsive breakpoints: mobile (< 768px), tablet (768px - 1024px), desktop (> 1024px)
3. WHEN ditampilkan di layar mobile, THE UI_System SHALL menyesuaikan ukuran tombol, font, dan tabel agar tetap dapat digunakan
4. THE UI_System SHALL memastikan tabel memiliki horizontal scroll pada layar kecil daripada memotong konten
5. WHEN ikon dan teks ditampilkan bersama, THE UI_System SHALL memastikan keduanya tidak saling tumpang tindih atau overflow
6. THE UI_System SHALL memastikan form input dan modal dapat digunakan dengan baik di layar mobile

### Requirement 6: Konsistensi di Seluruh Halaman

**User Story:** Sebagai pengguna, saya ingin semua halaman aplikasi memiliki tampilan yang konsisten, sehingga pengalaman pengguna terasa mulus dan profesional.

#### Acceptance Criteria

1. THE UI_System SHALL menerapkan standar yang sama untuk semua halaman: Dashboard, Login, Visi Misi, Analisis SWOT, Matriks TOWS, Diagram Kartesius, Sasaran Strategi, IKU, Rencana Strategis, Risk Input, Risk Register, Risk Profile, KRI, Residual Risk, Monitoring Evaluasi, Peluang, Laporan, Buku Pedoman, Master Data, Pengaturan
2. THE UI_System SHALL memastikan sidebar navigasi konsisten di semua halaman
3. WHEN pengguna berpindah halaman, THE UI_System SHALL mempertahankan konsistensi visual tanpa perubahan mendadak
4. THE UI_System SHALL memastikan warna tema (primary-red #8B0000) digunakan secara konsisten sebagai aksen utama
5. THE UI_System SHALL memastikan semua form input, modal, dan dropdown memiliki tampilan yang seragam
