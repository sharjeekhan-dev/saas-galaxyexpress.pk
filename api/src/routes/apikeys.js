import express from 'express';
import { requireAuth, requireRole } from '../middlewares/auth.js';
import { z } from 'zod';

const router = express.Router();

const SERVICES = ['STRIPE', 'GOPAYFAST', 'GOOGLE_MAPS', 'FIREBASE', 'TWILIO', 'SMTP', 'OPENAI'];

// GET /api/apikeys — list API keys for a tenant (or global)
router.get('/', requireAuth, requireRole(['SUPER_ADMIN', 'TENANT_ADMIN']), async (req, res) => {
  try {
    const where = req.user.role === 'SUPER_ADMIN' ? {} : { tenantId: req.user.tenantId };
    const keys = await req.prisma.apiKeyConfig.findMany({
      where,
      orderBy: { service: 'asc' },
      select: { id: true, tenantId: true, service: true, keyName: true, isActive: true, createdAt: true, updatedAt: true }
      // keyValue intentionally excluded — masked
    });
    res.json(keys);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/apikeys — add/update an API key
router.post('/', requireAuth, requireRole(['SUPER_ADMIN', 'TENANT_ADMIN']), async (req, res) => {
  try {
    const schema = z.object({
      service: z.enum(SERVICES),
      keyName: z.string().min(1),
      keyValue: z.string().min(1),
      tenantId: z.string().uuid().optional(),
    });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: 'Validation failed', details: parsed.error.flatten() });

    const tenantId = req.user.role === 'SUPER_ADMIN' ? (parsed.data.tenantId || null) : req.user.tenantId;

    const key = await req.prisma.apiKeyConfig.upsert({
      where: { tenantId_service_keyName: { tenantId: tenantId || '', service: parsed.data.service, keyName: parsed.data.keyName } },
      update: { keyValue: parsed.data.keyValue },
      create: { ...parsed.data, tenantId }
    });

    res.json({ id: key.id, service: key.service, keyName: key.keyName, message: 'API key saved' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// DELETE /api/apikeys/:id — revoke
router.delete('/:id', requireAuth, requireRole(['SUPER_ADMIN', 'TENANT_ADMIN']), async (req, res) => {
  try {
    await req.prisma.apiKeyConfig.update({ where: { id: req.params.id }, data: { isActive: false } });
    res.json({ message: 'API key revoked' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/apikeys/services — list available services
router.get('/services', requireAuth, requireRole(['SUPER_ADMIN', 'TENANT_ADMIN']), (req, res) => {
  res.json(SERVICES);
});

export default router;
