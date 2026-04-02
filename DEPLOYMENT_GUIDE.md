# Panduan Deployment ke Vercel

## Persiapan

### 1. Environment Variables
Pastikan environment variables berikut sudah diset di Vercel Dashboard:

```
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
NODE_ENV=production
ALLOWED_ORIGINS=https://your-domain.vercel.app
```

### 2. Install Vercel CLI (Opsional)
```bash
npm install -g vercel
```

## Deployment

### Metode 1: Deploy via Vercel Dashboard (Recommended)

1. Login ke [Vercel Dashboard](https://vercel.com)
2. Klik "Add New Project"
3. Import repository Git Anda
4. Vercel akan otomatis mendeteksi konfigurasi dari `vercel.json`
5. Tambahkan environment variables di Settings > Environment Variables
6. Klik "Deploy"

### Metode 2: Deploy via CLI

```bash
# Login ke Vercel
vercel login

# Deploy ke production
vercel --prod

# Atau deploy ke preview
vercel
```

## Konfigurasi yang Sudah Dioptimasi

### 1. Server Configuration
- ✅ Serverless function support
- ✅ Graceful shutdown handling
- ✅ Environment detection (Vercel/local)
- ✅ Error handling untuk production

### 2. Security Headers
- ✅ CSP (Content Security Policy)
- ✅ HSTS untuk HTTPS
- ✅ X-Frame-Options
- ✅ X-Content-Type-Options

### 3. Performance
- ✅ Body parser limit: 5MB
- ✅ Cache control untuk static files
- ✅ Optimized routing
- ✅ Lambda size: 50MB max

### 4. File Structure
```
/
├── api/
│   └── index.js          # Vercel serverless entry point
├── server.js             # Main Express app
├── vercel.json           # Vercel configuration
├── .vercelignore         # Files to exclude from deployment
└── .env.example          # Environment variables template
```

## Testing Sebelum Deploy

### Local Testing
```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Test dengan port auto-detect
npm run dev:auto
```

### Vercel Local Testing
```bash
# Install Vercel CLI
npm install -g vercel

# Run Vercel dev server
vercel dev
```

## Post-Deployment

### 1. Verifikasi Deployment
- Cek semua API endpoints berfungsi
- Test authentication flow
- Verifikasi database connection
- Test file upload/download

### 2. Monitor Logs
```bash
# Via CLI
vercel logs

# Via Dashboard
Vercel Dashboard > Your Project > Logs
```

### 3. Custom Domain (Opsional)
1. Buka Project Settings > Domains
2. Tambahkan custom domain
3. Update DNS records sesuai instruksi
4. Update ALLOWED_ORIGINS environment variable

## Troubleshooting

### Error: Missing Environment Variables
- Pastikan semua env vars sudah diset di Vercel Dashboard
- Redeploy setelah menambahkan env vars

### Error: Function Timeout
- Default timeout: 10 detik
- Untuk Pro plan, bisa dinaikkan hingga 60 detik
- Optimasi query database untuk response lebih cepat

### Error: Lambda Size Exceeded
- Cek `.vercelignore` untuk exclude file yang tidak perlu
- Hapus dependencies yang tidak digunakan
- Gunakan dynamic imports untuk large libraries

### Error: CORS Issues
- Update ALLOWED_ORIGINS di environment variables
- Pastikan domain Vercel sudah ditambahkan

## Rollback

Jika terjadi masalah setelah deployment:

```bash
# Via CLI - rollback ke deployment sebelumnya
vercel rollback

# Via Dashboard
Deployments > Previous Deployment > Promote to Production
```

## Best Practices

1. **Selalu test di local environment dulu**
2. **Gunakan preview deployments untuk testing**
3. **Monitor logs setelah deployment**
4. **Backup database sebelum major updates**
5. **Gunakan environment variables untuk sensitive data**
6. **Set up monitoring dan alerts**

## Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Vercel CLI Reference](https://vercel.com/docs/cli)
- [Supabase Documentation](https://supabase.com/docs)
