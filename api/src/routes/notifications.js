import express from 'express';
import { requireAuth } from '../middlewares/auth.js';
import { z } from 'zod';
import admin from 'firebase-admin';

const router = express.Router();

/*
// FIREBASE INITIALIZATION NOTE:
// In production, initialize Firebase Admin SDK in index.js or util file using service account:
// admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
// For development, we wrap push logic in a try-catch and log if firebase is not initialized.
*/

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

// POST /api/notifications/push — Trigger push notification manually (Admin/System)
router.post('/push', requireAuth, async (req, res) => {
  try {
    const { targetUserId, title, body, type, link } = req.body;
    
    // Save to DB first
    const notification = await req.prisma.notification.create({
      data: { userId: targetUserId, title, body, type: type || 'INFO', link }
    });

    // Send Real-time popup via WebSockets
    req.io.to(`user_${targetUserId}`).emit('notification', notification);

    // Send FCM Push if token exists
    const targetUser = await req.prisma.user.findUnique({ where: { id: targetUserId }, select: { fcmToken: true } });
    if (targetUser?.fcmToken) {
      try {
        if (admin.apps.length > 0) {
          await admin.messaging().send({
            token: targetUser.fcmToken,
            notification: { title, body },
            data: { type: type || 'INFO', link: link || '' }
          });
        }
      } catch (fcmErr) {
        console.error('FCM Push Failed:', fcmErr.message);
      }
    }

    res.status(201).json(notification);
  } catch (err) { 
    res.status(500).json({ error: err.message }); 
  }
});

// PUT /api/notifications/device-token — update FCM token
router.put('/device-token', requireAuth, async (req, res) => {
  try {
    const { token } = req.body;
    await req.prisma.user.update({
      where: { id: req.user.id },
      data: { fcmToken: token }
    });
    res.json({ message: 'Token updated' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

export default router;
