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
  const password = await bcrypt.hash('password123', 12);

  const usersData = [
    { email: 'super@admin.com', name: 'Super Admin', role: 'SUPER_ADMIN', tenantId: null },
    { email: 'admin@demo.com', name: 'Tenant Admin', role: 'TENANT_ADMIN', tenantId: tenant.id },
    { email: 'manager@demo.com', name: 'Floor Manager', role: 'MANAGER', tenantId: tenant.id },
    { email: 'cashier@demo.com', name: 'Jane Cashier', role: 'CASHIER', tenantId: tenant.id },
    { email: 'waiter@demo.com', name: 'Tom Waiter', role: 'WAITER', tenantId: tenant.id },
    { email: 'kitchen@demo.com', name: 'Chef Ali', role: 'KITCHEN', tenantId: tenant.id },
    { email: 'vendor@demo.com', name: 'Fresh Supplies Co', role: 'VENDOR', tenantId: tenant.id },
    { email: 'rider@demo.com', name: 'Fast Rider Ahmed', role: 'RIDER', tenantId: tenant.id },
    { email: 'customer@demo.com', name: 'Customer Sara', role: 'CUSTOMER', tenantId: tenant.id, phone: '+923001234567' },
    { email: 'hr@demo.com', name: 'HR Manager', role: 'HR_ADMIN', tenantId: tenant.id },
  ];

  const users = {};
  for (const u of usersData) {
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: { ...u, password }
    });
    users[u.role] = user;
  }
  console.log('✅ Users created (all passwords: password123)');

  // 3. Outlets with geolocation
  const outlet1 = await prisma.outlet.create({
    data: { tenantId: tenant.id, name: 'Main Branch', address: '123 Food Street, Downtown', phone: '+92300111222', lat: 24.8607, lng: 67.0011, taxRate: 10, serviceChg: 5, serviceChgType: 'PERCENTAGE' }
  });
  const outlet2 = await prisma.outlet.create({
    data: { tenantId: tenant.id, name: 'Mall Outlet', address: '456 Mall Road, DHA Phase 6', phone: '+92300333444', lat: 24.8150, lng: 67.0300, taxRate: 10, serviceChg: 100, serviceChgType: 'FIXED' }
  });
  console.log('✅ 2 Outlets created');

  // 4. Tables
  for (let i = 1; i <= 8; i++) {
    await prisma.table.create({
      data: { outletId: outlet1.id, name: `Table ${i}`, capacity: i <= 4 ? 4 : (i <= 6 ? 2 : 6), section: i <= 4 ? 'Indoor' : 'Outdoor', isOccupied: i <= 2 }
    });
  }
  console.log('✅ 8 Tables created');

  // 5. KDS Stations
  await prisma.kdsStation.create({ data: { outletId: outlet1.id, name: 'Grill Station', categories: 'Burgers,Mains' } });
  await prisma.kdsStation.create({ data: { outletId: outlet1.id, name: 'Fryer', categories: 'Sides' } });
  await prisma.kdsStation.create({ data: { outletId: outlet1.id, name: 'Cold Station', categories: 'Drinks,Desserts' } });
  console.log('✅ 3 KDS Stations created');

  // 6. Vendor Profile
  const vendorProfile = await prisma.vendorProfile.create({
    data: { userId: users.VENDOR.id, businessName: 'Fresh Supplies Co', cnic: '42201-1234567-8', license: 'FBR-12345', bankName: 'HBL', bankAccount: '1234567890', bankIban: 'PK36HABB0000011234567890', isVerified: true, verificationStatus: 'APPROVED', commissionType: 'PERCENTAGE', commissionValue: 10 }
  });
  console.log('✅ Vendor profile created');

  // 7. Rider Profile
  const riderProfile = await prisma.riderProfile.create({
    data: { userId: users.RIDER.id, vehicleType: 'Motorcycle', vehiclePlate: 'KHI-1234', cnic: '42201-7654321-0', license: 'DL-67890', bankName: 'JazzCash', bankAccount: '03001234567', isVerified: true, verificationStatus: 'APPROVED', isAvailable: true, currentLat: 24.8607, currentLng: 67.0011 }
  });
  console.log('✅ Rider profile created');

  // 8. Customer Profile + Wallet
  await prisma.customerProfile.create({
    data: { userId: users.CUSTOMER.id, savedAddress: '789 Customer Lane, Clifton', addressLat: 24.8200, addressLng: 67.0300, loyaltyPoints: 250 }
  });
  await prisma.wallet.create({ data: { userId: users.CUSTOMER.id, balance: 500 } });
  console.log('✅ Customer profile + wallet created');

  // 9. Products with variants and modifiers
  const products = [
    { name: 'Neon Burger', sku: 'NB-001', category: 'Burgers', price: 12.99, cost: 5.50, mods: [{ name: 'Extra Cheese', price: 2 }, { name: 'Extra Patty', price: 4 }], vars: [{ name: 'Regular', price: 12.99 }, { name: 'Large', price: 16.99 }] },
    { name: 'Cyber Fries', sku: 'CF-002', category: 'Sides', price: 5.99, cost: 1.80, mods: [{ name: 'Loaded', price: 3 }], vars: [] },
    { name: 'Quantum Cola', sku: 'QC-003', category: 'Drinks', price: 3.50, cost: 0.80, mods: [], vars: [{ name: 'Regular', price: 3.50 }, { name: 'Large', price: 5.00 }] },
    { name: 'Plasma Pizza', sku: 'PP-004', category: 'Mains', price: 16.00, cost: 6.00, mods: [{ name: 'Olives', price: 1.50 }, { name: 'Jalapeños', price: 1 }], vars: [{ name: 'Medium', price: 16 }, { name: 'Family', price: 28 }] },
    { name: 'Holo Salad', sku: 'HS-005', category: 'Starters', price: 8.50, cost: 3.20, mods: [], vars: [] },
    { name: 'Galactic Shake', sku: 'GS-006', category: 'Desserts', price: 6.50, cost: 2.00, mods: [{ name: 'Whipped Cream', price: 1 }], vars: [] },
    { name: 'Nebula Wings', sku: 'NW-007', category: 'Starters', price: 10.99, cost: 4.50, mods: [{ name: 'BBQ Sauce', price: 0.50 }], vars: [] },
    { name: 'Solar Wrap', sku: 'SW-008', category: 'Mains', price: 13.50, cost: 5.00, mods: [], vars: [] },
    { name: 'Flour 50kg', sku: 'RM-001', category: 'Raw Material', price: 0, cost: 45.00, isRaw: true },
    { name: 'Cooking Oil 5L', sku: 'RM-002', category: 'Raw Material', price: 0, cost: 12.00, isRaw: true },
  ];

  for (const p of products) {
    const prod = await prisma.product.upsert({
      where: { sku: p.sku },
      update: {},
      create: {
        tenantId: tenant.id,
        name: p.name, sku: p.sku, category: p.category, price: p.price, cost: p.cost,
        isRawMaterial: p.isRaw || false,
        vendorId: p.isRaw ? vendorProfile.id : undefined,
        modifiers: p.mods?.length ? { create: p.mods } : undefined,
        variants: p.vars?.length ? { create: p.vars } : undefined,
      }
    });
    // Stock at both outlets
    for (const ol of [outlet1, outlet2]) {
      await prisma.stock.create({
        data: { productId: prod.id, outletId: ol.id, quantity: Math.floor(Math.random() * 100) + 20, lowThreshold: 10 }
      }).catch(() => {});
    }
  }
  console.log('✅ 10 Products + Stock + Modifiers + Variants created');

  // 10. Coupons
  await prisma.coupon.create({
    data: { tenantId: tenant.id, code: 'WELCOME50', type: 'PERCENTAGE', value: 50, maxDiscount: 500, usageLimit: 100, validTo: new Date('2027-12-31') }
  });
  await prisma.coupon.create({
    data: { tenantId: tenant.id, code: 'FLAT100', type: 'FIXED', value: 100, minOrderAmount: 500 }
  });
  console.log('✅ 2 Coupons created (WELCOME50, FLAT100)');

  // 11. Banners
  await prisma.banner.create({ data: { tenantId: tenant.id, title: '🎉 Grand Opening — 50% Off!', position: 1 } });
  await prisma.banner.create({ data: { tenantId: tenant.id, title: '🚀 Free Delivery This Weekend', position: 2 } });
  await prisma.banner.create({ data: { tenantId: tenant.id, title: '⚡ Flash Sale Fridays', position: 3 } });
  console.log('✅ 3 Banners created');

  // 12. Blog Posts
  await prisma.blogPost.create({
    data: { tenantId: tenant.id, title: 'Platform Raises $5M in Series A', slug: 'series-a-funding', content: 'We are excited to announce our Series A funding round...', excerpt: 'Our mission to digitize every restaurant takes a leap forward.', author: 'CEO', tags: 'Press Release', isPublished: true, publishedAt: new Date() }
  });
  await prisma.blogPost.create({
    data: { tenantId: tenant.id, title: 'Bill Splitting Now Available', slug: 'bill-splitting-launch', content: 'Split bills across cards, cash, and wallet with a single tap...', excerpt: 'Handle group dinners with ease.', author: 'Product Team', tags: 'Feature Update', isPublished: true, publishedAt: new Date() }
  });
  console.log('✅ 2 Blog posts created');

  // 13. Supplier
  await prisma.supplier.create({
    data: { tenantId: tenant.id, name: 'Metro Wholesale', contact: '+92300555666', email: 'metro@supplies.pk', terms: 'Net 30 days' }
  });
  console.log('✅ Supplier created');

  // 14. Chart of Accounts
  const accounts = [
    { name: 'Cash on Hand', type: 'ASSET', balance: 50000 },
    { name: 'Bank Account', type: 'ASSET', balance: 120000 },
    { name: 'Inventory', type: 'ASSET', balance: 35000 },
    { name: 'Accounts Payable', type: 'LIABILITY', balance: 15000 },
    { name: 'Owner Equity', type: 'EQUITY', balance: 190000 },
    { name: 'Food Sales', type: 'INCOME', balance: 0 },
    { name: 'Beverage Sales', type: 'INCOME', balance: 0 },
    { name: 'Food Cost', type: 'EXPENSE', balance: 0 },
    { name: 'Rent', type: 'EXPENSE', balance: 0 },
    { name: 'Salaries', type: 'EXPENSE', balance: 0 },
  ];
  for (const a of accounts) {
    await prisma.account.create({ data: { ...a, tenantId: tenant.id } });
  }
  console.log('✅ Chart of Accounts created');

  // 15. Departments + Employees
  const kitchenDept = await prisma.department.create({ data: { tenantId: tenant.id, outletId: outlet1.id, name: 'Kitchen' } });
  const frontDept = await prisma.department.create({ data: { tenantId: tenant.id, outletId: outlet1.id, name: 'Front of House' } });
  const adminDept = await prisma.department.create({ data: { tenantId: tenant.id, name: 'Administration' } });

  await prisma.employee.create({ data: { userId: users.KITCHEN.id, departmentId: kitchenDept.id, employeeCode: 'EMP-001', designation: 'Head Chef', salary: 45000 } });
  await prisma.employee.create({ data: { userId: users.WAITER.id, departmentId: frontDept.id, employeeCode: 'EMP-002', designation: 'Senior Waiter', salary: 25000 } });
  await prisma.employee.create({ data: { userId: users.CASHIER.id, departmentId: frontDept.id, employeeCode: 'EMP-003', designation: 'Lead Cashier', salary: 30000 } });
  await prisma.employee.create({ data: { userId: users.HR_ADMIN.id, departmentId: adminDept.id, employeeCode: 'EMP-004', designation: 'HR Manager', salary: 50000 } });
  console.log('✅ 3 Departments + 4 Employees created');

  // 16. Lead
  await prisma.lead.create({
    data: { name: 'Ali Hassan', businessName: 'Spice Garden Restaurant', businessType: 'Restaurant', requirements: 'POS + KDS + Online Ordering', contactMethod: 'WhatsApp' }
  });
  console.log('✅ Sample lead created');

  // 17. API Key Config
  await prisma.apiKeyConfig.create({ data: { service: 'STRIPE', keyName: 'secret_key', keyValue: 'sk_test_demo', tenantId: tenant.id } });
  await prisma.apiKeyConfig.create({ data: { service: 'GOOGLE_MAPS', keyName: 'api_key', keyValue: 'AIza-demo-key', tenantId: tenant.id } });
  console.log('✅ API key configs created');

  console.log('\n🎉 Seed completed! Login credentials:');
  console.log('='.repeat(50));
  console.log('  Super Admin:  super@admin.com / password123');
  console.log('  Admin:        admin@demo.com / password123');
  console.log('  Manager:      manager@demo.com / password123');
  console.log('  Cashier:      cashier@demo.com / password123');
  console.log('  Waiter:       waiter@demo.com / password123');
  console.log('  Kitchen:      kitchen@demo.com / password123');
  console.log('  Vendor:       vendor@demo.com / password123');
  console.log('  Rider:        rider@demo.com / password123');
  console.log('  Customer:     customer@demo.com / password123');
  console.log('  HR Admin:     hr@demo.com / password123');
  console.log('='.repeat(50));
  console.log('  Coupons:      WELCOME50 (50% off), FLAT100 (RS100 off)');
}

main()
  .then(() => prisma.$disconnect())
  .catch(e => { console.error(e); prisma.$disconnect(); process.exit(1); });
