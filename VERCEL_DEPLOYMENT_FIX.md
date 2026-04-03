# Perbaikan Error 503 di Vercel - Panduan Deployment

## Masalah yang Ditemukan

Error 503 pada `/api/config` menyebabkan:
- ❌ Supabase initialization failed
- ❌ Auth state manager tidak bisa initialize  
- ❌ Semua API calls gagal
- ❌ User tidak bisa login

## Root Cause

Endpoint `/api/config` mengembalikan 503 karena:
1. Environment variables tidak tersedia di Vercel
2. Route gagal di-load di serverless environment

## Solusi yang Diterapkan

### 1. Perbaikan Route Loading (server.js)
- `/api/config` di-load dengan prioritas tertinggi
- Fallback inline route jika file gagal di-load
- Error handling yang lebih robust

### 2. Enhanced Logging (api/index.js)
- Log setiap request untuk debugging
- Log environment variables check
- Log error dengan detail lengkap

### 3. Test Endpoint (api/test-env.js)
- Endpoint untuk verifikasi environment variables
- Akses: `https://your-app.vercel.app/api/test-env`

## Langkah Deployment

### Step 1: Set Environment Variables di Vercel

1. Buka Vercel Dashboard: https://vercel.com/dashboard
2. Pilih project Anda
3. Klik "Settings" → "Environment Variables"
4. Tambahkan variables berikut:

```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
NODE_ENV=production
```

**PENTING:** 
- Pastikan SUPABASE_URL dan SUPABASE_ANON_KEY sudah di-set
- Pilih environment: Production, Preview, Development (centang semua)
- Klik "Save"

### Step 2: Redeploy Aplikasi

```bash
# Commit perubahan
git add .
git commit -m "fix: perbaiki error 503 pada /api/config di Vercel"
git push origin main
```

Atau deploy manual:
```bash
vercel --prod
```

### Step 3: Verifikasi Deployment

1. **Test Environment Variables:**
   ```
   https://your-app.vercel.app/api/test-env
   ```
   
   Response yang benar:
   ```json
   {
     "status": "ok",
     "environment": {
       "hasSupabaseUrl": true,
       "hasSupabaseKey": true,
       "nodeEnv": "production",
       "isVercel": true
     },
     "message": "Environment variables configured correctly"
   }
   ```

2. **Test Config Endpoint:**
   ```
   https://your-app.vercel.app/api/config
   ```
   
   Response yang benar:
   ```json
   {
     "supabaseUrl": "https://your-project.supabase.co",
     "supabaseAnonKey": "eyJ...",
     "apiBaseUrl": "https://your-app.vercel.app"
   }
   ```

3. **Test Login:**
   - Buka aplikasi: `https://your-app.vercel.app`
   - Coba login dengan credentials yang valid
   - Seharusnya berhasil tanpa error 503

### Step 4: Monitor Logs

Buka Vercel Dashboard → Project → Deployments → Latest → View Function Logs

Cari log berikut:
```
✅ [Vercel] Express app loaded successfully
✅ CRITICAL: /api/config route loaded successfully
✅ [Config] Returning config successfully
```

## Troubleshooting

### Jika masih error 503:

1. **Check Environment Variables:**
   - Pastikan SUPABASE_URL dan SUPABASE_ANON_KEY sudah di-set
   - Pastikan tidak ada typo di nama variable
   - Pastikan value tidak ada spasi di awal/akhir

2. **Check Function Logs:**
   - Buka Vercel Dashboard → Function Logs
   - Cari error message
   - Perhatikan log `[Vercel] Environment check`

3. **Redeploy dari Scratch:**
   ```bash
   # Hapus deployment lama
   vercel remove your-project-name --yes
   
   # Deploy ulang
   vercel --prod
   ```

4. **Check Vercel Configuration:**
   - Pastikan `vercel.json` sudah ter-commit
   - Pastikan tidak ada file `.vercelignore` yang block files penting

## Perubahan File

File yang diubah:
- ✅ `routes/config.js` - Enhanced logging
- ✅ `server.js` - Priority loading untuk /api/config
- ✅ `api/index.js` - Enhanced error handling & logging
- ✅ `vercel.json` - Tambah test-env endpoint
- ✅ `api/test-env.js` - NEW: Test endpoint

## Hasil yang Diharapkan

Setelah deployment berhasil:
- ✅ `/api/config` mengembalikan 200 OK
- ✅ Supabase client initialize dengan sukses
- ✅ Auth state manager berfungsi normal
- ✅ User bisa login tanpa error
- ✅ Semua API calls berfungsi normal

## Kontak Support

Jika masih ada masalah setelah mengikuti panduan ini:
1. Screenshot error dari browser console
2. Screenshot Function Logs dari Vercel
3. Screenshot Environment Variables settings
4. Hubungi tim development
