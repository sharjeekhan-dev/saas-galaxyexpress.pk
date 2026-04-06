import express from 'express';
import { requireAuth, requireTenant, requireRole } from '../middlewares/auth.js';
import { z } from 'zod';

const router = express.Router();

// GET /api/products — list products
router.get('/', requireAuth, requireTenant, async (req, res) => {
  try {
    const { category, search, includeRaw } = req.query;
    const where = { tenantId: req.user.tenantId };
    if (!includeRaw) where.isRawMaterial = false;
    if (category) where.category = category;
    if (search) where.name = { contains: search, mode: 'insensitive' };

    const products = await req.prisma.product.findMany({
      where,
      include: { modifiers: true, variants: true, vendor: { select: { businessName: true } } },
      orderBy: { category: 'asc' }
    });
    res.json(products);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/products/categories
router.get('/categories', requireAuth, requireTenant, async (req, res) => {
  try {
    const cats = await req.prisma.product.findMany({
      where: { tenantId: req.user.tenantId },
      select: { category: true },
      distinct: ['category']
    });
    res.json(cats.map(c => c.category));
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/products — create product
router.post('/', requireAuth, requireTenant, requireRole(['SUPER_ADMIN', 'TENANT_ADMIN', 'MANAGER']), async (req, res) => {
  try {
    const schema = z.object({
      name: z.string().min(1),
      sku: z.string().min(1),
      categoryId: z.string().uuid().optional(),
      unitId: z.string().uuid().optional(),
      description: z.string().optional(),
      price: z.number().min(0),
      cost: z.number().min(0).optional(),
      isRawMaterial: z.boolean().optional(),
      image: z.string().optional(),
      vendorId: z.string().uuid().optional(),
      commission: z.number().optional(),
      modifiers: z.array(z.object({ name: z.string(), price: z.number() })).optional(),
      variants: z.array(z.object({ name: z.string(), price: z.number(), cost: z.number().optional(), sku: z.string().optional() })).optional(),
    });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: 'Validation failed', details: parsed.error.flatten() });

    const { modifiers, variants, ...data } = parsed.data;
    const product = await req.prisma.product.create({
      data: {
        ...data,
        tenantId: req.user.tenantId,
        modifiers: modifiers ? { create: modifiers } : undefined,
        variants: variants ? { create: variants } : undefined,
      },
      include: { modifiers: true, variants: true }
    });
    res.status(201).json(product);
  } catch (err) {
    if (err.code === 'P2002') return res.status(409).json({ error: 'SKU already exists' });
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/products/:id
router.put('/:id', requireAuth, requireTenant, requireRole(['SUPER_ADMIN', 'TENANT_ADMIN', 'MANAGER']), async (req, res) => {
  try {
    const existing = await req.prisma.product.findFirst({ where: { id: req.params.id, tenantId: req.user.tenantId } });
    if (!existing) return res.status(404).json({ error: 'Product not found' });

    const { name, categoryId, unitId, description, price, cost, image, isActive, commission } = req.body;
    const product = await req.prisma.product.update({
      where: { id: req.params.id },
      data: { name, categoryId, unitId, description, price, cost, image, isActive, commission },
      include: { modifiers: true, variants: true }
    });
    res.json(product);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/products/:id/duplicate
router.post('/:id/duplicate', requireAuth, requireTenant, requireRole(['SUPER_ADMIN', 'TENANT_ADMIN', 'MANAGER']), async (req, res) => {
  try {
    const source = await req.prisma.product.findFirst({
      where: { id: req.params.id, tenantId: req.user.tenantId },
      include: { modifiers: true, variants: true }
    });
    if (!source) return res.status(404).json({ error: 'Product not found' });

    const copy = await req.prisma.product.create({
      data: {
        tenantId: source.tenantId,
        name: `${source.name} (Copy)`,
        sku: `${source.sku}-COPY-${Date.now().toString(36)}`,
        category: source.category,
        description: source.description,
        price: source.price,
        cost: source.cost,
        isRawMaterial: source.isRawMaterial,
        image: source.image,
        modifiers: { create: source.modifiers.map(m => ({ name: m.name, price: m.price })) },
        variants: { create: source.variants.map(v => ({ name: v.name, price: v.price, cost: v.cost })) },
      },
      include: { modifiers: true, variants: true }
    });
    res.status(201).json(copy);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// DELETE /api/products/:id
router.delete('/:id', requireAuth, requireTenant, requireRole(['SUPER_ADMIN', 'TENANT_ADMIN']), async (req, res) => {
  try {
    const existing = await req.prisma.product.findFirst({ where: { id: req.params.id, tenantId: req.user.tenantId } });
    if (!existing) return res.status(404).json({ error: 'Product not found' });

    await req.prisma.product.update({ where: { id: req.params.id }, data: { isActive: false } });
    res.json({ message: 'Product deactivated' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/products/search-b2b?q=flour — cross-store search
router.get('/search-b2b', requireAuth, async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.length < 2) return res.status(400).json({ error: 'Query too short' });

    const results = await req.prisma.product.findMany({
      where: { name: { contains: q, mode: 'insensitive' }, isRawMaterial: false, isActive: true },
      include: {
        tenant: { select: { name: true, subdomain: true } },
        stocks: { select: { quantity: true, outlet: { select: { name: true, address: true } } } }
      },
      take: 50
    });
    res.json(results);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ==========================================
// CATEGORIES (Master Data)
// ==========================================
router.get('/categories/master', requireAuth, requireTenant, async (req, res) => {
  try {
    const cats = await req.prisma.category.findMany({
      where: { tenantId: req.user.tenantId, isActive: true },
      orderBy: { name: 'asc' }
    });
    res.json(cats);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/categories', requireAuth, requireTenant, requireRole(['SUPER_ADMIN', 'TENANT_ADMIN', 'MANAGER']), async (req, res) => {
  try {
    const cat = await req.prisma.category.create({
      data: {
        name: req.body.name,
        description: req.body.description,
        tenantId: req.user.tenantId
      }
    });
    res.status(201).json(cat);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/categories/:id', requireAuth, requireTenant, requireRole(['SUPER_ADMIN', 'TENANT_ADMIN', 'MANAGER']), async (req, res) => {
  try {
    const cat = await req.prisma.category.update({
      where: { id: req.params.id },
      data: { name: req.body.name, description: req.body.description, isActive: req.body.isActive }
    });
    res.json(cat);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/categories/:id', requireAuth, requireTenant, requireRole(['SUPER_ADMIN', 'TENANT_ADMIN']), async (req, res) => {
  try {
    await req.prisma.category.update({ where: { id: req.params.id }, data: { isActive: false } });
    res.json({ message: 'Deleted' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ==========================================
// UNITS (Master Data)
// ==========================================
router.get('/units', requireAuth, requireTenant, async (req, res) => {
  try {
    const units = await req.prisma.unit.findMany({
      where: { tenantId: req.user.tenantId, isActive: true },
      orderBy: { name: 'asc' }
    });
    res.json(units);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/units', requireAuth, requireTenant, requireRole(['SUPER_ADMIN', 'TENANT_ADMIN', 'MANAGER']), async (req, res) => {
  try {
    const unit = await req.prisma.unit.create({
      data: {
        name: req.body.name,
        shortName: req.body.shortName,
        tenantId: req.user.tenantId
      }
    });
    res.status(201).json(unit);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/units/:id', requireAuth, requireTenant, requireRole(['SUPER_ADMIN', 'TENANT_ADMIN', 'MANAGER']), async (req, res) => {
  try {
    const unit = await req.prisma.unit.update({
      where: { id: req.params.id },
      data: { name: req.body.name, shortName: req.body.shortName, isActive: req.body.isActive }
    });
    res.json(unit);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/units/:id', requireAuth, requireTenant, requireRole(['SUPER_ADMIN', 'TENANT_ADMIN']), async (req, res) => {
  try {
    await req.prisma.unit.update({ where: { id: req.params.id }, data: { isActive: false } });
    res.json({ message: 'Deleted' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

export default router;
