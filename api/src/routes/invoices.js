import express from 'express';
import { requireAuth, requireTenant, requireRole } from '../middlewares/auth.js';

const router = express.Router();

// ── SALES INVOICES (Orders from POS/App) ───────────────────────────────────

// GET /api/invoices — list all sales invoices (Orders)
router.get('/', requireAuth, requireTenant, async (req, res) => {
  try {
    const { from, to, outletId, status, type } = req.query;
    const where = { tenantId: req.user.tenantId };
    
    if (outletId) where.outletId = outletId;
    if (status) where.status = status;
    if (type) where.type = type;
    if (from || to) {
      where.createdAt = {};
      if (from) where.createdAt.gte = new Date(from);
      if (to) where.createdAt.lte = new Date(to);
    }

    const orders = await req.prisma.order.findMany({
      where,
      include: { 
        items: { include: { product: true } }, 
        customer: true, 
        outlet: true, 
        payments: true,
        user: { select: { name: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(orders);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/invoices/:id — get single invoice detail
router.get('/:id', requireAuth, requireTenant, async (req, res) => {
  try {
    const order = await req.prisma.order.findUnique({
      where: { id: req.params.id, tenantId: req.user.tenantId },
      include: { 
        items: { include: { product: true } }, 
        customer: true, 
        outlet: true, 
        payments: true,
        user: { select: { name: true } }
      }
    });
    if (!order) return res.status(404).json({ error: 'Invoice not found' });
    res.json(order);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// PATCH /api/invoices/:id — Update invoice (e.g., mark as paid, change items)
router.patch('/:id', requireAuth, requireTenant, requireRole(['SUPER_ADMIN', 'TENANT_ADMIN', 'MANAGER']), async (req, res) => {
  try {
    const { items, status, totalAmount, taxAmount, discount } = req.body;
    
    // Start transaction for atomic updates
    const updatedOrder = await req.prisma.$transaction(async (tx) => {
      // 1. Delete old items if updating items
      if (items) {
        await tx.orderItem.deleteMany({ where: { orderId: req.params.id } });
      }

      // 2. Update order
      return await tx.order.update({
        where: { id: req.params.id, tenantId: req.user.tenantId },
        data: {
          status: status || undefined,
          totalAmount: totalAmount || undefined,
          taxAmount: taxAmount || undefined,
          discount: discount || undefined,
          items: items ? {
            create: items.map(it => ({
              productId: it.productId,
              quantity: it.quantity,
              price: it.price,
              subtotal: it.quantity * it.price,
              notes: it.notes
            }))
          } : undefined
        },
        include: { items: true }
      });
    });

    res.json(updatedOrder);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// DELETE /api/invoices/:id — Soft delete OR hard delete based on role
router.delete('/:id', requireAuth, requireTenant, requireRole(['SUPER_ADMIN', 'TENANT_ADMIN']), async (req, res) => {
  try {
    const order = await req.prisma.order.findUnique({ where: { id: req.params.id, tenantId: req.user.tenantId } });
    if (!order) return res.status(404).json({ error: 'Invoice not found' });

    // Hard delete for now as per user requirement to "Delete" button check
    await req.prisma.order.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── PURCHASE INVOICES (B2B) ──────────────────────────────────────────────────

// GET /api/invoices/purchase — handled as alias to inventory routes or dedicated
router.get('/type/purchase', requireAuth, requireTenant, async (req, res) => {
  try {
    const invoices = await req.prisma.purchaseInvoice.findMany({
      where: { tenantId: req.user.tenantId },
      include: { vendor: true, store: true, lines: { include: { product: true } } },
      orderBy: { createdAt: 'desc' }
    });
    res.json(invoices);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

export default router;
