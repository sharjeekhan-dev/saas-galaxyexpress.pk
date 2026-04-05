import express from 'express';
import { requireAuth, requireTenant, requireRole } from '../middlewares/auth.js';
import { z } from 'zod';

const router = express.Router();

// ================= TRANSLATIONS =================
// GET /api/settings/translations — fetch all (for frontend caching)
router.get('/translations', async (req, res) => {
  try {
    const { tenantId } = req.query;
    // Get global translations, and override with tenant specific if tenantId provided
    const globalTrans = await req.prisma.translation.findMany({ where: { tenantId: null } });
    let tenantTrans = [];
    if (tenantId) {
      tenantTrans = await req.prisma.translation.findMany({ where: { tenantId } });
    }
    
    // Merge
    const dict = {};
    for (const t of globalTrans) dict[t.key] = { en: t.en, ur: t.ur, id: t.id };
    for (const t of tenantTrans) dict[t.key] = { en: t.en, ur: t.ur, id: t.id };
    
    res.json(dict);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/settings/translations — Admin only
router.post('/translations', requireAuth, requireRole(['SUPER_ADMIN', 'TENANT_ADMIN']), async (req, res) => {
  try {
    const schema = z.object({
      key: z.string().min(1),
      en: z.string().min(1),
      ur: z.string().min(1),
    });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: 'Validation failed' });

    const tenantId = req.user.role === 'SUPER_ADMIN' ? null : req.user.tenantId;

    const translation = await req.prisma.translation.upsert({
      where: { tenantId_key: { tenantId: tenantId || '', key: parsed.data.key } },
      update: { en: parsed.data.en, ur: parsed.data.ur },
      create: { ...parsed.data, tenantId }
    });
    res.json(translation);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/translations/:id', requireAuth, requireRole(['SUPER_ADMIN']), async (req, res) => {
  try {
    await req.prisma.translation.delete({ where: { id: req.params.id } });
    res.json({ message: 'Deleted' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ================= FAQ =================
router.get('/faq', async (req, res) => {
  try {
    const { role } = req.query; // filter by role
    const where = {};
    if (role) where.OR = [{ targetRole: role }, { targetRole: null }];
    
    const faqs = await req.prisma.faq.findMany({
      where,
      orderBy: { position: 'asc' }
    });
    res.json(faqs);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/faq', requireAuth, requireRole(['SUPER_ADMIN', 'TENANT_ADMIN']), async (req, res) => {
  try {
    const faqs = await req.prisma.faq.create({
      data: {
        question: req.body.question,
        answer: req.body.answer,
        targetRole: req.body.targetRole || null,
        position: req.body.position || 0,
        tenantId: req.user.tenantId
      }
    });
    res.status(201).json(faqs);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/faq/:id', requireAuth, requireRole(['SUPER_ADMIN', 'TENANT_ADMIN']), async (req, res) => {
  try {
    const faq = await req.prisma.faq.update({ where: { id: req.params.id }, data: req.body });
    res.json(faq);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/faq/:id', requireAuth, requireRole(['SUPER_ADMIN', 'TENANT_ADMIN']), async (req, res) => {
  try {
    await req.prisma.faq.delete({ where: { id: req.params.id } });
    res.json({ message: 'Deleted' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ================= BRANDING / LOGOS =================
router.put('/branding', requireAuth, requireRole(['SUPER_ADMIN', 'TENANT_ADMIN', 'VENDOR']), async (req, res) => {
  try {
    const { logo, invoiceLogo } = req.body;
    
    if (req.user.role === 'VENDOR') {
      const vendor = await req.prisma.vendorProfile.update({
        where: { userId: req.user.id },
        data: { ...(logo && { documents: logo }), ...(invoiceLogo && { invoiceLogo }) } // Using documents/invoiceLogo for vendor
      });
      return res.json({ message: 'Vendor branding updated' });
    } else {
      const tenant = await req.prisma.tenant.update({
        where: { id: req.user.tenantId },
        data: { ...(logo && { logo }), ...(invoiceLogo && { invoiceLogo }) }
      });
      return res.json({ message: 'Tenant branding updated', logo: tenant.logo, invoiceLogo: tenant.invoiceLogo });
    }
  } catch (err) { res.status(500).json({ error: err.message }); }
});

export default router;
