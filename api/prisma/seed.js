// Seed script — creates full demo data for all modules
// Run: node prisma/seed.js
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...\n');

  // 1. Create Tenant
  const tenant = await prisma.tenant.upsert({
    where: { subdomain: 'demo' },
    update: {},
    create: {
      name: 'Demo Restaurant Group',
      subdomain: 'demo',
      plan: 'ENTERPRISE',
      logo: null,
      isActive: true,
      planFeatures: { maxOutlets: 999, maxProducts: 99999, maxUsers: 9999 },
      themeSettings: { primaryColor: '#06b6d4', mode: 'dark' }
    }
  });
  console.log('✅ Tenant:', tenant.name);

  // 2. Create users for every role
  const password = await bcrypt.hash('sharjeel123', 12);

  const adminEmail = 'sharjeel@galaxyexpress.pk';
  const superAdmin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: { isActive: true, status: 'APPROVED', role: 'SUPER_ADMIN' },
    create: { 
      email: adminEmail, 
      name: 'Sharjeel Khan (Super Admin)', 
      password, 
      role: 'SUPER_ADMIN', 
      tenantId: null,
      isActive: true,
      status: 'APPROVED'
    }
  });

  console.log('✅ Master Super Admin created:', adminEmail);
  console.log('🎉 Production Seed completed!');
}

main()
  .then(() => prisma.$disconnect())
  .catch(e => { console.error(e); prisma.$disconnect(); process.exit(1); });
