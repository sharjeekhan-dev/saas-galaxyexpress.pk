import express from 'express';
import { requireAuth, requireTenant, requireRole } from '../middlewares/auth.js';
import { z } from 'zod';

const router = express.Router();

// GET /api/outlets
router.get('/', requireAuth, requireTenant, async (req, res) => {
  try {
    const outlets = await req.prisma.outlet.findMany({
      where: { tenantId: req.user.tenantId },
      include: { _count: { select: { tables: true, orders: true, inventory: true } } },
      orderBy: { createdAt: 'desc' }
    });
    res.json(outlets);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/outlets
router.post('/', requireAuth, requireTenant, requireRole(['SUPER_ADMIN', 'TENANT_ADMIN']), async (req, res) => {
  try {
    const schema = z.object({
      name: z.string().min(1),
      address: z.string().min(1),
      phone: z.string().optional(),
      lat: z.number().optional(),
      lng: z.number().optional(),
      taxRate: z.number().min(0).optional(),
      serviceChg: z.number().min(0).optional(),
      serviceChgType: z.enum(['PERCENTAGE', 'FIXED']).optional(),
      operatingHours: z.any().optional(),
    });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: 'Validation failed', details: parsed.error.flatten() });

    const outlet = await req.prisma.outlet.create({
      data: { ...parsed.data, tenantId: req.user.tenantId }
    });
    res.status(201).json(outlet);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// PUT /api/outlets/:id
router.put('/:id', requireAuth, requireTenant, requireRole(['SUPER_ADMIN', 'TENANT_ADMIN']), async (req, res) => {
  try {
    const existing = await req.prisma.outlet.findFirst({ where: { id: req.params.id, tenantId: req.user.tenantId } });
    if (!existing) return res.status(404).json({ error: 'Outlet not found' });

    const outlet = await req.prisma.outlet.update({ where: { id: req.params.id }, data: req.body });
    res.json(outlet);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/outlets/nearby?lat=X&lng=Y — public, for customer discovery
router.get('/nearby', async (req, res) => {
  try {
    const { lat, lng, radius } = req.query;
    if (!lat || !lng) return res.status(400).json({ error: 'lat and lng required' });

    const r = parseFloat(radius) || 10; // km
    const outlets = await req.prisma.$queryRaw`
      SELECT o.id, o.name, o.address, o.lat, o.lng, o.phone, t.name as "tenantName", t.logo,
        ( 6371 * acos( cos(radians(${parseFloat(lat)})) * cos(radians(o.lat)) * cos(radians(o.lng) - radians(${parseFloat(lng)})) + sin(radians(${parseFloat(lat)})) * sin(radians(o.lat)) ) ) AS distance
      FROM "Outlet" o
      JOIN "Tenant" t ON o."tenantId" = t.id
      WHERE o.lat IS NOT NULL AND o.lng IS NOT NULL AND o."isActive" = true AND t."isActive" = true
      HAVING distance < ${r}
      ORDER BY distance
      LIMIT 50
    `;
    res.json(outlets);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// === TABLE MANAGEMENT ===

// GET /api/outlets/:outletId/tables
router.get('/:outletId/tables', requireAuth, requireTenant, async (req, res) => {
  try {
    const tables = await req.prisma.table.findMany({
      where: { outletId: req.params.outletId, outlet: { tenantId: req.user.tenantId } },
      include: { orders: { where: { status: { in: ['PENDING', 'PREPARING', 'READY'] } }, select: { id: true, totalAmount: true, status: true } } }
    });
    res.json(tables);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/outlets/:outletId/tables
router.post('/:outletId/tables', requireAuth, requireTenant, async (req, res) => {
  try {
    const { name, capacity, section } = req.body;
    const table = await req.prisma.table.create({
      data: { outletId: req.params.outletId, name, capacity: capacity || 4, section }
    });
    res.status(201).json(table);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// PUT /api/outlets/tables/:tableId/status
router.put('/tables/:tableId/status', requireAuth, requireTenant, async (req, res) => {
  try {
    const { isOccupied } = req.body;
    const table = await req.prisma.table.update({ where: { id: req.params.tableId }, data: { isOccupied } });
    req.io.to(`tenant_${req.user.tenantId}`).emit('table_status', table);
    res.json(table);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

export default router;
