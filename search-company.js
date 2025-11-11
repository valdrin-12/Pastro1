const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get search term from command line argument
const searchTerm = process.argv[2];

async function main() {
  try {
    let companies;
    
    if (searchTerm) {
      // Search by name or email
      companies = await prisma.company.findMany({
        where: {
          OR: [
            { name: { contains: searchTerm, mode: 'insensitive' } },
            { user: { email: { contains: searchTerm, mode: 'insensitive' } } }
          ]
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
        },
        orderBy: {
          createdAt: 'desc'
        }
      });
      
      console.log(`\n🔍 Rezultatet e kërkimit për "${searchTerm}":\n`);
    } else {
      // Get all companies
      companies = await prisma.company.findMany({
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
        },
        orderBy: {
          createdAt: 'desc'
        }
      });
      
      console.log(`\n📋 Të gjitha kompanitë:\n`);
    }

    if (companies.length > 0) {
      companies.forEach((company, index) => {
        console.log('─'.repeat(80));
        console.log(`${index + 1}. ${company.name}`);
        console.log(`   ID: ${company.id}`);
        console.log(`   Email: ${company.user?.email || 'N/A'}`);
        console.log(`   Telefoni: ${company.phone || 'N/A'}`);
        console.log(`   Status: ${company.status}`);
        console.log(`   Aktive: ${company.isActive ? '✅' : '❌'}`);
        console.log(`   E krijuar: ${company.createdAt.toLocaleString()}`);
        
        if (company.companyCities && company.companyCities.length > 0) {
          console.log(`   Qytetet: ${company.companyCities.map(cc => cc.city.name).join(', ')}`);
        }
        
        if (company.companyServices && company.companyServices.length > 0) {
          console.log(`   Shërbimet: ${company.companyServices.map(cs => `${cs.service.name} (${cs.price}€)`).join(', ')}`);
        }
      });
      console.log('─'.repeat(80));
      console.log(`\n📊 Total: ${companies.length} kompani\n`);
    } else {
      console.log('❌ Nuk u gjet asnjë kompani.\n');
    }

  } catch (e) {
    console.error('❌ Gabim:', e);
  } finally {
    await prisma.$disconnect();
  }
}

main();

