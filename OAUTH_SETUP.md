# OAuth Setup Guide - Pastro.com

Ky dokument shpjegon si të konfigurohen OAuth providers (Google, Facebook, Apple) për identifikim në aplikacionin Pastro.com.

## 📋 Përgatitja

Para se të filloni, sigurohuni që keni:
- Next.js server i instaluar dhe duke punuar
- PostgreSQL database e konfiguruar
- Environment variables të konfiguruara

## 🔧 Konfigurimi i OAuth Providers

### 1. Google OAuth

1. Shkoni te [Google Cloud Console](https://console.cloud.google.com/)
2. Krijoni një projekt të ri ose zgjidhni një ekzistues
3. Aktivizoni Google+ API
4. Shkoni te "Credentials" → "Create Credentials" → "OAuth client ID"
5. Zgjidhni "Web application"
6. Shtoni Authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google` (për development)
   - `https://yourdomain.com/api/auth/callback/google` (për production)
7. Kopjoni Client ID dhe Client Secret

### 2. Facebook OAuth

1. Shkoni te [Facebook Developers](https://developers.facebook.com/)
2. Krijoni një aplikacion të ri
3. Shtoni "Facebook Login" product
4. Shkoni te Settings → Basic
5. Shtoni Valid OAuth Redirect URIs:
   - `http://localhost:3000/api/auth/callback/facebook` (për development)
   - `https://yourdomain.com/api/auth/callback/facebook` (për production)
6. Kopjoni App ID dhe App Secret

### 3. Apple OAuth

1. Shkoni te [Apple Developer Portal](https://developer.apple.com/)
2. Krijoni një Service ID
3. Konfiguroni Sign in with Apple
4. Shtoni Return URLs:
   - `http://localhost:3000/api/auth/callback/apple` (për development)
   - `https://yourdomain.com/api/auth/callback/apple` (për production)
5. Kopjoni Client ID dhe Client Secret

## 🔐 Environment Variables

Shtoni këto variabla në `.env` file:

```env
# OAuth Providers
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

FACEBOOK_CLIENT_ID="your-facebook-app-id"
FACEBOOK_CLIENT_SECRET="your-facebook-app-secret"

APPLE_CLIENT_ID="your-apple-client-id"
APPLE_CLIENT_SECRET="your-apple-client-secret"

# NextAuth Configuration
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"
```

**Shënim:** `NEXTAUTH_SECRET` duhet të jetë një string i rastësishëm. Mund ta gjeneroni me:
```bash
openssl rand -base64 32
```

## 🚀 Testimi

1. Startoni Next.js server:
   ```bash
   npm run dev
   ```

2. Hapni `http://localhost:3000/signin-sq.html`

3. Klikoni në butonat e OAuth (Google, Facebook, Apple)

4. Verifikoni që redirect-i funksionon dhe që përdoruesi krijohet në databazë

## 📝 Shënime të Rëndësishme

- **Development:** Përdorni `http://localhost:3000` për NEXTAUTH_URL
- **Production:** Përdorni domain-in tuaj aktual për NEXTAUTH_URL
- **Security:** Mos e ndani kurrë Client Secret në kod ose në Git
- **Database:** OAuth users krijohen automatikisht në databazë me role `USER`

## 🐛 Troubleshooting

### Problem: "OAuth provider not configured"
**Zgjidhje:** Sigurohuni që environment variables janë të konfiguruara dhe serveri është restartuar.

### Problem: "Redirect URI mismatch"
**Zgjidhje:** Verifikoni që redirect URIs në OAuth provider dashboard përputhen me NEXTAUTH_URL.

### Problem: "User not created in database"
**Zgjidhje:** Kontrolloni logs në terminal për gabime dhe sigurohuni që Prisma schema është e sinkronizuar.

## 📚 Burime

- [NextAuth.js Documentation](https://next-auth.js.org/)
- [Google OAuth Setup](https://developers.google.com/identity/protocols/oauth2)
- [Facebook Login Setup](https://developers.facebook.com/docs/facebook-login/)
- [Apple Sign In Setup](https://developer.apple.com/sign-in-with-apple/)

