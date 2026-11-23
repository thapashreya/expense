import mongoose from 'mongoose';

const EXPENSE_CATEGORIES = [
  'Food',
  'Transportation',
  'Shopping',
  'Education',
  'Entertainment',
  'Healthcare',
  'Bills',
  'Other',
];

const transactionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: ['income', 'expense'],
      required: [true, 'Transaction type is required.'],
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required.'],
      min: [0.01, 'Amount must be greater than zero.'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [200, 'Description cannot exceed 200 characters.'],
      default: '',
    },
    date: {
      type: Date,
      required: [true, 'Date is required.'],
    },
    // Income-specific
    source: {
      type: String,
      trim: true,
      maxlength: [100, 'Source cannot exceed 100 characters.'],
    },
    // Expense-specific
    category: {
      type: String,
      enum: {
        values: EXPENSE_CATEGORIES,
        message: 'Invalid expense category.',
      },
    },
  },
  { timestamps: true },
);

// Compound index for efficient per-user queries sorted by date
transactionSchema.index({ user: 1, date: -1 });

export const VALID_EXPENSE_CATEGORIES = EXPENSE_CATEGORIES;
const Transaction = mongoose.model('Transaction', transactionSchema);
export default Transaction;
