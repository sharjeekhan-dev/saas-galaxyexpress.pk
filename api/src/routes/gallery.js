import express from 'express';
import { requireAuth, requireRole } from '../middlewares/auth.js';
import admin from 'firebase-admin';

const router = express.Router();
const db = admin.firestore();

// GET /api/gallery — list media
router.get('/', requireAuth, async (req, res) => {
  try {
    let query = db.collection('media');
    
    // Applying filters
    const { category, type } = req.query;
    if (category) query = query.where('category', '==', category);
    if (type) query = query.where('type', '==', type);

    const snapshot = await query.get();
    let media = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // Vendor filtering logic: restricted to what Admin shares or their own
    if (req.user.role === 'VENDOR') {
      media = media.filter(m => 
        m.tenantId === req.user.tenantId || 
        m.isPublic === true || 
        m.category === 'CATEGORIES'
      );
    }

    // Sort by createdAt desc
    media.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

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

    const newMedia = {
      url,
      category: category || 'UNCATEGORIZED',
      type: type || 'IMAGE',
      isPublic: isPublic || false,
      tenantId: req.user.tenantId || null,
      userId: req.user.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const docRef = await db.collection('media').add(newMedia);
    res.status(201).json({ id: docRef.id, ...newMedia });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/gallery/:id/public — toggle public access (Admin only)
router.patch('/:id/public', requireAuth, requireRole(['SUPER_ADMIN']), async (req, res) => {
  try {
    const { isPublic } = req.body;
    await db.collection('media').doc(req.params.id).update({ isPublic, updatedAt: new Date().toISOString() });
    res.json({ id: req.params.id, isPublic });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/gallery/:id
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const doc = await db.collection('media').doc(req.params.id).get();
    if (!doc.exists) return res.status(404).json({ error: 'Media not found' });
    
    const media = doc.data();
    // Only Admin or Owner can delete
    if (req.user.role !== 'SUPER_ADMIN' && media.userId !== req.user.id) {
       return res.status(403).json({ error: 'Unauthorized to delete this media' });
    }

    await db.collection('media').doc(req.params.id).delete();
    res.json({ message: 'Media deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
