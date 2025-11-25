# Pastro.com - Platforma e Shërbimeve të Pastrimit

Platforma web që lidh klientët me kompani profesionale pastrimi nëpër qytetet e Kosovës.

## 📋 Përshkrim

Pastro.com është një platformë e plotë që lejon:
- **Klientët** të gjejnë dhe kontaktojnë kompani pastrimi në qytetet e tyre
- **Kompanitë** të regjistrohen dhe të shfaqen në platformë
- **Administratorët** të menaxhojnë kompanitë dhe miratojnë regjistrimet

## 🚀 Kërkesat

Para se të filloni, sigurohuni që keni të instaluar:

- **Node.js** (version 18 ose më i lartë) - [Download](https://nodejs.org/)
- **PostgreSQL** (version 12 ose më i lartë) - [Download](https://www.postgresql.org/download/)
- **npm** ose **yarn** (vjen me Node.js)
- **Git** - [Download](https://git-scm.com/downloads)

## 📦 Instalim

### 1. Klononi Repozitorinë

```bash
git clone https://github.com/valdrin-12/Pastro1.git
cd Pastro1
```

### 2. Instaloni Dependencies

```bash
npm install
```

### 3. Konfiguroni Variablat e Mjedisit

Krijoni një file `.env.local` në root të projektit:

```bash
cp env.example .env.local
```

Hapni `.env.local` dhe plotësoni me të dhënat tuaja:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/pastro_db?schema=public"

# NextAuth.js
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"  # Gjeneroni një string të rastësishëm

# JWT
JWT_SECRET="your-jwt-secret-here"  # Gjeneroni një string të rastësishëm

# File Upload
UPLOAD_DIR="./public/uploads"
MAX_FILE_SIZE=5242880

# App Configuration
APP_NAME="Pastro.com"
APP_DESCRIPTION="Cleaning Services Portal for Kosovo"

# SMTP (Emails) - Optional
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
EMAIL_FROM="Pastro.com <noreply@pastro.com>"

# Weather API (Optional)
WEATHER_API_KEY="your-openweathermap-api-key-here"
```

**Shënim:** Për të gjeneruar `NEXTAUTH_SECRET` dhe `JWT_SECRET`, mund të përdorni:
```bash
openssl rand -base64 32
```

### 4. Krijoni Databazën PostgreSQL

```bash
# Hyni në PostgreSQL
psql -U postgres

# Krijoni databazën
CREATE DATABASE pastro_db;

# Dilni
\q
```

### 5. Konfiguroni Prisma

```bash
# Gjeneroni Prisma Client
npm run db:generate

# Sinkronizoni schema-n me databazën
npm run db:push

# (Opsionale) Mbushni databazën me të dhëna test
npm run db:seed
```

## 🏃 Ekzekutim

### Development Mode

```bash
npm run dev
```

Aplikacioni do të hapet në `http://localhost:3000`

**Shënim:** Nëse porti 3000 është i zënë, Next.js do të përdorë portin 3001 automatikisht.

### Production Build

```bash
# Ndërtoni aplikacionin
npm run build

# Nisni serverin e production
npm start
```

## 📁 Strukturë e Projektit

```
pastro-com-full/
├── prisma/
│   ├── schema.prisma          # Schema e databazës
│   └── seed.ts                # Skript për të dhëna test
├── public/                    # Fajllat statike
│   ├── demo-sq-fixed.html     # Faqja kryesore
│   ├── register-sq.html       # Regjistrimi i kompanive
│   ├── register-user-sq.html  # Regjistrimi i përdoruesve
│   └── signin-sq.html         # Faqja e login
├── src/
│   ├── app/
│   │   ├── api/               # API endpoints
│   │   │   ├── auth/          # Authentication endpoints
│   │   │   ├── companies/      # Company management
│   │   │   ├── cities/        # Cities data
│   │   │   └── services/      # Services data
│   │   └── ...
│   └── lib/
│       ├── prisma.ts          # Prisma client instance
│       └── email.ts           # Email utility
├── *.html                     # HTML pages (mund të hapen si file://)
└── package.json
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Regjistrimi i kompanive
- `POST /api/auth/register-user` - Regjistrimi i përdoruesve
- `POST /api/auth/login` - Login
- `POST /api/auth/forgot-password` - Harruar fjalëkalimin
- `POST /api/auth/reset-password` - Reset fjalëkalimin

### Companies
- `GET /api/companies` - Lista e kompanive të miratuara
- `GET /api/company/profile` - Profili i kompanisë
- `POST /api/company/verify` - Verifikimi i emrit të kompanisë

### Data
- `GET /api/cities` - Lista e qyteteve
- `GET /api/services` - Lista e shërbimeve
- `GET /api/service-categories` - Kategoritë e shërbimeve
- `GET /api/weather` - Të dhëna moti (kërkon API key)

### Admin
- `GET /api/admin/companies` - Lista e të gjitha kompanive (admin)
- `POST /api/admin/companies/[id]/status` - Ndryshimi i statusit (admin)

## 👥 Roli i Përdoruesve

### USER (Përdorues i thjeshtë)
- Mund të regjistrohet me email dhe fjalëkalim
- Mund të regjistrojë vetëm një kompani
- Mund të shohë të gjitha kompanitë

### COMPANY (Kompani)
- Krijon automatikisht kur një USER regjistron një kompani
- Mund të menaxhojë profilin e kompanisë
- Mund të shohë statistika dhe transaksione

### ADMIN (Administrator)
- Mund të miratojë/refuzojë kompanitë
- Mund të shohë të gjitha kompanitë dhe përdoruesit
- Akses i plotë në sistem

## 🎯 Përdorim

### Regjistrimi i Përdoruesit

1. Hapni `register-user-sq.html` ose `http://localhost:3000/register-user-sq.html`
2. Plotësoni:
   - Emri
   - Mbiemri
   - Email
   - Fjalëkalimi (minimum 6 karaktere)
   - Konfirmo fjalëkalimin
3. Klikoni "Krijo Llogari"

### Regjistrimi i Kompanisë

1. **Krijoni një llogari përdoruesi** (nëse nuk keni)
2. Hapni `register-sq.html` ose `http://localhost:3000/register-sq.html`
3. Plotësoni të gjitha hapat:
   - Informacione bazë (emri, përshkrimi, telefoni)
   - Email dhe fjalëkalim (nëse nuk jeni të kyçur)
   - Qytetet ku operon
   - Shërbimet që ofron
   - Foto dhe lokacioni
4. Kompania do të jetë në status "PENDING" derisa administratori ta miratojë

### Login

1. Hapni `signin-sq.html` ose `http://localhost:3000/signin-sq.html`
2. Shkruani email dhe fjalëkalim
3. Klikoni "Hyr"

## 🔧 Troubleshooting

### Problemi: "Database connection failed"

**Zgjidhja:**
- Kontrolloni që PostgreSQL është duke punuar: `pg_isready`
- Verifikoni `DATABASE_URL` në `.env.local`
- Sigurohuni që databaza `pastro_db` ekziston

### Problemi: "Prisma Client not generated"

**Zgjidhja:**
```bash
npm run db:generate
npm run db:push
```

### Problemi: "Port 3000 already in use"

**Zgjidhja:**
- Next.js do të përdorë automatikisht portin 3001
- Ose ndaloni procesin që përdor portin 3000

### Problemi: "CORS error" kur hapni HTML si `file://`

**Zgjidhja:**
- Hapni faqet përmes serverit: `http://localhost:3000/demo-sq-fixed.html`
- Ose sigurohuni që serveri Next.js është aktiv (`npm run dev`)
- Aplikacioni ka fallback në localStorage për `file://` protocol

### Problemi: "User role not found"

**Zgjidhja:**
```bash
npm run db:push
npm run db:generate
# Rinisni serverin
```

## 📝 Skripta të Dobishme

### Kontrollimi i Përdoruesve në Databazë

```bash
export PATH="/Users/valdrinqerimi/.nvm/versions/node/v24.11.0/bin:$PATH"
node -e 'const { PrismaClient } = require("@prisma/client"); const p = new PrismaClient(); p.user.findMany({ orderBy: { createdAt: "desc" }, include: { company: { select: { name: true } } } }).then(users => { console.log("Total users:", users.length); users.forEach(u => console.log(`${u.email.padEnd(35)} | ${u.role.padEnd(8)} | ${u.company?.name || "-"}`)); p.$disconnect(); });'
```

### Kontrollimi i Kompanive në Databazë

```bash
export PATH="/Users/valdrinqerimi/.nvm/versions/node/v24.11.0/bin:$PATH"
node -e 'const { PrismaClient } = require("@prisma/client"); const p = new PrismaClient(); p.company.findMany({ include: { user: { select: { email: true } } }, orderBy: { createdAt: "desc" } }).then(companies => { console.log("Total companies:", companies.length); companies.forEach(c => console.log(`${c.name.padEnd(30)} | ${c.user?.email.padEnd(35)} | ${(c.status || "NULL").padEnd(10)}`)); p.$disconnect(); });'
```

## 🛠️ Teknologjitë e Përdorura

- **Frontend:** HTML5, CSS3, Tailwind CSS, JavaScript (Vanilla)
- **Backend:** Next.js 15, TypeScript
- **Database:** PostgreSQL, Prisma ORM
- **Authentication:** NextAuth.js, JWT, bcryptjs
- **Email:** Nodemailer
- **Icons:** Lucide Icons

## 📄 Licenca

ISC

## 👤 Autor

Pastro.com Team

## 🤝 Kontribut

Kontributet janë të mirëpritura! Ju lutemi hapni një issue ose pull request.

## 📞 Kontakt

Për pyetje ose mbështetje, ju lutemi hapni një issue në GitHub.

---

**Shënim:** Ky projekt është në zhvillim aktiv. Ndryshimet mund të ndodhin shpesh.
