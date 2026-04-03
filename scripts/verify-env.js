#!/usr/bin/env node

/**
 * Script untuk verifikasi environment variables sebelum deployment
 * Jalankan: node scripts/verify-env.js
 */

require('dotenv').config();

console.log('🔍 Verifying Environment Variables...\n');

const requiredVars = [
  'SUPABASE_URL',
  'SUPABASE_ANON_KEY'
];

const optionalVars = [
  'NODE_ENV',
  'PORT',
  'API_BASE_URL'
];

let hasErrors = false;

// Check required variables
console.log('📋 Required Variables:');
requiredVars.forEach(varName => {
  const value = process.env[varName];
  if (!value) {
    console.log(`  ❌ ${varName}: MISSING`);
    hasErrors = true;
  } else {
    // Mask sensitive values
    const maskedValue = varName.includes('KEY') || varName.includes('SECRET')
      ? value.substring(0, 10) + '...' + value.substring(value.length - 4)
      : value;
    console.log(`  ✅ ${varName}: ${maskedValue}`);
  }
});

// Check optional variables
console.log('\n📋 Optional Variables:');
optionalVars.forEach(varName => {
  const value = process.env[varName];
  if (!value) {
    console.log(`  ⚠️  ${varName}: Not set (using default)`);
  } else {
    console.log(`  ✅ ${varName}: ${value}`);
  }
});

// Validate Supabase URL format
if (process.env.SUPABASE_URL) {
  console.log('\n🔍 Validating Supabase URL...');
  try {
    const url = new URL(process.env.SUPABASE_URL);
    if (!url.hostname || !url.protocol.startsWith('http')) {
      console.log('  ❌ Invalid URL format');
      hasErrors = true;
    } else {
      console.log(`  ✅ Valid URL: ${url.hostname}`);
    }
  } catch (error) {
    console.log(`  ❌ Invalid URL: ${error.message}`);
    hasErrors = true;
  }
}

// Summary
console.log('\n' + '='.repeat(50));
if (hasErrors) {
  console.log('❌ Environment verification FAILED');
  console.log('\nPlease fix the errors above before deploying.');
  console.log('\nFor Vercel deployment:');
  console.log('1. Go to Vercel Dashboard → Settings → Environment Variables');
  console.log('2. Add missing variables');
  console.log('3. Redeploy the application');
  process.exit(1);
} else {
  console.log('✅ Environment verification PASSED');
  console.log('\nYour environment is ready for deployment!');
  process.exit(0);
}
