const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🔍 Approving companies with cities and services...\n');

  try {
    // Get all PENDING companies with their cities and services
    const pendingCompanies = await prisma.company.findMany({
      where: { status: 'PENDING' },
      include: {
        companyCities: true,
        companyServices: true
      }
    });

    console.log(`Found ${pendingCompanies.length} PENDING companies\n`);

    let approvedCount = 0;
    for (const company of pendingCompanies) {
      const hasCities = company.companyCities.length > 0;
      const hasServices = company.companyServices.length > 0;

      if (hasCities && hasServices) {
        await prisma.company.update({
          where: { id: company.id },
          data: { status: 'APPROVED' }
        });
        console.log(`✅ Approved: ${company.name} (${company.companyCities.length} cities, ${company.companyServices.length} services)`);
        approvedCount++;
      } else {
        console.log(`⏳ Skipped: ${company.name} (${company.companyCities.length} cities, ${company.companyServices.length} services)`);
      }
    }

    console.log(`\n📊 Summary:`);
    console.log(`   Approved: ${approvedCount}`);
    console.log(`   Still PENDING: ${pendingCompanies.length - approvedCount}`);

    // Show approved companies
    const approvedCompanies = await prisma.company.findMany({
      where: { status: 'APPROVED', isActive: true },
      include: {
        companyCities: { include: { city: true } },
        companyServices: { include: { service: true } }
      },
      orderBy: { createdAt: 'desc' },
      take: 5
    });

    console.log(`\n✅ Latest APPROVED companies (should appear in UI):`);
    approvedCompanies.forEach(c => {
      const cities = c.companyCities.map(cc => cc.city.name).join(', ') || 'None';
      const services = c.companyServices.map(cs => cs.service.name).join(', ') || 'None';
      console.log(`   - ${c.name}: ${cities} | ${services}`);
    });

  } catch (e) {
    console.error('Error:', e);
  } finally {
    await prisma.$disconnect();
  }
}

main();

