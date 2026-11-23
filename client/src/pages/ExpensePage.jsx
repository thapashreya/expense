import { useEffect, useState } from 'react';
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

const EMPTY_FORM = { amount: '', category: '', date: '', description: '' };

function fmtDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });
}

export default function ExpensePage() {
  const { expenses, addExpense, updateExpense, deleteExpense, refreshAll, loading } = useTransactions();
  const { toast, show, hide } = useToast();

  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [editId, setEditId] = useState(null);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  function update(e) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    setFormError('');
  }

  function validate() {
    if (!form.amount || isNaN(Number(form.amount)) || Number(form.amount) <= 0)
      return 'Please enter a valid positive amount in Nepali Rupees (रु.).';
    if (!form.category) return 'Please choose an expense category.';
    if (!form.date) return 'Transaction date is required.';
    return '';
  }

  function startEdit(item) {
    setEditId(item._id);
    setForm({
      amount: String(item.amount),
      category: item.category || '',
      date: item.date ? item.date.slice(0, 10) : '',
      description: item.description || '',
    });
    setFormError('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function cancelEdit() {
    setEditId(null);
    setForm(EMPTY_FORM);
    setFormError('');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const err = validate();
    if (err) { setFormError(err); return; }

    setSubmitting(true);
    try {
      const payload = {
        amount: Number(form.amount),
        category: form.category,
        date: form.date,
        description: form.description.trim(),
      };
      if (editId) {
        await updateExpense(editId, payload);
        show('Expense updated successfully.');
        cancelEdit();
      } else {
        await addExpense(payload);
        show('Expense recorded successfully in Nepali Rupees.');
        setForm(EMPTY_FORM);
      }
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteExpense(deleteTarget);
      show('Expense entry deleted.');
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
        <div className="page-header">
          <div>
            <h1 className="page-title">Manage Expenses</h1>
            <p className="page-subtitle">Track your spending with smart categories in Nepali Rupees (रु.)</p>
          </div>
        </div>

        {toast && <Toast key={toast.key} message={toast.message} type={toast.type} onClose={hide} />}

        {/* Category visual chips */}
        <div className="category-chips-deck" aria-label="Select Category">
          <span className="pills-label">Quick Select Category:</span>
          <div className="category-grid">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                className={`luxury-category-chip${form.category === cat ? ' category-chip-active' : ''}`}
                onClick={() => { setForm((f) => ({ ...f, category: cat })); setFormError(''); }}
              >
                <span className="chip-emoji" aria-hidden="true">{CATEGORY_ICONS[cat]}</span>
                <span className="chip-name">{cat}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Form Card */}
        <div className="card luxury-form-card">
          <div className="card-header-flex">
            <div>
              <h2 className="card-title">{editId ? 'Edit Expense Entry' : 'Add New Expense'}</h2>
              <p className="card-subtitle-small">All values are tracked in Nepali Rupees</p>
            </div>
            {editId && (
              <span className="editing-badge editing-badge-rose">Editing Mode</span>
            )}
          </div>

          <form className="luxury-form" onSubmit={handleSubmit} noValidate>
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
                    placeholder="e.g. 1450"
                    value={form.amount}
                    onChange={update}
                    required
                  />
                </div>
              </label>

              <label className="form-field">
                <span>Category *</span>
                <select name="category" value={form.category} onChange={update} required>
                  <option value="">Select category…</option>
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{CATEGORY_ICONS[c]} {c}</option>
                  ))}
                </select>
              </label>
            </div>

            <div className="form-row">
              <label className="form-field">
                <span>Date *</span>
                <input
                  type="date"
                  name="date"
                  value={form.date}
                  onChange={update}
                  required
                />
              </label>

              <label className="form-field">
                <span>Description (Optional)</span>
                <input
                  type="text"
                  name="description"
                  placeholder="e.g. Weekly vegetable basket, ride share"
                  value={form.description}
                  onChange={update}
                  maxLength={200}
                />
              </label>
            </div>

            {formError && <div className="alert alert-error">{formError}</div>}

            <div className="form-actions">
              {editId && (
                <button type="button" className="btn-ghost" onClick={cancelEdit}>
                  Cancel Edit
                </button>
              )}
              <button className="btn-primary btn-primary-rose" type="submit" disabled={submitting}>
                {submitting ? 'Saving to Database…' : editId ? 'Save Changes' : '- Record Expense'}
              </button>
            </div>
          </form>
        </div>

        {/* Expense History Table */}
        <div className="card">
          <div className="card-header-flex">
            <div>
              <h2 className="card-title">Expense History</h2>
              <p className="card-subtitle-small">Total {expenses.length} expense record{expenses.length !== 1 ? 's' : ''}</p>
            </div>
          </div>

          {loading && !expenses.length ? (
            <div className="page-loading"><div className="luxury-spinner" /></div>
          ) : expenses.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🛍️</div>
              <p className="empty-title">No expenses logged yet</p>
              <p className="empty-desc">Use the form above to record your first expense in Nepali Rupees.</p>
            </div>
          ) : (
            <div className="tx-list">
              {expenses.map((item) => (
                <div key={item._id} className="tx-row">
                  <div className="tx-badge tx-badge-expense">
                    {CATEGORY_ICONS[item.category] ?? '↓'}
                  </div>
                  <div className="tx-info">
                    <div className="tx-label">{item.category}</div>
                    <div className="tx-desc">{item.description || fmtDate(item.date)}</div>
                  </div>
                  <div className="tx-date">{fmtDate(item.date)}</div>
                  <div className="tx-amount tx-amount-expense">-{formatNPR(item.amount)}</div>
                  <div className="tx-actions">
                    <button className="icon-btn" onClick={() => startEdit(item)} title="Edit entry">✎</button>
                    <button className="icon-btn icon-btn-danger" onClick={() => setDeleteTarget(item._id)} title="Delete entry">✕</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {deleteTarget && (
          <ConfirmModal
            title="Delete Expense Record"
            message="Are you sure you want to delete this expense entry? Your dashboard calculations will be updated immediately."
            onConfirm={confirmDelete}
            onCancel={() => setDeleteTarget(null)}
            loading={deleting}
          />
        )}
      </div>
    </AppShell>
  );
}
