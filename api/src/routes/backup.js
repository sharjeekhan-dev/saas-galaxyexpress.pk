import express from 'express';
import { db } from '../firebase-admin.js';
import fs from 'fs';
import path from 'path';

const router = express.Router();

// GET /api/backup/export — Download full JSON backup (Super Admin Only)
router.get('/export', async (req, res) => {
  try {
    // 1. Fetch all essential collections from Firestore
    const collections = ['tenants', 'users', 'products', 'orders', 'inventory', 'accounts', 'leads'];
    const backupData = {
      timestamp: new Date().toISOString(),
      platform: 'Galaxy Express SaaS v3.0',
      data: {}
    };

    for (const col of collections) {
      const snap = await db.collection(col).get();
      backupData.data[col] = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }

    // 2. Export local SQL Data (Simulated for now, would use Prisma dump)
    try {
      backupData.sql_snapshot = await req.prisma.user.findMany({ select: { email: true, role: true, status: true } });
    } catch (e) {
      console.warn('SQL snapshot partial failure during backup:', e.message);
    }

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename=galaxy_backup_' + Date.now() + '.json');
    res.json(backupData);
  } catch (err) {
    res.status(500).json({ error: 'Backup failed: ' + err.message });
  }
});

// POST /api/backup/auto — Triggered by cron (Simulation)
router.post('/auto', async (req, res) => {
  // Logic for automatic rotation would go here
  res.json({ message: 'Auto-backup cycle registered' });
});

export default router;
