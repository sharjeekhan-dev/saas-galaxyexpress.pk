import express from 'express';
import { requireAuth, requireTenant } from '../middlewares/auth.js';

const router = express.Router();

// GET /api/kds/orders/:outletId — active orders for kitchen
router.get('/orders/:outletId', requireAuth, requireTenant, async (req, res) => {
  try {
    const orders = await req.prisma.order.findMany({
      where: {
        outletId: req.params.outletId,
        tenantId: req.user.tenantId,
        status: { in: ['PENDING', 'PREPARING'] }
      },
      include: { items: { include: { product: true } } },
      orderBy: { createdAt: 'asc' }
    });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/kds/item/:itemId/status — mark individual item status
router.put('/item/:itemId/status', requireAuth, requireTenant, async (req, res) => {
  try {
    const { status } = req.body; // PENDING, PREPARING, READY
    const item = await req.prisma.orderItem.update({
      where: { id: req.params.itemId },
      data: { kdsStatus: status },
      include: { order: true }
    });

    req.io.to(`outlet_${item.order.outletId}`).emit('kds_item_ready', {
      orderId: item.orderId,
      itemId: item.id,
      status
    });

    // Check if all items are READY → auto-update order status
    const allItems = await req.prisma.orderItem.findMany({ where: { orderId: item.orderId } });
    const allReady = allItems.every(i => i.kdsStatus === 'READY');

    if (allReady) {
      const updatedOrder = await req.prisma.order.update({
        where: { id: item.orderId },
        data: { status: 'READY' }
      });
      req.io.to(`outlet_${updatedOrder.outletId}`).emit('order_status_changed', updatedOrder);
    }

    res.json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/kds/order/:orderId/ready — mark entire order ready
router.put('/order/:orderId/ready', requireAuth, requireTenant, async (req, res) => {
  try {
    await req.prisma.orderItem.updateMany({
      where: { orderId: req.params.orderId },
      data: { kdsStatus: 'READY' }
    });

    const order = await req.prisma.order.update({
      where: { id: req.params.orderId, tenantId: req.user.tenantId },
      data: { status: 'READY' }
    });

    req.io.to(`outlet_${order.outletId}`).emit('order_status_changed', order);
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
