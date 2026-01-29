# 🚨 Cara Mengatasi Login Gagal: "Koneksi Internet Bermasalah"

## ⚠️ Gejala Masalah

Saat login, muncul notifikasi merah:
```
❌ Koneksi internet bermasalah.
```

Padahal koneksi internet Anda **LANCAR** dan bisa browsing normal.

## 🎯 Penyebab Sebenarnya

**BUKAN masalah koneksi internet!** Tapi:

1. **DNS tidak bisa menemukan server Supabase** ❌
2. **Firewall/antivirus memblokir akses** 🛡️
3. **Proxy bermasalah** 🔄

## ✅ Solusi Cepat (5 Menit)

### Langkah 1: Ganti DNS ke Google DNS

**Windows 10/11:**

1. Klik kanan icon WiFi/Network di taskbar
2. Pilih **"Open Network & Internet settings"**
3. Klik **"Change adapter options"**
4. Klik kanan pada WiFi/Ethernet Anda → **Properties**
5. Pilih **"Internet Protocol Version 4 (TCP/IPv4)"** → **Properties**
6. Pilih **"Use the following DNS server addresses"**
7. Isi:
   - **Preferred DNS:** `8.8.8.8`
   - **Alternate DNS:** `8.8.4.4`
8. Klik **OK** → **OK**

### Langkah 2: Flush DNS Cache

1. Tekan **Windows + R**
2. Ketik `cmd` → Enter
3. Ketik perintah ini:
   ```cmd
   ipconfig /flushdns
   ```
4. Tunggu sampai muncul pesan "Successfully flushed..."

### Langkah 3: Restart Browser

1. **Tutup semua tab browser**
2. **Tutup browser sepenuhnya** (pastikan tidak ada di taskbar)
3. **Buka browser lagi**
4. **Coba login**

## 🔧 Jika Masih Gagal

### Solusi 2: Matikan Firewall Sementara

**Windows Defender:**

1. Tekan **Windows + I** (Settings)
2. Pilih **"Privacy & Security"** → **"Windows Security"**
3. Klik **"Firewall & network protection"**
4. Klik **"Private network"** atau **"Public network"**
5. Matikan **"Microsoft Defender Firewall"** (sementara)
6. **Coba login lagi**
7. Jika berhasil, nyalakan kembali firewall

**Antivirus (Kaspersky, Avast, dll):**

1. Buka antivirus Anda
2. Cari menu **"Settings"** atau **"Protection"**
3. Matikan **"Web Protection"** sementara
4. **Coba login lagi**

### Solusi 3: Clear Browser Cache

**Chrome/Edge:**

1. Tekan **Ctrl + Shift + Delete**
2. Pilih **"All time"**
3. Centang:
   - ✅ Cookies and other site data
   - ✅ Cached images and files
4. Klik **"Clear data"**
5. **Restart browser**
6. **Coba login lagi**

### Solusi 4: Coba Browser Lain

1. Coba buka aplikasi di **browser lain** (Chrome, Firefox, Edge)
2. Jika berhasil → masalah ada di browser sebelumnya
3. Clear cache browser yang bermasalah

## 🛠️ Tool Diagnostic

Kami sudah menyediakan tool untuk mengecek masalah:

1. Buka browser
2. Ketik di address bar:
   ```
   http://localhost:3001/test-supabase-connection.html
   ```
3. Klik **"Jalankan Semua Test"**
4. Lihat hasil test:
   - ✅ Hijau = OK
   - ❌ Merah = Ada masalah
5. Ikuti solusi yang ditampilkan

## 📞 Masih Belum Berhasil?

Jika semua solusi di atas tidak berhasil:

### Kemungkinan 1: ISP Memblokir Supabase

**Solusi:**
- Gunakan **VPN** (Cloudflare WARP, ProtonVPN, dll)
- Hubungi ISP Anda

### Kemungkinan 2: Network Policy Perusahaan

**Solusi:**
- Hubungi **IT Department**
- Minta whitelist domain `*.supabase.co`

### Kemungkinan 3: Server Supabase Down

**Cek status:**
- Buka: https://status.supabase.com/
- Jika ada masalah, tunggu hingga normal

## 📋 Checklist Troubleshooting

Gunakan checklist ini:

- [ ] Ganti DNS ke Google DNS (8.8.8.8)
- [ ] Flush DNS cache (`ipconfig /flushdns`)
- [ ] Restart browser
- [ ] Matikan firewall/antivirus sementara
- [ ] Clear browser cache
- [ ] Coba browser lain
- [ ] Jalankan diagnostic tool
- [ ] Hubungi administrator sistem

## 💡 Tips

1. **Solusi tercepat:** Ganti DNS + Flush DNS + Restart browser
2. **Jika di kantor:** Kemungkinan besar network policy, hubungi IT
3. **Jika di rumah:** Kemungkinan besar DNS atau firewall
4. **Gunakan diagnostic tool** untuk identifikasi masalah

## ✅ Verifikasi Berhasil

Setelah menerapkan solusi:

1. Buka diagnostic tool
2. Pastikan semua test **SUCCESS** ✅
3. Coba login dengan username/password yang benar
4. Tidak ada error di console browser (F12)

---

**Butuh bantuan lebih lanjut?**

Hubungi administrator sistem dengan informasi:
- Screenshot error
- Hasil diagnostic tool
- Solusi yang sudah dicoba

**Dokumentasi lengkap:** `TROUBLESHOOTING_LOGIN_CONNECTION.md`
