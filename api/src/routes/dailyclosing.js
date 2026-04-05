import express from 'express';
import { requireAuth, requireTenant, requireRole } from '../middlewares/auth.js';

const router = express.Router();

// POST /api/daily-closing — run daily closing for an outlet
router.post('/', requireAuth, requireTenant, requireRole(['SUPER_ADMIN', 'TENANT_ADMIN', 'MANAGER']), async (req, res) => {
  try {
    const { outletId, date } = req.body;
    if (!outletId) return res.status(400).json({ error: 'outletId required' });

    const closingDate = date ? new Date(date) : new Date();
    closingDate.setHours(0, 0, 0, 0);

    const nextDay = new Date(closingDate);
    nextDay.setDate(nextDay.getDate() + 1);

    // Gather all orders for this day
    const orders = await req.prisma.order.findMany({
      where: {
        tenantId: req.user.tenantId,
        outletId,
        createdAt: { gte: closingDate, lt: nextDay },
        status: { not: 'CANCELLED' }
      },
      include: { payments: true }
    });

    const totalSales = orders.reduce((s, o) => s + o.totalAmount, 0);
    const totalTax = orders.reduce((s, o) => s + o.taxAmount, 0);
    const totalDiscount = orders.reduce((s, o) => s + o.discount, 0);
    const totalOrders = orders.length;

    let cashSales = 0, cardSales = 0, onlineSales = 0;
    orders.forEach(o => {
      o.payments.forEach(p => {
        if (p.status !== 'PAID') return;
        if (p.method === 'CASH') cashSales += p.amount;
        else if (p.method === 'CARD') cardSales += p.amount;
        else onlineSales += p.amount;
      });
    });

    // Wastage value
    const wastage = await req.prisma.inventoryTransaction.findMany({
      where: {
        type: 'WASTAGE',
        createdAt: { gte: closingDate, lt: nextDay },
        stock: { outletId }
      },
      include: { stock: { include: { product: true } } }
    });
    const wastageValue = wastage.reduce((s, w) => s + (w.quantity * w.stock.product.cost), 0);

    const closing = await req.prisma.dailyClosing.upsert({
      where: { tenantId_outletId_date: { tenantId: req.user.tenantId, outletId, date: closingDate } },
      update: { totalSales, totalTax, totalDiscount, totalOrders, cashSales, cardSales, onlineSales, wastageValue, closedBy: req.user.id },
      create: { tenantId: req.user.tenantId, outletId, date: closingDate, totalSales, totalTax, totalDiscount, totalOrders, cashSales, cardSales, onlineSales, wastageValue, closedBy: req.user.id }
    });

    res.json(closing);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/daily-closing — list closings
router.get('/', requireAuth, requireTenant, async (req, res) => {
  try {
    const { outletId, from, to } = req.query;
    const where = { tenantId: req.user.tenantId };
    if (outletId) where.outletId = outletId;
    if (from || to) {
      where.date = {};
      if (from) where.date.gte = new Date(from);
      if (to) where.date.lte = new Date(to);
    }

    const closings = await req.prisma.dailyClosing.findMany({
      where,
      include: { outlet: { select: { name: true } } },
      orderBy: { date: 'desc' },
      take: 90
    });
    res.json(closings);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

export default router;
