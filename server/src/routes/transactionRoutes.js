import { Router } from 'express';
import mongoose from 'mongoose';
import { requireAuth } from '../middleware/requireAuth.js';
import Transaction, { VALID_EXPENSE_CATEGORIES } from '../models/Transaction.js';

const router = Router();

// All routes require authentication
router.use(requireAuth);

/* ─── Shared helpers ──────────────────────────────────────────── */

function validateAmount(value) {
  const n = Number(value);
  return Number.isFinite(n) && n > 0;
}

function sanitiseIncomeBody(body) {
  const errors = [];
  const { amount, source, date, description } = body ?? {};
  if (!validateAmount(amount)) errors.push('Amount must be a positive number.');
  if (typeof source !== 'string' || source.trim().length === 0)
    errors.push('Income source is required.');
  if (!date || isNaN(new Date(date).getTime())) errors.push('A valid date is required.');
  if (errors.length) return { errors };
  return {
    data: {
      amount: Number(amount),
      source: source.trim().slice(0, 100),
      date: new Date(date),
      description: typeof description === 'string' ? description.trim().slice(0, 200) : '',
      type: 'income',
    },
  };
}

function sanitiseExpenseBody(body) {
  const errors = [];
  const { amount, category, date, description } = body ?? {};
  if (!validateAmount(amount)) errors.push('Amount must be a positive number.');
  if (!VALID_EXPENSE_CATEGORIES.includes(category)) errors.push('A valid category is required.');
  if (!date || isNaN(new Date(date).getTime())) errors.push('A valid date is required.');
  if (errors.length) return { errors };
  return {
    data: {
      amount: Number(amount),
      category,
      date: new Date(date),
      description: typeof description === 'string' ? description.trim().slice(0, 200) : '',
      type: 'expense',
    },
  };
}

/* ─── Income routes ───────────────────────────────────────────── */

router.get('/income', async (req, res, next) => {
  try {
    const items = await Transaction.find({ user: req.user._id, type: 'income' }).sort({ date: -1 });
    res.json({ income: items });
  } catch (err) {
    next(err);
  }
});

router.post('/income', async (req, res, next) => {
  const { data, errors } = sanitiseIncomeBody(req.body);
  if (errors) return res.status(400).json({ message: errors.join(' ') });
  try {
    const item = await Transaction.create({ ...data, user: req.user._id });
    return res.status(201).json({ income: item });
  } catch (err) {
    return next(err);
  }
});

router.put('/income/:id', async (req, res, next) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(404).json({ message: 'Income record not found.' });
  }
  const { data, errors } = sanitiseIncomeBody(req.body);
  if (errors) return res.status(400).json({ message: errors.join(' ') });
  try {
    const item = await Transaction.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id, type: 'income' },
      data,
      { new: true, runValidators: true },
    );
    if (!item) return res.status(404).json({ message: 'Income record not found.' });
    return res.json({ income: item });
  } catch (err) {
    return next(err);
  }
});

router.delete('/income/:id', async (req, res, next) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(404).json({ message: 'Income record not found.' });
  }
  try {
    const item = await Transaction.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
      type: 'income',
    });
    if (!item) return res.status(404).json({ message: 'Income record not found.' });
    return res.json({ message: 'Income deleted.' });
  } catch (err) {
    return next(err);
  }
});

/* ─── Expense routes ──────────────────────────────────────────── */

router.get('/expenses', async (req, res, next) => {
  try {
    const items = await Transaction.find({ user: req.user._id, type: 'expense' }).sort({ date: -1 });
    res.json({ expenses: items });
  } catch (err) {
    next(err);
  }
});

router.post('/expenses', async (req, res, next) => {
  const { data, errors } = sanitiseExpenseBody(req.body);
  if (errors) return res.status(400).json({ message: errors.join(' ') });
  try {
    const item = await Transaction.create({ ...data, user: req.user._id });
    return res.status(201).json({ expense: item });
  } catch (err) {
    return next(err);
  }
});

router.put('/expenses/:id', async (req, res, next) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(404).json({ message: 'Expense record not found.' });
  }
  const { data, errors } = sanitiseExpenseBody(req.body);
  if (errors) return res.status(400).json({ message: errors.join(' ') });
  try {
    const item = await Transaction.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id, type: 'expense' },
      data,
      { new: true, runValidators: true },
    );
    if (!item) return res.status(404).json({ message: 'Expense record not found.' });
    return res.json({ expense: item });
  } catch (err) {
    return next(err);
  }
});

router.delete('/expenses/:id', async (req, res, next) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(404).json({ message: 'Expense record not found.' });
  }
  try {
    const item = await Transaction.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
      type: 'expense',
    });
    if (!item) return res.status(404).json({ message: 'Expense record not found.' });
    return res.json({ message: 'Expense deleted.' });
  } catch (err) {
    return next(err);
  }
});

/* ─── Dashboard summary ───────────────────────────────────────── */
// GET /api/transactions/summary
// Returns totals, last-5 recent, 6-month bar data, category breakdown
router.get('/summary', async (req, res, next) => {
  try {
    const userId = req.user._id;
    const allTx = await Transaction.find({ user: userId }).sort({ date: -1 });

    const incomeList = allTx.filter((t) => t.type === 'income');
    const expenseList = allTx.filter((t) => t.type === 'expense');

    const totalIncome = incomeList.reduce((s, t) => s + t.amount, 0);
    const totalExpenses = expenseList.reduce((s, t) => s + t.amount, 0);

    // Last 5 transactions across both types (already sorted date desc)
    const recent = allTx.slice(0, 5);

    // Build 6-month slots
    const now = new Date();
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({
        label: d.toLocaleString('default', { month: 'short', year: '2-digit' }),
        year: d.getFullYear(),
        month: d.getMonth(),
        income: 0,
        expenses: 0,
      });
    }

    for (const tx of allTx) {
      const txDate = new Date(tx.date);
      const slot = months.find(
        (m) => m.year === txDate.getFullYear() && m.month === txDate.getMonth(),
      );
      if (!slot) continue;
      if (tx.type === 'income') slot.income += tx.amount;
      else slot.expenses += tx.amount;
    }

    // Category breakdown
    const categoryMap = {};
    for (const tx of expenseList) {
      const cat = tx.category || 'Other';
      categoryMap[cat] = (categoryMap[cat] || 0) + tx.amount;
    }

    res.json({
      totalIncome,
      totalExpenses,
      balance: totalIncome - totalExpenses,
      recent,
      monthly: months,
      categoryBreakdown: categoryMap,
    });
  } catch (err) {
    next(err);
  }
});

/* ─── Reports (deep analytics) ───────────────────────────────── */
// GET /api/transactions/reports?months=12
// Returns per-month income, expenses, balance + all-time category breakdown
router.get('/reports', async (req, res, next) => {
  try {
    const userId = req.user._id;
    const monthCount = Math.min(Math.max(Number(req.query.months) || 12, 1), 24);

    const allTx = await Transaction.find({ user: userId }).sort({ date: -1 });

    const incomeList = allTx.filter((t) => t.type === 'income');
    const expenseList = allTx.filter((t) => t.type === 'expense');

    const totalIncome = incomeList.reduce((s, t) => s + t.amount, 0);
    const totalExpenses = expenseList.reduce((s, t) => s + t.amount, 0);

    // Build monthly slots (last N months)
    const now = new Date();
    const months = [];
    for (let i = monthCount - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({
        label: d.toLocaleString('default', { month: 'short', year: '2-digit' }),
        fullLabel: d.toLocaleString('default', { month: 'long', year: 'numeric' }),
        year: d.getFullYear(),
        month: d.getMonth(),
        income: 0,
        expenses: 0,
        balance: 0,
      });
    }

    for (const tx of allTx) {
      const txDate = new Date(tx.date);
      const slot = months.find(
        (m) => m.year === txDate.getFullYear() && m.month === txDate.getMonth(),
      );
      if (!slot) continue;
      if (tx.type === 'income') slot.income += tx.amount;
      else slot.expenses += tx.amount;
    }

    // Compute balance per month after filling
    for (const slot of months) {
      slot.balance = slot.income - slot.expenses;
    }

    // Category breakdown (all-time)
    const categoryMap = {};
    for (const tx of expenseList) {
      const cat = tx.category || 'Other';
      categoryMap[cat] = (categoryMap[cat] || 0) + tx.amount;
    }

    // Prepare category array sorted by amount desc
    const categoryBreakdown = Object.entries(categoryMap)
      .map(([name, amount]) => ({
        name,
        amount,
        percent: totalExpenses > 0 ? Math.round((amount / totalExpenses) * 100) : 0,
      }))
      .sort((a, b) => b.amount - a.amount);

    // Top income sources
    const sourceMap = {};
    for (const tx of incomeList) {
      const src = tx.source || 'Other';
      sourceMap[src] = (sourceMap[src] || 0) + tx.amount;
    }
    const incomeBreakdown = Object.entries(sourceMap)
      .map(([name, amount]) => ({
        name,
        amount,
        percent: totalIncome > 0 ? Math.round((amount / totalIncome) * 100) : 0,
      }))
      .sort((a, b) => b.amount - a.amount);

    res.json({
      totalIncome,
      totalExpenses,
      balance: totalIncome - totalExpenses,
      savingsRate: totalIncome > 0
        ? Math.round(((totalIncome - totalExpenses) / totalIncome) * 100)
        : 0,
      monthly: months,
      categoryBreakdown,
      incomeBreakdown,
      transactionCount: allTx.length,
      incomeCount: incomeList.length,
      expenseCount: expenseList.length,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
