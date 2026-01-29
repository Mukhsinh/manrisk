# 🔴 FIX: Error Login "Koneksi Internet Bermasalah"

## ⚡ QUICK FIX (2 Menit)

### Masalah:
- Login gagal dengan error: "Koneksi internet bermasalah"
- Console error: `ERR_NAME_NOT_RESOLVED`
- **Padahal internet lancar!**

### Penyebab:
**DNS tidak dapat me-resolve hostname Supabase** (bukan masalah internet!)

### Solusi Cepat:

#### 1. Ganti DNS ke Google DNS

**Windows:**
1. Tekan `Win + R` → ketik `ncpa.cpl` → Enter
2. Klik kanan koneksi internet → Properties
3. Pilih IPv4 → Properties
4. Pilih "Use the following DNS server addresses"
5. Masukkan:
   - **Preferred:** `8.8.8.8`
   - **Alternate:** `8.8.4.4`
6. Klik OK

#### 2. Flush DNS Cache

Buka Command Prompt sebagai Administrator:
```cmd
ipconfig /flushdns
```

#### 3. Restart Browser dan Server

```bash
# Stop server (Ctrl+C)
# Start server
npm start
```

#### 4. Test Login

Buka `http://localhost:3001` dan coba login lagi.

---

## 🤖 ATAU Gunakan Script Otomatis

1. Klik kanan `fix-dns-windows.bat`
2. Pilih "Run as administrator"
3. Ikuti instruksi
4. Restart komputer
5. Ganti DNS ke 8.8.8.8 (lihat langkah di atas)

---

## ✅ Verifikasi

Test koneksi Supabase:
```bash
node test-supabase-connection.js
```

Harus muncul: `✅ ALL TESTS PASSED`

---

## 📚 Dokumentasi Lengkap

- **Panduan Lengkap:** `PANDUAN_FIX_ERROR_LOGIN.md`
- **Solusi Detail:** `SOLUSI_ERROR_DNS_SUPABASE.md`
- **Dokumentasi Teknis:** `LOGIN_ERROR_DNS_FIX_COMPLETE.md`

---

## 🆘 Masih Bermasalah?

1. Coba DNS lain: Cloudflare `1.1.1.1`
2. Periksa firewall/antivirus
3. Test dari jaringan lain (mobile hotspot)
4. Baca `PANDUAN_FIX_ERROR_LOGIN.md` untuk troubleshooting lengkap

---

**Status:** SOLUSI TERSEDIA ✅  
**Estimasi:** 2-5 menit  
**Tanggal:** 29 Januari 2026
