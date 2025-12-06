# 📊 Struktura e Databazës - Pastro.com

## 🎯 Kërkesat Kryesore

1. ✅ **Kur krijohet user → ruhet në PostgreSQL**
2. ✅ **1 user mund të regjistrojë vetëm 1 kompani**
3. ✅ **Kur krijohet kompania, emri i kompanisë ruhet tek ky user**

---

## 📋 Struktura e Thjeshtuar e Tabelave

### 1. Tabela `users` (Përdoruesit)

**Fushat kryesore:**
- `id` - Primary Key (String, CUID)
- `email` - Unique, përdoret për login
- `password` - Hash me bcrypt
- `firstName`, `lastName`, `fullName` - Emri i plotë
- `role` - ADMIN, COMPANY, ose USER
- `companyName` - **Emri i kompanisë (nëse ka regjistruar kompani)**
- `createdAt`, `updatedAt` - Timestamps

**SQL Equivalent (PostgreSQL):**
```sql
CREATE TABLE users (
    id VARCHAR(255) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(255),
    last_name VARCHAR(255),
    full_name VARCHAR(255),
    role VARCHAR(50) DEFAULT 'USER',
    company_name VARCHAR(255),  -- Emri i kompanisë
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Prisma Schema:**
```prisma
model User {
  id          String   @id @default(cuid())
  email       String   @unique
  password    String
  firstName   String?
  lastName   String?
  fullName   String?
  role        UserRole @default(USER)
  companyName String?  // ✅ Emri i kompanisë ruhet këtu
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  company     Company? // One-to-one relationship
  
  @@map("users")
}
```

---

### 2. Tabela `companies` (Kompanitë)

**Fushat kryesore:**
- `id` - Primary Key
- `userId` - Foreign Key → `users.id` (UNIQUE - garanton 1 kompani për user)
- `name` - Emri i kompanisë (kopjohet edhe tek `users.companyName`)
- `description` - Përshkrimi
- `phone` - Telefoni
- `status` - PENDING, APPROVED, REJECTED
- `createdAt`, `updatedAt` - Timestamps

**SQL Equivalent (PostgreSQL):**
```sql
CREATE TABLE companies (
    id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    phone VARCHAR(50),
    status VARCHAR(50) DEFAULT 'PENDING',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT one_company_per_user UNIQUE (user_id)
);
```

**Prisma Schema:**
```prisma
model Company {
  id          String        @id @default(cuid())
  userId      String        @unique  // ✅ UNIQUE garanton 1 kompani për user
  name        String
  description String?
  phone       String
  status      CompanyStatus @default(PENDING)
  createdAt   DateTime      @default(now())
  updatedAt   DateTime      @updatedAt
  user        User          @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@map("companies")
}
```

---

## 🔄 Flow i Regjistrimit

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

**Procesi:**
1. ✅ Validim të dhënash me Zod
2. ✅ Kontroll nëse email ekziston
3. ✅ Hash password me bcrypt
4. ✅ Krijim user në databazë me `role: 'USER'`
5. ✅ `companyName` mbetet `null` (nuk ka kompani ende)

**Rezultati në databazë:**
```json
{
  "id": "clx123...",
  "email": "valdrin@example.com",
  "password": "$2a$10$...", // hashed
  "firstName": "Valdrin",
  "lastName": "Qerimi",
  "fullName": "Valdrin Qerimi",
  "role": "USER",
  "companyName": null,  // ✅ Nuk ka kompani ende
  "createdAt": "2024-01-15T10:00:00Z"
}
```

---

### Hapi 2: Regjistrimi i Kompanisë

**API:** `POST /api/auth/register`

**Request:**
```json
{
  "userId": "clx123...",  // ✅ ID e userit të kyçur
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

**Procesi:**
1. ✅ Kontroll nëse user ekziston
2. ✅ **Kontroll nëse user ka tashmë kompani** (nëse ka → error)
3. ✅ Krijim kompani në tabelën `companies`
4. ✅ **Update `users.companyName` me emrin e kompanisë** ✅
5. ✅ Update `users.role` nga `USER` në `COMPANY`
6. ✅ Shtim qyteteve dhe shërbimeve

**Rezultati në databazë:**

**Tabela `users`:**
```json
{
  "id": "clx123...",
  "email": "valdrin@example.com",
  "role": "COMPANY",  // ✅ U përditësua
  "companyName": "Kompania Demo Pastrimi",  // ✅ Emri i kompanisë u ruajt këtu
  "updatedAt": "2024-01-15T11:00:00Z"
}
```

**Tabela `companies`:**
```json
{
  "id": "cly456...",
  "userId": "clx123...",  // ✅ Lidhje me user
  "name": "Kompania Demo Pastrimi",
  "phone": "+38344123456",
  "description": "Kompani profesionale pastrimi",
  "status": "APPROVED",  // Auto-approved nëse ka qytete dhe shërbime
  "createdAt": "2024-01-15T11:00:00Z"
}
```

---

## 🔒 Garancitë për "1 User = 1 Kompani"

### 1. Në nivel të databazës:
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

## 📝 Përditësimi i Schema-s

Për të shtuar `companyName` në tabelën `users`, duhet të përditësohet Prisma schema:

```prisma
model User {
  id          String   @id @default(cuid())
  email       String   @unique
  password    String
  firstName   String?
  lastName   String?
  fullName   String?
  role        UserRole @default(USER)
  companyName String?  // ✅ Shto këtë fushë
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  company     Company?
  
  @@map("users")
}
```

Pastaj ekzekuto:
```bash
npx prisma db push
npx prisma generate
```

---

## 🔄 Përditësimi i API-së për të Ruajtur `companyName`

Në `/api/auth/register`, pas krijimit të kompanisë:

```typescript
// Pas krijimit të kompanisë
await prisma.user.update({
  where: { id: user.id },
  data: {
    companyName: validatedData.companyName,  // ✅ Ruaj emrin e kompanisë
    role: 'COMPANY'  // ✅ Update role
  }
})
```

---

## ✅ Përmbledhje

1. ✅ **User regjistrohet** → Ruhet në `users` me `companyName: null`
2. ✅ **User regjistron kompani** → 
   - Krijon rekord në `companies`
   - **Update `users.companyName` me emrin e kompanisë**
   - Update `users.role` në `COMPANY`
3. ✅ **1 user = 1 kompani** → Garantuar me `@unique` constraint dhe kontroll në API

---

## 🎯 Avantazhet e Kësaj Strukture

1. ✅ **E thjeshtë** - Vetëm 2 tabela kryesore (`users`, `companies`)
2. ✅ **E shpejtë** - Mund të marrësh emrin e kompanisë direkt nga `users` pa JOIN
3. ✅ **E sigurt** - `@unique` constraint garanton 1 kompani për user
4. ✅ **E lehtë për query** - `SELECT companyName FROM users WHERE id = ?`

---

## 📌 Shembull Query

**Marrja e emrit të kompanisë për një user:**
```typescript
const user = await prisma.user.findUnique({
  where: { id: userId },
  select: {
    email: true,
    companyName: true,  // ✅ Direkt nga users, pa JOIN
    company: {
      select: {
        id: true,
        name: true,
        status: true
      }
    }
  }
})

// Rezultati:
// {
//   email: "valdrin@example.com",
//   companyName: "Kompania Demo Pastrimi",  // ✅ Direkt nga users
//   company: {
//     id: "cly456...",
//     name: "Kompania Demo Pastrimi",
//     status: "APPROVED"
//   }
// }
```

