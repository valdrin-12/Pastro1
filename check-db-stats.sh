#!/bin/bash
# Script për të kontrolluar statistikat e databazës

export PATH="/Users/valdrinqerimi/.nvm/versions/node/v24.11.0/bin:$PATH"

cd "$(dirname "$0")"

echo "📊 Statistikat e Databazës PostgreSQL"
echo "======================================"
echo ""

# Check companies
echo "🏢 Kompani:"
node -e "
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
(async () => {
  const count = await prisma.company.count();
  console.log('   Total:', count);
  const byStatus = await prisma.company.groupBy({
    by: ['status'],
    _count: { id: true }
  });
  byStatus.forEach(s => console.log('   ' + s.status + ':', s._count.id));
  await prisma.\$disconnect();
})();
"

echo ""
echo "👥 Përdorues:"
node -e "
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
(async () => {
  const count = await prisma.user.count();
  console.log('   Total:', count);
  const byRole = await prisma.user.groupBy({
    by: ['role'],
    _count: { id: true }
  });
  byRole.forEach(r => console.log('   ' + r.role + ':', r._count.id));
  await prisma.\$disconnect();
})();
"

echo ""
echo "🔧 Shërbime:"
node -e "
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
(async () => {
  const count = await prisma.service.count();
  console.log('   Total:', count);
  await prisma.\$disconnect();
})();
"

echo ""
echo "🏙️  Qytete:"
node -e "
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
(async () => {
  const count = await prisma.city.count();
  console.log('   Total:', count);
  await prisma.\$disconnect();
})();
"

