#!/usr/bin/env node

/**
 * OAuth Setup Wizard
 * Ky script ju ndihmon të konfiguroni OAuth providers për Pastro.com
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

function updateEnvFile(updates) {
  const envPath = path.join(__dirname, '.env');
  let envContent = '';
  
  // Read existing .env if it exists
  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, 'utf8');
  }
  
  // Update or add each variable
  updates.forEach(({ key, value }) => {
    const regex = new RegExp(`^${key}=.*$`, 'm');
    if (regex.test(envContent)) {
      envContent = envContent.replace(regex, `${key}="${value}"`);
    } else {
      envContent += `\n${key}="${value}"`;
    }
  });
  
  // Write back to file
  fs.writeFileSync(envPath, envContent);
  console.log('✅ .env file u përditësua me sukses!\n');
}

async function setupGoogle() {
  console.log('\n📘 Konfigurimi i Google OAuth:');
  console.log('─────────────────────────────────────');
  console.log('1. Shkoni te: https://console.cloud.google.com/');
  console.log('2. Krijoni OAuth 2.0 Client ID');
  console.log('3. Shtoni redirect URI: http://localhost:3000/api/auth/callback/google');
  console.log('─────────────────────────────────────\n');
  
  const clientId = await question('Shkruani Google Client ID: ');
  const clientSecret = await question('Shkruani Google Client Secret: ');
  
  if (clientId && clientSecret) {
    updateEnvFile([
      { key: 'GOOGLE_CLIENT_ID', value: clientId.trim() },
      { key: 'GOOGLE_CLIENT_SECRET', value: clientSecret.trim() }
    ]);
    return true;
  }
  return false;
}

async function setupFacebook() {
  console.log('\n📘 Konfigurimi i Facebook OAuth:');
  console.log('─────────────────────────────────────');
  console.log('1. Shkoni te: https://developers.facebook.com/');
  console.log('2. Krijoni një app dhe shtoni "Facebook Login"');
  console.log('3. Shtoni redirect URI: http://localhost:3000/api/auth/callback/facebook');
  console.log('─────────────────────────────────────\n');
  
  const appId = await question('Shkruani Facebook App ID: ');
  const appSecret = await question('Shkruani Facebook App Secret: ');
  
  if (appId && appSecret) {
    updateEnvFile([
      { key: 'FACEBOOK_CLIENT_ID', value: appId.trim() },
      { key: 'FACEBOOK_CLIENT_SECRET', value: appSecret.trim() }
    ]);
    return true;
  }
  return false;
}

async function setupApple() {
  console.log('\n📘 Konfigurimi i Apple OAuth:');
  console.log('─────────────────────────────────────');
  console.log('1. Shkoni te: https://developer.apple.com/');
  console.log('2. Krijoni Service ID dhe aktivizoni "Sign In with Apple"');
  console.log('3. Shtoni redirect URI: http://localhost:3000/api/auth/callback/apple');
  console.log('─────────────────────────────────────\n');
  
  const clientId = await question('Shkruani Apple Client ID: ');
  const clientSecret = await question('Shkruani Apple Client Secret: ');
  
  if (clientId && clientSecret) {
    updateEnvFile([
      { key: 'APPLE_CLIENT_ID', value: clientId.trim() },
      { key: 'APPLE_CLIENT_SECRET', value: clientSecret.trim() }
    ]);
    return true;
  }
  return false;
}

async function main() {
  console.log('\n🚀 OAuth Setup Wizard për Pastro.com');
  console.log('=====================================\n');
  
  const setupGoogleOAuth = await question('Dëshironi të konfiguroni Google OAuth? (y/n): ');
  if (setupGoogleOAuth.toLowerCase() === 'y') {
    await setupGoogle();
  }
  
  const setupFacebookOAuth = await question('\nDëshironi të konfiguroni Facebook OAuth? (y/n): ');
  if (setupFacebookOAuth.toLowerCase() === 'y') {
    await setupFacebook();
  }
  
  const setupAppleOAuth = await question('\nDëshironi të konfiguroni Apple OAuth? (y/n): ');
  if (setupAppleOAuth.toLowerCase() === 'y') {
    await setupApple();
  }
  
  console.log('\n✅ Konfigurimi u përfundua!');
  console.log('\n📝 Hapi tjetër: Restartoni Next.js server me: npm run dev\n');
  
  rl.close();
}

main().catch(console.error);

