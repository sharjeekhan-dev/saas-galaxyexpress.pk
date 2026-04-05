import express from 'express';
import { requireAuth, requireTenant, requireRole } from '../middlewares/auth.js';
import { z } from 'zod';

const router = express.Router();

// GET /api/coupons
router.get('/', requireAuth, requireTenant, async (req, res) => {
  try {
    const coupons = await req.prisma.coupon.findMany({
      where: { tenantId: req.user.tenantId },
      orderBy: { createdAt: 'desc' }
    });
    res.json(coupons);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/coupons
router.post('/', requireAuth, requireTenant, requireRole(['SUPER_ADMIN', 'TENANT_ADMIN', 'MANAGER']), async (req, res) => {
  try {
    const schema = z.object({
      code: z.string().min(2).transform(v => v.toUpperCase()),
      type: z.enum(['PERCENTAGE', 'FIXED']),
      value: z.number().positive(),
      minOrderAmount: z.number().optional(),
      maxDiscount: z.number().optional(),
      usageLimit: z.number().int().positive().optional(),
      validFrom: z.string().datetime().optional(),
      validTo: z.string().datetime().optional(),
    });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: 'Validation failed', details: parsed.error.flatten() });

    const coupon = await req.prisma.coupon.create({
      data: {
        ...parsed.data,
        tenantId: req.user.tenantId,
        validFrom: parsed.data.validFrom ? new Date(parsed.data.validFrom) : new Date(),
        validTo: parsed.data.validTo ? new Date(parsed.data.validTo) : null,
      }
    });
    res.status(201).json(coupon);
  } catch (err) {
    if (err.code === 'P2002') return res.status(409).json({ error: 'Coupon code already exists for this tenant' });
    res.status(500).json({ error: err.message });
  }
});

// POST /api/coupons/validate — validate coupon and return discount
router.post('/validate', requireAuth, requireTenant, async (req, res) => {
  try {
    const { code, orderAmount } = req.body;
    if (!code) return res.status(400).json({ error: 'Code required' });

    const coupon = await req.prisma.coupon.findFirst({
      where: { tenantId: req.user.tenantId, code: code.toUpperCase(), isActive: true }
    });

    if (!coupon) return res.status(404).json({ error: 'Coupon not found or inactive' });
    if (coupon.validTo && new Date(coupon.validTo) < new Date()) return res.status(400).json({ error: 'Coupon expired' });
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) return res.status(400).json({ error: 'Coupon usage limit reached' });
    if (coupon.minOrderAmount && orderAmount < coupon.minOrderAmount) {
      return res.status(400).json({ error: `Minimum order amount is ${coupon.minOrderAmount}` });
    }

    let discount = coupon.type === 'PERCENTAGE' ? (orderAmount * coupon.value / 100) : coupon.value;
    if (coupon.maxDiscount && discount > coupon.maxDiscount) discount = coupon.maxDiscount;

    res.json({ valid: true, discount, couponId: coupon.id, code: coupon.code, type: coupon.type, value: coupon.value });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// PUT /api/coupons/:id — toggle active
router.put('/:id', requireAuth, requireTenant, requireRole(['SUPER_ADMIN', 'TENANT_ADMIN']), async (req, res) => {
  try {
    const coupon = await req.prisma.coupon.update({ where: { id: req.params.id }, data: req.body });
    res.json(coupon);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// DELETE /api/coupons/:id
router.delete('/:id', requireAuth, requireTenant, requireRole(['SUPER_ADMIN', 'TENANT_ADMIN']), async (req, res) => {
  try {
    await req.prisma.coupon.update({ where: { id: req.params.id }, data: { isActive: false } });
    res.json({ message: 'Coupon deactivated' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

export default router;
