import express from 'express';
import { requireAuth, requireTenant, requireRole } from '../middlewares/auth.js';

const router = express.Router();

// GET /api/reports/sales — sales summary
router.get('/sales', requireAuth, requireTenant, async (req, res) => {
  try {
    const { from, to, outletId } = req.query;
    const where = { tenantId: req.user.tenantId };
    if (outletId) where.outletId = outletId;
    if (from || to) {
      where.createdAt = {};
      if (from) where.createdAt.gte = new Date(from);
      if (to) where.createdAt.lte = new Date(to);
    }

    const orders = await req.prisma.order.findMany({
      where,
      include: { payments: true, outlet: true, items: { include: { product: true } } },
      orderBy: { createdAt: 'desc' }
    });

    const totalSales = orders.reduce((s, o) => s + o.totalAmount, 0);
    const totalTax = orders.reduce((s, o) => s + o.taxAmount, 0);
    const totalDiscount = orders.reduce((s, o) => s + o.discount, 0);
    const orderCount = orders.length;

    // Daily breakdown
    const dailyMap = {};
    orders.forEach(o => {
      const day = o.createdAt.toISOString().split('T')[0];
      if (!dailyMap[day]) dailyMap[day] = { date: day, sales: 0, orders: 0 };
      dailyMap[day].sales += o.totalAmount;
      dailyMap[day].orders += 1;
    });

    res.json({
      totalSales,
      totalTax,
      totalDiscount,
      orderCount,
      dailyBreakdown: Object.values(dailyMap),
      orders
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/reports/inventory — inventory valuation
router.get('/inventory', requireAuth, requireTenant, async (req, res) => {
  try {
    const stocks = await req.prisma.stock.findMany({
      where: { outlet: { tenantId: req.user.tenantId } },
      include: { product: true, outlet: true }
    });

    const totalValuation = stocks.reduce((s, st) => s + (st.quantity * st.product.cost), 0);

    res.json({ totalValuation, stocks });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/reports/shifts — shift reconciliation
router.get('/shifts', requireAuth, requireTenant, async (req, res) => {
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

// GET /api/reports/vendors — vendor performance + commissions
router.get('/vendors', requireAuth, requireTenant, async (req, res) => {
  try {
    const vendors = await req.prisma.vendorProfile.findMany({
      where: { user: { tenantId: req.user.tenantId } },
      include: {
        user: { select: { name: true, email: true } },
        products: { select: { id: true } },
        payouts: true
      }
    });
    res.json(vendors);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/reports/riders — rider delivery performance
router.get('/riders', requireAuth, requireTenant, async (req, res) => {
  try {
    const riders = await req.prisma.riderProfile.findMany({
      where: { user: { tenantId: req.user.tenantId } },
      include: {
        user: { select: { name: true } },
        orders: { select: { id: true, status: true, totalAmount: true } },
        earnings: true
      }
    });
    res.json(riders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/reports/purchases — purchase summary
router.get('/purchases', requireAuth, requireTenant, async (req, res) => {
  try {
    const invoices = await req.prisma.purchaseInvoice.findMany({
      where: { tenantId: req.user.tenantId, status: 'APPROVED' },
      include: { vendor: true, store: true, lines: true },
      orderBy: { createdAt: 'desc' }
    });
    const totalPurchases = invoices.reduce((s, i) => s + i.netAmount, 0);
    res.json({ totalPurchases, invoices });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/reports/issuances — store to department issuances
router.get('/issuances', requireAuth, requireTenant, async (req, res) => {
  try {
    const issuances = await req.prisma.stockIssuance.findMany({
      where: { tenantId: req.user.tenantId, status: 'APPROVED' },
      include: { store: true, department: true, lines: { include: { product: true } } },
      orderBy: { createdAt: 'desc' }
    });
    res.json(issuances);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/reports/wastage — wastage & variance
router.get('/wastage', requireAuth, requireTenant, async (req, res) => {
  try {
    const wastages = await req.prisma.wastage.findMany({
      where: { tenantId: req.user.tenantId, status: 'APPROVED' },
      include: { lines: { include: { product: true } } },
      orderBy: { createdAt: 'desc' }
    });
    res.json(wastages);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/reports/dashboard — aggregate stats for dashboard
router.get('/dashboard', requireAuth, requireTenant, async (req, res) => {
  try {
    const tenantId = req.user.tenantId;
    const [orders, users, products, tenants] = await Promise.all([
      req.prisma.order.findMany({ where: { tenantId }, include: { payments: true } }),
      req.prisma.user.count({ where: { tenantId } }),
      req.prisma.product.count({ where: { tenantId } }),
      req.prisma.tenant.count() // Super Admin view logic should be handled here
    ]);

    const totalRevenue = orders.reduce((s, o) => s + o.totalAmount, 0);
    const totalOrders = orders.length;

    // Monthly revenue trend (last 12 months)
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const revenueTrend = months.map(m => 0); // Placeholder for group-by logic
    
    // Simplified daily/monthly aggregation
    const monthlyMap = {};
    orders.forEach(o => {
      const m = o.createdAt.getMonth();
      revenueTrend[m] += o.totalAmount;
    });

    res.json({
      totalRevenue, totalOrders, totalUsers: users, totalProducts: products, totalTenants: tenants,
      revenueTrend,
      recentOrders: orders.slice(0, 10)
    });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/reports/activity-logs — platform audit
router.get('/activity-logs', requireAuth, requireTenant, async (req, res) => {
  try {
    const logs = await req.prisma.activityLog.findMany({
      where: { tenantId: req.user.tenantId },
      orderBy: { createdAt: 'desc' },
      take: 50
    });
    res.json(logs);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

export default router;


