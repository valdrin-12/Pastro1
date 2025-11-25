const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

// Users from localStorage (copy from browser console)
const localUsers = [
  { firstName: 'Titi', lastName: 'User', email: 'titi@gmail.com', password: '123456' },
  { firstName: 'Tc', lastName: 'User', email: 'tc@gmail.com', password: '123456' },
  { firstName: 'Tn1', lastName: 'User', email: 'tn1@gmail.com', password: '123456' },
  { firstName: 'Tmn', lastName: 'User', email: 'tmn@gmail.com', password: '123456' },
  { firstName: 'Tbt', lastName: 'User', email: 'tbt@gmail.com', password: '123456' }
];

async function syncUsers() {
  console.log('🔄 Starting to sync users to PostgreSQL...\n');
  
  for (const userData of localUsers) {
    try {
      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email: userData.email }
      });
      
      if (existingUser) {
        console.log(`⏭️  User ${userData.email} already exists in database. Skipping...`);
        continue;
      }
      
      // Hash password
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      
      // Create user with USER role
      const user = await prisma.user.create({
        data: {
          email: userData.email,
          password: hashedPassword,
          firstName: userData.firstName || null,
          lastName: userData.lastName || null,
          fullName: userData.name || [userData.firstName, userData.lastName].filter(Boolean).join(' ').trim() || null,
          role: 'USER'
        }
      });
      
      console.log(`✅ User created: ${user.email} (ID: ${user.id}, Role: ${user.role})`);
    } catch (error) {
      console.error(`❌ Error creating user ${userData.email}:`, error.message);
    }
  }
  
  console.log('\n✨ Sync completed!');
  await prisma.$disconnect();
}

syncUsers().catch(console.error);

