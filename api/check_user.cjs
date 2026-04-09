const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const email = 'sharjeel@galaxyexpress.pk';
  const user = await prisma.user.findUnique({ where: { email } });
  if (user) {
    console.log('USER_FOUND:', JSON.stringify({
      id: user.id,
      email: user.email,
      role: user.role,
      status: user.status,
      isActive: user.isActive,
      hasPassword: !!user.password
    }));
  } else {
    console.log('USER_NOT_FOUND');
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
