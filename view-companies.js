#!/usr/bin/env node

/**
 * View all companies in PostgreSQL database
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function viewCompanies(statusFilter = null) {
  try {
    const statusText = statusFilter 
      ? (statusFilter === 'PENDING' ? 'Në Pritje' : 
         statusFilter === 'APPROVED' ? 'Të Miratuara' : 
         statusFilter === 'REJECTED' ? 'Të Refuzuara' : statusFilter)
      : 'Të Gjitha';
    
    console.log(`\n📊 Kompanitë ${statusText} në PostgreSQL:\n`);
    console.log('='.repeat(80));
    
    const where = statusFilter ? { status: statusFilter } : {};
    
    const companies = await prisma.company.findMany({
      where,
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
      console.log('❌ Nuk ka kompani të regjistruara në databazë.\n');
      return;
    }

    console.log(`\nGjithsej: ${companies.length} kompani\n`);
    console.log('-'.repeat(80));

    companies.forEach((company, index) => {
      console.log(`\n${index + 1}. ${company.name}`);
      console.log(`   ID: ${company.id}`);
      console.log(`   Email: ${company.user?.email || 'N/A'}`);
      console.log(`   Telefon: ${company.phone || 'N/A'}`);
      console.log(`   Status: ${company.status || 'N/A'}`);
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

    // Summary
    const stats = {
      total: companies.length,
      pending: companies.filter(c => c.status === 'PENDING').length,
      approved: companies.filter(c => c.status === 'APPROVED').length,
      rejected: companies.filter(c => c.status === 'REJECTED').length,
      active: companies.filter(c => c.isActive).length
    };

    console.log('\n📈 Statistika:');
    console.log(`   Total: ${stats.total}`);
    console.log(`   Në pritje: ${stats.pending}`);
    console.log(`   Të miratuara: ${stats.approved}`);
    console.log(`   Të refuzuara: ${stats.rejected}`);
    console.log(`   Aktive: ${stats.active}`);
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

// Get status filter from command line argument
const statusArg = process.argv[2];
let statusFilter = null;

if (statusArg) {
  const upperStatus = statusArg.toUpperCase();
  if (['PENDING', 'APPROVED', 'REJECTED'].includes(upperStatus)) {
    statusFilter = upperStatus;
  } else {
    console.log('❌ Status i pavlefshëm. Përdorni: PENDING, APPROVED, ose REJECTED');
    console.log('   Shembull: node view-companies.js REJECTED');
    process.exit(1);
  }
}

viewCompanies(statusFilter);

