# 🚀 OAuth Quick Start Guide

## ✅ Hapi 1: Environment Variables (U krye!)

Variablat e nevojshëm janë shtuar në `.env` file. Tani duhet të merrni credentials nga OAuth providers.

---

## 📝 Hapi 2: Konfiguro Google OAuth

### 2.1 Krijoni OAuth Client në Google Cloud Console

1. **Shkoni te:** [Google Cloud Console](https://console.cloud.google.com/)
2. **Krijoni ose zgjidhni një projekt**
3. **Aktivizoni Google+ API:**
   - Shkoni te "APIs & Services" → "Library"
   - Kërkoni "Google+ API" dhe aktivizojeni

4. **Krijoni OAuth 2.0 Client ID:**
   - Shkoni te "APIs & Services" → "Credentials"
   - Klikoni "Create Credentials" → "OAuth client ID"
   - Nëse kërkohet, konfiguroni OAuth consent screen fillimisht
   - Zgjidhni "Web application"
   - Emër: "Pastro.com OAuth"
   - **Authorized redirect URIs:** Shtoni:
     ```
     http://localhost:3000/api/auth/callback/google
     ```

5. **Kopjoni Client ID dhe Client Secret**

6. **Përditësoni `.env` file:**
   ```env
   GOOGLE_CLIENT_ID="paste-your-client-id-here"
   GOOGLE_CLIENT_SECRET="paste-your-client-secret-here"
   ```

---

## 📝 Hapi 3: Konfiguro Facebook OAuth

### 3.1 Krijoni Facebook App

1. **Shkoni te:** [Facebook Developers](https://developers.facebook.com/)
2. **Klikoni "My Apps" → "Create App"**
3. **Zgjidhni "Consumer" ose "Business"**
4. **Plotësoni informacionin e aplikacionit**

### 3.2 Shtoni Facebook Login

1. **Në dashboard, shtoni "Facebook Login" product**
2. **Shkoni te Settings → Basic:**
   - Kopjoni **App ID** dhe **App Secret**
3. **Shkoni te "Facebook Login" → Settings:**
   - **Valid OAuth Redirect URIs:** Shtoni:
     ```
     http://localhost:3000/api/auth/callback/facebook
     ```

4. **Përditësoni `.env` file:**
   ```env
   FACEBOOK_CLIENT_ID="paste-your-app-id-here"
   FACEBOOK_CLIENT_SECRET="paste-your-app-secret-here"
   ```

---

## 📝 Hapi 4: Konfiguro Apple OAuth

### 4.1 Krijoni Service ID në Apple Developer

1. **Shkoni te:** [Apple Developer Portal](https://developer.apple.com/)
2. **Shkoni te "Certificates, Identifiers & Profiles"**
3. **Klikoni "Identifiers" → "+" për të krijuar një të ri**
4. **Zgjidhni "Services IDs"**
5. **Plotësoni Description dhe Identifier**

### 4.2 Konfiguroni Sign in with Apple

1. **Në Services IDs, aktivizoni "Sign In with Apple"**
2. **Klikoni "Configure"**
3. **Shtoni Return URLs:**
   ```
   http://localhost:3000/api/auth/callback/apple
   ```
4. **Ruani dhe merrni Client ID dhe Client Secret**

5. **Përditësoni `.env` file:**
   ```env
   APPLE_CLIENT_ID="paste-your-service-id-here"
   APPLE_CLIENT_SECRET="paste-your-client-secret-here"
   ```

---

## 🔄 Hapi 5: Restart Next.js Server

Pas përditësimit të `.env` file me credentials aktuale:

```bash
# Stop serverin aktual (Ctrl+C nëse është duke punuar)
# Pastaj startoni përsëri:
npm run dev
```

---

## ✅ Hapi 6: Testoni OAuth

1. **Hapni:** `http://localhost:3000/signin-sq.html`
2. **Klikoni në butonat e OAuth:**
   - "Identifikohu me Google"
   - "Identifikohu me Facebook"
   - "Identifikohu me Apple"
3. **Verifikoni që redirect-i funksionon**
4. **Kontrolloni në databazë që përdoruesi u krijua**

---

## 🐛 Troubleshooting

### Problem: "OAuth provider not configured"
**Zgjidhje:** Sigurohuni që credentials janë të shtuara në `.env` dhe serveri është restartuar.

### Problem: "Redirect URI mismatch"
**Zgjidhje:** Verifikoni që redirect URIs në OAuth provider dashboard përputhen me:
- `http://localhost:3000/api/auth/callback/google`
- `http://localhost:3000/api/auth/callback/facebook`
- `http://localhost:3000/api/auth/callback/apple`

### Problem: "User not created in database"
**Zgjidhje:** 
- Kontrolloni logs në terminal për gabime
- Verifikoni që DATABASE_URL është i saktë në `.env`
- Sigurohuni që Prisma schema është e sinkronizuar: `npx prisma db push`

---

## 📚 Burime të Mëtejshme

- [NextAuth.js Documentation](https://next-auth.js.org/)
- [Google OAuth Setup](https://developers.google.com/identity/protocols/oauth2)
- [Facebook Login Setup](https://developers.facebook.com/docs/facebook-login/)
- [Apple Sign In Setup](https://developer.apple.com/sign-in-with-apple/)

---

## ⚠️ Shënime të Rëndësishme

- **Development:** Përdorni `http://localhost:3000` për redirect URIs
- **Production:** Kur deployoni, përditësoni redirect URIs me domain-in tuaj aktual
- **Security:** Mos e ndani kurrë Client Secret në kod ose në Git
- **Database:** OAuth users krijohen automatikisht me role `USER`

