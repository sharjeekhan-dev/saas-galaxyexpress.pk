import express from 'express';
import { requireAuth, requireTenant } from '../middlewares/auth.js';
import { z } from 'zod';

const router = express.Router();

// POST /api/shifts/open
router.post('/open', requireAuth, requireTenant, async (req, res) => {
  try {
    const schema = z.object({
      outletId: z.string().uuid(),
      openingCash: z.number().min(0),
    });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: 'Validation failed', details: parsed.error.flatten() });

    const shift = await req.prisma.shift.create({
      data: {
        tenantId: req.user.tenantId,
        outletId: parsed.data.outletId,
        userId: req.user.id,
        openingCash: parsed.data.openingCash,
      }
    });
    res.status(201).json(shift);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/shifts/:id/close
router.put('/:id/close', requireAuth, requireTenant, async (req, res) => {
  try {
    const { closingCash, notes } = req.body;
    const shift = await req.prisma.shift.update({
      where: { id: req.params.id },
      data: { endTime: new Date(), closingCash, notes }
    });
    res.json(shift);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/shifts — list shifts
router.get('/', requireAuth, requireTenant, async (req, res) => {
  try {
    const shifts = await req.prisma.shift.findMany({
      where: { tenantId: req.user.tenantId },
      include: { user: { select: { name: true } }, outlet: { select: { name: true } } },
      orderBy: { startTime: 'desc' },
      take: 50
    });
    res.json(shifts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
