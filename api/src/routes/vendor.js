import express from 'express';
import { requireAuth, requireTenant, requireRole } from '../middlewares/auth.js';
import { z } from 'zod';

const router = express.Router();

// POST /api/vendor/onboard — submit vendor onboarding
router.post('/onboard', requireAuth, async (req, res) => {
  try {
    const schema = z.object({
      businessName: z.string().min(2),
      cnic: z.string().optional(),
      license: z.string().optional(),
      bankName: z.string().optional(),
      bankAccount: z.string().optional(),
      bankIban: z.string().optional(),
    });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: 'Validation failed', details: parsed.error.flatten() });

    // Update user role to VENDOR if not already
    await req.prisma.user.update({ where: { id: req.user.id }, data: { role: 'VENDOR' } });

    const profile = await req.prisma.vendorProfile.upsert({
      where: { userId: req.user.id },
      update: { ...parsed.data, verificationStatus: 'PENDING' },
      create: { ...parsed.data, userId: req.user.id, verificationStatus: 'PENDING' }
    });

    res.json(profile);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/vendor/profile
router.get('/profile', requireAuth, async (req, res) => {
  try {
    const profile = await req.prisma.vendorProfile.findUnique({
      where: { userId: req.user.id },
      include: { user: { select: { name: true, email: true } }, products: true, payouts: true }
    });
    if (!profile) return res.status(404).json({ error: 'Vendor profile not found' });
    res.json(profile);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// PUT /api/vendor/:id/verify — admin approves/rejects vendor
router.put('/:id/verify', requireAuth, requireRole(['SUPER_ADMIN', 'TENANT_ADMIN']), async (req, res) => {
  try {
    const { status } = req.body; // APPROVED, REJECTED
    const profile = await req.prisma.vendorProfile.update({
      where: { id: req.params.id },
      data: { verificationStatus: status, isVerified: status === 'APPROVED' }
    });
    res.json(profile);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/vendor/orders — vendor's orders
router.get('/orders', requireAuth, async (req, res) => {
  try {
    const profile = await req.prisma.vendorProfile.findUnique({ where: { userId: req.user.id } });
    if (!profile) return res.status(404).json({ error: 'Not a vendor' });

    const vendorProducts = await req.prisma.product.findMany({ where: { vendorId: profile.id }, select: { id: true } });
    const productIds = vendorProducts.map(p => p.id);

    const orders = await req.prisma.order.findMany({
      where: { items: { some: { productId: { in: productIds } } } },
      include: { items: { where: { productId: { in: productIds } }, include: { product: true } }, outlet: true },
      orderBy: { createdAt: 'desc' },
      take: 100
    });
    res.json(orders);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/vendor/commissions
router.get('/commissions', requireAuth, async (req, res) => {
  try {
    const profile = await req.prisma.vendorProfile.findUnique({ where: { userId: req.user.id } });
    if (!profile) return res.status(404).json({ error: 'Not a vendor' });

    const ledger = await req.prisma.commissionLedger.findMany({
      where: { vendorId: profile.id },
      include: { order: { select: { id: true, orderNumber: true, totalAmount: true, createdAt: true } } },
      orderBy: { createdAt: 'desc' }
    });

    const totalCommission = ledger.reduce((s, l) => s + l.commissionAmount, 0);
    res.json({ totalCommission, ledger });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/vendor/featured — public, for welcome page
router.get('/featured', async (req, res) => {
  try {
    const vendors = await req.prisma.vendorProfile.findMany({
      where: { isVerified: true },
      include: { user: { select: { name: true, avatar: true } } },
      take: 20
    });
    res.json(vendors);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

export default router;
