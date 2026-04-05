import express from 'express';
import { requireAuth, requireTenant, requireRole } from '../middlewares/auth.js';
import { z } from 'zod';

const router = express.Router();

// ========== DEPARTMENTS ==========
router.get('/departments', requireAuth, requireTenant, async (req, res) => {
  try {
    const depts = await req.prisma.department.findMany({
      where: { tenantId: req.user.tenantId },
      include: { _count: { select: { employees: true } }, outlet: { select: { name: true } } }
    });
    res.json(depts);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/departments', requireAuth, requireTenant, requireRole(['SUPER_ADMIN', 'TENANT_ADMIN', 'HR_ADMIN']), async (req, res) => {
  try {
    const dept = await req.prisma.department.create({
      data: { tenantId: req.user.tenantId, name: req.body.name, outletId: req.body.outletId || null }
    });
    res.status(201).json(dept);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ========== EMPLOYEES ==========
router.get('/employees', requireAuth, requireTenant, async (req, res) => {
  try {
    const employees = await req.prisma.employee.findMany({
      where: { user: { tenantId: req.user.tenantId } },
      include: { user: { select: { name: true, email: true, role: true } }, department: { select: { name: true } } }
    });
    res.json(employees);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/employees', requireAuth, requireTenant, requireRole(['SUPER_ADMIN', 'TENANT_ADMIN', 'HR_ADMIN']), async (req, res) => {
  try {
    const schema = z.object({
      userId: z.string().uuid(),
      departmentId: z.string().uuid().optional(),
      employeeCode: z.string().optional(),
      designation: z.string().optional(),
      salary: z.number().min(0).optional(),
      bankAccount: z.string().optional(),
      cnic: z.string().optional(),
      emergencyContact: z.string().optional(),
    });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: 'Validation failed', details: parsed.error.flatten() });

    const emp = await req.prisma.employee.create({ data: parsed.data });
    res.status(201).json(emp);
  } catch (err) {
    if (err.code === 'P2002') return res.status(409).json({ error: 'Employee record already exists for this user' });
    res.status(500).json({ error: err.message });
  }
});

router.put('/employees/:id', requireAuth, requireTenant, requireRole(['SUPER_ADMIN', 'TENANT_ADMIN', 'HR_ADMIN']), async (req, res) => {
  try {
    const emp = await req.prisma.employee.update({ where: { id: req.params.id }, data: req.body });
    res.json(emp);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ========== ATTENDANCE ==========
router.get('/attendance', requireAuth, requireTenant, async (req, res) => {
  try {
    const { date, employeeId } = req.query;
    const where = { employee: { user: { tenantId: req.user.tenantId } } };
    if (date) where.date = { gte: new Date(date + 'T00:00:00'), lt: new Date(date + 'T23:59:59') };
    if (employeeId) where.employeeId = employeeId;

    const records = await req.prisma.attendance.findMany({
      where,
      include: { employee: { include: { user: { select: { name: true } } } } },
      orderBy: { date: 'desc' },
      take: 200
    });
    res.json(records);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/attendance/checkin', requireAuth, async (req, res) => {
  try {
    const emp = await req.prisma.employee.findUnique({ where: { userId: req.user.id } });
    if (!emp) return res.status(404).json({ error: 'Employee not found' });

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const existing = await req.prisma.attendance.findFirst({
      where: { employeeId: emp.id, date: { gte: today } }
    });
    if (existing) return res.status(400).json({ error: 'Already checked in today' });

    const record = await req.prisma.attendance.create({
      data: { employeeId: emp.id, date: new Date(), checkIn: new Date(), status: 'PRESENT' }
    });
    res.json(record);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/attendance/checkout', requireAuth, async (req, res) => {
  try {
    const emp = await req.prisma.employee.findUnique({ where: { userId: req.user.id } });
    if (!emp) return res.status(404).json({ error: 'Employee not found' });

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const record = await req.prisma.attendance.findFirst({
      where: { employeeId: emp.id, date: { gte: today }, checkOut: null }
    });
    if (!record) return res.status(404).json({ error: 'No active check-in found' });

    const updated = await req.prisma.attendance.update({
      where: { id: record.id },
      data: { checkOut: new Date() }
    });
    res.json(updated);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ========== HR STATS ==========
router.get('/stats', requireAuth, requireTenant, async (req, res) => {
  try {
    const [empCount, deptCount, today] = await Promise.all([
      req.prisma.employee.count({ where: { user: { tenantId: req.user.tenantId } } }),
      req.prisma.department.count({ where: { tenantId: req.user.tenantId } }),
      (() => { const d = new Date(); d.setHours(0,0,0,0); return req.prisma.attendance.count({ where: { date: { gte: d }, status: 'PRESENT' } }); })()
    ]);
    res.json({ totalEmployees: empCount, totalDepartments: deptCount, presentToday: today });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

export default router;
