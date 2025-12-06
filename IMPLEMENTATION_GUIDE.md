# 🚀 Udhëzues i Implementimit - Pastro.com

## ✅ Çfarë është Implementuar

### 1. ✅ Struktura e Databazës

**Tabela `users`:**
- ✅ `companyName` - Emri i kompanisë ruhet këtu
- ✅ `role` - ADMIN, COMPANY, ose USER
- ✅ Constraint: 1 user = 1 kompani (garantuar me `Company.userId @unique`)

**Tabela `companies`:**
- ✅ `userId` - Foreign Key me `users.id` (UNIQUE)
- ✅ Të gjitha detajet e kompanisë

---

## 🔄 Flow i Plotë

### Hapi 1: Regjistrimi i Userit

**API:** `POST /api/auth/register-user`

**Request:**
```json
{
  "firstName": "Valdrin",
  "lastName": "Qerimi",
  "email": "valdrin@example.com",
  "password": "123456"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Përdoruesi u regjistrua me sukses",
  "user": {
    "id": "clx123...",
    "email": "valdrin@example.com",
    "firstName": "Valdrin",
    "lastName": "Qerimi",
    "fullName": "Valdrin Qerimi",
    "role": "USER"
  }
}
```

**Rezultati në databazë:**
```sql
SELECT * FROM users WHERE email = 'valdrin@example.com';
-- Rezultati:
-- id: clx123...
-- email: valdrin@example.com
-- role: USER
-- companyName: NULL  ✅ Nuk ka kompani ende
```

---

### Hapi 2: Login i Userit

**API:** `POST /api/auth/login`

**Request:**
```json
{
  "email": "valdrin@example.com",
  "password": "123456"
}
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "clx123...",
    "email": "valdrin@example.com",
    "role": "USER",
    "company": null  ✅ Nuk ka kompani ende
  }
}
```

**Ruaj në localStorage:**
```javascript
localStorage.setItem('currentUser', JSON.stringify({
  id: "clx123...",
  email: "valdrin@example.com",
  role: "USER",
  companyName: null  ✅ Nuk ka kompani ende
}));
```

---

### Hapi 3: Regjistrimi i Kompanisë

**API:** `POST /api/auth/register`

**Request:**
```json
{
  "userId": "clx123...",  ✅ ID e userit të kyçur
  "companyName": "Kompania Demo Pastrimi",
  "phone": "+38344123456",
  "description": "Kompani profesionale pastrimi",
  "cities": ["city-id-1", "city-id-2"],
  "services": [
    { "serviceId": "service-id-1", "price": 50.00 },
    { "serviceId": "service-id-2", "price": 75.00 }
  ]
}
```

**Procesi i API-së:**
1. ✅ Kontroll nëse user ekziston
2. ✅ **Kontroll nëse user ka tashmë kompani** → Nëse ka, kthen error
3. ✅ Krijon kompani në tabelën `companies`
4. ✅ **Update `users.companyName` me emrin e kompanisë** ✅
5. ✅ **Update `users.role` nga `USER` në `COMPANY`** ✅

**Response:**
```json
{
  "success": true,
  "message": "Company registered successfully",
  "userId": "clx123..."
}
```

**Rezultati në databazë:**

**Tabela `users`:**
```sql
SELECT * FROM users WHERE id = 'clx123...';
-- Rezultati:
-- id: clx123...
-- email: valdrin@example.com
-- role: COMPANY  ✅ U përditësua
-- companyName: "Kompania Demo Pastrimi"  ✅ Emri i kompanisë u ruajt këtu
```

**Tabela `companies`:**
```sql
SELECT * FROM companies WHERE userId = 'clx123...';
-- Rezultati:
-- id: cly456...
-- userId: clx123...  ✅ Lidhje me user
-- name: "Kompania Demo Pastrimi"
-- phone: "+38344123456"
-- status: APPROVED  ✅ Auto-approved nëse ka qytete dhe shërbime
```

---

## 🔒 Garancitë për "1 User = 1 Kompani"

### 1. Në nivel të databazës (Prisma):
```prisma
model Company {
  userId String @unique  // ✅ UNIQUE constraint
  // ...
}
```

Kjo garanton që në databazë, çdo `userId` mund të ketë vetëm një kompani.

### 2. Në nivel të API:
```typescript
// Në /api/auth/register
if (user.company) {
  return NextResponse.json(
    { error: 'Ju keni një kompani tashmë. Një përdorues mund të ketë vetëm një kompani.' },
    { status: 400 }
  )
}
```

Kjo kontrollon para se të krijohet kompania e re.

---

## 📝 Si të Përdoret në Frontend

### 1. Regjistrimi i Userit

```javascript
// register-user-sq.html
async function registerUser() {
  const response = await fetch('http://localhost:3000/api/auth/register-user', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      firstName: document.getElementById('firstName').value,
      lastName: document.getElementById('lastName').value,
      email: document.getElementById('email').value,
      password: document.getElementById('password').value
    })
  });
  
  const data = await response.json();
  if (data.success) {
    // Ruaj në localStorage
    localStorage.setItem('currentUser', JSON.stringify(data.user));
    // Redirect në register-sq.html për të regjistruar kompaninë
    window.location.href = 'register-sq.html';
  }
}
```

### 2. Regjistrimi i Kompanisë

```javascript
// register-sq.html
async function registerCompany() {
  const currentUser = JSON.parse(localStorage.getItem('currentUser'));
  
  if (!currentUser) {
    alert('Ju duhet të jeni të kyçur për të regjistruar kompani');
    window.location.href = 'register-user-sq.html';
    return;
  }
  
  // Kontroll nëse ka tashmë kompani
  if (currentUser.companyName) {
    alert('Ju keni një kompani tashmë: ' + currentUser.companyName);
    return;
  }
  
  const response = await fetch('http://localhost:3000/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId: currentUser.id,  // ✅ ID e userit të kyçur
      companyName: document.getElementById('companyName').value,
      phone: document.getElementById('phone').value,
      description: document.getElementById('description').value,
      cities: selectedCities,
      services: selectedServices
    })
  });
  
  const data = await response.json();
  if (data.success) {
    // Update currentUser në localStorage
    currentUser.role = 'COMPANY';
    currentUser.companyName = document.getElementById('companyName').value;
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    
    alert('Kompania u regjistrua me sukses!');
    window.location.href = 'demo-sq-fixed.html';
  }
}
```

### 3. Shfaqja e Emrit të Kompanisë

```javascript
// demo-sq-fixed.html ose çdo faqe tjetër
function checkUserAndUpdateHeader() {
  const currentUser = JSON.parse(localStorage.getItem('currentUser'));
  
  if (currentUser && currentUser.role === 'COMPANY') {
    // Shfaq butonin "Ç'kyçu"
    document.getElementById('logoutBtn').style.display = 'block';
    document.getElementById('loginBtn').style.display = 'none';
    
    // Shfaq emrin e kompanisë
    if (currentUser.companyName) {
      document.getElementById('companyNameHeader').textContent = currentUser.companyName;
      document.getElementById('companyNameHeader').style.display = 'block';
    }
  } else {
    // Shfaq butonin "Kyçu"
    document.getElementById('loginBtn').style.display = 'block';
    document.getElementById('logoutBtn').style.display = 'none';
    document.getElementById('companyNameHeader').style.display = 'none';
  }
}
```

---

## 🔍 Query Examples

### 1. Marrja e Userit me Emrin e Kompanisë

```typescript
// Në API
const user = await prisma.user.findUnique({
  where: { id: userId },
  select: {
    id: true,
    email: true,
    role: true,
    companyName: true,  // ✅ Direkt nga users, pa JOIN
    company: {
      select: {
        id: true,
        name: true,
        status: true
      }
    }
  }
});

// Rezultati:
// {
//   id: "clx123...",
//   email: "valdrin@example.com",
//   role: "COMPANY",
//   companyName: "Kompania Demo Pastrimi",  // ✅ Direkt nga users
//   company: {
//     id: "cly456...",
//     name: "Kompania Demo Pastrimi",
//     status: "APPROVED"
//   }
// }
```

### 2. Kontrollimi nëse User ka Kompani

```typescript
// Në API
const user = await prisma.user.findUnique({
  where: { id: userId },
  include: { company: true }
});

if (user.company) {
  // User ka kompani
  console.log('Kompania:', user.companyName);  // ✅ Direkt nga users
} else {
  // User nuk ka kompani
  console.log('Nuk ka kompani');
}
```

---

## ✅ Checklist për Testim

- [ ] ✅ User regjistrohet → Ruhet në `users` me `companyName: null`
- [ ] ✅ User regjistron kompani → 
  - [ ] ✅ Krijon rekord në `companies`
  - [ ] ✅ Update `users.companyName` me emrin e kompanisë
  - [ ] ✅ Update `users.role` në `COMPANY`
- [ ] ✅ 1 user = 1 kompani → 
  - [ ] ✅ Nëse user ka kompani, nuk mund të regjistrojë të dytën
  - [ ] ✅ `Company.userId` është UNIQUE në databazë
- [ ] ✅ Emri i kompanisë shfaqet në header kur user është i kyçur si COMPANY

---

## 🎯 Përmbledhje

1. ✅ **User regjistrohet** → Ruhet në `users` me `companyName: null`
2. ✅ **User regjistron kompani** → 
   - Krijon rekord në `companies`
   - **Update `users.companyName` me emrin e kompanisë** ✅
   - Update `users.role` në `COMPANY`
3. ✅ **1 user = 1 kompani** → Garantuar me `@unique` constraint dhe kontroll në API
4. ✅ **Emri i kompanisë ruhet tek useri** → Mund të merret direkt nga `users.companyName` pa JOIN

---

## 📚 Dokumentacioni i Plotë

Për më shumë detaje, shiko:
- `DATABASE_STRUCTURE.md` - Struktura e detajuar e databazës
- `README.md` - Dokumentacioni i plotë i projektit

