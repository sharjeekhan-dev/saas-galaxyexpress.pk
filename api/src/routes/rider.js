import express from 'express';
import { requireAuth, requireTenant, requireRole } from '../middlewares/auth.js';
import { z } from 'zod';

const router = express.Router();

// POST /api/rider/onboard
router.post('/onboard', requireAuth, async (req, res) => {
  try {
    const schema = z.object({
      vehicleType: z.string().min(1),
      vehiclePlate: z.string().optional(),
      cnic: z.string().optional(),
      license: z.string().optional(),
      bankName: z.string().optional(),
      bankAccount: z.string().optional(),
    });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: 'Validation failed' });

    await req.prisma.user.update({ where: { id: req.user.id }, data: { role: 'RIDER' } });

    const profile = await req.prisma.riderProfile.upsert({
      where: { userId: req.user.id },
      update: { ...parsed.data, verificationStatus: 'PENDING' },
      create: { ...parsed.data, userId: req.user.id, verificationStatus: 'PENDING' }
    });
    res.json(profile);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// PUT /api/rider/:id/verify
router.put('/:id/verify', requireAuth, requireRole(['SUPER_ADMIN', 'TENANT_ADMIN']), async (req, res) => {
  try {
    const { status } = req.body;
    const profile = await req.prisma.riderProfile.update({
      where: { id: req.params.id },
      data: { verificationStatus: status, isVerified: status === 'APPROVED' }
    });
    res.json(profile);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// PUT /api/rider/location — rider updates their GPS
router.put('/location', requireAuth, async (req, res) => {
  try {
    const { lat, lng } = req.body;
    const profile = await req.prisma.riderProfile.update({
      where: { userId: req.user.id },
      data: { currentLat: lat, currentLng: lng }
    });
    req.io.emit('rider_location', { riderId: profile.id, lat, lng });
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// PUT /api/rider/toggle — go online/offline
router.put('/toggle', requireAuth, async (req, res) => {
  try {
    const profile = await req.prisma.riderProfile.findUnique({ where: { userId: req.user.id } });
    if (!profile) return res.status(404).json({ error: 'Not a rider' });

    const updated = await req.prisma.riderProfile.update({
      where: { id: profile.id },
      data: { isAvailable: !profile.isAvailable }
    });
    res.json(updated);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/rider/assign — assign rider to order
router.post('/assign', requireAuth, requireRole(['SUPER_ADMIN', 'TENANT_ADMIN', 'MANAGER']), async (req, res) => {
  try {
    const { orderId, riderId } = req.body;
    const order = await req.prisma.order.update({
      where: { id: orderId },
      data: { riderId, status: 'OUT_FOR_DELIVERY' }
    });

    req.io.to(`tenant_${order.tenantId}`).emit('rider_assigned', { orderId, riderId });
    res.json(order);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/rider/available — list available riders
router.get('/available', requireAuth, requireTenant, async (req, res) => {
  try {
    const riders = await req.prisma.riderProfile.findMany({
      where: { isAvailable: true, isVerified: true, user: { tenantId: req.user.tenantId } },
      include: { user: { select: { name: true, phone: true } } }
    });
    res.json(riders);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/rider/earnings
router.get('/earnings', requireAuth, async (req, res) => {
  try {
    const profile = await req.prisma.riderProfile.findUnique({ where: { userId: req.user.id } });
    if (!profile) return res.status(404).json({ error: 'Not a rider' });

    const deliveries = await req.prisma.order.findMany({
      where: { riderId: profile.id, status: 'DELIVERED' },
      select: { id: true, totalAmount: true, createdAt: true }
    });

    const commissions = await req.prisma.commissionLedger.findMany({
      where: { riderId: profile.id },
      orderBy: { createdAt: 'desc' }
    });

    const totalEarnings = commissions.reduce((s, c) => s + c.commissionAmount, 0);
    res.json({ totalDeliveries: deliveries.length, totalEarnings, commissions });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

export default router;
