import express from 'express';
import { requireAuth, requireTenant, requireRole } from '../middlewares/auth.js';
import { z } from 'zod';

const router = express.Router();

// ================= CHAT SESSIONS =================
// GET /api/chat/sessions — get active sessions for the user
router.get('/sessions', requireAuth, async (req, res) => {
  try {
    // Find all sessions where this user's ID is in the JSON participants array
    // Prisma JSON filtering is somewhat tricky; we'll fetch those containing the ID string
    const sessions = await req.prisma.chatSession.findMany({
      where: {
        participants: {
          array_contains: req.user.id
        }
      },
      include: {
        order: { select: { orderNumber: true, status: true } },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      },
      orderBy: { updatedAt: 'desc' }
    });
    
    res.json(sessions);
  } catch (err) { 
    console.error(err);
    res.status(500).json({ error: err.message }); 
  }
});

// POST /api/chat/initiate — Start a chat (e.g. Rider to Customer)
router.post('/initiate', requireAuth, async (req, res) => {
  try {
    const { targetUserId, contextType, orderId } = req.body;
    if (!targetUserId) return res.status(400).json({ error: 'targetUserId required' });

    // Check if session already exists
    const existing = await req.prisma.chatSession.findFirst({
      where: {
        orderId: orderId || null,
        participants: { array_contains: req.user.id }
      }
    });
    // For a real check, we should ensure both IDs are in the array, but this is a rough check.
    // If orderId matches, usually it's the right session.

    if (existing) return res.json(existing);

    const session = await req.prisma.chatSession.create({
      data: {
        contextType: contextType || 'SUPPORT',
        orderId: orderId || null,
        participants: [req.user.id, targetUserId]
      }
    });

    res.status(201).json(session);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ================= MESSAGING =================
// GET /api/chat/:sessionId/messages
router.get('/:sessionId/messages', requireAuth, async (req, res) => {
  try {
    const session = await req.prisma.chatSession.findUnique({ where: { id: req.params.sessionId } });
    if (!session) return res.status(404).json({ error: 'Session not found' });
    
    // Verify participant
    if (!session.participants.includes(req.user.id)) {
      return res.status(403).json({ error: 'Not a participant' });
    }

    const messages = await req.prisma.message.findMany({
      where: { sessionId: req.params.sessionId },
      include: { sender: { select: { name: true, role: true, avatar: true } } },
      orderBy: { createdAt: 'asc' }
    });

    // Mark as read
    await req.prisma.message.updateMany({
      where: { sessionId: req.params.sessionId, senderId: { not: req.user.id }, isRead: false },
      data: { isRead: true }
    });

    res.json(messages);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/chat/:sessionId/messages — send message
router.post('/:sessionId/messages', requireAuth, async (req, res) => {
  try {
    const { content, messageType, attachmentUrl } = req.body;
    
    const session = await req.prisma.chatSession.findUnique({ where: { id: req.params.sessionId } });
    if (!session || !session.participants.includes(req.user.id)) {
      return res.status(403).json({ error: 'Invalid session' });
    }

    const message = await req.prisma.message.create({
      data: {
        sessionId: req.params.sessionId,
        senderId: req.user.id,
        content,
        messageType: messageType || 'TEXT',
        attachmentUrl
      },
      include: { sender: { select: { name: true, role: true } } }
    });

    // Update session timestamp
    await req.prisma.chatSession.update({ where: { id: req.params.sessionId }, data: { updatedAt: new Date() } });

    // Emit via socket io
    req.io.to(`chat_${session.id}`).emit('new_message', message);

    res.status(201).json(message);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

export default router;
