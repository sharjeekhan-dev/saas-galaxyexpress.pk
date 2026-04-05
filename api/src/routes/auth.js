import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

const router = express.Router();

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  password: z.string().min(6),
  role: z.enum(['SUPER_ADMIN', 'TENANT_ADMIN', 'MANAGER', 'CASHIER', 'WAITER', 'VENDOR', 'RIDER', 'CUSTOMER', 'KITCHEN', 'HR_ADMIN']).optional(),
  tenantId: z.string().uuid().optional(),
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: 'Validation failed', details: parsed.error.flatten() });

    const { email, password } = parsed.data;
    const user = await req.prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(401).json({ error: 'Invalid email or password' });
    if (!user.isActive) return res.status(403).json({ error: 'Account is deactivated' });

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) return res.status(401).json({ error: 'Invalid email or password' });

    const token = jwt.sign(
      { id: user.id, role: user.role, tenantId: user.tenantId },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Log login
    await req.prisma.systemLog.create({ data: { userId: user.id, tenantId: user.tenantId, action: 'LOGIN', details: `${user.role} login` } }).catch(() => {});

    res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role, tenantId: user.tenantId, darkMode: user.darkMode, avatar: user.avatar }
    });
  } catch (err) { res.status(500).json({ error: 'Internal server error' }); }
});

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: 'Validation failed', details: parsed.error.flatten() });

    const { name, email, phone, password, role, tenantId } = parsed.data;

    const exists = await req.prisma.user.findUnique({ where: { email } });
    if (exists) return res.status(409).json({ error: 'Email already registered' });

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await req.prisma.user.create({
      data: { name, email, phone, password: hashedPassword, role: role || 'CUSTOMER', tenantId: tenantId || null }
    });

    // Auto-create wallet for customers
    if (user.role === 'CUSTOMER') {
      await req.prisma.wallet.create({ data: { userId: user.id, balance: 0 } }).catch(() => {});
    }

    const token = jwt.sign(
      { id: user.id, role: user.role, tenantId: user.tenantId },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role, tenantId: user.tenantId }
    });
  } catch (err) { res.status(500).json({ error: 'Internal server error' }); }
});

// POST /api/auth/otp/send — send OTP via email or phone
router.post('/otp/send', async (req, res) => {
  try {
    const { email, phone } = req.body;
    if (!email && !phone) return res.status(400).json({ error: 'Email or phone required' });

    const where = email ? { email } : { phone };
    const user = await req.prisma.user.findFirst({ where });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await req.prisma.user.update({ where: { id: user.id }, data: { otpCode: otp, otpExpiry: expiry } });

    // In production: send via Twilio (SMS) or Nodemailer (email)
    // For now, log it and return success
    console.log(`[OTP] User ${user.email}: ${otp}`);

    res.json({ message: `OTP sent to ${email || phone}`, debug_otp: process.env.NODE_ENV !== 'production' ? otp : undefined });
  } catch (err) { res.status(500).json({ error: 'Failed to send OTP' }); }
});

// POST /api/auth/otp/verify — verify OTP and login
router.post('/otp/verify', async (req, res) => {
  try {
    const { email, phone, otp } = req.body;
    if (!otp) return res.status(400).json({ error: 'OTP required' });

    const where = email ? { email } : { phone };
    const user = await req.prisma.user.findFirst({ where });
    if (!user) return res.status(404).json({ error: 'User not found' });
    if (!user.otpCode || user.otpCode !== otp) return res.status(401).json({ error: 'Invalid OTP' });
    if (user.otpExpiry && new Date(user.otpExpiry) < new Date()) return res.status(401).json({ error: 'OTP expired' });

    // Clear OTP
    await req.prisma.user.update({ where: { id: user.id }, data: { otpCode: null, otpExpiry: null } });

    const token = jwt.sign(
      { id: user.id, role: user.role, tenantId: user.tenantId },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role, tenantId: user.tenantId }
    });
  } catch (err) { res.status(500).json({ error: 'OTP verification failed' }); }
});

// GET /api/auth/me
router.get('/me', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: 'No token' });

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await req.prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, name: true, email: true, phone: true, role: true, tenantId: true, avatar: true, darkMode: true }
    });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch { res.status(401).json({ error: 'Invalid token' }); }
});

// PUT /api/auth/preferences — dark mode toggle, avatar
router.put('/preferences', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: 'No token' });

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const { darkMode, avatar, name } = req.body;
    const user = await req.prisma.user.update({
      where: { id: decoded.id },
      data: { ...(darkMode !== undefined && { darkMode }), ...(avatar && { avatar }), ...(name && { name }) },
      select: { id: true, name: true, darkMode: true, avatar: true }
    });
    res.json(user);
  } catch { res.status(401).json({ error: 'Invalid token' }); }
});

export default router;
