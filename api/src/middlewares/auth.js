import jwt from 'jsonwebtoken';

export const requireAuth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized: No token provided' });
    }
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }
};

export const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden: Insufficient permissions' });
    }
    next();
  };
};

export const requireTenant = (req, res, next) => {
  if (!req.user.tenantId && req.user.role !== 'SUPER_ADMIN') {
    return res.status(403).json({ error: 'Forbidden: Tenant scope required' });
  }
  next();
};

// Plan enforcement middleware — checks tenant subscription limits
const PLAN_LIMITS = {
  BASIC: { maxOutlets: 1, maxProducts: 50, maxUsers: 5, features: ['pos', 'kds'] },
  PRO: { maxOutlets: 5, maxProducts: 500, maxUsers: 50, features: ['pos', 'kds', 'inventory', 'reports', 'coupons', 'waiter'] },
  ENTERPRISE: { maxOutlets: 999, maxProducts: 99999, maxUsers: 9999, features: ['pos', 'kds', 'inventory', 'reports', 'coupons', 'waiter', 'vendor', 'rider', 'hr', 'api_keys', 'b2b'] },
};

export const requirePlan = (feature) => {
  return async (req, res, next) => {
    if (req.user.role === 'SUPER_ADMIN') return next();
    if (!req.user.tenantId) return res.status(403).json({ error: 'Tenant required' });

    try {
      const tenant = await req.prisma.tenant.findUnique({ where: { id: req.user.tenantId } });
      if (!tenant || !tenant.isActive) return res.status(403).json({ error: 'Tenant is suspended' });

      // Check billing expiry
      if (tenant.billingExpiry && new Date(tenant.billingExpiry) < new Date()) {
        return res.status(402).json({ error: 'Subscription expired. Please renew.' });
      }

      const limits = PLAN_LIMITS[tenant.plan] || PLAN_LIMITS.BASIC;
      if (feature && !limits.features.includes(feature)) {
        return res.status(403).json({ error: `Feature "${feature}" not available on ${tenant.plan} plan. Upgrade required.` });
      }

      req.planLimits = limits;
      req.tenant = tenant;
      next();
    } catch (err) {
      res.status(500).json({ error: 'Plan check failed' });
    }
  };
};

// Check resource limits (outlets, products, users)
export const checkLimit = (resource) => {
  return async (req, res, next) => {
    if (req.user.role === 'SUPER_ADMIN') return next();

    try {
      const tenant = await req.prisma.tenant.findUnique({ where: { id: req.user.tenantId } });
      const limits = PLAN_LIMITS[tenant?.plan || 'BASIC'];

      let count = 0;
      if (resource === 'outlets') count = await req.prisma.outlet.count({ where: { tenantId: req.user.tenantId } });
      else if (resource === 'products') count = await req.prisma.product.count({ where: { tenantId: req.user.tenantId } });
      else if (resource === 'users') count = await req.prisma.user.count({ where: { tenantId: req.user.tenantId } });

      const maxKey = `max${resource.charAt(0).toUpperCase() + resource.slice(1)}`;
      if (limits[maxKey] && count >= limits[maxKey]) {
        return res.status(403).json({ error: `${resource} limit reached on ${tenant.plan} plan (max: ${limits[maxKey]})` });
      }

      next();
    } catch (err) {
      res.status(500).json({ error: 'Limit check failed' });
    }
  };
};
