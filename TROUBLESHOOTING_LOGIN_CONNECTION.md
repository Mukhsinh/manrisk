# 🔧 Troubleshooting: Login Gagal - "Koneksi Internet Bermasalah"

## 📋 Deskripsi Masalah

Saat login, muncul notifikasi **"Koneksi internet bermasalah"** padahal koneksi internet lancar.

Di console browser muncul error:
```
Failed to load resource: net::ERR_NAME_NOT_RESOLVED
TypeError: Failed to fetch
```

## 🔍 Root Cause Analysis

Error `ERR_NAME_NOT_RESOLVED` dan `Failed to fetch` menunjukkan bahwa:

1. **DNS tidak dapat resolve domain Supabase** (`cdivlsbtjuufqbzelbbj.supabase.co`)
2. **Firewall atau antivirus memblokir akses** ke domain Supabase
3. **Proxy settings bermasalah**
4. **ISP memblokir akses** ke Supabase (jarang terjadi)

**BUKAN masalah koneksi internet**, karena internet lancar tapi domain Supabase tidak dapat diakses.

## 🛠️ Solusi

### 1️⃣ Jalankan Diagnostic Tool

Buka file diagnostic untuk mengidentifikasi masalah:
```
http://localhost:3001/test-supabase-connection.html
```

Tool ini akan mengecek:
- ✅ DNS Resolution
- ✅ Network Connectivity
- ✅ Supabase Client
- ✅ Auth Endpoint

### 2️⃣ Ganti DNS ke Google DNS atau Cloudflare DNS

**Windows:**

1. Buka **Control Panel** → **Network and Internet** → **Network Connections**
2. Klik kanan pada network adapter Anda → **Properties**
3. Pilih **Internet Protocol Version 4 (TCP/IPv4)** → **Properties**
4. Pilih **Use the following DNS server addresses:**
   - **Preferred DNS server:** `8.8.8.8` (Google DNS)
   - **Alternate DNS server:** `8.8.4.4` (Google DNS)
   
   Atau gunakan Cloudflare DNS:
   - **Preferred DNS server:** `1.1.1.1`
   - **Alternate DNS server:** `1.0.0.1`

5. Klik **OK** dan restart browser

**macOS:**

1. Buka **System Preferences** → **Network**
2. Pilih network connection → **Advanced** → **DNS**
3. Klik **+** dan tambahkan:
   - `8.8.8.8`
   - `8.8.4.4`
4. Klik **OK** dan **Apply**

**Linux:**

Edit `/etc/resolv.conf`:
```bash
sudo nano /etc/resolv.conf
```

Tambahkan:
```
nameserver 8.8.8.8
nameserver 8.8.4.4
```

### 3️⃣ Flush DNS Cache

**Windows:**

Buka Command Prompt (CMD) as Administrator:
```cmd
ipconfig /flushdns
ipconfig /registerdns
ipconfig /release
ipconfig /renew
```

**macOS:**
```bash
sudo dscacheutil -flushcache
sudo killall -HUP mDNSResponder
```

**Linux:**
```bash
sudo systemd-resolve --flush-caches
```

### 4️⃣ Matikan Firewall/Antivirus Sementara

**Windows Defender Firewall:**

1. Buka **Windows Security** → **Firewall & network protection**
2. Klik **Domain network**, **Private network**, atau **Public network**
3. Matikan **Microsoft Defender Firewall** (sementara untuk testing)
4. Coba login lagi
5. Jika berhasil, tambahkan exception untuk domain `*.supabase.co`

**Antivirus (Kaspersky, Avast, dll):**

1. Buka antivirus Anda
2. Cari menu **Settings** atau **Protection**
3. Matikan **Web Protection** atau **Network Protection** sementara
4. Coba login lagi
5. Jika berhasil, tambahkan `*.supabase.co` ke whitelist

### 5️⃣ Cek Proxy Settings

**Windows:**

1. Buka **Settings** → **Network & Internet** → **Proxy**
2. Pastikan **Automatically detect settings** ON
3. Matikan **Use a proxy server** jika tidak digunakan
4. Restart browser

**Browser (Chrome/Edge):**

1. Buka **Settings** → **System** → **Open your computer's proxy settings**
2. Ikuti langkah di atas

### 6️⃣ Restart Network Adapter

**Windows:**

1. Buka **Control Panel** → **Network and Internet** → **Network Connections**
2. Klik kanan pada network adapter → **Disable**
3. Tunggu 5 detik
4. Klik kanan lagi → **Enable**
5. Restart browser

### 7️⃣ Clear Browser Cache

**Chrome/Edge:**

1. Tekan `Ctrl + Shift + Delete`
2. Pilih **All time**
3. Centang:
   - ✅ Cookies and other site data
   - ✅ Cached images and files
4. Klik **Clear data**
5. Restart browser

### 8️⃣ Coba Browser Lain

Jika masalah hanya terjadi di satu browser:

1. Coba buka aplikasi di browser lain (Chrome, Firefox, Edge)
2. Jika berhasil, masalahnya ada di browser yang bermasalah
3. Clear cache atau reset browser settings

### 9️⃣ Cek dengan Command Line

**Windows (CMD):**

Test DNS resolution:
```cmd
nslookup cdivlsbtjuufqbzelbbj.supabase.co
```

Test ping:
```cmd
ping cdivlsbtjuufqbzelbbj.supabase.co
```

Test dengan curl (jika tersedia):
```cmd
curl -I https://cdivlsbtjuufqbzelbbj.supabase.co/rest/v1/
```

**Hasil yang diharapkan:**
- `nslookup` harus mengembalikan IP address
- `ping` harus mendapat reply (atau timeout jika ICMP diblokir, tapi bukan "could not find host")
- `curl` harus mengembalikan HTTP response

### 🔟 Hubungi Administrator Sistem

Jika semua solusi di atas tidak berhasil:

1. **Kemungkinan ISP memblokir Supabase**
   - Hubungi ISP Anda
   - Gunakan VPN sebagai workaround

2. **Kemungkinan network policy perusahaan**
   - Hubungi IT department
   - Minta whitelist domain `*.supabase.co`

3. **Kemungkinan Supabase down**
   - Cek status: https://status.supabase.com/
   - Tunggu hingga service kembali normal

## 📊 Diagnostic Checklist

Gunakan checklist ini untuk troubleshooting:

- [ ] Jalankan diagnostic tool (`/test-supabase-connection.html`)
- [ ] Ganti DNS ke Google DNS (8.8.8.8)
- [ ] Flush DNS cache
- [ ] Matikan firewall/antivirus sementara
- [ ] Cek proxy settings
- [ ] Restart network adapter
- [ ] Clear browser cache
- [ ] Coba browser lain
- [ ] Test dengan command line (nslookup, ping, curl)
- [ ] Hubungi administrator sistem

## 🎯 Quick Fix (Paling Sering Berhasil)

**Solusi tercepat yang paling sering berhasil:**

1. **Ganti DNS ke Google DNS** (8.8.8.8 dan 8.8.4.4)
2. **Flush DNS cache** (`ipconfig /flushdns`)
3. **Restart browser**

Jika masih gagal:

4. **Matikan firewall/antivirus sementara**
5. **Coba lagi**

## 📝 Catatan Teknis

### Error yang Terjadi

```javascript
// Di supabase.js:20
TypeError: Failed to fetch
at supabase.js:20:2872

// Di app.js:1162
❌ Login error: Error: Koneksi internet bermasalah.
at HTMLFormElement.handleLogin (app.js:1034:23)
```

### Penyebab

Error `Failed to fetch` terjadi saat browser tidak dapat melakukan HTTP request ke URL Supabase karena:

1. DNS tidak dapat resolve domain → `ERR_NAME_NOT_RESOLVED`
2. Firewall memblokir request
3. Proxy bermasalah
4. Network adapter bermasalah

### Perbaikan yang Dilakukan

File `public/js/app.js` sudah diperbaiki untuk memberikan pesan error yang lebih informatif:

```javascript
// Sebelum:
throw new Error('Koneksi internet bermasalah.');

// Sesudah:
throw new Error(
    'Tidak dapat terhubung ke server Supabase.\n\n' +
    'Kemungkinan penyebab:\n' +
    '• DNS tidak dapat resolve domain Supabase\n' +
    '• Firewall atau antivirus memblokir akses\n' +
    '• Koneksi internet bermasalah\n\n' +
    'Solusi:\n' +
    '1. Coba gunakan DNS Google (8.8.8.8)\n' +
    '2. Matikan sementara firewall/antivirus\n' +
    '3. Hubungi administrator sistem'
);
```

## 🔗 Resources

- **Google DNS:** https://developers.google.com/speed/public-dns
- **Cloudflare DNS:** https://1.1.1.1/
- **Supabase Status:** https://status.supabase.com/
- **Diagnostic Tool:** http://localhost:3001/test-supabase-connection.html

## ✅ Verification

Setelah menerapkan solusi, verifikasi dengan:

1. Buka diagnostic tool dan pastikan semua test SUCCESS ✅
2. Coba login dengan kredensial yang valid
3. Pastikan tidak ada error di console browser

---

**Dibuat:** 29 Januari 2026  
**Status:** ✅ COMPLETE  
**Perbaikan:** Error handling improved, diagnostic tool created
