# Solusi Error DNS Login - ERR_NAME_NOT_RESOLVED

## 🔴 Masalah
```
POST https://cdivlsbtjuufqbzelbbj.supabase.co/auth/v1/token?grant_type=password 
net::ERR_NAME_NOT_RESOLVED
```

Error ini terjadi karena browser tidak dapat me-resolve domain Supabase.

## ✅ Solusi Lengkap

### Solusi 1: Ganti DNS ke Google DNS (RECOMMENDED)

#### Windows:
1. Buka **Control Panel** → **Network and Internet** → **Network and Sharing Center**
2. Klik **Change adapter settings**
3. Klik kanan pada koneksi internet Anda → **Properties**
4. Pilih **Internet Protocol Version 4 (TCP/IPv4)** → **Properties**
5. Pilih **Use the following DNS server addresses:**
   - Preferred DNS server: `8.8.8.8`
   - Alternate DNS server: `8.8.4.4`
6. Klik **OK** dan restart browser

#### Atau gunakan Command Prompt (Run as Administrator):
```cmd
netsh interface ip set dns "Wi-Fi" static 8.8.8.8
netsh interface ip add dns "Wi-Fi" 8.8.4.4 index=2
ipconfig /flushdns
```

### Solusi 2: Flush DNS Cache

```cmd
ipconfig /flushdns
ipconfig /registerdns
ipconfig /release
ipconfig /renew
```

### Solusi 3: Reset Winsock

```cmd
netsh winsock reset
netsh int ip reset
```

Setelah itu restart komputer.

### Solusi 4: Matikan Firewall/Antivirus Sementara

1. Matikan Windows Firewall sementara
2. Matikan antivirus (Avast, AVG, Kaspersky, dll) sementara
3. Coba login lagi
4. Jika berhasil, tambahkan exception untuk domain `*.supabase.co`

### Solusi 5: Cek File Hosts

1. Buka Notepad sebagai Administrator
2. Buka file: `C:\Windows\System32\drivers\etc\hosts`
3. Pastikan tidak ada baris yang memblokir `supabase.co`
4. Jika ada, hapus atau comment dengan `#`

### Solusi 6: Gunakan VPN

Jika DNS ISP Anda bermasalah, gunakan VPN seperti:
- Cloudflare WARP (gratis)
- ProtonVPN (gratis)
- Psiphon (gratis)

### Solusi 7: Test Koneksi

Buka Command Prompt dan test:

```cmd
ping cdivlsbtjuufqbzelbbj.supabase.co
nslookup cdivlsbtjuufqbzelbbj.supabase.co
```

Jika gagal, berarti DNS Anda tidak bisa resolve domain Supabase.

## 🔧 Verifikasi Setelah Perbaikan

1. Buka browser baru (Incognito/Private mode)
2. Clear browser cache: `Ctrl + Shift + Delete`
3. Akses aplikasi: `http://localhost:3002`
4. Coba login dengan:
   - Email: `mukhsin0@gmail.com`
   - Password: (password Anda)

## 📝 Catatan Penting

- Error `ERR_NAME_NOT_RESOLVED` adalah masalah DNS, bukan masalah aplikasi
- Supabase URL sudah benar: `https://cdivlsbtjuufqbzelbbj.supabase.co`
- Aplikasi sudah dikonfigurasi dengan benar
- Masalah ada di level network/DNS komputer Anda

## 🎯 Solusi Tercepat

**Gunakan Google DNS (8.8.8.8 dan 8.8.4.4) - ini solusi paling efektif!**

Setelah ganti DNS:
1. Flush DNS cache
2. Restart browser
3. Clear browser cache
4. Coba login lagi

## ❓ Jika Masih Gagal

Hubungi administrator jaringan Anda atau ISP, kemungkinan:
- ISP memblokir domain Supabase
- Firewall perusahaan memblokir akses
- Proxy server bermasalah
