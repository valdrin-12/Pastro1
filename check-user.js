const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function checkUser(email) {
  try {
    const user = await prisma.user.findUnique({
      where: { email: email },
      include: {
        company: true
      }
    })

    if (user) {
      console.log('\n✅ Përdoruesi u gjet:')
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
      console.log(`ID: ${user.id}`)
      console.log(`Email: ${user.email}`)
      console.log(`Role: ${user.role}`)
      console.log(`Krijuar më: ${user.createdAt}`)
      
      if (user.company) {
        console.log(`\n📦 Kompania:`)
        console.log(`   Emri: ${user.company.name}`)
        console.log(`   Status: ${user.company.status}`)
        console.log(`   Telefoni: ${user.company.phone}`)
      } else {
        console.log(`\n📦 Kompania: Nuk ka kompani të regjistruar`)
      }
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
    } else {
      console.log(`\n❌ Përdoruesi me email "${email}" nuk u gjet në databazë.\n`)
    }
  } catch (error) {
    console.error('Gabim:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Merr email-in si argument nga command line
const email = process.argv[2]

if (!email) {
  console.log('Përdorimi: node check-user.js <email>')
  console.log('Shembull: node check-user.js user@example.com')
  process.exit(1)
}

checkUser(email)

