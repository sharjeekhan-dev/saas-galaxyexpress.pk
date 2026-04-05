import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import morgan from 'morgan';
import { PrismaClient } from '@prisma/client';

dotenv.config();

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
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(morgan('dev'));

// Static file serving for uploads
app.use('/uploads', express.static('uploads'));

// Assign prisma & io to req for easy access in controllers
app.use((req, res, next) => {
  req.prisma = prisma;
  req.io = io;
  next();
});

// ============ Load Routes ============
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

// Phase 2 Routes
import chatRoutes from './routes/chat.js';
import settingsRoutes from './routes/settings.js';
import printersRoutes from './routes/printers.js';
import notificationsRoutes from './routes/notifications.js';

// ============ Register Routes ============
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
app.use('/api/chat', chatRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/printers', printersRoutes);
app.use('/api/notifications', notificationsRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString(), routes: 19 });
});

// Global error handling middleware
app.use((err, req, res, next) => {
  console.error('[ERROR]', err);
  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.path} not found` });
});

// ============ WebSocket ============
io.on('connection', (socket) => {
  console.log(`Socket connected: ${socket.id}`);

  socket.on('join_room', ({ tenantId, outletId, userId, chatId }) => {
    if (tenantId) socket.join(`tenant_${tenantId}`);
    if (outletId) socket.join(`outlet_${outletId}`);
    if (userId) socket.join(`user_${userId}`); // For push notifications
    if (chatId) socket.join(`chat_${chatId}`); // For direct messaging
  });

  socket.on('rider_location_update', (data) => {
    io.to(`tenant_${data.tenantId}`).emit('rider_location', data);
  });

  socket.on('typing', ({ chatId, userId }) => {
    socket.to(`chat_${chatId}`).emit('user_typing', { userId });
  });

  socket.on('disconnect', () => {
    console.log(`Socket disconnected: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 23 API route modules loaded`);
});
