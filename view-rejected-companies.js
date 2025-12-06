#!/usr/bin/env node

/**
 * View rejected companies in PostgreSQL database
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function viewRejectedCompanies() {
  try {
    console.log('\n❌ Kompanitë e Refuzuara në PostgreSQL:\n');
    console.log('='.repeat(80));
    
    const companies = await prisma.company.findMany({
      where: {
        status: 'REJECTED'
      },
      include: {
        user: {
          select: {
            email: true,
            firstName: true,
            lastName: true,
            fullName: true
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

    if (companies.length === 0) {
      console.log('✅ Nuk ka kompani të refuzuara në databazë.\n');
      return;
    }

    console.log(`\nGjithsej: ${companies.length} kompani të refuzuara\n`);
    console.log('-'.repeat(80));

    companies.forEach((company, index) => {
      console.log(`\n${index + 1}. ${company.name}`);
      console.log(`   ID: ${company.id}`);
      console.log(`   Email: ${company.user?.email || 'N/A'}`);
      console.log(`   Telefon: ${company.phone || 'N/A'}`);
      console.log(`   Status: ${company.status}`);
      console.log(`   Aktiv: ${company.isActive ? 'Po' : 'Jo'}`);
      console.log(`   Krijuar: ${company.createdAt.toLocaleString('sq-AL')}`);
      console.log(`   Përditësuar: ${company.updatedAt.toLocaleString('sq-AL')}`);
      
      if (company.description) {
        const desc = company.description.length > 100 
          ? company.description.substring(0, 100) + '...' 
          : company.description;
        console.log(`   Përshkrim: ${desc}`);
      }
      
      if (company.companyCities && company.companyCities.length > 0) {
        const cities = company.companyCities.map(cc => cc.city.name).join(', ');
        console.log(`   Qytetet: ${cities}`);
      }
      
      if (company.companyServices && company.companyServices.length > 0) {
        const services = company.companyServices
          .map(cs => `${cs.service.name} (${cs.price}€)`)
          .join(', ');
        console.log(`   Shërbimet: ${services}`);
      }
      
      console.log('-'.repeat(80));
    });

    console.log('\n');

  } catch (error) {
    console.error('❌ Gabim në leximin e kompanive:', error.message);
    if (error.code === 'P1001') {
      console.error('\n💡 Këshilla: Sigurohuni që PostgreSQL serveri është duke punuar dhe DATABASE_URL është i saktë në .env file.');
    }
  } finally {
    await prisma.$disconnect();
  }
}

viewRejectedCompanies();

