// Add cities and services to companies DR and vvv
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function addCompanyData() {
  try {
    console.log('🔍 Adding cities and services to companies...\n');
    
    // Get companies
    const companies = await prisma.company.findMany({
      where: {
        user: {
          email: {
            in: ['dr@gmail.com', 'vvv@gmail.com']
          }
        }
      },
      include: {
        user: {
          select: {
            email: true
          }
        }
      }
    });
    
    if (companies.length === 0) {
      console.log('❌ No companies found');
      process.exit(1);
    }
    
    // Get or create Prishtinë city
    let prishtine = await prisma.city.findFirst({
      where: { name: 'Prishtinë' }
    });
    
    if (!prishtine) {
      prishtine = await prisma.city.create({
        data: { name: 'Prishtinë' }
      });
      console.log('✅ Created Prishtinë city');
    }
    
    // Get a service (Pastrimi i Shtëpisë or create one)
    let service = await prisma.service.findFirst({
      where: { name: 'Pastrimi i Shtëpisë' }
    });
    
    if (!service) {
      service = await prisma.service.findFirst();
      if (!service) {
        // Create a default service
        service = await prisma.service.create({
          data: { name: 'Pastrimi i Shtëpisë' }
        });
        console.log('✅ Created default service');
      }
    }
    
    for (const company of companies) {
      console.log(`\n📋 Processing: ${company.name} (${company.user.email})`);
      
      // Add city if not exists
      const existingCity = await prisma.companyCity.findFirst({
        where: {
          companyId: company.id,
          cityId: prishtine.id
        }
      });
      
      if (!existingCity) {
        await prisma.companyCity.create({
          data: {
            companyId: company.id,
            cityId: prishtine.id
          }
        });
        console.log('   ✅ Added Prishtinë city');
      } else {
        console.log('   ℹ️  Prishtinë city already exists');
      }
      
      // Add service if not exists
      const existingService = await prisma.companyService.findFirst({
        where: {
          companyId: company.id,
          serviceId: service.id
        }
      });
      
      if (!existingService) {
        await prisma.companyService.create({
          data: {
            companyId: company.id,
            serviceId: service.id,
            price: 25.00
          }
        });
        console.log(`   ✅ Added service "${service.name}" (25€)`);
      } else {
        console.log(`   ℹ️  Service "${service.name}" already exists`);
      }
    }
    
    // Verify
    console.log('\n🔍 Verifying updates...\n');
    const updatedCompanies = await prisma.company.findMany({
      where: {
        user: {
          email: {
            in: ['dr@gmail.com', 'vvv@gmail.com']
          }
        }
      },
      include: {
        companyCities: {
          include: {
            city: true
          }
        },
        companyServices: {
          include: {
            service: true
          }
        }
      }
    });
    
    updatedCompanies.forEach(company => {
      console.log(`✅ ${company.name}:`);
      console.log(`   Cities: ${company.companyCities.length}`);
      company.companyCities.forEach(cc => {
        console.log(`      - ${cc.city.name}`);
      });
      console.log(`   Services: ${company.companyServices.length}`);
      company.companyServices.forEach(cs => {
        console.log(`      - ${cs.service.name} (${cs.price}€)`);
      });
      console.log('');
    });
    
    console.log('✅ Companies updated successfully!');
    console.log('✅ They should now appear in the UI');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

addCompanyData();

