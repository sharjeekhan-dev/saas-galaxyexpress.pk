import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

const router = express.Router();

const loginSchema = z.object({
  email: z.string().email().optional(),
  phone: z.string().optional(),
  password: z.string().min(6),
}).refine(data => data.email || data.phone, {
  message: "Either email or phone must be provided",
  path: ["email"]
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

    const { email, phone, password } = parsed.data;
    
    const where = email ? { email: email.toLowerCase().trim() } : { phone };
    console.log(`🔍 Attempting login for: ${email || phone}`);
    
    const user = await req.prisma.user.findUnique({ 
      where,
      include: {
        vendorProfile: true,
        riderProfile: true,
        customerProfile: true
      }
    });
    
    if (!user) {
      console.log(`🚫 AUTH FAILED: User account not found.`);
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    if (user.status === 'PENDING') return res.status(403).json({ error: 'Your account is pending approval.' });
    if (user.status === 'REJECTED') return res.status(403).json({ error: 'Your account request was rejected.' });
    if (user.isActive === false) return res.status(403).json({ error: 'Account is deactivated' });

    // Validate password
    const isValid = await bcrypt.compare(password, user.password);
    console.log(`🔑 PASSWORD CHECK: ${isValid ? 'SUCCESS' : 'FAILURE'}`);
    
    if (!isValid) return res.status(401).json({ error: 'Invalid email or password' });

    const token = jwt.sign(
      { id: user.id, role: user.role, tenantId: user.tenantId },
      process.env.JWT_SECRET || 'your_jwt_secret',
      { expiresIn: '24h' }
    );

    // Log login
    try {
      await req.prisma.systemLog.create({
        data: {
          userId: user.id,
          tenantId: user.tenantId,
          action: 'LOGIN',
          details: `${user.role} login via Custom Auth`,
        }
      });
    } catch (e) {
      console.warn('⚠️ Logging failed:', e.message);
    }

    res.json({
      token,
      user: { 
        id: user.id, 
        name: user.name, 
        email: user.email, 
        role: user.role, 
        tenantId: user.tenantId, 
        darkMode: user.darkMode, 
        avatar: user.avatar,
        vendorProfile: user.vendorProfile,
        riderProfile: user.riderProfile,
        customerProfile: user.customerProfile
      }
    });
  } catch (err) { 
    console.error('Login Error:', err);
    res.status(500).json({ error: 'Internal server error: ' + err.message }); 
  }
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

    const status = (role === 'CUSTOMER' || !role) ? 'APPROVED' : 'PENDING';

    const user = await req.prisma.user.create({
      data: { 
        name, 
        email: email.toLowerCase().trim(), 
        phone, 
        password: hashedPassword, 
        role: role || 'CUSTOMER', 
        tenantId: tenantId || null, 
        status 
      }
    });

    // Auto-create wallet for customers
    if (user.role === 'CUSTOMER') {
      await req.prisma.wallet.create({ data: { userId: user.id, balance: 0 } }).catch(() => {});
      await req.prisma.customerProfile.create({ data: { userId: user.id } }).catch(() => {});
    }

    const token = jwt.sign(
      { id: user.id, role: user.role, tenantId: user.tenantId },
      process.env.JWT_SECRET || 'your_jwt_secret',
      { expiresIn: '24h' }
    );

    res.status(201).json({
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role, tenantId: user.tenantId }
    });
  } catch (err) { 
    console.error('Register Error:', err);
    res.status(500).json({ error: 'Internal server error' }); 
  }
});

// POST /api/auth/otp/send
router.post('/otp/send', async (req, res) => {
  try {
    const { email, phone } = req.body;
    if (!email && !phone) return res.status(400).json({ error: 'Email or phone required' });

    const where = email ? { email: email.toLowerCase().trim() } : { phone };
    const user = await req.prisma.user.findFirst({ where });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await req.prisma.user.update({ where: { id: user.id }, data: { otpCode: otp, otpExpiry: expiry } });

    console.log(`[OTP] User ${user.email}: ${otp}`);

    res.json({ message: `OTP sent to ${email || phone}`, debug_otp: process.env.NODE_ENV !== 'production' ? otp : undefined });
  } catch (err) { res.status(500).json({ error: 'Failed to send OTP' }); }
});

// POST /api/auth/otp/verify
router.post('/otp/verify', async (req, res) => {
  try {
    const { email, phone, otp } = req.body;
    if (!otp) return res.status(400).json({ error: 'OTP required' });

    const where = email ? { email: email.toLowerCase().trim() } : { phone };
    const user = await req.prisma.user.findFirst({ where });
    if (!user) return res.status(404).json({ error: 'User not found' });
    if (!user.otpCode || user.otpCode !== otp) return res.status(401).json({ error: 'Invalid OTP' });
    if (user.otpExpiry && new Date(user.otpExpiry) < new Date()) return res.status(401).json({ error: 'OTP expired' });

    // Clear OTP
    await req.prisma.user.update({ where: { id: user.id }, data: { otpCode: null, otpExpiry: null } });

    const token = jwt.sign(
      { id: user.id, role: user.role, tenantId: user.tenantId },
      process.env.JWT_SECRET || 'your_jwt_secret',
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
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');

    const user = await req.prisma.user.findUnique({
      where: { id: decoded.id },
      include: {
        vendorProfile: true,
        riderProfile: true,
        customerProfile: true,
        tenant: true
      }
    });

    if (!user) return res.status(404).json({ error: 'User not found' });
    if (!user.isActive) return res.status(403).json({ error: 'Account is deactivated' });

    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      tenantId: user.tenantId,
      avatar: user.avatar,
      darkMode: user.darkMode,
      vendorProfile: user.vendorProfile,
      riderProfile: user.riderProfile,
      customerProfile: user.customerProfile,
      tenant: user.tenant
    });
  } catch (err) { 
    res.status(401).json({ error: 'Invalid token: ' + err.message }); 
  }
});

// PUT /api/auth/preferences
router.put('/preferences', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: 'No token' });

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');

    const { darkMode, avatar, name } = req.body;
    const user = await req.prisma.user.update({
      where: { id: decoded.id },
      data: { 
        ...(darkMode !== undefined && { darkMode }), 
        ...(avatar && { avatar }), 
        ...(name && { name }) 
      },
      select: { id: true, name: true, darkMode: true, avatar: true }
    });
    res.json(user);
  } catch { res.status(401).json({ error: 'Invalid token' }); }
});

export default router;
