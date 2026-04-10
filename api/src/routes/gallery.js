import express from 'express';
import { requireAuth, requireRole } from '../middlewares/auth.js';

const router = express.Router();

// GET /api/gallery — list media
router.get('/', requireAuth, async (req, res) => {
  try {
    const { category, type } = req.query;
    const where = {};
    if (category) where.category = category;
    if (type) where.type = type;

    // RBAC: Vendor filtering logic
    if (req.user.role === 'VENDOR') {
      where.OR = [
        { tenantId: req.user.tenantId },
        { isPublic: true },
        { category: 'CATEGORIES' }
      ];
    } else if (req.user.role !== 'SUPER_ADMIN') {
      where.tenantId = req.user.tenantId;
    }

    const media = await req.prisma.media.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    });

    res.json(media);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/gallery — upload media
router.post('/', requireAuth, async (req, res) => {
  try {
    const { url, category, type, isPublic } = req.body;
    if (!url) return res.status(400).json({ error: 'URL required' });

    const media = await req.prisma.media.create({
      data: {
        url,
        category: category || 'UNCATEGORIZED',
        type: type || 'IMAGE',
        isPublic: isPublic || false,
        tenantId: req.user.tenantId || null,
        userId: req.user.id
      }
    });

    res.status(201).json(media);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/gallery/:id/public — toggle public access (Admin only)
router.patch('/:id/public', requireAuth, requireRole(['SUPER_ADMIN']), async (req, res) => {
  try {
    const { isPublic } = req.body;
    const media = await req.prisma.media.update({
      where: { id: req.params.id },
      data: { isPublic }
    });
    res.json(media);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/gallery/:id
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const media = await req.prisma.media.findUnique({ where: { id: req.params.id } });
    if (!media) return res.status(404).json({ error: 'Media not found' });
    
    // Only Admin or Owner can delete
    if (req.user.role !== 'SUPER_ADMIN' && media.userId !== req.user.id) {
       return res.status(403).json({ error: 'Unauthorized to delete this media' });
    }

    await req.prisma.media.delete({ where: { id: req.params.id } });
    res.json({ message: 'Media deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
