import { useEffect, useState, useMemo } from 'react';
import { useTransactions } from '../context/TransactionContext.jsx';
import { AppShell } from '../components/AppShell.jsx';
import { Toast, useToast } from '../components/Toast.jsx';
import { ConfirmModal } from '../components/ConfirmModal.jsx';
import { formatNPR } from '../lib/currency.js';

const CATEGORIES = [
  'Food', 'Transportation', 'Shopping', 'Education',
  'Entertainment', 'Healthcare', 'Bills', 'Other',
];

const CATEGORY_ICONS = {
  Food: '🍔', Transportation: '🚗', Shopping: '🛍️', Education: '📚',
  Entertainment: '🎬', Healthcare: '💊', Bills: '📄', Other: '📌',
};

const PAGE_SIZE = 10;

function fmtDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });
}

export default function TransactionsPage() {
  const {
    income, expenses,
    deleteIncome, deleteExpense,
    updateIncome, updateExpense,
    refreshAll, loading,
  } = useTransactions();
  const { toast, show, hide } = useToast();

  /* ── Filter state ─────────────────────────────────────────── */
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');       // all | income | expense
  const [categoryFilter, setCategoryFilter] = useState('');  // '' = all
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  /* ── Edit state ───────────────────────────────────────────── */
  const [editTarget, setEditTarget] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [editError, setEditError] = useState('');
  const [saving, setSaving] = useState(false);

  /* ── Delete state ─────────────────────────────────────────── */
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => { refreshAll(); }, [refreshAll]);

  /* ── Merge + filter ───────────────────────────────────────── */
  const all = useMemo(() => [
    ...income.map((t) => ({ ...t, _type: 'income' })),
    ...expenses.map((t) => ({ ...t, _type: 'expense' })),
  ].sort((a, b) => new Date(b.date) - new Date(a.date)), [income, expenses]);

  const filtered = useMemo(() => {
    let list = all;

    // Search filter
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      list = list.filter((t) => {
        const label = (t.source || t.category || '').toLowerCase();
        const desc = (t.description || '').toLowerCase();
        const amt = String(t.amount);
        return label.includes(term) || desc.includes(term) || amt.includes(term);
      });
    }

    // Type filter
    if (typeFilter !== 'all') {
      list = list.filter((t) => t._type === typeFilter);
    }

    // Category filter
    if (categoryFilter) {
      list = list.filter((t) => t._type === 'expense' && t.category === categoryFilter);
    }

    // Date range filter
    if (dateFrom) {
      const from = new Date(dateFrom);
      list = list.filter((t) => new Date(t.date) >= from);
    }
    if (dateTo) {
      const to = new Date(dateTo);
      to.setHours(23, 59, 59, 999);
      list = list.filter((t) => new Date(t.date) <= to);
    }

    return list;
  }, [all, searchTerm, typeFilter, categoryFilter, dateFrom, dateTo]);

  // Reset to page 1 whenever filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, typeFilter, categoryFilter, dateFrom, dateTo]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE) || 1;
  const paginatedList = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, currentPage]);

  /* ── Summary of filtered results ──────────────────── */
  const filteredIncome = filtered
    .filter((t) => t._type === 'income')
    .reduce((s, t) => s + t.amount, 0);
  const filteredExpenses = filtered
    .filter((t) => t._type === 'expense')
    .reduce((s, t) => s + t.amount, 0);

  function clearFilters() {
    setSearchTerm('');
    setTypeFilter('all');
    setCategoryFilter('');
    setDateFrom('');
    setDateTo('');
    setCurrentPage(1);
  }

  const hasActiveFilters = Boolean(searchTerm.trim() || typeFilter !== 'all' || categoryFilter || dateFrom || dateTo);

  function exportCSV() {
    if (!filtered.length) return;
    const headers = ['Type', 'Source/Category', 'Amount (NPR)', 'Date', 'Description'];
    const rows = filtered.map((tx) => [
      tx._type,
      `"${(tx.source || tx.category || '').replace(/"/g, '""')}"`,
      tx.amount,
      tx.date ? new Date(tx.date).toISOString().slice(0, 10) : '',
      `"${(tx.description || '').replace(/"/g, '""')}"`,
    ]);
    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `SpendWell_Transactions_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    show('Transactions exported to CSV successfully.');
  }

  /* ── Edit handlers ────────────────────────────────────────── */
  function openEdit(tx) {
    setEditTarget(tx);
    const base = {
      amount: String(tx.amount),
      date: tx.date ? tx.date.slice(0, 10) : '',
      description: tx.description || '',
    };
    if (tx._type === 'income') {
      setEditForm({ ...base, source: tx.source || '' });
    } else {
      setEditForm({ ...base, category: tx.category || '' });
    }
    setEditError('');
  }

  function closeEdit() {
    setEditTarget(null);
    setEditForm({});
    setEditError('');
  }

  function updateField(e) {
    setEditForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    setEditError('');
  }

  async function saveEdit(e) {
    e.preventDefault();
    if (!editTarget) return;

    if (!editForm.amount || isNaN(Number(editForm.amount)) || Number(editForm.amount) <= 0) {
      setEditError('Enter a valid positive amount in Nepali Rupees (रु.).'); return;
    }
    if (!editForm.date) { setEditError('Date is required.'); return; }
    if (editTarget._type === 'income' && !editForm.source?.trim()) {
      setEditError('Income source is required.'); return;
    }
    if (editTarget._type === 'expense' && !editForm.category) {
      setEditError('Category is required.'); return;
    }

    setSaving(true);
    try {
      const payload = {
        amount: Number(editForm.amount),
        date: editForm.date,
        description: editForm.description?.trim() || '',
      };
      if (editTarget._type === 'income') {
        payload.source = editForm.source.trim();
        await updateIncome(editTarget._id, payload);
      } else {
        payload.category = editForm.category;
        await updateExpense(editTarget._id, payload);
      }
      show('Transaction updated successfully.');
      closeEdit();
    } catch (err) {
      setEditError(err.message);
    } finally {
      setSaving(false);
    }
  }

  /* ── Delete handler ───────────────────────────────────────── */
  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      if (deleteTarget._type === 'income') await deleteIncome(deleteTarget._id);
      else await deleteExpense(deleteTarget._id);
      show('Transaction deleted successfully.');
    } catch (err) {
      show(err.message, 'error');
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  }

  return (
    <AppShell>
      <div className="page light-luxury">
        {/* ── Header ──────────────────────────────────────────── */}
        <div className="page-header">
          <div>
            <h1 className="page-title">Transaction History</h1>
            <p className="page-subtitle">
              Viewing {filtered.length} transaction{filtered.length !== 1 ? 's' : ''} in Nepali Rupees (रु.)
              {hasActiveFilters ? ' (filtered)' : ''}
            </p>
          </div>
          {all.length > 0 && (
            <button
              type="button"
              className="btn-ghost"
              onClick={exportCSV}
              disabled={filtered.length === 0}
              title="Download filtered transactions as CSV"
            >
              📥 Export CSV
            </button>
          )}
        </div>

        {toast && <Toast key={toast.key} message={toast.message} type={toast.type} onClose={hide} />}

        {/* ── Filter bar ──────────────────────────────────────── */}
        <div className="card filter-card">
          <div className="filter-bar">
            {/* Keyword search */}
            <div className="filter-group filter-group-search">
              <label className="filter-label">Search</label>
              <input
                type="text"
                className="filter-input"
                placeholder="Search description, category..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Type tabs */}
            <div className="filter-group">
              <label className="filter-label">Type</label>
              <div className="filter-tabs">
                {['all', 'income', 'expense'].map((f) => (
                  <button
                    key={f}
                    className={`filter-tab${typeFilter === f ? ' filter-tab-active' : ''}`}
                    onClick={() => setTypeFilter(f)}
                  >
                    {f === 'all' ? 'All' : f === 'income' ? 'Income' : 'Expenses'}
                  </button>
                ))}
              </div>
            </div>

            {/* Category dropdown */}
            <div className="filter-group">
              <label className="filter-label">Category</label>
              <select
                className="filter-select"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <option value="">All categories</option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{CATEGORY_ICONS[c]} {c}</option>
                ))}
              </select>
            </div>

            {/* Date from */}
            <div className="filter-group">
              <label className="filter-label">From</label>
              <input
                type="date"
                className="filter-input"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
            </div>

            {/* Date to */}
            <div className="filter-group">
              <label className="filter-label">To</label>
              <input
                type="date"
                className="filter-input"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
            </div>

            {/* Clear */}
            {hasActiveFilters && (
              <button className="btn-ghost filter-clear-btn" onClick={clearFilters}>
                Clear filters
              </button>
            )}
          </div>

          {/* Summary pills */}
          {filtered.length > 0 && (
            <div className="filter-summary">
              <span className="filter-pill filter-pill-income">
                Filtered Income: {formatNPR(filteredIncome)}
              </span>
              <span className="filter-pill filter-pill-expense">
                Filtered Expenses: {formatNPR(filteredExpenses)}
              </span>
              <span className="filter-pill filter-pill-net">
                Net: {formatNPR(filteredIncome - filteredExpenses)}
              </span>
            </div>
          )}
        </div>

        {/* ── Transaction table ────────────────────────────────── */}
        <div className="card">
          {loading && !all.length ? (
            <div className="page-loading"><div className="luxury-spinner" /></div>
          ) : filtered.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">≡</div>
              <p className="empty-title">
                {hasActiveFilters ? 'No matching transactions' : 'No transactions recorded yet'}
              </p>
              <p className="empty-desc">
                {hasActiveFilters
                  ? 'Try adjusting your search terms or date filters.'
                  : 'Add your first income or expense to begin tracking.'}
              </p>
              {hasActiveFilters && (
                <button className="btn-ghost" onClick={clearFilters}>Clear all filters</button>
              )}
            </div>
          ) : (
            <>
              {/* Desktop table header */}
              <div className="tx-table-header">
                <div className="tx-th tx-th-type">Type</div>
                <div className="tx-th tx-th-detail">Source / Category</div>
                <div className="tx-th tx-th-desc">Description</div>
                <div className="tx-th tx-th-date">Date</div>
                <div className="tx-th tx-th-amount">Amount (NPR)</div>
                <div className="tx-th tx-th-actions">Actions</div>
              </div>

              <div className="tx-list">
                {paginatedList.map((tx) => {
                  const isIncome = tx._type === 'income';
                  const icon = isIncome ? '↑' : (CATEGORY_ICONS[tx.category] ?? '↓');
                  const sourceOrCat = isIncome
                    ? (tx.source || 'Income')
                    : (tx.category || 'Expense');
                  return (
                    <div key={tx._id} className="tx-row tx-row-table">
                      {/* Type badge */}
                      <div className="tx-cell tx-cell-type">
                        <span className={`tx-type-tag tx-type-tag-${tx._type}`}>
                          {icon} {isIncome ? 'Income' : 'Expense'}
                        </span>
                      </div>

                      {/* Source / Category */}
                      <div className="tx-cell tx-cell-detail">
                        <div className="tx-label">{sourceOrCat}</div>
                      </div>

                      {/* Description */}
                      <div className="tx-cell tx-cell-desc">
                        <div className="tx-desc">{tx.description || '—'}</div>
                      </div>

                      {/* Date */}
                      <div className="tx-cell tx-cell-date">
                        {fmtDate(tx.date)}
                      </div>

                      {/* Amount */}
                      <div className={`tx-cell tx-cell-amount tx-amount-${tx._type}`}>
                        {isIncome ? '+' : '-'}{formatNPR(tx.amount)}
                      </div>

                      {/* Actions */}
                      <div className="tx-cell tx-cell-actions">
                        <button
                          className="icon-btn"
                          onClick={() => openEdit(tx)}
                          title="Edit transaction"
                        >
                          ✎
                        </button>
                        <button
                          className="icon-btn icon-btn-danger"
                          onClick={() => setDeleteTarget(tx)}
                          title="Delete transaction"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* ── Pagination bar ────────────────────────────── */}
              {filtered.length > PAGE_SIZE && (
                <div className="pagination">
                  <div className="pagination-info">
                    Showing {(currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, filtered.length)} of {filtered.length} entries
                  </div>
                  <div className="pagination-controls">
                    <button
                      type="button"
                      className="page-btn"
                      onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                      disabled={currentPage === 1}
                    >
                      ← Prev
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                      .map((p, idx, arr) => (
                        <span key={p} style={{ display: 'inline-flex', alignItems: 'center' }}>
                          {idx > 0 && arr[idx - 1] !== p - 1 && <span style={{ padding: '0 4px', color: '#A997C9' }}>…</span>}
                          <button
                            type="button"
                            className={`page-btn${currentPage === p ? ' page-btn-active' : ''}`}
                            onClick={() => setCurrentPage(p)}
                          >
                            {p}
                          </button>
                        </span>
                      ))}
                    <button
                      type="button"
                      className="page-btn"
                      onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                      disabled={currentPage === totalPages}
                    >
                      Next →
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* ── Edit modal ───────────────────────────────────────── */}
        {editTarget && (
          <div className="modal-overlay" role="dialog" aria-modal="true">
            <div className="modal-box modal-box-edit">
              <h3 className="modal-title">
                Edit {editTarget._type === 'income' ? 'Income' : 'Expense'} Record
              </h3>
              <form className="luxury-form" onSubmit={saveEdit} noValidate>
                <div className="form-row">
                  <label className="form-field">
                    <span>Amount (रु. NPR) *</span>
                    <div className="input-with-symbol">
                      <span className="currency-prefix">रु.</span>
                      <input
                        type="number"
                        name="amount"
                        min="1"
                        step="any"
                        value={editForm.amount}
                        onChange={updateField}
                        required
                      />
                    </div>
                  </label>

                  {editTarget._type === 'income' ? (
                    <label className="form-field">
                      <span>Income Source *</span>
                      <input
                        type="text"
                        name="source"
                        value={editForm.source}
                        onChange={updateField}
                        maxLength={100}
                        required
                      />
                    </label>
                  ) : (
                    <label className="form-field">
                      <span>Category *</span>
                      <select
                        name="category"
                        value={editForm.category}
                        onChange={updateField}
                        required
                      >
                        <option value="">Select category…</option>
                        {CATEGORIES.map((c) => (
                          <option key={c} value={c}>{CATEGORY_ICONS[c]} {c}</option>
                        ))}
                      </select>
                    </label>
                  )}
                </div>

                <div className="form-row">
                  <label className="form-field">
                    <span>Date *</span>
                    <input
                      type="date"
                      name="date"
                      value={editForm.date}
                      onChange={updateField}
                      required
                    />
                  </label>
                  <label className="form-field">
                    <span>Description</span>
                    <input
                      type="text"
                      name="description"
                      value={editForm.description}
                      onChange={updateField}
                      maxLength={200}
                    />
                  </label>
                </div>

                {editError && <div className="alert alert-error">{editError}</div>}

                <div className="form-actions">
                  <button type="button" className="btn-ghost" onClick={closeEdit} disabled={saving}>
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary" disabled={saving}>
                    {saving ? 'Saving Changes…' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ── Delete modal ─────────────────────────────────────── */}
        {deleteTarget && (
          <ConfirmModal
            title="Delete Transaction"
            message="Are you sure you want to delete this record? This action cannot be undone."
            onConfirm={confirmDelete}
            onCancel={() => setDeleteTarget(null)}
            loading={deleting}
          />
        )}
      </div>
    </AppShell>
  );
}
