import express from 'express';
import { requireAuth, requireRole } from '../middlewares/auth.js';
import { z } from 'zod';

const router = express.Router();

// POST /api/leads — public lead capture (no auth needed)
router.post('/', async (req, res) => {
  try {
    const schema = z.object({
      name: z.string().min(2),
      businessName: z.string().min(2),
      businessType: z.string().min(2),
      requirements: z.string().min(5),
      contactMethod: z.string().min(2),
    });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: 'Validation failed', details: parsed.error.flatten() });

    const lead = await req.prisma.lead.create({ data: parsed.data });
    res.status(201).json(lead);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/leads — list all leads (super admin only)
router.get('/', requireAuth, requireRole(['SUPER_ADMIN']), async (req, res) => {
  try {
    const leads = await req.prisma.lead.findMany({ orderBy: { createdAt: 'desc' } });
    res.json(leads);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/leads/:id/convert — convert lead to tenant
router.put('/:id/convert', requireAuth, requireRole(['SUPER_ADMIN']), async (req, res) => {
  try {
    const lead = await req.prisma.lead.findUnique({ where: { id: req.params.id } });
    if (!lead) return res.status(404).json({ error: 'Lead not found' });

    const subdomain = lead.businessName.toLowerCase().replace(/[^a-z0-9]/g, '');

    const tenant = await req.prisma.tenant.create({
      data: { name: lead.businessName, subdomain }
    });

    await req.prisma.lead.update({
      where: { id: req.params.id },
      data: { status: 'CONVERTED' }
    });

    res.json({ tenant, message: 'Lead converted to tenant' });
  } catch (err) {
    if (err.code === 'P2002') return res.status(409).json({ error: 'Subdomain already exists' });
    res.status(500).json({ error: err.message });
  }
});

export default router;
