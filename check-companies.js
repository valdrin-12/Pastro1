// Check companies in database
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkCompanies() {
  try {
    // Count total companies
    const totalCompanies = await prisma.company.count();
    console.log(`\n📊 Total Companies: ${totalCompanies}\n`);
    
    // Get companies with details
    const companies = await prisma.company.findMany({
      select: {
        id: true,
        name: true,
        phone: true,
        status: true,
        isActive: true,
        createdAt: true,
        user: {
          select: {
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    if (companies.length > 0) {
      console.log('📋 Lista e Kompanive:\n');
      console.log('─'.repeat(80));
      companies.forEach((company, index) => {
        console.log(`${index + 1}. ${company.name}`);
        console.log(`   Email: ${company.user?.email || 'N/A'}`);
        console.log(`   Phone: ${company.phone || 'N/A'}`);
        console.log(`   Status: ${company.status}`);
        console.log(`   Active: ${company.isActive ? '✅' : '❌'}`);
        console.log(`   Created: ${company.createdAt.toLocaleDateString()}`);
        console.log('─'.repeat(80));
      });
    } else {
      console.log('Nuk ka kompani në databazë.');
    }
    
    // Statistics by status
    const byStatus = await prisma.company.groupBy({
      by: ['status'],
      _count: {
        id: true
      }
    });
    
    console.log('\n📈 Statistikat sipas Statusit:\n');
    byStatus.forEach(stat => {
      console.log(`   ${stat.status}: ${stat._count.id}`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

checkCompanies();

