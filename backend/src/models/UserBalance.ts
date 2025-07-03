import mongoose, { Document, Schema } from 'mongoose';

export interface IUserBalance extends Document {
  userId: string;
  balance: number;
  currency: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ITransaction extends Document {
  userId: string;
  type: 'credit' | 'debit';
  amount: number;
  currency: string;
  description: string;
  reference?: string; // Stripe payment intent ID or project ID
  status: 'pending' | 'completed' | 'failed';
  createdAt: Date;
  updatedAt: Date;
}

const UserBalanceSchema = new Schema<IUserBalance>({
  userId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  balance: {
    type: Number,
    required: true,
    default: 0,
    min: 0
  },
  currency: {
    type: String,
    required: true,
    default: 'INR',
    enum: ['INR', 'USD', 'EUR']
  }
}, {
  timestamps: true
});

const TransactionSchema = new Schema<ITransaction>({
  userId: {
    type: String,
    required: true,
    index: true
  },
  type: {
    type: String,
    required: true,
    enum: ['credit', 'debit']
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    required: true,
    default: 'INR',
    enum: ['INR', 'USD', 'EUR']
  },
  description: {
    type: String,
    required: true
  },
  reference: {
    type: String
  },
  status: {
    type: String,
    required: true,
    enum: ['pending', 'completed', 'failed'],
    default: 'completed'
  }
}, {
  timestamps: true
});

// Indexes for better query performance
TransactionSchema.index({ userId: 1, createdAt: -1 });
TransactionSchema.index({ reference: 1 });

export const UserBalance = mongoose.model<IUserBalance>('UserBalance', UserBalanceSchema);
export const Transaction = mongoose.model<ITransaction>('Transaction', TransactionSchema); 