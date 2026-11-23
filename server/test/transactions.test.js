/**
 * Integration test for Stage 2 & Stage 3 transaction + reports endpoints.
 * Uses mongodb-memory-server (already in devDependencies) so no real DB needed.
 * Run: node --test server/test/transactions.test.js
 */
import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import supertest from 'supertest';

// Bootstrap env before importing app
process.env.JWT_SECRET = 'test-jwt-secret-at-least-32-characters-long';
process.env.NODE_ENV = 'test';

const { default: app } = await import('../src/app.js');
const request = supertest(app);

let mongod;
let authCookie;
let userId;

/* ─── Helpers ─────────────────────────────────────────────────── */
async function register(name = 'Test User', email = 'test@example.com', password = 'Password123') {
  return request.post('/api/auth/register').send({ name, email, password });
}

/* ─── Setup ───────────────────────────────────────────────────── */
before(async () => {
  mongod = await MongoMemoryServer.create();
  await mongoose.connect(mongod.getUri());
  const regRes = await register();
  assert.equal(regRes.status, 201, `Register failed: ${JSON.stringify(regRes.body)}`);
  authCookie = regRes.headers['set-cookie'];
  userId = regRes.body.user.id;
  console.log('✓ Test user registered and auth cookie obtained');
});

after(async () => {
  await mongoose.disconnect();
  await mongod.stop();
});

/* ─── Income Tests ────────────────────────────────────────────── */
describe('Income CRUD', () => {
  let incomeId;

  it('POST /api/transactions/income — creates income', async () => {
    const res = await request
      .post('/api/transactions/income')
      .set('Cookie', authCookie)
      .send({ amount: 2500, source: 'Salary', date: '2024-11-01', description: 'Monthly pay' });
    assert.equal(res.status, 201);
    assert.equal(res.body.income.amount, 2500);
    assert.equal(res.body.income.source, 'Salary');
    assert.equal(res.body.income.type, 'income');
    incomeId = res.body.income._id;
  });

  it('POST /api/transactions/income — rejects missing source', async () => {
    const res = await request
      .post('/api/transactions/income')
      .set('Cookie', authCookie)
      .send({ amount: 100, date: '2024-11-01' });
    assert.equal(res.status, 400);
  });

  it('POST /api/transactions/income — rejects negative amount', async () => {
    const res = await request
      .post('/api/transactions/income')
      .set('Cookie', authCookie)
      .send({ amount: -50, source: 'Bad', date: '2024-11-01' });
    assert.equal(res.status, 400);
  });

  it('GET /api/transactions/income — lists income', async () => {
    const res = await request
      .get('/api/transactions/income')
      .set('Cookie', authCookie);
    assert.equal(res.status, 200);
    assert.ok(Array.isArray(res.body.income));
    assert.ok(res.body.income.length >= 1);
  });

  it('PUT /api/transactions/income/:id — updates income', async () => {
    const res = await request
      .put(`/api/transactions/income/${incomeId}`)
      .set('Cookie', authCookie)
      .send({ amount: 3000, source: 'Salary + Bonus', date: '2024-11-01', description: 'Updated' });
    assert.equal(res.status, 200);
    assert.equal(res.body.income.amount, 3000);
    assert.equal(res.body.income.source, 'Salary + Bonus');
  });

  it('DELETE /api/transactions/income/:id — deletes income', async () => {
    const res = await request
      .delete(`/api/transactions/income/${incomeId}`)
      .set('Cookie', authCookie);
    assert.equal(res.status, 200);
  });
});

/* ─── Expense Tests ───────────────────────────────────────────── */
describe('Expense CRUD', () => {
  let expenseId;

  it('POST /api/transactions/expenses — creates expense', async () => {
    const res = await request
      .post('/api/transactions/expenses')
      .set('Cookie', authCookie)
      .send({ amount: 45.50, category: 'Food', date: '2024-11-02', description: 'Groceries' });
    assert.equal(res.status, 201);
    assert.equal(res.body.expense.amount, 45.5);
    assert.equal(res.body.expense.category, 'Food');
    assert.equal(res.body.expense.type, 'expense');
    expenseId = res.body.expense._id;
  });

  it('POST /api/transactions/expenses — rejects invalid category', async () => {
    const res = await request
      .post('/api/transactions/expenses')
      .set('Cookie', authCookie)
      .send({ amount: 20, category: 'InvalidCat', date: '2024-11-02' });
    assert.equal(res.status, 400);
  });

  it('POST /api/transactions/expenses — accepts all 8 valid categories', async () => {
    const categories = ['Food', 'Transportation', 'Shopping', 'Education', 'Entertainment', 'Healthcare', 'Bills', 'Other'];
    for (const category of categories) {
      const res = await request
        .post('/api/transactions/expenses')
        .set('Cookie', authCookie)
        .send({ amount: 10, category, date: '2024-11-02' });
      assert.equal(res.status, 201, `Category "${category}" failed: ${JSON.stringify(res.body)}`);
    }
  });

  it('GET /api/transactions/expenses — lists expenses', async () => {
    const res = await request
      .get('/api/transactions/expenses')
      .set('Cookie', authCookie);
    assert.equal(res.status, 200);
    assert.ok(Array.isArray(res.body.expenses));
  });

  it('PUT /api/transactions/expenses/:id — updates expense', async () => {
    const res = await request
      .put(`/api/transactions/expenses/${expenseId}`)
      .set('Cookie', authCookie)
      .send({ amount: 60, category: 'Shopping', date: '2024-11-03', description: 'Updated' });
    assert.equal(res.status, 200);
    assert.equal(res.body.expense.amount, 60);
    assert.equal(res.body.expense.category, 'Shopping');
  });

  it('DELETE /api/transactions/expenses/:id — deletes expense', async () => {
    const res = await request
      .delete(`/api/transactions/expenses/${expenseId}`)
      .set('Cookie', authCookie);
    assert.equal(res.status, 200);
  });
});

/* ─── Dashboard Summary ───────────────────────────────────────── */
describe('Dashboard Summary', () => {
  before(async () => {
    await request.post('/api/transactions/income').set('Cookie', authCookie)
      .send({ amount: 5000, source: 'Salary', date: '2024-11-01' });
    await request.post('/api/transactions/expenses').set('Cookie', authCookie)
      .send({ amount: 1200, category: 'Bills', date: '2024-11-05' });
    await request.post('/api/transactions/expenses').set('Cookie', authCookie)
      .send({ amount: 350, category: 'Food', date: '2024-11-10' });
  });

  it('GET /api/transactions/summary — returns aggregated data', async () => {
    const res = await request.get('/api/transactions/summary').set('Cookie', authCookie);
    assert.equal(res.status, 200);
    assert.ok(typeof res.body.totalIncome === 'number');
    assert.ok(typeof res.body.totalExpenses === 'number');
    assert.ok(typeof res.body.balance === 'number');
    assert.ok(Array.isArray(res.body.monthly));
    assert.equal(res.body.monthly.length, 6);
    assert.ok(typeof res.body.categoryBreakdown === 'object');
    assert.ok(Array.isArray(res.body.recent));
  });

  it('GET /api/transactions/summary — balance = totalIncome - totalExpenses', async () => {
    const res = await request.get('/api/transactions/summary').set('Cookie', authCookie);
    const expected = res.body.totalIncome - res.body.totalExpenses;
    assert.ok(Math.abs(res.body.balance - expected) < 0.01);
  });
});

/* ─── Stage 3: Reports Analytics ──────────────────────────────── */
describe('Stage 3: Reports & Analytics Endpoint', () => {
  it('GET /api/transactions/reports — returns full analytics breakdown', async () => {
    const res = await request.get('/api/transactions/reports').set('Cookie', authCookie);
    assert.equal(res.status, 200);
    assert.ok(typeof res.body.totalIncome === 'number');
    assert.ok(typeof res.body.totalExpenses === 'number');
    assert.ok(typeof res.body.balance === 'number');
    assert.ok(typeof res.body.savingsRate === 'number');
    assert.ok(Array.isArray(res.body.monthly));
    assert.equal(res.body.monthly.length, 12); // default 12 months
    assert.ok(Array.isArray(res.body.categoryBreakdown));
    assert.ok(Array.isArray(res.body.incomeBreakdown));
    assert.ok(typeof res.body.transactionCount === 'number');

    // Balance verification
    assert.equal(res.body.balance, res.body.totalIncome - res.body.totalExpenses);

    // Category breakdown should contain Bills and Food
    const catNames = res.body.categoryBreakdown.map((c) => c.name);
    assert.ok(catNames.includes('Bills'));
    assert.ok(catNames.includes('Food'));

    // Category percents should sum close to 100% (accounting for integer rounding)
    const totalPercent = res.body.categoryBreakdown.reduce((s, c) => s + c.percent, 0);
    assert.ok(totalPercent <= 105 && totalPercent >= 95);
  });

  it('GET /api/transactions/reports?months=6 — respects custom month count', async () => {
    const res = await request.get('/api/transactions/reports?months=6').set('Cookie', authCookie);
    assert.equal(res.status, 200);
    assert.equal(res.body.monthly.length, 6);
  });

  it('dynamic recalculation: adding new expense updates report immediately', async () => {
    const beforeRes = await request.get('/api/transactions/reports').set('Cookie', authCookie);
    const prevExpense = beforeRes.body.totalExpenses;
    const beforeHealth = beforeRes.body.categoryBreakdown.find((c) => c.name === 'Healthcare');

    // Add a $500 Healthcare expense
    await request.post('/api/transactions/expenses').set('Cookie', authCookie)
      .send({ amount: 500, category: 'Healthcare', date: '2024-11-15' });

    const afterRes = await request.get('/api/transactions/reports').set('Cookie', authCookie);
    assert.equal(afterRes.body.totalExpenses, prevExpense + 500);
    assert.equal(afterRes.body.balance, afterRes.body.totalIncome - afterRes.body.totalExpenses);

    const health = afterRes.body.categoryBreakdown.find((c) => c.name === 'Healthcare');
    assert.ok(health);
    assert.equal(health.amount, (beforeHealth?.amount || 0) + 500);
  });
});

/* ─── Route Protection & User Isolation ───────────────────────── */
describe('Route Protection & Data Isolation', () => {
  it('GET /api/transactions/reports — rejects unauthenticated request', async () => {
    const res = await request.get('/api/transactions/reports');
    assert.equal(res.status, 401);
  });

  it('each user sees ONLY their own data in reports', async () => {
    // Register User 2
    const reg2 = await register('User Two', 'user2_stage3@example.com', 'Password456');
    const cookie2 = reg2.headers['set-cookie'];

    // User 2 adds their own income and expense
    await request.post('/api/transactions/income').set('Cookie', cookie2)
      .send({ amount: 9999, source: 'User2 Private Income', date: '2024-11-01' });
    await request.post('/api/transactions/expenses').set('Cookie', cookie2)
      .send({ amount: 888, category: 'Education', date: '2024-11-02' });

    // Fetch reports for User 2
    const u2Res = await request.get('/api/transactions/reports').set('Cookie', cookie2);
    assert.equal(u2Res.body.totalIncome, 9999);
    assert.equal(u2Res.body.totalExpenses, 888);

    // Fetch reports for User 1 — User 1 must NOT see User 2's data
    const u1Res = await request.get('/api/transactions/reports').set('Cookie', authCookie);
    assert.notEqual(u1Res.body.totalIncome, 9999);
    const u1IncomeSources = u1Res.body.incomeBreakdown.map((s) => s.name);
    assert.equal(u1IncomeSources.includes('User2 Private Income'), false);
  });
});
