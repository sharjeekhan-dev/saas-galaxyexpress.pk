import express from 'express';
import { requireAuth, requireTenant, requireRole } from '../middlewares/auth.js';
import { z } from 'zod';

const router = express.Router();

// ========== BANNERS ==========
router.get('/banners', async (req, res) => {
  try {
    const { tenantId } = req.query;
    const where = { isActive: true };
    if (tenantId) where.tenantId = tenantId;
    const now = new Date();
    where.OR = [
      { startDate: null, endDate: null },
      { startDate: { lte: now }, endDate: { gte: now } },
      { startDate: { lte: now }, endDate: null },
    ];

    const banners = await req.prisma.banner.findMany({
      where,
      orderBy: { position: 'asc' },
      take: 20
    });
    res.json(banners);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/banners', requireAuth, requireTenant, requireRole(['SUPER_ADMIN', 'TENANT_ADMIN']), async (req, res) => {
  try {
    const schema = z.object({
      title: z.string().min(1),
      imageUrl: z.string().optional(),
      videoUrl: z.string().optional(),
      linkUrl: z.string().optional(),
      position: z.number().int().optional(),
      startDate: z.string().datetime().optional(),
      endDate: z.string().datetime().optional(),
    });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: 'Validation failed' });

    const banner = await req.prisma.banner.create({
      data: {
        ...parsed.data,
        tenantId: req.user.tenantId,
        startDate: parsed.data.startDate ? new Date(parsed.data.startDate) : null,
        endDate: parsed.data.endDate ? new Date(parsed.data.endDate) : null,
      }
    });
    res.status(201).json(banner);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/banners/:id', requireAuth, requireTenant, async (req, res) => {
  try {
    const banner = await req.prisma.banner.update({ where: { id: req.params.id }, data: req.body });
    res.json(banner);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/banners/:id', requireAuth, requireTenant, async (req, res) => {
  try {
    await req.prisma.banner.update({ where: { id: req.params.id }, data: { isActive: false } });
    res.json({ message: 'Banner deactivated' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ========== BLOG POSTS ==========
router.get('/blog', async (req, res) => {
  try {
    const { tag, tenantId } = req.query;
    const where = { isPublished: true };
    if (tenantId) where.tenantId = tenantId;
    if (tag) where.tags = { contains: tag };

    const posts = await req.prisma.blogPost.findMany({
      where,
      orderBy: { publishedAt: 'desc' },
      take: 50
    });
    res.json(posts);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/blog/:slug', async (req, res) => {
  try {
    const post = await req.prisma.blogPost.findUnique({ where: { slug: req.params.slug } });
    if (!post) return res.status(404).json({ error: 'Post not found' });
    res.json(post);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/blog', requireAuth, requireRole(['SUPER_ADMIN', 'TENANT_ADMIN']), async (req, res) => {
  try {
    const schema = z.object({
      title: z.string().min(1),
      slug: z.string().min(1).transform(v => v.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')),
      content: z.string().min(10),
      excerpt: z.string().optional(),
      coverImage: z.string().optional(),
      author: z.string().optional(),
      tags: z.string().optional(),
      isPublished: z.boolean().optional(),
    });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: 'Validation failed' });

    const post = await req.prisma.blogPost.create({
      data: { ...parsed.data, tenantId: req.user.tenantId || null, publishedAt: parsed.data.isPublished ? new Date() : null }
    });
    res.status(201).json(post);
  } catch (err) {
    if (err.code === 'P2002') return res.status(409).json({ error: 'Slug already taken' });
    res.status(500).json({ error: err.message });
  }
});

router.put('/blog/:id', requireAuth, requireRole(['SUPER_ADMIN', 'TENANT_ADMIN']), async (req, res) => {
  try {
    const post = await req.prisma.blogPost.update({ where: { id: req.params.id }, data: req.body });
    res.json(post);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

export default router;
