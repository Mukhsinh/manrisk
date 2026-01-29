/**
 * Test Supabase Connection
 * Verifies that Supabase URL is valid and accessible
 */

require('dotenv').config();
const https = require('https');
const { URL } = require('url');

async function testSupabaseConnection() {
    console.log('🔍 Testing Supabase Connection...\n');
    
    // 1. Check environment variables
    console.log('1. Checking environment variables...');
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
    
    if (!supabaseUrl) {
        console.error('❌ SUPABASE_URL not found in .env file');
        return false;
    }
    
    if (!supabaseAnonKey) {
        console.error('❌ SUPABASE_ANON_KEY not found in .env file');
        return false;
    }
    
    console.log('✅ Environment variables found');
    console.log(`   SUPABASE_URL: ${supabaseUrl}`);
    console.log(`   SUPABASE_ANON_KEY: ${supabaseAnonKey.substring(0, 20)}...`);
    
    // 2. Validate URL format
    console.log('\n2. Validating URL format...');
    try {
        const url = new URL(supabaseUrl);
        console.log('✅ URL format is valid');
        console.log(`   Protocol: ${url.protocol}`);
        console.log(`   Hostname: ${url.hostname}`);
        console.log(`   Port: ${url.port || 'default'}`);
        
        if (!url.protocol.startsWith('http')) {
            console.error('❌ URL must use HTTP or HTTPS protocol');
            return false;
        }
        
        if (!url.hostname) {
            console.error('❌ URL must have a valid hostname');
            return false;
        }
    } catch (error) {
        console.error('❌ Invalid URL format:', error.message);
        return false;
    }
    
    // 3. Test DNS resolution
    console.log('\n3. Testing DNS resolution...');
    const dns = require('dns').promises;
    try {
        const url = new URL(supabaseUrl);
        const addresses = await dns.resolve4(url.hostname);
        console.log('✅ DNS resolution successful');
        console.log(`   Resolved to: ${addresses.join(', ')}`);
    } catch (error) {
        console.error('❌ DNS resolution failed:', error.message);
        console.error('   This is likely the cause of ERR_NAME_NOT_RESOLVED error');
        console.error('   Possible solutions:');
        console.error('   - Check your internet connection');
        console.error('   - Check your DNS settings (try 8.8.8.8 or 1.1.1.1)');
        console.error('   - Check if the hostname is correct');
        console.error('   - Check firewall or proxy settings');
        return false;
    }
    
    // 4. Test HTTPS connection
    console.log('\n4. Testing HTTPS connection...');
    try {
        const url = new URL(supabaseUrl);
        const result = await new Promise((resolve, reject) => {
            const options = {
                hostname: url.hostname,
                port: url.port || 443,
                path: '/rest/v1/',
                method: 'GET',
                headers: {
                    'apikey': supabaseAnonKey,
                    'Authorization': `Bearer ${supabaseAnonKey}`
                },
                timeout: 10000
            };
            
            const req = https.request(options, (res) => {
                console.log(`   Status: ${res.statusCode} ${res.statusMessage}`);
                
                let data = '';
                res.on('data', (chunk) => {
                    data += chunk;
                });
                
                res.on('end', () => {
                    if (res.statusCode === 200 || res.statusCode === 401 || res.statusCode === 404) {
                        // 200 = OK, 401 = Unauthorized (but server is reachable), 404 = Not Found (but server is reachable)
                        resolve(true);
                    } else {
                        resolve(false);
                    }
                });
            });
            
            req.on('error', (error) => {
                reject(error);
            });
            
            req.on('timeout', () => {
                req.destroy();
                reject(new Error('Connection timeout'));
            });
            
            req.end();
        });
        
        if (result) {
            console.log('✅ HTTPS connection successful');
            console.log('   Supabase server is reachable');
        } else {
            console.error('❌ HTTPS connection failed');
            console.error('   Server returned unexpected status code');
        }
        
        return result;
    } catch (error) {
        console.error('❌ HTTPS connection failed:', error.message);
        console.error('   Possible causes:');
        console.error('   - Firewall blocking connection');
        console.error('   - Proxy configuration issue');
        console.error('   - SSL/TLS certificate issue');
        console.error('   - Server is down or unreachable');
        return false;
    }
}

// Run test
testSupabaseConnection()
    .then((success) => {
        console.log('\n' + '='.repeat(60));
        if (success) {
            console.log('✅ ALL TESTS PASSED');
            console.log('   Supabase connection is working correctly');
            process.exit(0);
        } else {
            console.log('❌ TESTS FAILED');
            console.log('   Please fix the issues above before trying to login');
            process.exit(1);
        }
    })
    .catch((error) => {
        console.error('\n❌ Test error:', error);
        process.exit(1);
    });
