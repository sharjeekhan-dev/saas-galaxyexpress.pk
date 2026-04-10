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
import jwt from 'jsonwebtoken';

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
  let log = { prisma: 'Wait...', seed: 'Wait...', masterAccount: 'Wait...' };
  try {
    const { stdout: pushOut } = await execPromise('npx prisma db push');
    log.prisma = 'Ready';
    
    const { stdout: seedOut } = await execPromise('node prisma/seed.js');
    log.seed = 'Complete';

    const email = 'sharjeel@galaxyexpress.pk';
    const hashedPassword = await bcrypt.hash('sharjeel123', 12);
    
    await prisma.user.upsert({
      where: { email },
      update: { password: hashedPassword, role: 'SUPER_ADMIN', status: 'APPROVED', isActive: true },
      create: { 
        email, name: 'Sharjeel - Galaxy Super Admin', password: hashedPassword, 
        role: 'SUPER_ADMIN', status: 'APPROVED', isActive: true 
      }
    });
    log.masterAccount = 'SQL: OK';

    const { db: firestore } = await import('./firebase-admin.js');
    if (firestore) {
      await firestore.collection('users').doc('master-admin').set({
        email, password: hashedPassword, name: 'Sharjeel - Galaxy Master', 
        role: 'SUPER_ADMIN', status: 'APPROVED', isActive: true
      }, { merge: true });
      log.masterAccount += ' | Firestore: OK';
    }

    res.send(`
      <div style="background: #000; color: #39FF14; font-family: 'Courier New', monospace; padding: 50px; min-height: 100vh;">
        <h1 style="text-shadow: 0 0 10px #39FF14;">⚡ GALAXY EXPRESS: CORE SYSTEM RECOVERY</h1>
        <hr style="border: 1px solid #39FF14; opacity: 0.3;" />
        <div style="font-size: 1.2rem; margin: 30px 0;">
          <p>[+] Database Synchronization: ${log.prisma}</p>
          <p>[+] Data Seeding: ${log.seed}</p>
          <p>[+] Admin Credentials Injection: ${log.masterAccount}</p>
        </div>
        <div style="border: 2px dashed #39FF14; padding: 20px; text-align: center;">
          <h2 style="margin: 0;">SYSTEM LIVE</h2>
          <p>Login at: <strong>partner.galaxyexpress.pk</strong></p>
          <p>User: <strong>${email}</strong></p>
          <p>Pass: <strong>sharjeel123</strong></p>
          <div style="margin-top: 20px;">
            <a href="/api/setup/bypass" style="color: #000; background: #39FF14; padding: 10px 20px; text-decoration: none; font-weight: bold; border-radius: 4px;">EMERGENCY BYPASS LOGIN</a>
          </div>
        </div>
        <p style="margin-top: 40px; opacity: 0.5;">Status: MISSION_READY | Timestamp: ${new Date().toISOString()}</p>
      </div>
    `);
  } catch (error) {
    res.status(500).send(`<div style="padding: 20px; background: maroon; color: white;">INITIALIZATION FAILED: ${error.message}</div>`);
  }
});

app.get('/api/setup/bypass', async (req, res) => {
  const email = 'sharjeel@galaxyexpress.pk';
  const pass = 'sharjeel123';
  
  try {
    const auth = admin.auth();
    const firestore = admin.firestore();
    
    // 1. Attempt Firebase Auth / Firestore Sync with full crash-safety
    let fbUser = { uid: 'master-offline-id' }; // Fallback ID if Firebase is completely dead
    let syncStatus = "Recovery Mode Active (Local Auth Only)";
    let customToken = null;

    try {
      if (admin.apps.length > 0 && admin.apps[0].options.credential) {
        try {
          fbUser = await auth.getUserByEmail(email);
          await auth.updateUser(fbUser.uid, { password: pass });
        } catch (e) {
          fbUser = await auth.createUser({ email, password: pass, displayName: 'Sharjeel Khan' });
        }

        try {
          await firestore.collection('users').doc(fbUser.uid).set({
            email, name: 'Sharjeel - Galaxy Master', role: 'SUPER_ADMIN', 
            status: 'APPROVED', isActive: true, createdAt: new Date().toISOString()
          }, { merge: true });
          customToken = await auth.createCustomToken(fbUser.uid, { role: 'SUPER_ADMIN' });
          syncStatus = "Identity Synchronized ✓";
        } catch (e) {
          console.warn("Firestore sync skipped:", e.message);
        }
      }
    } catch (globalFbErr) {
      console.error("🔥 Critical Firebase SDK Failure during bypass:", globalFbErr.message);
      syncStatus = "Firebase Cluster Offline (Local Session Active)";
    }

    // 2. Generate Local JWT (Always works regardless of Firebase)
    const masterPayload = { id: fbUser.uid, role: 'SUPER_ADMIN', tenantId: null };
    const token = jwt.sign(masterPayload, process.env.JWT_SECRET || 'fallback_secret', { expiresIn: '24h' });
    const user = { id: fbUser.uid, name: 'Sharjeel - System Master', email, role: 'SUPER_ADMIN' };

    res.send(`
      <div style="background: #000; color: #39FF14; font-family: 'Courier New', monospace; padding: 50px; text-align: center; min-height: 100vh;">
        <h1 style="text-shadow: 0 0 20px #39FF14; margin-bottom: 30px;">⚡ GALAXY EXPRESS ROOT INITIALIZATION</h1>
        <div id="log" style="background: rgba(57,255,20,0.05); border: 1px solid #39FF14; padding: 20px; text-align: left; max-width: 650px; margin: 0 auto; min-height: 200px; border-radius: 8px; font-size: 0.9rem; line-height: 1.6;">
          <p style="color: #fff; margin: 0;">[SYSTEM] Identity Protocol Ready...</p>
          <div style="color: #39FF14; margin-top: 10px;">[STATUS] ${syncStatus}</div>
        </div>
        <button id="btn" onclick="startRootProtocol()" style="margin-top: 30px; padding: 20px 50px; background: #39FF14; color: #000; border: none; font-weight: 900; cursor: pointer; border-radius: 4px; font-size: 1.2rem; text-transform: uppercase;">Initialize Master Session</button>
        
        <script type="module">
          import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
          import { getAuth, signInWithCustomToken } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
          
          const config = {
            apiKey: "AIzaSyBhj3W49UOLoZYB9MzAJYBsN2m2yUHixks",
            authDomain: "galaxy-express-saas.firebaseapp.com",
            projectId: "galaxy-express-saas",
            storageBucket: "galaxy-express-saas.firebasestorage.app",
            messagingSenderId: "1064319458646",
            appId: "1:1064319458646:web:849621950588983e078af7"
          };
          
          window.startRootProtocol = async () => {
            const btn = document.getElementById('btn');
            const logBox = document.getElementById('log');
            const addLog = (msg, color = '#39FF14') => {
              logBox.innerHTML += \`<div style="color: \${color}">[\${new Date().toLocaleTimeString()}] \${msg}</div>\`;
              logBox.scrollTop = logBox.scrollHeight;
            };
            
            btn.disabled = true;
            btn.innerText = 'INITIALIZING...';
            
            try {
              const customToken = ${customToken ? `'${customToken}'` : 'null'};
              
              if (customToken) {
                addLog("Contacting Firebase Authorization Cluster...");
                try {
                  const app = getApps().length === 0 ? initializeApp(config) : getApps()[0];
                  const auth = getAuth(app);
                  addLog("Validating Master Credentials...");
                  await signInWithCustomToken(auth, customToken);
                  addLog("Firebase Auth Handshake: SUCCESS", "#fff");
                } catch (e) {
                  addLog("Warning: Firebase Handshake Skipped: " + e.message, "#f97316");
                }
              } else {
                addLog("NOTICE: Proceeding with Local Identity Node (Real-time restricted)", "#0ea5e9");
              }
              
              addLog("Injecting Local Security Tokens...");
              localStorage.setItem('erp_token', '${token}');
              localStorage.setItem('erp_user', JSON.stringify(${JSON.stringify(user)}));
              addLog("Master Session Profile: PERSISTED", "#fff");
              
              addLog("Redirecting to Command Center...");
              setTimeout(() => {
                const bridgeUrl = new URL('https://partner.galaxyexpress.pk');
                bridgeUrl.searchParams.append('bridge_token', '${token}');
                bridgeUrl.searchParams.append('bridge_user', JSON.stringify(${JSON.stringify(user)}));
                window.location.href = bridgeUrl.toString();
              }, 1500);
            } catch (err) {
              console.error(err);
              addLog("MISSION FAILED: " + err.message, "red");
              btn.style.background = 'maroon';
              btn.style.color = '#fff';
              btn.innerText = 'FIX REQUIRED';
            }
          };
        </script>
      </div>
    `);
  } catch (err) {
    res.status(500).send("Bypass Component Error: " + err.message);
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
      const password = await bcrypt.hash('sharjeel123', 12);
      
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
