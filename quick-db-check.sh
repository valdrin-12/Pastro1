#!/bin/bash
# Quick database check script

export PATH="/Users/valdrinqerimi/.nvm/versions/node/v24.11.0/bin:$PATH"

echo "📊 Quick Database Check"
echo "======================"
echo ""

# Check if psql is available
PSQL_PATH=$(which psql 2>/dev/null || find /usr/local/bin /opt/homebrew/bin ~/Library/PostgreSQL* -name psql 2>/dev/null | head -1)

if [ -z "$PSQL_PATH" ]; then
    echo "⚠️  psql not found. Using Prisma instead..."
    echo ""
    
    # Use Prisma to check
    node -e "
    const {PrismaClient} = require('@prisma/client');
    const p = new PrismaClient();
    (async () => {
        const users = await p.user.count();
        const companies = await p.company.count();
        const approved = await p.company.count({where: {status: 'APPROVED'}});
        const pending = await p.company.count({where: {status: 'PENDING'}});
        const services = await p.service.count();
        const cities = await p.city.count();
        
        console.log('👥 Users:', users);
        console.log('🏢 Companies:', companies);
        console.log('   ✅ Approved:', approved);
        console.log('   ⏳ Pending:', pending);
        console.log('🔧 Services:', services);
        console.log('🏙️  Cities:', cities);
        
        await p.\$disconnect();
    })();
    "
else
    echo "✅ Using psql: $PSQL_PATH"
    echo ""
    
    # Use psql
    $PSQL_PATH -U valdrinqerimi -d pastro_db -c "
    SELECT 
        'Users' as type, COUNT(*)::text as count FROM users
    UNION ALL
    SELECT 
        'Companies (Total)' as type, COUNT(*)::text FROM companies
    UNION ALL
    SELECT 
        'Companies (Approved)' as type, COUNT(*)::text FROM companies WHERE status = 'APPROVED'
    UNION ALL
    SELECT 
        'Companies (Pending)' as type, COUNT(*)::text FROM companies WHERE status = 'PENDING'
    UNION ALL
    SELECT 
        'Services' as type, COUNT(*)::text FROM services
    UNION ALL
    SELECT 
        'Cities' as type, COUNT(*)::text FROM cities;
    " 2>&1
fi

