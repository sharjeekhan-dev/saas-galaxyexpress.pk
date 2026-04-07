import express from 'express';
import { requireAuth, requireTenant, requireRole } from '../middlewares/auth.js';
import { z } from 'zod';

const router = express.Router();

// =============================================
// CHART OF ACCOUNTS (COA)
// =============================================

router.get('/coa', requireAuth, requireTenant, async (req, res) => {
    try {
        const coa = await req.prisma.account.findMany({
            where: { tenantId: req.user.tenantId },
            orderBy: { name: 'asc' }
        });
        res.json(coa);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/coa', requireAuth, requireTenant, async (req, res) => {
    try {
        const { name, type } = req.body;
        const account = await req.prisma.account.create({
            data: { tenantId: req.user.tenantId, name, type, balance: 0 }
        });
        res.json(account);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// =============================================
// JOURNAL ENTRIES & VOUCHERS
// =============================================

router.get('/vouchers', requireAuth, requireTenant, async (req, res) => {
    try {
        const vouchers = await req.prisma.journalEntry.findMany({
            where: { tenantId: req.user.tenantId },
            include: { lines: { include: { account: true } } },
            orderBy: { date: 'desc' },
            take: 100
        });
        res.json(vouchers);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/vouchers', requireAuth, requireTenant, async (req, res) => {
    try {
        const { date, reference, description, lines } = req.body;
        
        // Validation: Sum of debits must equal sum of credits
        const debits = lines.reduce((s, l) => s + (l.debit || 0), 0);
        const credits = lines.reduce((s, l) => s + (l.credit || 0), 0);
        if (Math.abs(debits - credits) > 0.01) {
            return res.status(400).json({ error: 'Debits must equal Credits' });
        }

        const entry = await req.prisma.$transaction(async (tx) => {
            const je = await tx.journalEntry.create({
                data: {
                    tenantId: req.user.tenantId,
                    date: new Date(date),
                    reference,
                    description,
                    lines: {
                        create: lines.map(l => ({
                            accountId: l.accountId,
                            debit: l.debit || 0,
                            credit: l.credit || 0
                        }))
                    }
                },
                include: { lines: true }
            });

            // Update Account Balances
            for (const line of je.lines) {
                const diff = line.debit - line.credit;
                await tx.account.update({
                    where: { id: line.accountId },
                    data: { balance: { increment: diff } }
                });
            }
            return je;
        });

        res.json(entry);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// =============================================
// FINANCIAL REPORTS (Trial balance, Trial, Daybook)
// =============================================

router.get('/reports/trial-balance', requireAuth, requireTenant, async (req, res) => {
    try {
        const coa = await req.prisma.account.findMany({
            where: { tenantId: req.user.tenantId },
            orderBy: { type: 'asc' }
        });
        res.json(coa);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/reports/daybook', requireAuth, requireTenant, async (req, res) => {
    try {
        const { date } = req.query;
        const targetDate = date ? new Date(date) : new Date();
        const start = new Date(targetDate.setHours(0,0,0,0));
        const end = new Date(targetDate.setHours(23,59,59,999));

        const vouchers = await req.prisma.journalEntry.findMany({
            where: { 
                tenantId: req.user.tenantId,
                date: { gte: start, lte: end }
            },
            include: { lines: { include: { account: true } } }
        });
        res.json(vouchers);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

export default router;
