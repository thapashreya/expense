import { useEffect, useState } from 'react';
import { useTransactions } from '../context/TransactionContext.jsx';
import { AppShell } from '../components/AppShell.jsx';
import { Toast, useToast } from '../components/Toast.jsx';
import { ConfirmModal } from '../components/ConfirmModal.jsx';
import { formatNPR } from '../lib/currency.js';

const EMPTY_FORM = { amount: '', source: '', date: '', description: '' };

const COMMON_SOURCES = ['Salary', 'Freelance', 'Business', 'Investments', 'Bonus', 'Rental', 'Gifts', 'Other'];

function fmtDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });
}

export default function IncomePage() {
  const { income, addIncome, updateIncome, deleteIncome, refreshAll, loading } = useTransactions();
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
    if (!form.source.trim()) return 'Income source is required.';
    if (!form.date) return 'Transaction date is required.';
    return '';
  }

  function startEdit(item) {
    setEditId(item._id);
    setForm({
      amount: String(item.amount),
      source: item.source || '',
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
        source: form.source.trim(),
        date: form.date,
        description: form.description.trim(),
      };
      if (editId) {
        await updateIncome(editId, payload);
        show('Income updated successfully.');
        cancelEdit();
      } else {
        await addIncome(payload);
        show('Income recorded successfully in Nepali Rupees.');
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
      await deleteIncome(deleteTarget);
      show('Income entry deleted.');
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
            <h1 className="page-title">Manage Income</h1>
            <p className="page-subtitle">Record and review your earnings in Nepali Rupees (रु.)</p>
          </div>
        </div>

        {toast && <Toast key={toast.key} message={toast.message} type={toast.type} onClose={hide} />}

        {/* Quick source pills */}
        <div className="source-quick-pills" aria-label="Common income sources">
          <span className="pills-label">Quick Suggestions:</span>
          {COMMON_SOURCES.map((src) => (
            <button
              key={src}
              type="button"
              className={`source-chip${form.source === src ? ' source-chip-active' : ''}`}
              onClick={() => { setForm((f) => ({ ...f, source: src })); setFormError(''); }}
            >
              {src}
            </button>
          ))}
        </div>

        {/* Form Card */}
        <div className="card luxury-form-card">
          <div className="card-header-flex">
            <div>
              <h2 className="card-title">{editId ? 'Edit Income Entry' : 'Add New Income'}</h2>
              <p className="card-subtitle-small">All values are stored in Nepali Rupees</p>
            </div>
            {editId && (
              <span className="editing-badge">Editing Mode</span>
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
                    placeholder="e.g. 25000"
                    value={form.amount}
                    onChange={update}
                    required
                  />
                </div>
              </label>

              <label className="form-field">
                <span>Income Source *</span>
                <input
                  type="text"
                  name="source"
                  placeholder="e.g. Monthly Salary, Freelance project"
                  value={form.source}
                  onChange={update}
                  maxLength={100}
                  required
                />
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
                  placeholder="e.g. Client deposit, Q3 festival bonus"
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
              <button className="btn-primary" type="submit" disabled={submitting}>
                {submitting ? 'Saving to Database…' : editId ? 'Save Changes' : '+ Record Income'}
              </button>
            </div>
          </form>
        </div>

        {/* Income History Table */}
        <div className="card">
          <div className="card-header-flex">
            <div>
              <h2 className="card-title">Income History</h2>
              <p className="card-subtitle-small">Total {income.length} income record{income.length !== 1 ? 's' : ''}</p>
            </div>
          </div>

          {loading && !income.length ? (
            <div className="page-loading"><div className="luxury-spinner" /></div>
          ) : income.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">💰</div>
              <p className="empty-title">No income recorded yet</p>
              <p className="empty-desc">Use the form above to record your first earnings.</p>
            </div>
          ) : (
            <div className="tx-list">
              {income.map((item) => (
                <div key={item._id} className="tx-row">
                  <div className="tx-badge tx-badge-income">↑</div>
                  <div className="tx-info">
                    <div className="tx-label">{item.source}</div>
                    <div className="tx-desc">{item.description || fmtDate(item.date)}</div>
                  </div>
                  <div className="tx-date">{fmtDate(item.date)}</div>
                  <div className="tx-amount tx-amount-income">+{formatNPR(item.amount)}</div>
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
            title="Delete Income Record"
            message="Are you sure you want to delete this income entry? Your dashboard balance will be updated immediately."
            onConfirm={confirmDelete}
            onCancel={() => setDeleteTarget(null)}
            loading={deleting}
          />
        )}
      </div>
    </AppShell>
  );
}
