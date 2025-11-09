# Komanda për Kontrollimin e Databazës PostgreSQL

## Komanda Bazë

### 1. Lidhja me Databazën
```bash
psql -U valdrinqerimi -d pastro_db
```

### 2. Lista e Të Gjitha Databazave
```bash
psql -U valdrinqerimi -l
```

### 3. Kontrollimi i Versionit të PostgreSQL
```bash
psql -U valdrinqerimi -d pastro_db -c "SELECT version();"
```

## Komanda për Kompanitë

### Numri i Kompanive
```bash
psql -U valdrinqerimi -d pastro_db -c "SELECT COUNT(*) FROM companies;"
```

### Lista e Të Gjitha Kompanive
```bash
psql -U valdrinqerimi -d pastro_db -c "SELECT id, name, status, \"isActive\" FROM companies;"
```

### Kompanitë me Status APPROVED
```bash
psql -U valdrinqerimi -d pastro_db -c "SELECT id, name, status FROM companies WHERE status = 'APPROVED';"
```

### Kompanitë me Status PENDING
```bash
psql -U valdrinqerimi -d pastro_db -c "SELECT id, name, status FROM companies WHERE status = 'PENDING';"
```

### Detajet e Kompanisë DR
```bash
psql -U valdrinqerimi -d pastro_db -c "SELECT c.id, c.name, c.status, c.\"isActive\", u.email FROM companies c JOIN users u ON c.\"userId\" = u.id WHERE u.email = 'dr@gmail.com';"
```

### Detajet e Kompanisë vvv
```bash
psql -U valdrinqerimi -d pastro_db -c "SELECT c.id, c.name, c.status, c.\"isActive\", u.email FROM companies c JOIN users u ON c.\"userId\" = u.id WHERE u.email = 'vvv@gmail.com';"
```

### Kompanitë me Qytete dhe Shërbime
```bash
psql -U valdrinqerimi -d pastro_db -c "
SELECT 
    c.name,
    COUNT(DISTINCT cc.\"cityId\") as cities_count,
    COUNT(DISTINCT cs.\"serviceId\") as services_count
FROM companies c
LEFT JOIN company_cities cc ON c.id = cc.\"companyId\"
LEFT JOIN company_services cs ON c.id = cs.\"companyId\"
GROUP BY c.id, c.name
ORDER BY c.name;
"
```

## Komanda për Përdoruesit

### Numri i Përdoruesve
```bash
psql -U valdrinqerimi -d pastro_db -c "SELECT COUNT(*) FROM users;"
```

### Lista e Përdoruesve
```bash
psql -U valdrinqerimi -d pastro_db -c "SELECT id, email, role FROM users;"
```

### Përdoruesit me Rol COMPANY
```bash
psql -U valdrinqerimi -d pastro_db -c "SELECT id, email, role FROM users WHERE role = 'COMPANY';"
```

## Komanda për Shërbimet

### Numri i Shërbimeve
```bash
psql -U valdrinqerimi -d pastro_db -c "SELECT COUNT(*) FROM services;"
```

### Lista e Shërbimeve
```bash
psql -U valdrinqerimi -d pastro_db -c "SELECT id, name FROM services;"
```

## Komanda për Qytetet

### Numri i Qyteteve
```bash
psql -U valdrinqerimi -d pastro_db -c "SELECT COUNT(*) FROM cities;"
```

### Lista e Qyteteve
```bash
psql -U valdrinqerimi -d pastro_db -c "SELECT id, name FROM cities ORDER BY name;"
```

## Komanda për Statistikat e Përgjithshme

### Statistikat e Plotë
```bash
psql -U valdrinqerimi -d pastro_db -c "
SELECT 
    'Users' as table_name, COUNT(*) as count FROM users
UNION ALL
SELECT 
    'Companies' as table_name, COUNT(*) as count FROM companies
UNION ALL
SELECT 
    'Services' as table_name, COUNT(*) as count FROM services
UNION ALL
SELECT 
    'Cities' as table_name, COUNT(*) as count FROM cities
UNION ALL
SELECT 
    'Service Categories' as table_name, COUNT(*) as count FROM service_categories;
"
```

### Kompanitë sipas Statusit
```bash
psql -U valdrinqerimi -d pastro_db -c "
SELECT 
    status,
    COUNT(*) as count
FROM companies
GROUP BY status
ORDER BY count DESC;
"

## Komanda për Ndryshimin e Statusit

### Ndrysho Statusin e Kompanisë në APPROVED
```bash
psql -U valdrinqerimi -d pastro_db -c "
UPDATE companies 
SET status = 'APPROVED' 
WHERE id IN (
    SELECT c.id 
    FROM companies c 
    JOIN users u ON c.\"userId\" = u.id 
    WHERE u.email IN ('dr@gmail.com', 'vvv@gmail.com')
);
"
```

### Ndrysho Statusin e Kompanisë në PENDING
```bash
psql -U valdrinqerimi -d pastro_db -c "
UPDATE companies 
SET status = 'PENDING' 
WHERE id = 'COMPANY_ID_HERE';
"
```

## Komanda për Tabelat

### Lista e Të Gjitha Tabelave
```bash
psql -U valdrinqerimi -d pastro_db -c "\dt"
```

### Struktura e Tabelës
```bash
psql -U valdrinqerimi -d pastro_db -c "\d companies"
```

### Struktura e Të Gjitha Tabelave
```bash
psql -U valdrinqerimi -d pastro_db -c "\d+"
```

## Komanda për Prisma (Alternative)

### Kontrollo Kompanitë me Prisma
```bash
export PATH="/Users/valdrinqerimi/.nvm/versions/node/v24.11.0/bin:$PATH"
node -e "const {PrismaClient} = require('@prisma/client'); const p = new PrismaClient(); p.company.count().then(c => {console.log('Total:', c); p.\$disconnect();});"
```

### Lista e Kompanive me Prisma
```bash
export PATH="/Users/valdrinqerimi/.nvm/versions/node/v24.11.0/bin:$PATH"
node check-companies.js
```

### Statistikat me Prisma
```bash
export PATH="/Users/valdrinqerimi/.nvm/versions/node/v24.11.0/bin:$PATH"
./check-db-stats.sh
```

## Komanda për Backup dhe Restore

### Backup i Databazës
```bash
pg_dump -U valdrinqerimi -d pastro_db > backup_$(date +%Y%m%d_%H%M%S).sql
```

### Restore i Databazës
```bash
psql -U valdrinqerimi -d pastro_db < backup_file.sql
```

## Shënime

- Nëse `psql` nuk është në PATH, përdorni path të plotë ose shtoni në PATH
- Për macOS me Homebrew: `/opt/homebrew/bin/psql` ose `/usr/local/bin/psql`
- Për të kontrolluar nëse PostgreSQL është duke punuar: `pg_isready -h localhost -p 5432`

