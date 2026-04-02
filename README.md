# Aplikasi Manajemen Risiko Terpadu

Aplikasi web untuk manajemen risiko berbasis Supabase dengan fitur lengkap untuk analisis risiko, perencanaan strategis, dan monitoring evaluasi.

## Fitur Utama

- 🔐 Autentikasi & Multi-tenant
- 📊 Dashboard & Risk Profile
- 📈 Analisis SWOT & Diagram Kartesius
- 🎯 Rencana Strategis & Sasaran Strategi
- 📉 Monitoring & Evaluasi
- 📋 Risk Register & KRI
- 📄 Export ke Excel/PDF
- 🤖 AI Assistant

## Tech Stack

- **Backend**: Node.js + Express
- **Database**: Supabase (PostgreSQL)
- **Frontend**: Vanilla JavaScript
- **Deployment**: Vercel (Serverless)

## Quick Start

### Prerequisites

- Node.js >= 18.x
- Supabase Account
- Vercel Account (untuk deployment)

### Installation

```bash
# Clone repository
git clone <repository-url>
cd manajemen-resiko-project

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env
# Edit .env dengan credentials Supabase Anda
```

### Development

```bash
# Run development server
npm run dev

# Run dengan auto port detection
npm run dev:auto

# Run tests
npm test
```

Server akan berjalan di `http://localhost:3001`

## Deployment ke Vercel

Lihat [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) untuk panduan lengkap deployment.

### Quick Deploy

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod
```

## Environment Variables

```env
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
NODE_ENV=development
PORT=3001
ALLOWED_ORIGINS=http://localhost:3001
```

## Project Structure

```
/
├── api/                  # Vercel serverless functions
├── config/              # Configuration files
├── middleware/          # Express middleware
├── routes/              # API routes
├── utils/               # Utility functions
├── public/              # Static files
│   ├── css/            # Stylesheets
│   ├── js/             # JavaScript files
│   └── index.html      # Main SPA entry
├── server.js           # Express app
├── vercel.json         # Vercel configuration
└── package.json        # Dependencies
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login
- `POST /api/auth/register` - Register
- `POST /api/auth/logout` - Logout

### Risk Management
- `GET /api/risks` - Get all risks
- `POST /api/risks` - Create risk
- `PUT /api/risks/:id` - Update risk
- `DELETE /api/risks/:id` - Delete risk

### Reports
- `GET /api/risk-profile` - Risk profile data
- `GET /api/risk-profile/export` - Export risk profile
- `GET /api/reports/residual-risk` - Residual risk reports

Lihat dokumentasi lengkap di [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md)

## Testing

```bash
# Run all tests
npm test

# Run specific test suite
npm run test:unit
npm run test:property
npm run test:integration

# Run with coverage
npm run test:coverage
```

## Contributing

1. Fork repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## License

ISC License

## Support

Untuk pertanyaan dan dukungan, silakan buka issue di repository ini.
