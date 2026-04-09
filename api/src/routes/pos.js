import { requireAuth, requireTenant } from '../middlewares/auth.js';
import { z } from 'zod';
import admin from 'firebase-admin';

const router = express.Router();

// GET /api/pos/products
router.get('/products', requireAuth, requireTenant, async (req, res) => {
  try {
    const products = await req.prisma.product.findMany({
      where: { tenantId: req.user.tenantId, isRawMaterial: false, isActive: true },
      include: { modifiers: true, variants: true },
      orderBy: { category: 'asc' }
    });
    res.json(products);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// POST /api/pos/orders — create new order with auto tax/service charge calc
router.post('/orders', requireAuth, requireTenant, async (req, res) => {
  try {
    const schema = z.object({
      outletId: z.string(),
      type: z.enum(['DINE_IN', 'TAKEAWAY', 'DELIVERY', 'ONLINE', 'B2B']),
      totalAmount: z.number().min(0),
      taxAmount: z.number().min(0).optional(),
      discount: z.number().min(0).optional(),
      tableId: z.string().optional(),
      couponCode: z.string().optional(),
      deliveryAddress: z.string().optional(),
      items: z.array(z.object({
        productId: z.string(),
        variantName: z.string().optional(),
        quantity: z.number().positive(),
        unitPrice: z.number().min(0),
        modifiers: z.any().optional(),
        notes: z.string().optional(),
        kdsStation: z.string().optional(),
      })).min(1),
      payments: z.array(z.object({
        method: z.enum(['CASH', 'CARD', 'ONLINE_STRIPE', 'ONLINE_GOPAYFAST', 'WALLET', 'UPI', 'STORE_CREDIT']),
        amount: z.number().positive(),
        status: z.enum(['PENDING', 'PAID', 'FAILED', 'REFUNDED']).optional(),
      })).min(1),
    });

    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: 'Validation failed', details: parsed.error.flatten() });

    const data = parsed.data;

    // Auto-calculate tax and service charge from outlet settings
    const outlet = await req.prisma.outlet.findUnique({ where: { id: data.outletId } });
    const subtotal = data.items.reduce((s, i) => s + (i.unitPrice * i.quantity), 0);
    const taxAmount = data.taxAmount ?? (subtotal * (outlet?.taxRate || 0) / 100);
    let serviceCharge = 0;
    if (outlet) {
      serviceCharge = outlet.serviceChgType === 'FIXED' ? outlet.serviceChg : (subtotal * outlet.serviceChg / 100);
    }

    // Validate and apply coupon
    let couponId = null;
    let couponDiscount = 0;
    if (data.couponCode) {
      const coupon = await req.prisma.coupon.findFirst({
        where: { tenantId: req.user.tenantId, code: data.couponCode.toUpperCase(), isActive: true }
      });
      if (coupon) {
        if (!coupon.validTo || new Date(coupon.validTo) >= new Date()) {
          if (!coupon.usageLimit || coupon.usedCount < coupon.usageLimit) {
            couponDiscount = coupon.type === 'PERCENTAGE' ? (subtotal * coupon.value / 100) : coupon.value;
            if (coupon.maxDiscount && couponDiscount > coupon.maxDiscount) couponDiscount = coupon.maxDiscount;
            couponId = coupon.id;
            await req.prisma.coupon.update({ where: { id: coupon.id }, data: { usedCount: { increment: 1 } } });
          }
        }
      }
    }

    const finalDiscount = (data.discount || 0) + couponDiscount;
    const totalAmount = subtotal + taxAmount + serviceCharge - finalDiscount;

    // Generate order number
    const orderCount = await req.prisma.order.count({ where: { tenantId: req.user.tenantId } });
    const orderNumber = `ORD-${String(orderCount + 1).padStart(5, '0')}`;

    const order = await req.prisma.order.create({
      data: {
        orderNumber,
        tenantId: req.user.tenantId,
        outletId: data.outletId,
        userId: req.user.id,
        tableId: data.tableId || null,
        type: data.type,
        subtotal,
        totalAmount,
        taxAmount,
        serviceCharge,
        discount: finalDiscount,
        couponId,
        deliveryAddress: data.deliveryAddress,
        status: 'PREPARING',
        items: {
          create: data.items.map(item => ({
            productId: item.productId,
            variantName: item.variantName,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            modifiers: item.modifiers || null,
            notes: item.notes || '',
            kdsStatus: 'PENDING',
            kdsStation: item.kdsStation
          }))
        },
        payments: {
          create: data.payments.map(payment => ({
            method: payment.method,
            amount: payment.amount,
            status: payment.status || 'PAID'
          }))
        }
      },
      include: { items: { include: { product: true } }, payments: true }
    });

    // Set table to occupied
    if (data.tableId) {
      await req.prisma.table.update({ where: { id: data.tableId }, data: { isOccupied: true } });
    }

    // Generate commission ledger entries for vendor products
    for (const item of order.items) {
      if (item.product.vendorId) {
        const vendor = await req.prisma.vendorProfile.findUnique({ where: { id: item.product.vendorId } });
        if (vendor) {
          const itemTotal = item.quantity * item.unitPrice;
          const commRate = item.product.commission ?? vendor.commissionValue;
          const commAmount = vendor.commissionType === 'PERCENTAGE' ? (itemTotal * commRate / 100) : commRate;
          await req.prisma.commissionLedger.create({
            data: {
              tenantId: req.user.tenantId,
              orderId: order.id,
              vendorId: vendor.id,
              orderAmount: itemTotal,
              commissionRate: commRate,
              commissionAmount: commAmount,
              type: 'VENDOR'
            }
          });
        }
      }
    }

    // 4. Sync to Firestore for real-time Dashboard access
    try {
      const db = admin.firestore();
      await db.collection('orders').doc(order.id).set({
        ...order,
        createdAt: order.createdAt.toISOString(),
        updatedAt: order.updatedAt.toISOString(),
        items: order.items.map(i => ({
          ...i,
          product: { name: i.product.name, category: i.product.category }
        }))
      });
      console.log('✅ Firestore Sync Success:', order.id);
    } catch (fsErr) {
      console.error('❌ Firestore Sync Failed:', fsErr.message);
    }

    req.io.to(`outlet_${data.outletId}`).emit('order_created', order);
    res.status(201).json(order);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// GET /api/pos/orders
router.get('/orders', requireAuth, requireTenant, async (req, res) => {
  try {
    const { outletId, status, from, to } = req.query;
    const where = { tenantId: req.user.tenantId };
    if (outletId) where.outletId = outletId;
    if (status) where.status = status;
    if (from || to) {
      where.createdAt = {};
      if (from) where.createdAt.gte = new Date(from);
      if (to) where.createdAt.lte = new Date(to);
    }
    const orders = await req.prisma.order.findMany({
      where,
      include: { items: { include: { product: true } }, payments: true, table: true, user: { select: { name: true } } },
      orderBy: { createdAt: 'desc' },
      take: 200
    });
    res.json(orders);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// PUT /api/pos/orders/:id/status
router.put('/orders/:id/status', requireAuth, requireTenant, async (req, res) => {
  try {
    const { status } = req.body;
    const existing = await req.prisma.order.findFirst({ where: { id: req.params.id, tenantId: req.user.tenantId } });
    if (!existing) return res.status(404).json({ error: 'Order not found' });

    const order = await req.prisma.order.update({ where: { id: req.params.id }, data: { status } });

    // Free table if order is completed
    if (['SERVED', 'DELIVERED', 'CANCELLED'].includes(status) && existing.tableId) {
      const activeOrders = await req.prisma.order.count({
        where: { tableId: existing.tableId, status: { in: ['PENDING', 'PREPARING', 'READY'] }, id: { not: existing.id } }
      });
      if (activeOrders === 0) {
        await req.prisma.table.update({ where: { id: existing.tableId }, data: { isOccupied: false } });
      }
    }

    // Update Firestore
    try {
      const db = admin.firestore();
      await db.collection('orders').doc(order.id).update({ 
        status: order.status,
        updatedAt: order.updatedAt.toISOString()
      });
    } catch (e) {}

    req.io.to(`outlet_${order.outletId}`).emit('order_status_changed', order);
    res.json(order);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// POST /api/pos/orders/:id/split — split bill
router.post('/orders/:id/split', requireAuth, requireTenant, async (req, res) => {
  try {
    const { splits } = req.body;
    // splits: [{ itemIds: [...], payments: [{method, amount}] }]
    if (!splits || !Array.isArray(splits)) return res.status(400).json({ error: 'splits array required' });

    const parent = await req.prisma.order.findFirst({
      where: { id: req.params.id, tenantId: req.user.tenantId },
      include: { items: true }
    });
    if (!parent) return res.status(404).json({ error: 'Order not found' });

    const childOrders = [];
    for (const split of splits) {
      const splitItems = parent.items.filter(i => split.itemIds.includes(i.id));
      const subtotal = splitItems.reduce((s, i) => s + (i.unitPrice * i.quantity), 0);
      const taxRate = parent.taxAmount / (parent.subtotal || 1);
      const taxAmount = subtotal * taxRate;
      const totalAmount = subtotal + taxAmount;

      const child = await req.prisma.order.create({
        data: {
          tenantId: parent.tenantId,
          outletId: parent.outletId,
          userId: req.user.id,
          tableId: parent.tableId,
          type: parent.type,
          status: 'PREPARING',
          subtotal,
          taxAmount,
          totalAmount,
          parentOrderId: parent.id,
          items: { create: splitItems.map(i => ({ productId: i.productId, quantity: i.quantity, unitPrice: i.unitPrice, notes: i.notes, kdsStatus: i.kdsStatus })) },
          payments: { create: (split.payments || []).map(p => ({ method: p.method, amount: p.amount, status: 'PAID' })) }
        },
        include: { items: true, payments: true }
      });
      childOrders.push(child);
    }

    // Mark parent as split
    await req.prisma.order.update({ where: { id: parent.id }, data: { status: 'CANCELLED', refundReason: 'Split into child orders' } });
    res.json({ parentCancelled: true, childOrders });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// POST /api/pos/orders/:id/refund — cancel and refund
router.post('/orders/:id/refund', requireAuth, requireTenant, async (req, res) => {
  try {
    const { reason } = req.body;
    const order = await req.prisma.order.findFirst({
      where: { id: req.params.id, tenantId: req.user.tenantId },
      include: { payments: true }
    });
    if (!order) return res.status(404).json({ error: 'Order not found' });
    if (order.status === 'REFUNDED') return res.status(400).json({ error: 'Already refunded' });

    // Mark payments as refunded
    await req.prisma.payment.updateMany({ where: { orderId: order.id }, data: { status: 'REFUNDED' } });

    // Update order status
    const updated = await req.prisma.order.update({
      where: { id: order.id },
      data: { status: 'REFUNDED', refundReason: reason || 'Customer request' }
    });

    // Create refund journal entry
    await req.prisma.systemLog.create({
      data: { tenantId: order.tenantId, userId: req.user.id, action: 'ORDER_REFUND', entity: 'Order', entityId: order.id, details: reason }
    });

    // Free table
    if (order.tableId) {
      await req.prisma.table.update({ where: { id: order.tableId }, data: { isOccupied: false } });
    }

    req.io.to(`outlet_${order.outletId}`).emit('order_refunded', updated);
    res.json(updated);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// GET /api/pos/orders/:id/invoice
router.get('/orders/:id/invoice', requireAuth, requireTenant, async (req, res) => {
  try {
    const order = await req.prisma.order.findFirst({
      where: { id: req.params.id, tenantId: req.user.tenantId },
      include: {
        items: { include: { product: true } },
        payments: true,
        outlet: true,
        user: { select: { name: true } },
        tenant: { select: { name: true, logo: true } },
        coupon: { select: { code: true } }
      }
    });
    if (!order) return res.status(404).json({ error: 'Order not found' });

    const invoice = {
      invoiceNumber: `INV-${order.orderNumber || order.id.slice(-8).toUpperCase()}`,
      orderNumber: order.orderNumber,
      date: order.createdAt,
      company: order.tenant.name,
      logo: order.tenant.logo,
      outlet: order.outlet.name,
      outletAddress: order.outlet.address,
      cashier: order.user?.name || 'Self-Service',
      type: order.type,
      items: order.items.map(i => ({
        name: i.product.name,
        variant: i.variantName,
        qty: i.quantity,
        unitPrice: i.unitPrice,
        modifiers: i.modifiers,
        total: i.quantity * i.unitPrice
      })),
      subtotal: order.subtotal || order.items.reduce((s, i) => s + (i.quantity * i.unitPrice), 0),
      tax: order.taxAmount,
      serviceCharge: order.serviceCharge || 0,
      discount: order.discount,
      couponCode: order.coupon?.code,
      total: order.totalAmount,
      payments: order.payments.map(p => ({ method: p.method, amount: p.amount, status: p.status })),
    };
    res.json(invoice);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

export default router;
