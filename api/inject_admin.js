import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const email = 'sharjeel@galaxyexpress.pk';
  const password = await bcrypt.hash('sharjeel72930011#', 12);
  
  const user = await prisma.user.upsert({
    where: { email },
    update: {
      password,
      role: 'SUPER_ADMIN',
      status: 'APPROVED',
      isActive: true
    },
    create: {
      email,
      password,
      name: 'Sharjeel - Galaxy Express Super Admin',
      role: 'SUPER_ADMIN',
      status: 'APPROVED',
      isActive: true
    }
  });

  console.log('✅ Master Admin Updated Success:', user.email);
}

main()
  .catch(e => {
    console.error('❌ Update Failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
