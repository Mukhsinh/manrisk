// Test koneksi login dan Supabase
require('dotenv').config();
const https = require('https');
const dns = require('dns').promises;

async function testSupabaseConnection() {
    console.log('='.repeat(60));
    console.log('TEST KONEKSI SUPABASE');
    console.log('='.repeat(60));
    
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
    
    console.log('\n1. Memeriksa Environment Variables:');
    console.log('   SUPABASE_URL:', supabaseUrl ? '✅ Ada' : '❌ Tidak ada');
    console.log('   SUPABASE_ANON_KEY:', supabaseAnonKey ? '✅ Ada' : '❌ Tidak ada');
    
    if (!supabaseUrl || !supabaseAnonKey) {
        console.error('\n❌ ERROR: Environment variables tidak lengkap!');
        console.log('\nSolusi:');
        console.log('1. Pastikan file .env ada di root folder');
        console.log('2. Pastikan isi .env memiliki SUPABASE_URL dan SUPABASE_ANON_KEY');
        return;
    }
    
    // Parse URL
    let hostname, protocol;
    try {
        const url = new URL(supabaseUrl);
        hostname = url.hostname;
        protocol = url.protocol;
        console.log('\n2. URL Supabase:');
        console.log('   Protocol:', protocol);
        console.log('   Hostname:', hostname);
    } catch (error) {
        console.error('\n❌ ERROR: URL Supabase tidak valid!');
        console.error('   URL:', supabaseUrl);
        console.error('   Error:', error.message);
        return;
    }
    
    // Test DNS Resolution
    console.log('\n3. Test DNS Resolution:');
    try {
        const addresses = await dns.resolve4(hostname);
        console.log('   ✅ DNS berhasil resolve');
        console.log('   IP Addresses:', addresses.join(', '));
    } catch (error) {
        console.error('   ❌ DNS gagal resolve!');
        console.error('   Error:', error.message);
        console.log('\n   Solusi:');
        console.log('   1. Periksa koneksi internet Anda');
        console.log('   2. Coba ganti DNS ke Google DNS (8.8.8.8, 8.8.4.4)');
        console.log('   3. Matikan VPN jika ada');
        console.log('   4. Restart router/modem');
        return;
    }
    
    // Test HTTPS Connection
    console.log('\n4. Test HTTPS Connection:');
    return new Promise((resolve) => {
        const options = {
            hostname: hostname,
            port: 443,
            path: '/auth/v1/health',
            method: 'GET',
            headers: {
                'apikey': supabaseAnonKey
            },
            timeout: 10000
        };
        
        const req = https.request(options, (res) => {
            console.log('   ✅ Koneksi HTTPS berhasil');
            console.log('   Status Code:', res.statusCode);
            
            let data = '';
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', () => {
                console.log('   Response:', data);
                console.log('\n' + '='.repeat(60));
                console.log('✅ SEMUA TEST BERHASIL!');
                console.log('Supabase dapat diakses dengan baik.');
                console.log('='.repeat(60));
                resolve();
            });
        });
        
        req.on('error', (error) => {
            console.error('   ❌ Koneksi HTTPS gagal!');
            console.error('   Error:', error.message);
            console.log('\n   Kemungkinan penyebab:');
            console.log('   1. Firewall memblokir koneksi');
            console.log('   2. Antivirus memblokir koneksi');
            console.log('   3. Proxy/VPN bermasalah');
            console.log('   4. Koneksi internet tidak stabil');
            console.log('\n   Solusi:');
            console.log('   1. Matikan firewall sementara untuk test');
            console.log('   2. Tambahkan exception untuk Node.js di antivirus');
            console.log('   3. Matikan VPN/Proxy');
            console.log('   4. Coba koneksi internet lain');
            resolve();
        });
        
        req.on('timeout', () => {
            console.error('   ❌ Koneksi timeout!');
            console.log('   Server tidak merespons dalam 10 detik');
            req.destroy();
            resolve();
        });
        
        req.end();
    });
}

// Run test
testSupabaseConnection().catch(console.error);
