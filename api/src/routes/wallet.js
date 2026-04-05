import express from 'express';
import { requireAuth } from '../middlewares/auth.js';
import { z } from 'zod';

const router = express.Router();

// GET /api/wallet — get user's wallet
router.get('/', requireAuth, async (req, res) => {
  try {
    let wallet = await req.prisma.wallet.findFirst({ where: { userId: req.user.id } });
    if (!wallet) {
      wallet = await req.prisma.wallet.create({ data: { userId: req.user.id, balance: 0 } });
    }
    const transactions = await req.prisma.walletTransaction.findMany({
      where: { walletId: wallet.id },
      orderBy: { createdAt: 'desc' },
      take: 50
    });
    res.json({ ...wallet, transactions });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/wallet/topup
router.post('/topup', requireAuth, async (req, res) => {
  try {
    const schema = z.object({ amount: z.number().positive(), reference: z.string().optional() });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: 'Validation failed' });

    let wallet = await req.prisma.wallet.findFirst({ where: { userId: req.user.id } });
    if (!wallet) wallet = await req.prisma.wallet.create({ data: { userId: req.user.id, balance: 0 } });

    const newBalance = wallet.balance + parsed.data.amount;

    const [updatedWallet, tx] = await req.prisma.$transaction([
      req.prisma.wallet.update({ where: { id: wallet.id }, data: { balance: newBalance } }),
      req.prisma.walletTransaction.create({
        data: { walletId: wallet.id, type: 'CREDIT', amount: parsed.data.amount, reference: parsed.data.reference || 'top-up', balanceAfter: newBalance }
      })
    ]);

    res.json({ wallet: updatedWallet, transaction: tx });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/wallet/debit — used during order payment
router.post('/debit', requireAuth, async (req, res) => {
  try {
    const { amount, reference } = req.body;
    if (!amount || amount <= 0) return res.status(400).json({ error: 'Invalid amount' });

    const wallet = await req.prisma.wallet.findFirst({ where: { userId: req.user.id } });
    if (!wallet) return res.status(404).json({ error: 'No wallet found' });
    if (wallet.balance < amount) return res.status(400).json({ error: 'Insufficient wallet balance' });

    const newBalance = wallet.balance - amount;

    const [updatedWallet, tx] = await req.prisma.$transaction([
      req.prisma.wallet.update({ where: { id: wallet.id }, data: { balance: newBalance } }),
      req.prisma.walletTransaction.create({
        data: { walletId: wallet.id, type: 'DEBIT', amount, reference: reference || 'order-payment', balanceAfter: newBalance }
      })
    ]);

    res.json({ wallet: updatedWallet, transaction: tx });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

export default router;
