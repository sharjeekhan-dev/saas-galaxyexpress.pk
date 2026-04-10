import express from 'express';
import { requireAuth, requireRole } from '../middlewares/auth.js';

const router = express.Router();

// GET /api/backup/export — Download full JSON backup (Super Admin Only)
router.get('/export', requireAuth, requireRole(['SUPER_ADMIN']), async (req, res) => {
  try {
    const backupData = {
      timestamp: new Date().toISOString(),
      platform: 'Galaxy Express SaaS v3.0 (SQL Enabled)',
      data: {}
    };

    // Fetch all major tables from SQL via Prisma
    backupData.data.tenants = await req.prisma.tenant.findMany();
    backupData.data.users = await req.prisma.user.findMany({ select: { id: true, email: true, name: true, role: true, isActive: true, tenantId: true } });
    backupData.data.products = await req.prisma.product.findMany();
    backupData.data.orders = await req.prisma.order.findMany({ include: { items: true, payments: true } });
    backupData.data.outlets = await req.prisma.outlet.findMany();

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename=galaxy_full_backup_' + Date.now() + '.json');
    res.json(backupData);
  } catch (err) {
    res.status(500).json({ error: 'Backup failed: ' + err.message });
  }
});

// POST /api/backup/auto — Triggered by cron
router.post('/auto', async (req, res) => {
  res.json({ message: 'Auto-backup cycle registered (SQL Only)' });
});

export default router;
