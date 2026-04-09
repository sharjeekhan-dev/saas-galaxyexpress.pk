import './firebase-admin.js'; // MUST BE FIRST TO INITIALIZE FIREBASE BEFORE ROUTES
import express from 'express';
import http from 'http';
import { exec } from 'child_process';
import util from 'util';
const execPromise = util.promisify(exec);
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import morgan from 'morgan';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

dotenv.config();

import admin from 'firebase-admin';

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URLS ? process.env.FRONTEND_URLS.split(',') : '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  }
});

const prisma = new PrismaClient();

// Middlewares
app.use(helmet({
  crossOriginResourcePolicy: false,
  crossOriginEmbedderPolicy: false,
}));

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, Postman)
    if (!origin) return callback(null, true);
    const allowed = process.env.FRONTEND_URLS
      ? process.env.FRONTEND_URLS.split(',').map(u => u.trim())
      : [];
    if (
      allowed.includes(origin) ||
      origin.endsWith('.vercel.app') ||
      origin.includes('galaxyexpress.pk') ||
      origin.startsWith('http://localhost')
    ) {
      return callback(null, true);
    }
    return callback(new Error(`CORS: origin ${origin} not allowed`));
  },
  credentials: true,
  methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization'],
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(express.json({ limit: '50mb' }));
app.use(morgan('dev'));
app.use('/uploads', express.static('uploads'));

app.use((req, res, next) => {
  req.prisma = prisma;
  req.io = io;
  req.logActivity = async (action, entity, entityId, details) => {
    try {
      await prisma.activityLog.create({
        data: {
          tenantId: req.user?.tenantId || null,
          userId: req.user?.id || null,
          username: req.user?.name || 'System',
          action,
          entity,
          entityId,
          details: typeof details === 'object' ? JSON.stringify(details) : details,
          ipAddress: req.ip,
          userAgent: req.get('User-Agent')
        }
      });
    } catch (e) { console.error('Logging error:', e); }
  };
  next();
});

// Load Routes
import authRoutes from './routes/auth.js';
import tenantRoutes from './routes/tenant.js';
import posRoutes from './routes/pos.js';
import inventoryRoutes from './routes/inventory.js';
import kdsRoutes from './routes/kds.js';
import reportsRoutes from './routes/reports.js';
import usersRoutes from './routes/users.js';
import leadsRoutes from './routes/leads.js';
import shiftsRoutes from './routes/shifts.js';
import productsRoutes from './routes/products.js';
import outletsRoutes from './routes/outlets.js';
import couponsRoutes from './routes/coupons.js';
import walletRoutes from './routes/wallet.js';
import vendorRoutes from './routes/vendor.js';
import riderRoutes from './routes/rider.js';
import hrRoutes from './routes/hr.js';
import contentRoutes from './routes/content.js';
import apikeysRoutes from './routes/apikeys.js';
import dailyclosingRoutes from './routes/dailyclosing.js';
import galleryRoutes from './routes/gallery.js';
import chatRoutes from './routes/chat.js';
import settingsRoutes from './routes/settings.js';
import printersRoutes from './routes/printers.js';
import notificationsRoutes from './routes/notifications.js';
import invoicesRoutes from './routes/invoices.js';
import backupRoutes from './routes/backup.js';
import accountsRoutes from './routes/accounts.js';

// Route Registration
app.use('/api/auth', authRoutes);
app.use('/api/tenant', tenantRoutes);
app.use('/api/pos', posRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/kds', kdsRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/leads', leadsRoutes);
app.use('/api/shifts', shiftsRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/outlets', outletsRoutes);
app.use('/api/coupons', couponsRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/vendor', vendorRoutes);
app.use('/api/rider', riderRoutes);
app.use('/api/hr', hrRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/apikeys', apikeysRoutes);
app.use('/api/daily-closing', dailyclosingRoutes);
app.use('/api/gallery', galleryRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/printers', printersRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/invoices', invoicesRoutes);
app.use('/api/backup', backupRoutes);
app.use('/api/accounts', accountsRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString(), routes: 27 });
});

app.get('/api/setup', async (req, res) => {
  try {
    const { stdout: pushOut } = await execPromise('npx prisma db push');
    const { stdout: seedOut } = await execPromise('node prisma/seed.js');
    res.send(`
      <div style="font-family: sans-serif; padding: 20px; color: green;">
        <h2 style="color: blue;">Database Setup Successful! 🎉</h2>
        <pre>${pushOut}</pre>
        <pre>${seedOut}</pre>
      </div>
    `);
  } catch (error) {
    res.status(500).send(`Error setting up database: ${error.message}`);
  }
});

app.use((err, req, res, next) => {
  console.error('[ERROR]', err);
  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message
  });
});

app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.path} not found` });
});

io.on('connection', (socket) => {
  console.log(`Socket connected: ${socket.id}`);
  socket.on('join_room', ({ tenantId, outletId, userId, chatId }) => {
    if (tenantId) socket.join(`tenant_${tenantId}`);
    if (outletId) socket.join(`outlet_${outletId}`);
    if (userId) socket.join(`user_${userId}`);
    if (chatId) socket.join(`chat_${chatId}`);
  });
  socket.on('disconnect', () => {
    console.log(`Socket disconnected: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  
  // Auto-inject Master Admin into Dual Persistence
  (async () => {
    try {
      const email = 'sharjeel@galaxyexpress.pk';
      const password = await bcrypt.hash('sharjeel72930011#', 12);
      
      // SQL Injection
      try {
        await prisma.user.upsert({
          where: { email },
          update: { password, role: 'SUPER_ADMIN', status: 'APPROVED', isActive: true },
          create: {
            email,
            password,
            name: 'Sharjeel - Galaxy Express Super Admin',
            role: 'SUPER_ADMIN',
            status: 'APPROVED',
            isActive: true
          }
        });
        console.log('💎 GALAXY EXPRESS: Master Admin secured in SQL.');
      } catch (e) { console.warn('⚠️ SQL Injection skipped.'); }

      // Firestore Injection
      const { db: firestore } = await import('./firebase-admin.js');
      if (firestore) {
         await firestore.collection('users').doc('master-admin').set({
           email,
           password,
           name: 'Sharjeel - Galaxy Express Master',
           role: 'SUPER_ADMIN',
           status: 'APPROVED',
           isActive: true
         }, { merge: true });
         console.log('🔥 GALAXY EXPRESS: Master Admin secured in Firestore.');
      }
    } catch (e) {
      console.warn('⚠️ Master Injection error:', e.message);
    }
  })();
});
