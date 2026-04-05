import express from 'express';
import { requireAuth, requireTenant, requireRole } from '../middlewares/auth.js';
import { z } from 'zod';

const router = express.Router();

// GET /api/inventory/stock — list all stock for tenant
router.get('/stock', requireAuth, requireTenant, async (req, res) => {
  try {
    const { outletId } = req.query;
    const where = { outlet: { tenantId: req.user.tenantId } };
    if (outletId) where.outletId = outletId;

    const stock = await req.prisma.stock.findMany({
      where,
      include: { product: true, outlet: true, transactions: { take: 5, orderBy: { createdAt: 'desc' } } }
    });
    res.json(stock);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/inventory/alerts — low stock alerts
router.get('/alerts', requireAuth, requireTenant, async (req, res) => {
  try {
    const alerts = await req.prisma.$queryRaw`
      SELECT s.id, s.quantity, s."lowThreshold", p.name, p.sku, o.name as "outletName"
      FROM "Stock" s
      JOIN "Product" p ON s."productId" = p.id
      JOIN "Outlet" o ON s."outletId" = o.id
      WHERE o."tenantId" = ${req.user.tenantId}
      AND s.quantity <= s."lowThreshold"
      AND s."lowThreshold" > 0
    `;
    res.json(alerts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/inventory/transaction — stock in/out/wastage/adjustment
router.post('/transaction', requireAuth, requireTenant, async (req, res) => {
  try {
    const schema = z.object({
      stockId: z.string().uuid(),
      type: z.enum(['IN', 'OUT', 'ADJUSTMENT', 'WASTAGE', 'PRODUCTION']),
      quantity: z.number().positive(),
      reason: z.string().optional(),
      batchNumber: z.string().optional(),
      expiryDate: z.string().datetime().optional(),
    });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: 'Validation failed', details: parsed.error.flatten() });

    const { stockId, type, quantity, reason, batchNumber, expiryDate } = parsed.data;

    // Verify stock belongs to tenant
    const stock = await req.prisma.stock.findFirst({
      where: { id: stockId, outlet: { tenantId: req.user.tenantId } }
    });
    if (!stock) return res.status(404).json({ error: 'Stock record not found' });

    const delta = (type === 'IN') ? quantity : -quantity;

    const [tx] = await req.prisma.$transaction([
      req.prisma.inventoryTransaction.create({
        data: { stockId, type, quantity, reason, batchNumber, expiryDate: expiryDate ? new Date(expiryDate) : null }
      }),
      req.prisma.stock.update({
        where: { id: stockId },
        data: { quantity: { increment: delta } }
      })
    ]);

    // Emit stock update event
    req.io.to(`tenant_${req.user.tenantId}`).emit('stock_updated', { stockId, delta });

    res.json(tx);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
