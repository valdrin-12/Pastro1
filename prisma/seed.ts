import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Create Kosovo cities
  const cities = [
    'Prishtina',
    'Prizren', 
    'Gjakova',
    'Peja',
    'Ferizaj',
    'Gjilan',
    'Mitrovica',
    'Vushtrri',
    'Podujeva',
    'Rahovec',
    'Lipjan',
    'Malisheva',
    'Suhareka',
    'Kamenica',
    'Viti',
    'Skenderaj',
    'Istog',
    'Kline',
    'Dragash',
    'Shtime',
    'Kacanik',
    'Novoberde',
    'Hani i Elezit',
    'Junik',
    'Mamusha',
    'Partesh',
    'Ranillug',
    'Gracanica',
    'Artana',
    'Zubin Potok',
    'Zvecan'
  ]

  for (const cityName of cities) {
    await prisma.city.upsert({
      where: { name: cityName },
      update: {},
      create: { name: cityName }
    })
  }

  // Create service categories
  const categories = [
    {
      name: 'Pastrime Shtëpiake / Rezidenciale',
      description: 'Mbaj shtëpinë tënde gjithmonë të pastër, të freskët dhe mikpritëse.',
      icon: '🏠',
      order: 1
    },
    {
      name: 'Pastrime Komerciale / Zyrash',
      description: 'Krijoni një ambient profesional dhe të pastër për punonjësit dhe klientët tuaj.',
      icon: '🏢',
      order: 2
    },
    {
      name: 'Pastrime Pas Ndërtimit',
      description: 'Heq pluhurin dhe mbeturinat pas punimeve ndërtimore apo rinovuese.',
      icon: '🏗️',
      order: 3
    },
    {
      name: 'Pastrime Speciale',
      description: 'Kujdes i thellë për sipërfaqe dhe pajisje të veçanta.',
      icon: '🚗',
      order: 4
    },
    {
      name: 'Pastrime për Biznese të Veçanta',
      description: 'Ne përshtatim shërbimet tona sipas industrisë suaj.',
      icon: '🏨',
      order: 5
    },
    {
      name: 'Pastrime Ekologjike',
      description: 'Kujdes për pastërtinë dhe për mjedisin!',
      icon: '🌿',
      order: 6
    }
  ]

  const createdCategories = []
  for (const category of categories) {
    const created = await prisma.serviceCategory.upsert({
      where: { name: category.name },
      update: {},
      create: category
    })
    createdCategories.push(created)
  }

  // Create services organized by category
  const services = [
    // Pastrime Shtëpiake / Rezidenciale
    {
      name: 'Pastrim i përgjithshëm (dritare, dysheme, mobilje)',
      description: 'Pastrim i plotë i shtëpisë duke përfshirë dritaret, dyshemetë dhe mobiljet',
      categoryName: 'Pastrime Shtëpiake / Rezidenciale'
    },
    {
      name: 'Pastrim i thellë sezonal',
      description: 'Pastrim i thellë sezonal për të pastruar çdo cep të shtëpisë',
      categoryName: 'Pastrime Shtëpiake / Rezidenciale'
    },
    {
      name: 'Pastrim pas festave apo eventeve',
      description: 'Pastrim profesional pas festave dhe eventeve',
      categoryName: 'Pastrime Shtëpiake / Rezidenciale'
    },
    {
      name: 'Pastrim pas zhvendosjes (hyrje / dalje)',
      description: 'Pastrim i plotë për shtëpi të reja ose pas zhvendosjes',
      categoryName: 'Pastrime Shtëpiake / Rezidenciale'
    },
    {
      name: 'Organizim hapësirash dhe garderobash',
      description: 'Organizim dhe pastrim i garderobave dhe hapësirave të tjera',
      categoryName: 'Pastrime Shtëpiake / Rezidenciale'
    },

    // Pastrime Komerciale / Zyrash
    {
      name: 'Pastrim i përditshëm ose javor i zyrave',
      description: 'Pastrim i rregullt ditor ose javor i ambienteve të zyrës',
      categoryName: 'Pastrime Komerciale / Zyrash'
    },
    {
      name: 'Larje xhamash dhe dritaresh',
      description: 'Larje profesionale e xhamave dhe dritareve të zyrës',
      categoryName: 'Pastrime Komerciale / Zyrash'
    },
    {
      name: 'Dezinfektim i hapësirave të përbashkëta',
      description: 'Dezinfektim i plotë i hapësirave të përbashkëta',
      categoryName: 'Pastrime Komerciale / Zyrash'
    },
    {
      name: 'Pastrim i tapeteve, dyshemeve dhe mobiljeve',
      description: 'Pastrim i thellë i tapeteve, dyshemeve dhe mobiljeve të zyrës',
      categoryName: 'Pastrime Komerciale / Zyrash'
    },
    {
      name: 'Pastrim i ambienteve të pritjes dhe sallave të mbledhjeve',
      description: 'Pastrim i ambienteve të pritjes dhe sallave të mbledhjeve',
      categoryName: 'Pastrime Komerciale / Zyrash'
    },

    // Pastrime Pas Ndërtimit
    {
      name: 'Pastrim i pluhurit, mbetjeve dhe bojës',
      description: 'Heqje e plotë e pluhurit, mbetjeve dhe bojës pas ndërtimit',
      categoryName: 'Pastrime Pas Ndërtimit'
    },
    {
      name: 'Larje e dritareve dhe kornizave',
      description: 'Larje e plotë e dritareve dhe kornizave pas ndërtimit',
      categoryName: 'Pastrime Pas Ndërtimit'
    },
    {
      name: 'Dezinfektim i plotë pas punimeve',
      description: 'Dezinfektim i plotë i ambientit pas punimeve ndërtimore',
      categoryName: 'Pastrime Pas Ndërtimit'
    },
    {
      name: 'Përgatitje e hapësirës për përdorim',
      description: 'Përgatitje e plotë e hapësirës për përdorim pas ndërtimit',
      categoryName: 'Pastrime Pas Ndërtimit'
    },

    // Pastrime Speciale
    {
      name: 'Pastrim profesional i divanëve dhe tapicerive',
      description: 'Pastrim i thellë i divanëve dhe tapicerive me teknika profesionale',
      categoryName: 'Pastrime Speciale'
    },
    {
      name: 'Larje tapetesh dhe qilimash',
      description: 'Larje profesionale e tapeteve dhe qilimave',
      categoryName: 'Pastrime Speciale'
    },
    {
      name: 'Pastrim me avull ose ozon',
      description: 'Pastrim i thellë me avull ose ozon për dezinfektim të plotë',
      categoryName: 'Pastrime Speciale'
    },
    {
      name: 'Pastrim dhe aromatizim i makinave (auto detailing)',
      description: 'Pastrim dhe aromatizim profesional i makinave',
      categoryName: 'Pastrime Speciale'
    },

    // Pastrime për Biznese të Veçanta
    {
      name: 'Pastrim hotelesh dhe apartamenteve me qira',
      description: 'Pastrim profesional për hotele dhe apartamente me qira',
      categoryName: 'Pastrime për Biznese të Veçanta'
    },
    {
      name: 'Pastrim klinikash dhe ambienteve mjekësore',
      description: 'Pastrim me standarde të larta higjiene për ambiente mjekësore',
      categoryName: 'Pastrime për Biznese të Veçanta'
    },
    {
      name: 'Pastrim restorantesh dhe bareve',
      description: 'Pastrim profesional për restorante dhe bare',
      categoryName: 'Pastrime për Biznese të Veçanta'
    },
    {
      name: 'Pastrim palestrash dhe qendrave sportive',
      description: 'Pastrim dhe dezinfektim i palestrave dhe qendrave sportive',
      categoryName: 'Pastrime për Biznese të Veçanta'
    },

    // Pastrime Ekologjike
    {
      name: 'Pastrim me produkte natyrale dhe eco-friendly',
      description: 'Pastrim me produkte natyrale dhe miqësore me mjedisin',
      categoryName: 'Pastrime Ekologjike'
    },
    {
      name: 'Pastrim pa kimikate të forta',
      description: 'Pastrim pa përdorim të kimikateve të forta',
      categoryName: 'Pastrime Ekologjike'
    },
    {
      name: 'Aromatizim me esenca natyrale',
      description: 'Aromatizim i ambientit me esenca natyrale',
      categoryName: 'Pastrime Ekologjike'
    }
  ]

  for (const service of services) {
    const category = createdCategories.find(c => c.name === service.categoryName)
    await prisma.service.upsert({
      where: { name: service.name },
      update: {
        description: service.description,
        categoryId: category?.id
      },
      create: {
        name: service.name,
        description: service.description,
        categoryId: category?.id
      }
    })
  }

  // Create admin user
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@pastro.com' },
    update: {},
    create: {
      email: 'admin@pastro.com',
      password: '$2a$10$K7L1OJ45/4Y2nIvhRVpCe.FSmhDdWoXehVzJByJp1Dn8Kj8Kj8Kj8', // password: admin123
      role: 'ADMIN'
    }
  })

  console.log('Database seeded successfully!')
  console.log('Admin user created: admin@pastro.com / admin123')
  console.log(`Created ${createdCategories.length} service categories`)
  console.log(`Created ${services.length} services`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
