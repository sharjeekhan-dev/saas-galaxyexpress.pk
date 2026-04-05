import express from 'express';
import bcrypt from 'bcryptjs';
import { requireAuth, requireTenant, requireRole } from '../middlewares/auth.js';
import { z } from 'zod';

const router = express.Router();

// GET /api/users — list users for a tenant
router.get('/', requireAuth, requireTenant, requireRole(['SUPER_ADMIN', 'TENANT_ADMIN', 'MANAGER']), async (req, res) => {
  try {
    const where = {};
    if (req.user.role !== 'SUPER_ADMIN') {
      where.tenantId = req.user.tenantId;
    }
    const users = await req.prisma.user.findMany({
      where,
      select: { id: true, name: true, email: true, role: true, tenantId: true, createdAt: true },
      orderBy: { createdAt: 'desc' }
    });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/users — create user (admin creates staff)
router.post('/', requireAuth, requireTenant, requireRole(['SUPER_ADMIN', 'TENANT_ADMIN', 'MANAGER']), async (req, res) => {
  try {
    const schema = z.object({
      name: z.string().min(2),
      email: z.string().email(),
      password: z.string().min(6),
      role: z.enum(['TENANT_ADMIN', 'MANAGER', 'CASHIER', 'WAITER', 'VENDOR', 'RIDER', 'CUSTOMER', 'KITCHEN']),
    });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: 'Validation failed', details: parsed.error.flatten() });

    const { name, email, password, role } = parsed.data;
    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await req.prisma.user.create({
      data: { name, email, password: hashedPassword, role, tenantId: req.user.tenantId }
    });

    res.status(201).json({ id: user.id, name: user.name, email: user.email, role: user.role });
  } catch (err) {
    if (err.code === 'P2002') return res.status(409).json({ error: 'Email already exists' });
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/users/:id — update user role
router.put('/:id', requireAuth, requireTenant, requireRole(['SUPER_ADMIN', 'TENANT_ADMIN']), async (req, res) => {
  try {
    const { name, role } = req.body;
    const user = await req.prisma.user.update({
      where: { id: req.params.id },
      data: { name, role }
    });
    res.json({ id: user.id, name: user.name, role: user.role });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/users/:id
router.delete('/:id', requireAuth, requireTenant, requireRole(['SUPER_ADMIN', 'TENANT_ADMIN']), async (req, res) => {
  try {
    await req.prisma.user.delete({ where: { id: req.params.id } });
    res.json({ message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
