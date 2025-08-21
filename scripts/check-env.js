#!/usr/bin/env node

/**
 * Startup verification script for AnnMitra
 * This script checks if all required environment variables are set
 * and provides helpful guidance for setup.
 */

const requiredEnvVars = [
  'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY',
  'CLERK_SECRET_KEY',
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'NEXT_PUBLIC_FIREBASE_VAPID_KEY',
  'FIREBASE_PROJECT_ID',
  'FIREBASE_CLIENT_EMAIL',
  'FIREBASE_PRIVATE_KEY_ID',
  'FIREBASE_PRIVATE_KEY'
];

const optionalEnvVars = [
  'NEXT_PUBLIC_CLERK_SIGN_IN_URL',
  'NEXT_PUBLIC_CLERK_SIGN_UP_URL',
  'NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL',
  'NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL'
];

console.log('🚀 AnnMitra Environment Check\n');

let allRequiredSet = true;
const missingVars = [];

// Check required variables
console.log('📋 Required Environment Variables:');
requiredEnvVars.forEach(varName => {
  const value = process.env[varName];
  if (value) {
    console.log(`  ✅ ${varName}`);
  } else {
    console.log(`  ❌ ${varName} - MISSING`);
    allRequiredSet = false;
    missingVars.push(varName);
  }
});

// Check optional variables
console.log('\n📋 Optional Environment Variables:');
optionalEnvVars.forEach(varName => {
  const value = process.env[varName];
  if (value) {
    console.log(`  ✅ ${varName}`);
  } else {
    console.log(`  ⚠️  ${varName} - using default`);
  }
});

console.log('\n' + '='.repeat(50));

if (allRequiredSet) {
  console.log('🎉 All required environment variables are set!');
  console.log('✅ AnnMitra is ready to run!');
  console.log('\nRun: npm run dev');
} else {
  console.log('❌ Missing required environment variables!');
  console.log('\n📝 Next steps:');
  console.log('1. Copy .env.example to .env.local');
  console.log('2. Fill in the missing variables:');
  missingVars.forEach(varName => {
    console.log(`   - ${varName}`);
  });
  console.log('\n📚 Check README.md for setup instructions');
  process.exit(1);
}
