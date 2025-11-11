const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    // Get the most recently created company
    const latestCompany = await prisma.company.findFirst({
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        user: {
          select: {
            email: true
          }
        },
        companyCities: {
          include: {
            city: {
              select: {
                name: true
              }
            }
          }
        },
        companyServices: {
          include: {
            service: {
              select: {
                name: true
              }
            }
          }
        }
      }
    });

    if (latestCompany) {
      console.log('\n📋 Kompania e Fundit e Regjistruar:\n');
      console.log('─'.repeat(80));
      console.log(`ID: ${latestCompany.id}`);
      console.log(`Emri: ${latestCompany.name}`);
      console.log(`Email: ${latestCompany.user?.email || 'N/A'}`);
      console.log(`Telefoni: ${latestCompany.phone || 'N/A'}`);
      console.log(`Status: ${latestCompany.status}`);
      console.log(`Aktive: ${latestCompany.isActive ? '✅' : '❌'}`);
      console.log(`E krijuar: ${latestCompany.createdAt.toLocaleString()}`);
      
      if (latestCompany.companyCities && latestCompany.companyCities.length > 0) {
        console.log(`\nQytetet:`);
        latestCompany.companyCities.forEach(cc => {
          console.log(`  - ${cc.city.name}`);
        });
      }
      
      if (latestCompany.companyServices && latestCompany.companyServices.length > 0) {
        console.log(`\nShërbimet:`);
        latestCompany.companyServices.forEach(cs => {
          console.log(`  - ${cs.service.name} (Çmimi: ${cs.price}€)`);
        });
      }
      
      console.log('─'.repeat(80));
    } else {
      console.log('\n❌ Nuk u gjet asnjë kompani në databazë.\n');
    }

    // Also show all companies count
    const totalCompanies = await prisma.company.count();
    console.log(`\n📊 Total kompani në databazë: ${totalCompanies}\n`);

  } catch (e) {
    console.error('❌ Gabim:', e);
  } finally {
    await prisma.$disconnect();
  }
}

main();

