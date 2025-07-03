import { types, flow, Instance } from 'mobx-state-tree';
import apiClient, { API_ENDPOINTS } from '../lib/api/config';

const Transaction = types.model('Transaction', {
  _id: types.identifier,
  userId: types.string,
  type: types.enumeration('TransactionType', ['credit', 'debit']),
  amount: types.number,
  currency: types.string,
  description: types.string,
  reference: types.maybe(types.string),
  status: types.enumeration('TransactionStatus', ['pending', 'completed', 'failed']),
  createdAt: types.string,
  updatedAt: types.string,
});

const UserBalanceModel = types
  .model('UserBalance', {
    balance: types.number,
    currency: types.string,
    transactions: types.array(Transaction),
    isLoading: types.optional(types.boolean, false),
    error: types.maybe(types.string),
    paymentIntentClientSecret: types.maybe(types.string),
    paymentIntentId: types.maybe(types.string),
  })
  .views(self => ({
    get formattedBalance() {
      return `₹${self.balance.toFixed(2)}`;
    },
    get recentTransactions() {
      return self.transactions.slice(0, 10);
    },
    get totalCredits() {
      return self.transactions
        .filter(t => t.type === 'credit')
        .reduce((sum, t) => sum + t.amount, 0);
    },
    get totalDebits() {
      return self.transactions
        .filter(t => t.type === 'debit')
        .reduce((sum, t) => sum + t.amount, 0);
    },
  }))
  .actions(self => ({
    fetchBalance: flow(function* () {
      self.isLoading = true;
      self.error = undefined;
      
      try {
        const response = yield apiClient.get(API_ENDPOINTS.PAYMENTS.BALANCE);
        const { balance, currency } = response.data.data;
        self.balance = balance;
        self.currency = currency;
      } catch (error: any) {
        self.error = error.response?.data?.message || 'Failed to fetch balance';
      } finally {
        self.isLoading = false;
      }
    }),

    fetchTransactions: flow(function* (limit = 50, offset = 0) {
      self.isLoading = true;
      self.error = undefined;
      
      try {
        const response = yield apiClient.get(`${API_ENDPOINTS.PAYMENTS.TRANSACTIONS}?limit=${limit}&offset=${offset}`);
        self.transactions.clear();
        response.data.data.forEach((transaction: any) => {
          self.transactions.push(transaction);
        });
      } catch (error: any) {
        self.error = error.response?.data?.message || 'Failed to fetch transactions';
      } finally {
        self.isLoading = false;
      }
    }),

    createPaymentIntent: flow(function* (amount: number) {
      self.isLoading = true;
      self.error = undefined;
      
      try {
        const response = yield apiClient.post(API_ENDPOINTS.PAYMENTS.CREATE_PAYMENT_INTENT, { amount });
        const { clientSecret, paymentIntentId } = response.data.data;
        self.paymentIntentClientSecret = clientSecret;
        self.paymentIntentId = paymentIntentId;
        return { clientSecret, paymentIntentId };
      } catch (error: any) {
        self.error = error.response?.data?.message || 'Failed to create payment intent';
        throw error;
      } finally {
        self.isLoading = false;
      }
    }),

    checkProjectEligibility: flow(function* () {
      self.isLoading = true;
      self.error = undefined;
      
      try {
        const response = yield apiClient.get('/api/payments/check-project-eligibility');
        return response.data.data;
      } catch (error: any) {
        self.error = error.response?.data?.message || 'Failed to check project eligibility';
        throw error;
      } finally {
        self.isLoading = false;
      }
    }),

    clearPaymentIntent() {
      self.paymentIntentClientSecret = undefined;
      self.paymentIntentId = undefined;
    },

    manualBalanceUpdate: flow(function* (amount: number, paymentIntentId: string) {
      // Direct payment processing for successful payments
      console.log(`💳 Processing direct payment: ₹${amount}, PaymentIntent: ${paymentIntentId}`);
      
      try {
        const response = yield apiClient.post('/api/payments/process-direct-payment', {
          amount,
          paymentIntentId
        });
        
        if (response.data.success) {
          console.log('✅ Direct payment processed successfully:', response.data.data);
          
          // Update local balance
          self.balance = response.data.data.newBalance;
          
          // Add transaction to local state
          if (response.data.data.transaction) {
            self.transactions.unshift(response.data.data.transaction);
          }
          
          // Clear any error state
          self.error = undefined;
        } else {
          throw new Error(response.data.message || 'Payment processing failed');
        }
      } catch (error: any) {
        console.error('❌ Direct payment processing failed:', error);
        self.error = error.response?.data?.message || error.message || 'Payment processing failed';
        throw error;
      }
    }),

    refreshAfterPayment: flow(function* () {
      // Refresh balance and transactions after successful payment
      self.isLoading = true;
      
      try {
        // Fetch balance
        const balanceResponse = yield apiClient.get('/api/payments/balance');
        const { balance, currency } = balanceResponse.data.data;
        self.balance = balance;
        self.currency = currency;
        
        // Fetch transactions
        const transactionsResponse = yield apiClient.get('/api/payments/transactions?limit=50&offset=0');
        self.transactions.clear();
        transactionsResponse.data.data.forEach((transaction: any) => {
          self.transactions.push(transaction);
        });
        
        // Clear payment intent
        self.paymentIntentClientSecret = undefined;
        self.paymentIntentId = undefined;
      } catch (error: any) {
        self.error = error.response?.data?.message || 'Failed to refresh after payment';
      } finally {
        self.isLoading = false;
      }
    }),
  }));

export type IUserBalance = Instance<typeof UserBalanceModel>;
export const createUserBalance = () => UserBalanceModel.create({
  balance: 0,
  currency: 'INR',
  transactions: [],
});

export default UserBalanceModel; 