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
    
    // 1. Try to find user in Firestore (Preferred for Firebase migration)
    const admin = (await import('firebase-admin')).default;
    const db = admin.firestore();
    const userSnapshot = await db.collection('users').where('email', '==', email.toLowerCase()).limit(1).get();
    
    let user = null;
    let userId = null;

    if (!userSnapshot.empty) {
      const userDoc = userSnapshot.docs[0];
      user = userDoc.data();
      userId = userDoc.id;
    } else {
      // 2. Fallback to Prisma if Firestore user not found (Legacy)
      try {
        user = await req.prisma.user.findUnique({ where: { email } });
        userId = user?.id;
      } catch (prismaErr) {
        console.error('Prisma search failed:', prismaErr.message);
      }
    }

    if (!user) return res.status(401).json({ error: 'Invalid email or password' });
    if (user.status === 'PENDING') return res.status(403).json({ error: 'Your account is pending approval from the Super Admin.' });
    if (user.status === 'REJECTED') return res.status(403).json({ error: 'Your account request was rejected.' });
    if (user.isActive === false) return res.status(403).json({ error: 'Account is deactivated' });

    // Validate password (both sources assume bcrypt or similar)
    // NOTE: For purely Firebase users, this check might fail if they don't have a 'password' field in Firestore.
    // However, the migration usually preserves the hash.
    if (user.password) {
      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) return res.status(401).json({ error: 'Invalid email or password' });
    } else {
      // If no password in Firestore/Prisma, we assume they must use Social Login or Firebase SDK directly.
      return res.status(401).json({ error: 'This account requires Social Login' });
    }

    const token = jwt.sign(
      { id: userId, role: user.role, tenantId: user.tenantId },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Log login (Silent failure)
    try {
      await db.collection('systemLogs').add({ userId, tenantId: user.tenantId, action: 'LOGIN', details: `${user.role} login via bridge`, createdAt: new Date().toISOString() });
    } catch (e) {}

    res.json({
      token,
      user: { id: userId, name: user.name, email: user.email, role: user.role, tenantId: user.tenantId, darkMode: user.darkMode, avatar: user.avatar }
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
      data: { name, email, phone, password: hashedPassword, role: role || 'CUSTOMER', tenantId: tenantId || null, status }
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
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (e) {
      // Fallback: try to verify as Firebase token
      const admin = (await import('firebase-admin')).default;
      decoded = await admin.auth().verifyIdToken(token);
      decoded.id = decoded.uid; // normalization
    }

    // Try Firestore first
    const admin = (await import('firebase-admin')).default;
    const db = admin.firestore();
    const userDoc = await db.collection('users').doc(decoded.id).get();
    
    if (userDoc.exists) {
      const userData = userDoc.data();
      return res.json({ id: userDoc.id, ...userData });
    }

    // Try Prisma fallback
    try {
      const user = await req.prisma.user.findUnique({
        where: { id: decoded.id },
        select: { id: true, name: true, email: true, phone: true, role: true, tenantId: true, avatar: true, darkMode: true }
      });
      if (user) return res.json(user);
    } catch (prismaErr) {}

    res.status(404).json({ error: 'User not found' });
  } catch (err) { res.status(401).json({ error: 'Invalid token: ' + err.message }); }
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
