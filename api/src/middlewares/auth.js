import jwt from 'jsonwebtoken';
import { admin } from '../firebase-admin.js';

export const requireAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized: No token provided' });
    }
    const token = authHeader.split(' ')[1];

    // 1. DEVELOPMENT BYPASS
    if (token === 'dev-token-bypass') {
      req.user = { id: 'dev-master', role: 'SUPER_ADMIN', tenantId: 'global' };
      return next();
    }
    
    // 2. Try Firebase Verification first
    if (admin && admin.apps.length > 0) {
      try {
        const decodedToken = await admin.auth().verifyIdToken(token);
        
        // SYNC: Find or Create User in SQL DB
        let sqlUser = await req.prisma.user.findUnique({
          where: { id: decodedToken.uid },
          include: { tenant: true }
        });

        if (!sqlUser) {
          // Auto-Provision SQL record from Firebase Identity
          sqlUser = await req.prisma.user.create({
            data: {
              id: decodedToken.uid,
              email: decodedToken.email,
              name: decodedToken.name || decodedToken.email.split('@')[0],
              role: 'VENDOR', // Default role for new auto-synced users
              isActive: true
            }
          });
          console.log(`🆕 Auto-synced new Firebase user to SQL: ${decodedToken.email}`);
        }

        req.user = sqlUser;
        return next();
      } catch (firebaseErr) {
        // Not a valid Firebase token, fallback to custom JWT
      }
    }

    // 3. Fallback: Custom JWT Verification
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
    req.user = decoded;

    next();
  } catch (err) {
    return res.status(401).json({ error: 'Unauthorized: Invalid token session' });
  }
};

export const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) return res.status(403).json({ error: 'Forbidden: Authentication required' });
    if (req.user.role === 'SUPER_ADMIN') return next();
    if (!roles.includes(req.user.role)) return res.status(403).json({ error: 'Forbidden: Insufficient permissions' });
    next();
  };
};

export const requireTenant = (req, res, next) => {
  if (!req.user.tenantId && req.user.role !== 'SUPER_ADMIN') {
    return res.status(403).json({ error: 'Forbidden: Tenant scope required' });
  }
  next();
};

const PLAN_LIMITS = {
  BASIC: { maxOutlets: 1, maxProducts: 50, maxUsers: 2, features: ['pos'] },
  PRO: { maxOutlets: 5, maxProducts: 500, maxUsers: 10, features: ['pos', 'inventory', 'reports'] },
  ENTERPRISE: { maxOutlets: 999, maxProducts: 99999, maxUsers: 999, features: ['pos', 'inventory', 'reports', 'accounting', 'hr', 'delivery'] },
};

export const requirePlan = (feature) => {
  return async (req, res, next) => {
    if (req.user.role === 'SUPER_ADMIN') return next();
    if (!req.user.tenantId) return res.status(403).json({ error: 'Tenant context missing' });

    try {
      const tenant = await req.prisma.tenant.findUnique({ where: { id: req.user.tenantId } });
      if (!tenant) return res.status(404).json({ error: 'Tenant not found' });
      
      if (!tenant.isActive || tenant.isSuspended) {
        return res.status(403).json({ 
          error: 'Tenant status: DISABLED', 
          message: tenant.suspensionReason || 'Access suspended by administration.' 
        });
      }

      // 1. Check manual feature toggles (Super Admin override)
      if (tenant.featureToggles && typeof tenant.featureToggles[feature] === 'boolean') {
        if (!tenant.featureToggles[feature]) {
          return res.status(403).json({ error: `Feature [${feature}] is manually disabled for this tenant.` });
        }
        return next(); // Override allowed
      }

      // 2. Check billing expiry
      if (tenant.billingExpiry && new Date(tenant.billingExpiry) < new Date()) {
        return res.status(402).json({ error: 'Subscription expired. Please renew for full access.' });
      }

      // 3. Fallback to plan defaults
      const limits = PLAN_LIMITS[tenant.plan] || PLAN_LIMITS.BASIC;
      if (feature && !limits.features.includes(feature)) {
        return res.status(403).json({ error: `Feature [${feature}] not included in ${tenant.plan} plan.` });
      }

      req.planLimits = limits;
      req.tenant = tenant;
      next();
    } catch (err) {
      res.status(500).json({ error: 'Infrastructure plan check failed' });
    }
  };
};

export const checkLimit = (resource) => {
  return async (req, res, next) => {
    if (req.user.role === 'SUPER_ADMIN') return next();

    try {
      const tenant = await req.prisma.tenant.findUnique({ where: { id: req.user.tenantId } });
      const limits = tenant?.limits || PLAN_LIMITS[tenant?.plan || 'BASIC'];

      let count = 0;
      if (resource === 'outlets') count = await req.prisma.outlet.count({ where: { tenantId: req.user.tenantId } });
      else if (resource === 'products') count = await req.prisma.product.count({ where: { tenantId: req.user.tenantId } });
      else if (resource === 'users') count = await req.prisma.user.count({ where: { tenantId: req.user.tenantId } });

      const maxKey = `max${resource.charAt(0).toUpperCase() + resource.slice(1)}`;
      if (limits[maxKey] && count >= limits[maxKey]) {
        return res.status(403).json({ error: `SAAS LIMIT REACHED: Max ${resource} (${limits[maxKey]})` });
      }

      next();
    } catch (err) {
      res.status(500).json({ error: 'SaaS quota verification failed' });
    }
  };
};
