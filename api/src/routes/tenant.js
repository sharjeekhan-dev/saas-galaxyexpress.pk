import express from 'express';
import { requireAuth, requireRole, requireTenant } from '../middlewares/auth.js';
import { z } from 'zod';

const router = express.Router();

// GET /api/tenant — list all tenants (super admin only)
router.get('/', requireAuth, requireRole(['SUPER_ADMIN']), async (req, res) => {
  try {
    const tenants = await req.prisma.tenant.findMany({
      include: { _count: { select: { users: true, orders: true, outlets: true } } },
      orderBy: { createdAt: 'desc' }
    });
    res.json(tenants);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/tenant — create tenant
router.post('/', requireAuth, requireRole(['SUPER_ADMIN']), async (req, res) => {
  try {
    const schema = z.object({
      name: z.string().min(2),
      subdomain: z.string().min(2),
      plan: z.enum(['BASIC', 'PRO', 'ENTERPRISE']).optional(),
    });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: 'Validation failed', details: parsed.error.flatten() });

    const tenant = await req.prisma.tenant.create({ data: parsed.data });
    res.status(201).json(tenant);
  } catch (err) {
    if (err.code === 'P2002') return res.status(409).json({ error: 'Subdomain already taken' });
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/tenant/:id — update tenant
router.put('/:id', requireAuth, requireRole(['SUPER_ADMIN']), async (req, res) => {
  try {
    const { name, plan, isActive, stripeAccountId, goPayFastKey, aiApiKey } = req.body;
    const tenant = await req.prisma.tenant.update({
      where: { id: req.params.id },
      data: { name, plan, isActive, stripeAccountId, goPayFastKey, aiApiKey }
    });
    res.json(tenant);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/tenant/:id — suspend/delete tenant
router.delete('/:id', requireAuth, requireRole(['SUPER_ADMIN']), async (req, res) => {
  try {
    await req.prisma.tenant.update({
      where: { id: req.params.id },
      data: { isActive: false }
    });
    res.json({ message: 'Tenant suspended' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/tenant/stats — global dashboard stats
router.get('/stats', requireAuth, requireRole(['SUPER_ADMIN']), async (req, res) => {
  try {
    const [tenantCount, userCount, orderCount, revenue] = await Promise.all([
      req.prisma.tenant.count(),
      req.prisma.user.count(),
      req.prisma.order.count(),
      req.prisma.payment.aggregate({ _sum: { amount: true }, where: { status: 'PAID' } })
    ]);
    res.json({
      totalTenants: tenantCount,
      totalUsers: userCount,
      totalOrders: orderCount,
      totalRevenue: revenue._sum.amount || 0
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
