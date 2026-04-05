import express from 'express';
import { requireAuth, requireTenant, requireRole } from '../middlewares/auth.js';
import { z } from 'zod';

const router = express.Router();

// ================= INVOICE TEMPLATES =================
router.get('/templates', requireAuth, requireTenant, async (req, res) => {
  try {
    const templates = await req.prisma.invoiceTemplate.findMany({
      where: { tenantId: req.user.tenantId },
      orderBy: { createdAt: 'desc' }
    });
    res.json(templates);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/templates', requireAuth, requireTenant, requireRole(['SUPER_ADMIN', 'TENANT_ADMIN']), async (req, res) => {
  try {
    const schema = z.object({
      name: z.string().min(1),
      type: z.enum(['THERMAL', 'A4']),
      htmlContent: z.string().min(10),
      isDefault: z.boolean().optional(),
    });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: 'Validation failed' });

    // If setting as default, unset others of same type
    if (parsed.data.isDefault) {
      await req.prisma.invoiceTemplate.updateMany({
        where: { tenantId: req.user.tenantId, type: parsed.data.type, isDefault: true },
        data: { isDefault: false }
      });
    }

    const template = await req.prisma.invoiceTemplate.create({
      data: { ...parsed.data, tenantId: req.user.tenantId }
    });
    res.status(201).json(template);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/templates/:id', requireAuth, requireTenant, requireRole(['SUPER_ADMIN', 'TENANT_ADMIN']), async (req, res) => {
  try {
    if (req.body.isDefault) {
       await req.prisma.invoiceTemplate.updateMany({
        where: { tenantId: req.user.tenantId, type: req.body.type, isDefault: true, id: { not: req.params.id } },
        data: { isDefault: false }
      });     
    }
    const template = await req.prisma.invoiceTemplate.update({ where: { id: req.params.id }, data: req.body });
    res.json(template);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/templates/:id', requireAuth, requireTenant, requireRole(['SUPER_ADMIN', 'TENANT_ADMIN']), async (req, res) => {
  try {
    await req.prisma.invoiceTemplate.delete({ where: { id: req.params.id } });
    res.json({ message: 'Deleted' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ================= PRINTERS =================
router.get('/', requireAuth, requireTenant, async (req, res) => {
  try {
    const { outletId, vendorId } = req.query;
    const where = { tenantId: req.user.tenantId };
    if (outletId) where.outletId = outletId;
    if (vendorId) where.vendorId = vendorId;

    const printers = await req.prisma.printer.findMany({
      where,
      include: { outlet: { select: { name: true } }, vendor: { select: { businessName: true } } },
      orderBy: { createdAt: 'desc' }
    });
    res.json(printers);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', requireAuth, requireTenant, requireRole(['SUPER_ADMIN', 'TENANT_ADMIN', 'MANAGER', 'VENDOR']), async (req, res) => {
  try {
    const schema = z.object({
      name: z.string().min(1),
      ipAddress: z.string().min(7), // minimal validation for IP length
      port: z.number().int().positive().optional(),
      type: z.enum(['THERMAL', 'A4']),
      paperWidth: z.number().optional(),
      department: z.string().optional(),
      outletId: z.string().uuid().optional(),
    });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: 'Validation failed' });

    let vendorId = req.user.role === 'VENDOR' ? (await req.prisma.vendorProfile.findUnique({where: {userId: req.user.id}})).id : null;

    const printer = await req.prisma.printer.create({
      data: { ...parsed.data, tenantId: req.user.tenantId, vendorId }
    });
    res.status(201).json(printer);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/:id', requireAuth, requireTenant, async (req, res) => {
  try {
    const printer = await req.prisma.printer.update({ where: { id: req.params.id }, data: req.body });
    res.json(printer);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', requireAuth, requireTenant, async (req, res) => {
  try {
    await req.prisma.printer.delete({ where: { id: req.params.id } });
    res.json({ message: 'Deleted' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ================= PRINT JOB ASSIGNMENT (MOCK HTTP BRIDGE) =================
// In production, this would communicate with a local printing proxy or send WebSockets
router.post('/jobs/send', requireAuth, async (req, res) => {
  try {
    const { orderId, printerId } = req.body;
    // Log the print job routing
    await req.prisma.systemLog.create({
      data: {
        tenantId: req.user.tenantId, userId: req.user.id, action: 'PRINT_JOB', entity: 'Order', entityId: orderId, details: `Sent to printer ${printerId}`
      }
    });

    res.json({ success: true, message: 'Print job dispatched successfully' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

export default router;
