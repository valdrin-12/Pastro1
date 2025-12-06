#!/usr/bin/env node

/**
 * OAuth Configuration Checker
 * Kontrollon nëse OAuth credentials janë të konfiguruara
 */

const fs = require('fs');
const path = require('path');

function checkEnvFile() {
  const envPath = path.join(__dirname, '.env');
  
  if (!fs.existsSync(envPath)) {
    console.log('❌ .env file nuk ekziston!');
    return false;
  }
  
  const envContent = fs.readFileSync(envPath, 'utf8');
  const config = {
    google: {
      clientId: envContent.match(/GOOGLE_CLIENT_ID="([^"]+)"/)?.[1],
      clientSecret: envContent.match(/GOOGLE_CLIENT_SECRET="([^"]+)"/)?.[1]
    },
    facebook: {
      clientId: envContent.match(/FACEBOOK_CLIENT_ID="([^"]+)"/)?.[1],
      clientSecret: envContent.match(/FACEBOOK_CLIENT_SECRET="([^"]+)"/)?.[1]
    },
    apple: {
      clientId: envContent.match(/APPLE_CLIENT_ID="([^"]+)"/)?.[1],
      clientSecret: envContent.match(/APPLE_CLIENT_SECRET="([^"]+)"/)?.[1]
    },
    nextauth: {
      url: envContent.match(/NEXTAUTH_URL="([^"]+)"/)?.[1],
      secret: envContent.match(/NEXTAUTH_SECRET="([^"]+)"/)?.[1]
    }
  };
  
  console.log('\n📋 OAuth Configuration Status:');
  console.log('================================\n');
  
  // Check NextAuth
  console.log('🔐 NextAuth:');
  console.log(`   URL: ${config.nextauth.url || '❌ Nuk është konfiguruar'}`);
  console.log(`   Secret: ${config.nextauth.secret ? '✅ Konfiguruar' : '❌ Nuk është konfiguruar'}`);
  console.log('');
  
  // Check Google
  console.log('🔵 Google OAuth:');
  const googleConfigured = config.google.clientId && 
                          config.google.clientSecret && 
                          !config.google.clientId.includes('your-') &&
                          !config.google.clientSecret.includes('your-');
  console.log(`   Client ID: ${googleConfigured ? '✅' : '❌'} ${googleConfigured ? 'Konfiguruar' : 'Nuk është konfiguruar'}`);
  console.log(`   Client Secret: ${googleConfigured ? '✅' : '❌'} ${googleConfigured ? 'Konfiguruar' : 'Nuk është konfiguruar'}`);
  console.log('');
  
  // Check Facebook
  console.log('🔵 Facebook OAuth:');
  const facebookConfigured = config.facebook.clientId && 
                             config.facebook.clientSecret && 
                             !config.facebook.clientId.includes('your-') &&
                             !config.facebook.clientSecret.includes('your-');
  console.log(`   App ID: ${facebookConfigured ? '✅' : '❌'} ${facebookConfigured ? 'Konfiguruar' : 'Nuk është konfiguruar'}`);
  console.log(`   App Secret: ${facebookConfigured ? '✅' : '❌'} ${facebookConfigured ? 'Konfiguruar' : 'Nuk është konfiguruar'}`);
  console.log('');
  
  // Check Apple
  console.log('🔵 Apple OAuth:');
  const appleConfigured = config.apple.clientId && 
                          config.apple.clientSecret && 
                          !config.apple.clientId.includes('your-') &&
                          !config.apple.clientSecret.includes('your-');
  console.log(`   Client ID: ${appleConfigured ? '✅' : '❌'} ${appleConfigured ? 'Konfiguruar' : 'Nuk është konfiguruar'}`);
  console.log(`   Client Secret: ${appleConfigured ? '✅' : '❌'} ${appleConfigured ? 'Konfiguruar' : 'Nuk është konfiguruar'}`);
  console.log('');
  
  // Summary
  const allConfigured = googleConfigured && facebookConfigured && appleConfigured;
  const anyConfigured = googleConfigured || facebookConfigured || appleConfigured;
  
  if (allConfigured) {
    console.log('✅ Të gjitha OAuth providers janë konfiguruar!');
  } else if (anyConfigured) {
    console.log('⚠️  Disa OAuth providers janë konfiguruar, por jo të gjithë.');
    console.log('   Përdorni: node setup-oauth.js për të konfiguruar të tjerat.');
  } else {
    console.log('❌ Asnjë OAuth provider nuk është konfiguruar.');
    console.log('   Përdorni: node setup-oauth.js për të filluar konfigurimin.');
  }
  console.log('');
  
  return { googleConfigured, facebookConfigured, appleConfigured };
}

checkEnvFile();

