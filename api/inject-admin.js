import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
dotenv.config();

const prisma = new PrismaClient();

async function inject() {
    const email = 'sharjeel@galaxyexpress.pk';
    const password = await bcrypt.hash('sharjeel72930011#', 12);
    
    console.log(`🚀 Injecting/Updating Super Admin: ${email}...`);
    
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
            name: 'Sharjeel Khan (Super Admin)',
            password,
            role: 'SUPER_ADMIN',
            status: 'APPROVED',
            isActive: true,
            tenantId: null
        }
    });
    
    console.log('✅ Injection Successful:', user.email);
    process.exit(0);
}

inject().catch(err => {
    console.error('❌ Injection Failed:', err);
    process.exit(1);
});
