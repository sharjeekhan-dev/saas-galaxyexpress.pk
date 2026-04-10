import express from 'express';
import { requireAuth } from '../middlewares/auth.js';

const router = express.Router();

// GET /api/notifications — Retrieve in-app history
router.get('/', requireAuth, async (req, res) => {
  try {
    const notifications = await req.prisma.notification.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
      take: 50
    });
    res.json(notifications);
  } catch (err) { 
    res.status(500).json({ error: err.message }); 
  }
});

// GET /api/notifications/unread-count
router.get('/unread-count', requireAuth, async (req, res) => {
  try {
    const count = await req.prisma.notification.count({
      where: { userId: req.user.id, isRead: false }
    });
    res.json({ count });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// PUT /api/notifications/:id/read
router.put('/:id/read', requireAuth, async (req, res) => {
  try {
    const notification = await req.prisma.notification.update({
      where: { id: req.params.id },
      data: { isRead: true }
    });
    res.json(notification);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// PUT /api/notifications/read-all
router.put('/read-all', requireAuth, async (req, res) => {
  try {
    await req.prisma.notification.updateMany({
      where: { userId: req.user.id, isRead: false },
      data: { isRead: true }
    });
    res.json({ message: 'All marked as read' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/notifications/push — Trigger notification via WebSockets
router.post('/push', requireAuth, async (req, res) => {
  try {
    const { targetUserId, title, body, type, link } = req.body;
    
    // Save to DB first
    const notification = await req.prisma.notification.create({
      data: { userId: targetUserId, title, body, type: type || 'INFO', link }
    });

    // Send Real-time popup via WebSockets (Alternative to Firebase FCM)
    if (req.io) {
      req.io.to(`user_${targetUserId}`).emit('notification', notification);
    }

    res.status(201).json(notification);
  } catch (err) { 
    res.status(500).json({ error: err.message }); 
  }
});

// PUT /api/notifications/device-token — Endpoint placeholder (formerly for FCM)
router.put('/device-token', requireAuth, async (req, res) => {
  res.json({ message: 'Push token registration disabled (Firebase Removed)' });
});

export default router;
