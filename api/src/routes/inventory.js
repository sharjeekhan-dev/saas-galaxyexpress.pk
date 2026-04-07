import express from 'express';
import { requireAuth, requireTenant, requireRole } from '../middlewares/auth.js';
import { z } from 'zod';

const router = express.Router();

// =============================================
// HELPERS
// =============================================

async function logAudit(prisma, tenantId, userId, username, actionType, entityId, productId, beforeQty, afterQty, changeQty, locationType, locationId, details) {
    return prisma.inventoryAuditTrail.create({
        data: {
            tenantId, userId, username, actionType, entityId, productId,
            beforeQty, afterQty, changeQty, locationType, locationId, details
        }
    });
}

// Ensure stock record exists for given product/outlet or product/department
async function ensureStock(prisma, tenantId, productId, outletId = null, departmentId = null) {
    const where = { productId };
    if (outletId) where.outletId = outletId;
    if (departmentId) where.departmentId = departmentId;

    let stock = await prisma.stock.findFirst({ where });
    if (!stock) {
        stock = await prisma.stock.create({
            data: { productId, outletId, departmentId, quantity: 0 }
        });
    }
    return stock;
}

// =============================================
// PURCHASE INVOICE (VENDOR -> STORE)
// =============================================

// POST /api/inventory/purchase-invoices — Create Pending
router.post('/purchase-invoices', requireAuth, requireTenant, async (req, res) => {
    try {
        const schema = z.object({
            vendorId: z.string().uuid(),
            storeId: z.string().uuid(),
            notes: z.string().optional(),
            lines: z.array(z.object({
                productId: z.string().uuid(),
                quantity: z.number().positive(),
                rate: z.number().nonnegative(),
            })).min(1),
        });

        const parsed = schema.safeParse(req.body);
        if (!parsed.success) return res.status(400).json({ error: 'Invalid data', details: parsed.error.flatten() });

        const { vendorId, storeId, notes, lines } = parsed.data;

        // Calculate totals
        const processedLines = lines.map(l => ({ ...l, total: l.quantity * l.rate }));
        const totalAmount = processedLines.reduce((sum, l) => sum + l.total, 0);

        const invite = await req.prisma.purchaseInvoice.create({
            data: {
                tenantId: req.user.tenantId,
                invoiceNumber: `INV-${Date.now()}`,
                vendorId,
                storeId,
                notes,
                status: 'PENDING',
                totalAmount,
                netAmount: totalAmount,
                lines: { create: processedLines }
            },
            include: { lines: true }
        });

        res.json(invite);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/inventory/purchase-invoices — List
router.get('/purchase-invoices', requireAuth, requireTenant, async (req, res) => {
    try {
        const invoices = await req.prisma.purchaseInvoice.findMany({
            where: { tenantId: req.user.tenantId },
            include: { vendor: true, store: true, lines: { include: { product: true } } },
            orderBy: { createdAt: 'desc' }
        });
        res.json(invoices);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PATCH /api/inventory/purchase-invoices/:id/approve
router.patch('/purchase-invoices/:id/approve', requireAuth, requireTenant, requireRole(['SUPER_ADMIN', 'TENANT_ADMIN', 'VENDOR']), async (req, res) => {
    try {
        const { id } = req.params;
        const invoice = await req.prisma.purchaseInvoice.findFirst({
            where: { id, tenantId: req.user.tenantId, status: 'PENDING' },
            include: { lines: true }
        });

        if (!invoice) return res.status(404).json({ error: 'Pending invoice not found' });

        await req.prisma.$transaction(async (tx) => {
            // Update Status
            await tx.purchaseInvoice.update({
                where: { id },
                data: { status: 'APPROVED', approvedBy: req.user.name }
            });

            // Update Stock
            for (const line of invoice.lines) {
                const stock = await ensureStock(tx, req.user.tenantId, line.productId, invoice.storeId, null);
                const beforeQty = stock.quantity;
                const afterQty = beforeQty + line.quantity;

                await tx.stock.update({
                    where: { id: stock.id },
                    data: { quantity: afterQty }
                });

                // Audit Log
                await logAudit(tx, req.user.tenantId, req.user.id, req.user.name, 'PURCHASE', invoice.id, line.productId, beforeQty, afterQty, line.quantity, 'STORE', invoice.storeId, `Received from ${invoice.vendorId}`);
            }
        });

        res.json({ message: 'Purchase Invoice Approved & Stock Updated' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// =============================================
// STOCK ISSUANCE (STORE -> DEPT)
// =============================================

// POST /api/inventory/issuances
router.post('/issuances', requireAuth, requireTenant, async (req, res) => {
    try {
        const schema = z.object({
            storeId: z.string().uuid(),
            departmentId: z.string().uuid(),
            notes: z.string().optional(),
            lines: z.array(z.object({
                productId: z.string().uuid(),
                quantity: z.number().positive(),
            })).min(1),
        });

        const parsed = schema.safeParse(req.body);
        if (!parsed.success) return res.status(400).json({ error: 'Invalid data', details: parsed.error.flatten() });

        const issuance = await req.prisma.stockIssuance.create({
            data: {
                tenantId: req.user.tenantId,
                storeId: parsed.data.storeId,
                departmentId: parsed.data.departmentId,
                notes: parsed.data.notes,
                status: 'PENDING',
                lines: { create: parsed.data.lines }
            }
        });

        res.json(issuance);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PATCH /api/inventory/issuances/:id/approve
router.patch('/issuances/:id/approve', requireAuth, requireTenant, requireRole(['SUPER_ADMIN', 'TENANT_ADMIN']), async (req, res) => {
    try {
        const { id } = req.params;
        const issuance = await req.prisma.stockIssuance.findFirst({
            where: { id, tenantId: req.user.tenantId, status: 'PENDING' },
            include: { lines: true }
        });

        if (!issuance) return res.status(404).json({ error: 'Pending issuance not found' });

        await req.prisma.$transaction(async (tx) => {
            // Update Status
            await tx.stockIssuance.update({
                where: { id },
                data: { status: 'APPROVED', approvedBy: req.user.name }
            });

            for (const line of issuance.lines) {
                // Check Source Stock (Store)
                const storeStock = await ensureStock(tx, req.user.tenantId, line.productId, issuance.storeId, null);
                if (storeStock.quantity < line.quantity) throw new Error(`Insufficient stock for Product ${line.productId} in Store`);

                const storeBefore = storeStock.quantity;
                const storeAfter = storeBefore - line.quantity;

                // Update Store Stock
                await tx.stock.update({ where: { id: storeStock.id }, data: { quantity: storeAfter } });

                // Check/Create Dept Stock
                const deptStock = await ensureStock(tx, req.user.tenantId, line.productId, null, issuance.departmentId);
                const deptBefore = deptStock.quantity;
                const deptAfter = deptBefore + line.quantity;

                // Update Dept Stock
                await tx.stock.update({ where: { id: deptStock.id }, data: { quantity: deptAfter } });

                // Logs
                await logAudit(tx, req.user.tenantId, req.user.id, req.user.name, 'ISSUANCE_OUT', issuance.id, line.productId, storeBefore, storeAfter, -line.quantity, 'STORE', issuance.storeId, `Issued to Dept ${issuance.departmentId}`);
                await logAudit(tx, req.user.tenantId, req.user.id, req.user.name, 'ISSUANCE_IN', issuance.id, line.productId, deptBefore, deptAfter, line.quantity, 'DEPARTMENT', issuance.departmentId, `Received from Store ${issuance.storeId}`);
            }
        });

        res.json({ message: 'Stock Issuance Approved' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// =============================================
// SUPPLIERS
// =============================================

router.get('/suppliers', requireAuth, requireTenant, async (req, res) => {
    try {
        const suppliers = await req.prisma.supplier.findMany({
            where: { tenantId: req.user.tenantId },
            orderBy: { name: 'asc' }
        });
        res.json(suppliers);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/suppliers', requireAuth, requireTenant, async (req, res) => {
    try {
        const { name, contact, email, terms } = req.body;
        const supplier = await req.prisma.supplier.create({
            data: { tenantId: req.user.tenantId, name, contact, email, terms }
        });
        res.json(supplier);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/suppliers/:id', requireAuth, requireTenant, async (req, res) => {
    try {
        await req.prisma.supplier.delete({ where: { id: req.params.id } });
        res.json({ message: 'Supplier deleted' });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// =============================================
// STOCK ADJUSTMENTS
// =============================================

router.post('/adjustments', requireAuth, requireTenant, async (req, res) => {
    try {
        const { locationId, locationType, notes, lines } = req.body;
        const adj = await req.prisma.stockAdjustment.create({
            data: {
                tenantId: req.user.tenantId,
                locationId, locationType, notes,
                status: 'PENDING',
                lines: {
                    create: lines.map(l => ({
                        productId: l.productId,
                        oldQuantity: l.oldQuantity || 0,
                        newQuantity: l.newQuantity,
                        difference: l.newQuantity - (l.oldQuantity || 0)
                    }))
                }
            }
        });
        res.json(adj);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

router.patch('/adjustments/:id/approve', requireAuth, requireTenant, requireRole(['SUPER_ADMIN', 'TENANT_ADMIN']), async (req, res) => {
    try {
        const { id } = req.params;
        const adj = await req.prisma.stockAdjustment.findFirst({
            where: { id, tenantId: req.user.tenantId, status: 'PENDING' },
            include: { lines: true }
        });
        if (!adj) return res.status(404).json({ error: 'Adjustment not found' });

        await req.prisma.$transaction(async (tx) => {
            await tx.stockAdjustment.update({ where: { id }, data: { status: 'APPROVED', approvedBy: req.user.name } });
            for (const line of adj.lines) {
                const isStore = adj.locationType === 'STORE';
                const stock = await ensureStock(tx, req.user.tenantId, line.productId, isStore ? adj.locationId : null, isStore ? null : adj.locationId);
                const before = stock.quantity;
                const after = line.newQuantity;

                await tx.stock.update({ where: { id: stock.id }, data: { quantity: after } });
                await logAudit(tx, req.user.tenantId, req.user.id, req.user.name, 'ADJUSTMENT', adj.id, line.productId, before, after, line.difference, adj.locationType, adj.locationId, adj.notes);
            }
        });
        res.json({ message: 'Adjustment Approved' });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// =============================================
// WASTAGE
// =============================================

router.post('/wastages', requireAuth, requireTenant, async (req, res) => {
    try {
        const { locationId, locationType, reason, notes, lines } = req.body;
        const waste = await req.prisma.wastage.create({
            data: {
                tenantId: req.user.tenantId,
                locationId, locationType, reason, notes,
                status: 'PENDING',
                lines: { create: lines.map(l => ({ productId: l.productId, quantity: l.quantity })) }
            }
        });
        res.json(waste);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

router.patch('/wastages/:id/approve', requireAuth, requireTenant, requireRole(['SUPER_ADMIN', 'TENANT_ADMIN']), async (req, res) => {
    try {
        const { id } = req.params;
        const waste = await req.prisma.wastage.findFirst({
            where: { id, tenantId: req.user.tenantId, status: 'PENDING' },
            include: { lines: true }
        });
        if (!waste) return res.status(404).json({ error: 'Wastage report not found' });

        await req.prisma.$transaction(async (tx) => {
            await tx.wastage.update({ where: { id }, data: { status: 'APPROVED', approvedBy: req.user.name } });
            for (const line of waste.lines) {
                const isStore = waste.locationType === 'STORE';
                const stock = await ensureStock(tx, req.user.tenantId, line.productId, isStore ? waste.locationId : null, isStore ? null : waste.locationId);
                if (stock.quantity < line.quantity) throw new Error(`Insufficient stock for Product ${line.productId} to log wastage`);

                const before = stock.quantity;
                const after = before - line.quantity;

                await tx.stock.update({ where: { id: stock.id }, data: { quantity: after } });
                await logAudit(tx, req.user.tenantId, req.user.id, req.user.name, 'WASTAGE', waste.id, line.productId, before, after, -line.quantity, waste.locationType, waste.locationId, `Wastage: ${waste.reason}`);
            }
        });
        res.json({ message: 'Wastage Approved' });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// =============================================
// STOCK GENERAL QUERIES
// =============================================

router.get('/stock', requireAuth, requireTenant, async (req, res) => {
    try {
        const { outletId, departmentId } = req.query;
        const where = { product: { tenantId: req.user.tenantId } };
        if (outletId) where.outletId = outletId;
        if (departmentId) where.departmentId = departmentId;

        const stock = await req.prisma.stock.findMany({
            where,
            include: { product: true, outlet: true, department: true }
        });
        res.json(stock);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/audit-logs', requireAuth, requireTenant, async (req, res) => {
    try {
        const logs = await req.prisma.inventoryAuditTrail.findMany({
            where: { tenantId: req.user.tenantId },
            orderBy: { createdAt: 'desc' },
            take: 100
        });
        res.json(logs);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;

