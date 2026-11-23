import { createContext, useCallback, useContext, useState } from 'react';
import { incomeApi, expenseApi, summaryApi } from '../lib/api.js';

const TransactionContext = createContext(null);

export function TransactionProvider({ children }) {
  const [income, setIncome] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  /* ── Fetch helpers ─────────────────────────────────────────── */
  const fetchIncome = useCallback(async () => {
    const data = await incomeApi.getAll();
    setIncome(data);
    return data;
  }, []);

  const fetchExpenses = useCallback(async () => {
    const data = await expenseApi.getAll();
    setExpenses(data);
    return data;
  }, []);

  const fetchSummary = useCallback(async () => {
    const data = await summaryApi.get();
    setSummary(data);
    return data;
  }, []);

  const refreshAll = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      await Promise.all([fetchIncome(), fetchExpenses(), fetchSummary()]);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [fetchIncome, fetchExpenses, fetchSummary]);

  /* ── Income CRUD ───────────────────────────────────────────── */
  const addIncome = useCallback(async (payload) => {
    const item = await incomeApi.create(payload);
    setIncome((prev) => [item, ...prev].sort((a, b) => new Date(b.date) - new Date(a.date)));
    await fetchSummary();
    return item;
  }, [fetchSummary]);

  const updateIncome = useCallback(async (id, payload) => {
    const item = await incomeApi.update(id, payload);
    setIncome((prev) => prev.map((x) => (x._id === id ? item : x)).sort((a, b) => new Date(b.date) - new Date(a.date)));
    await fetchSummary();
    return item;
  }, [fetchSummary]);

  const deleteIncome = useCallback(async (id) => {
    await incomeApi.remove(id);
    setIncome((prev) => prev.filter((x) => x._id !== id));
    await fetchSummary();
  }, [fetchSummary]);

  /* ── Expense CRUD ──────────────────────────────────────────── */
  const addExpense = useCallback(async (payload) => {
    const item = await expenseApi.create(payload);
    setExpenses((prev) => [item, ...prev].sort((a, b) => new Date(b.date) - new Date(a.date)));
    await fetchSummary();
    return item;
  }, [fetchSummary]);

  const updateExpense = useCallback(async (id, payload) => {
    const item = await expenseApi.update(id, payload);
    setExpenses((prev) => prev.map((x) => (x._id === id ? item : x)).sort((a, b) => new Date(b.date) - new Date(a.date)));
    await fetchSummary();
    return item;
  }, [fetchSummary]);

  const deleteExpense = useCallback(async (id) => {
    await expenseApi.remove(id);
    setExpenses((prev) => prev.filter((x) => x._id !== id));
    await fetchSummary();
  }, [fetchSummary]);

  return (
    <TransactionContext.Provider
      value={{
        income,
        expenses,
        summary,
        loading,
        error,
        refreshAll,
        fetchSummary,
        addIncome,
        updateIncome,
        deleteIncome,
        addExpense,
        updateExpense,
        deleteExpense,
      }}
    >
      {children}
    </TransactionContext.Provider>
  );
}

export function useTransactions() {
  const ctx = useContext(TransactionContext);
  if (!ctx) throw new Error('useTransactions must be used within TransactionProvider');
  return ctx;
}

