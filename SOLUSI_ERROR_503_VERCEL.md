# Solusi Error 503 di Vercel - Login Gagal

## Ringkasan Masalah

Dari console log yang Anda berikan, error utama adalah:

```
GET https://manrisk-1.vercel.app/api/config 503 (Service Unavailable)
❌ Supabase initialization failed: Error: Config fetch failed: 503
[AUTH] INIT - Supabase client not ready
Failed to initialize Supabase client. Please check configuration.
```

## Penyebab

**Environment variables (SUPABASE_URL dan SUPABASE_ANON_KEY) tidak terset di Vercel Dashboard**

Aplikasi berjalan normal di localhost karena menggunakan file `.env`, tetapi di Vercel environment variables harus di-set manual di dashboard.

## Solusi - Ikuti Langkah Ini

### Langkah 1: Set Environment Variables di Vercel

1. **Buka Vercel Dashboard**
   - Login ke https://vercel.com
   - Pilih project `manrisk-1`

2. **Masuk ke Settings**
   - Klik tab "Settings"
   - Klik "Environment Variables" di sidebar

3. **Tambahkan 3 Variables**

   **Variable 1:**
   ```
   Name: SUPABASE_URL
   Value: https://your-project-id.supabase.co
   ```

   **Variable 2:**
   ```
   Name: SUPABASE_ANON_KEY
   Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

   **Variable 3:**
   ```
   Name: SUPABASE_SERVICE_ROLE_KEY
   Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

4. **Pilih Environment**
   - ✅ Centang "Production"
   - ✅ Centang "Preview"
   - ✅ Centang "Development"

5. **Klik "Save"**

### Langkah 2: Cara Mendapatkan Nilai Supabase

1. **Buka Supabase Dashboard**
   - Login ke https://app.supabase.com
   - Pilih project Anda

2. **Buka Settings → API**
   - Klik icon ⚙️ Settings di sidebar
   - Klik "API" di menu

3. **Copy Values**
   - **Project URL** → Copy ke `SUPABASE_URL`
   - **anon public** key → Copy ke `SUPABASE_ANON_KEY`
   - **service_role** key → Copy ke `SUPABASE_SERVICE_ROLE_KEY`

### Langkah 3: Redeploy Aplikasi

Setelah environment variables ditambahkan:

**Opsi A: Redeploy dari Dashboard**
1. Klik tab "Deployments"
2. Klik titik tiga (...) pada deployment terakhir
3. Klik "Redeploy"
4. Tunggu hingga deployment selesai (biasanya 1-2 menit)

**Opsi B: Push Commit Baru**
```bash
git add .
git commit -m "fix: update environment variables"
git push
```

### Langkah 4: Verifikasi

Setelah deployment selesai, test dengan membuka:

**Test 1: Environment Check**
```
https://manrisk-1.vercel.app/api/test-simple
```

Harus menampilkan:
```json
{
  "status": "ok",
  "environment": {
    "hasSupabaseUrl": true,
    "hasSupabaseKey": true
  }
}
```

**Test 2: Config Endpoint**
```
https://manrisk-1.vercel.app/api/config
```

Harus menampilkan:
```json
{
  "supabaseUrl": "https://...",
  "supabaseAnonKey": "eyJ...",
  "apiBaseUrl": "https://manrisk-1.vercel.app"
}
```

**Test 3: Login**
1. Buka https://manrisk-1.vercel.app
2. Masukkan email dan password
3. Klik Login
4. Seharusnya berhasil masuk ke dashboard

## Troubleshooting

### Jika masih error 503 setelah set environment variables:

1. **Pastikan tidak ada typo**
   - Variable name harus PERSIS: `SUPABASE_URL` (bukan `SUPABASE_URI` atau lainnya)
   - Tidak ada spasi di awal/akhir value
   - URL tidak ada trailing slash (/)

2. **Check Vercel Logs**
   - Buka Vercel Dashboard → Deployments
   - Klik deployment terakhir
   - Klik "View Function Logs"
   - Cari error message

3. **Clear Cache dan Redeploy**
   ```bash
   vercel --prod --force
   ```

### Jika login masih gagal setelah config berhasil:

1. **Clear Browser Cache**
   - Tekan Ctrl+Shift+Delete
   - Clear cache dan cookies
   - Refresh halaman

2. **Check Supabase Auth Settings**
   - Buka Supabase Dashboard → Authentication → URL Configuration
   - Pastikan Site URL berisi: `https://manrisk-1.vercel.app`
   - Pastikan Redirect URLs berisi: `https://manrisk-1.vercel.app/**`

3. **Check Console Logs**
   - Buka browser DevTools (F12)
   - Lihat tab Console
   - Cari error message berwarna merah

## File yang Sudah Diperbaiki

Saya sudah memperbaiki file-file berikut untuk membantu debugging:

1. ✅ `routes/config.js` - Enhanced error logging
2. ✅ `api/test-simple.js` - Test endpoint untuk verifikasi environment
3. ✅ `public/js/vercel-debug-helper.js` - Auto-diagnostic tool

## Catatan Penting

- ⚠️ Environment variables di Vercel **TIDAK** otomatis sync dengan file `.env` lokal
- ⚠️ Setiap perubahan environment variables **HARUS** diikuti dengan redeploy
- ⚠️ Pastikan tidak ada spasi atau karakter tersembunyi di value
- ⚠️ Jangan share SUPABASE_SERVICE_ROLE_KEY ke publik (hanya untuk server)

## Kontak Support

Jika masih mengalami masalah setelah mengikuti langkah di atas:
1. Screenshot error message dari console
2. Screenshot environment variables di Vercel (blur sensitive values)
3. Screenshot Vercel function logs
