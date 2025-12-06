# 📄 Udhëzues për `file://` Protocol - Pastro.com

## ❓ A do të funksionojë me `file://`?

**Përgjigje e shkurtër:** 
- ✅ **Po, por me kufizime**
- ✅ `demo-sq-fixed.html` funksionon plotësisht me `file://`
- ⚠️ Regjistrimi i userit dhe kompanisë në PostgreSQL kërkon API server

---

## ✅ Çfarë Funksionon me `file://`

### 1. **demo-sq-fixed.html** ✅

**URL:** `file:///Users/valdrinqerimi/Downloads/pastro-com-full/demo-sq-fixed.html`

**Çfarë funksionon:**
- ✅ Shfaqja e kompanive (nga localStorage cache)
- ✅ Kërkim dhe filtrim kompanish
- ✅ Shfaqja e shërbimeve (nga localStorage cache)
- ✅ Weather widget (me mock data)
- ✅ Navigation dhe routing
- ✅ Login/Logout (nga localStorage)
- ✅ Shfaqja e emrit të kompanisë në header (nga localStorage)

**Si funksionon:**
```javascript
// Kontrollon nëse është file://
const isFileProtocol = window.location.protocol === 'file:';

if (isFileProtocol) {
    // Përdor localStorage cache në vend të API calls
    const cached = JSON.parse(localStorage.getItem('approvedCompaniesCache') || '[]');
    // Shfaq kompanitë nga cache
}
```

**Kufizime:**
- ❌ Nuk mund të marrë kompani të reja nga API (nëse serveri nuk është aktiv)
- ❌ Nuk mund të përditësojë të dhënat në kohë reale

---

### 2. **register-user-sq.html** ⚠️

**URL:** `file:///Users/valdrinqerimi/Downloads/pastro-com-full/register-user-sq.html`

**Çfarë funksionon:**
- ✅ Forma e regjistrimit
- ✅ Validimi i të dhënave
- ✅ Ruajtja në localStorage (fallback)

**Si funksionon:**
```javascript
// Përpiqet të përdorë API
try {
    const apiBase = await findApiBase(); // Port 3000 ose 3001
    const response = await fetch(`${apiBase}/api/auth/register-user`, {
        method: 'POST',
        // ...
    });
    // Ruaj në PostgreSQL ✅
} catch (error) {
    // Fallback: Ruaj vetëm në localStorage ⚠️
    // Nuk ruhet në PostgreSQL ❌
}
```

**Kufizime:**
- ⚠️ **Për të ruajtur në PostgreSQL, duhet API server aktiv** (`npm run dev`)
- ⚠️ Nëse API server nuk është aktiv, useri ruhet vetëm në localStorage
- ⚠️ Useri në localStorage nuk do të jetë i dukshëm për përdorues të tjerë

**Rekomandim:**
- ✅ Përdor `http://localhost:3000/register-user-sq.html` për regjistrim të plotë
- ⚠️ Ose sigurohu që API server është aktiv (`npm run dev`)

---

### 3. **register-sq.html** ⚠️

**URL:** `file:///Users/valdrinqerimi/Downloads/pastro-com-full/register-sq.html`

**Çfarë funksionon:**
- ✅ Forma e regjistrimit të kompanisë
- ✅ Validimi i të dhënave
- ✅ Ruajtja në localStorage (fallback)

**Si funksionon:**
```javascript
// Përpiqet të përdorë API
try {
    const apiBase = await findApiBase(); // Port 3000 ose 3001
    const response = await fetch(`${apiBase}/api/auth/register`, {
        method: 'POST',
        body: JSON.stringify({
            userId: currentUser.id,
            companyName: formData.companyName,
            // ...
        })
    });
    // Ruaj në PostgreSQL ✅
    // Update users.companyName ✅
} catch (error) {
    // Fallback: Ruaj vetëm në localStorage ⚠️
    // Nuk ruhet në PostgreSQL ❌
    // Nuk update users.companyName ❌
}
```

**Kufizime:**
- ⚠️ **Për të ruajtur në PostgreSQL, duhet API server aktiv** (`npm run dev`)
- ⚠️ Nëse API server nuk është aktiv, kompania ruhet vetëm në localStorage
- ⚠️ `users.companyName` nuk do të përditësohet në PostgreSQL
- ⚠️ Kompania nuk do të jetë e dukshme për përdorues të tjerë

**Rekomandim:**
- ✅ Përdor `http://localhost:3000/register-sq.html` për regjistrim të plotë
- ⚠️ Ose sigurohu që API server është aktiv (`npm run dev`)

---

### 4. **signin-sq.html** ⚠️

**URL:** `file:///Users/valdrinqerimi/Downloads/pastro-com-full/signin-sq.html`

**Çfarë funksionon:**
- ✅ Forma e login
- ✅ Login nga localStorage (fallback)

**Si funksionon:**
```javascript
// Përpiqet të përdorë API
if (!isFileProtocol) {
    try {
        const response = await fetch(`${apiBase}/api/auth/login`, {
            method: 'POST',
            // ...
        });
        // Login me PostgreSQL ✅
    } catch (error) {
        // Fallback: Login nga localStorage ⚠️
    }
} else {
    // file:// protocol: Login vetëm nga localStorage
}
```

**Kufizime:**
- ⚠️ **Për login me PostgreSQL, duhet API server aktiv**
- ⚠️ Me `file://`, login bëhet vetëm nga localStorage

---

## 🎯 Përmbledhje

### ✅ Funksionon plotësisht me `file://`:
- `demo-sq-fixed.html` - Shfaqja e kompanive, kërkim, navigation

### ⚠️ Funksionon me kufizime me `file://`:
- `register-user-sq.html` - Regjistron vetëm në localStorage (jo në PostgreSQL)
- `register-sq.html` - Regjistron vetëm në localStorage (jo në PostgreSQL)
- `signin-sq.html` - Login vetëm nga localStorage (jo nga PostgreSQL)

---

## 🔧 Si të Funksionojë Plotësisht

### Opsioni 1: Përdor `http://localhost` (Rekomanduar) ✅

**Hapi 1:** Nis serverin Next.js
```bash
npm run dev
```

**Hapi 2:** Hap faqet përmes `http://localhost:3000`:
- ✅ `http://localhost:3000/demo-sq-fixed.html`
- ✅ `http://localhost:3000/register-user-sq.html`
- ✅ `http://localhost:3000/register-sq.html`
- ✅ `http://localhost:3000/signin-sq.html`

**Avantazhet:**
- ✅ Nuk ka CORS issues
- ✅ Të gjitha API calls funksionojnë
- ✅ Regjistrimi në PostgreSQL funksionon
- ✅ `users.companyName` përditësohet në PostgreSQL

---

### Opsioni 2: Përdor `file://` me API Server Aktiv ⚠️

**Hapi 1:** Nis serverin Next.js
```bash
npm run dev
```

**Hapi 2:** Hap faqet si `file://`:
- ⚠️ `file:///Users/valdrinqerimi/Downloads/pastro-com-full/demo-sq-fixed.html`
- ⚠️ `file:///Users/valdrinqerimi/Downloads/pastro-com-full/register-user-sq.html`
- ⚠️ `file:///Users/valdrinqerimi/Downloads/pastro-com-full/register-sq.html`

**Kufizimet:**
- ⚠️ Mund të ketë CORS issues (por API ka CORS headers)
- ⚠️ Nëse serveri nuk është aktiv, regjistrimi nuk ruhet në PostgreSQL

---

## 📊 Tabela Krahasuese

| Funksionalitet | `file://` (pa server) | `file://` (me server) | `http://localhost` |
|----------------|----------------------|----------------------|-------------------|
| Shfaqja e kompanive | ✅ (localStorage) | ✅ (API + localStorage) | ✅ (API + localStorage) |
| Regjistrim user në PostgreSQL | ❌ | ✅ | ✅ |
| Regjistrim kompani në PostgreSQL | ❌ | ✅ | ✅ |
| Update `users.companyName` | ❌ | ✅ | ✅ |
| Login nga PostgreSQL | ❌ | ✅ | ✅ |
| CORS issues | ⚠️ | ⚠️ | ✅ |

---

## 🎯 Rekomandim Final

**Për regjistrimin e userit dhe kompanisë në PostgreSQL:**

1. ✅ **Nis serverin Next.js:**
   ```bash
   npm run dev
   ```

2. ✅ **Përdor `http://localhost:3000` në vend të `file://`:**
   - `http://localhost:3000/register-user-sq.html`
   - `http://localhost:3000/register-sq.html`
   - `http://localhost:3000/demo-sq-fixed.html`

3. ✅ **Kjo garanton:**
   - ✅ Regjistrimi në PostgreSQL
   - ✅ Update `users.companyName`
   - ✅ Nuk ka CORS issues
   - ✅ Të gjitha API calls funksionojnë

---

## ❓ Pyetje të Shpeshta

**P: A mund të përdor `file://` për regjistrim?**
**R:** Po, por useri/kompania do të ruhet vetëm në localStorage, jo në PostgreSQL. Për regjistrim të plotë, përdor `http://localhost:3000`.

**P: A do të funksionojë `demo-sq-fixed.html` me `file://`?**
**R:** Po, funksionon plotësisht me `file://` (përdor localStorage cache).

**P: Si të kontrolloj nëse serveri është aktiv?**
**R:** Hap `http://localhost:3000/api/cities` në browser. Nëse shfaq JSON, serveri është aktiv.

**P: A mund të përdor `file://` për testim?**
**R:** Po, por vetëm për testim të UI. Për testim të plotë me PostgreSQL, përdor `http://localhost:3000`.

