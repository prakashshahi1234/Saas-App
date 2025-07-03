import Stripe from 'stripe';
import { UserBalance, Transaction, IUserBalance, ITransaction } from '../models/UserBalance';
import dotenv from 'dotenv';

dotenv.config();

// Initialize Stripe with your secret key
const stripe = new Stripe(process.env['STRIPE_SECRET_KEY'] || '', {
  apiVersion: '2025-06-30.basil',
});

console.log(process.env['STRIPE_SECRET_KEY'], 'stripe secret key');

export class PaymentService {
  
  // Get or create user balance
  async getUserBalance(userId: string): Promise<IUserBalance> {
    let userBalance = await UserBalance.findOne({ userId });
    
    if (!userBalance) {
      userBalance = new UserBalance({
        userId,
        balance: 0,
        currency: 'INR'
      });
      await userBalance.save();
    }
    
    return userBalance;
  }

  // Check if user has sufficient balance
  async hasSufficientBalance(userId: string, amount: number): Promise<boolean> {
    const userBalance = await this.getUserBalance(userId);
    return userBalance.balance >= amount;
  }

  // Deduct balance for project creation - optimized for standalone MongoDB
  async deductBalance(userId: string, amount: number, projectId: string): Promise<{ success: boolean; newBalance: number; transaction?: ITransaction }> {
    try {
      const userBalance = await UserBalance.findOne({ userId });
      
      if (!userBalance || userBalance.balance < amount) {
        return { success: false, newBalance: userBalance?.balance || 0 };
      }

      // Deduct balance
      const oldBalance = userBalance.balance;
      userBalance.balance -= amount;
      await userBalance.save();

      // Create transaction record
      const transaction = new Transaction({
        userId,
        type: 'debit',
        amount,
        currency: 'INR',
        description: `Project creation fee`,
        reference: projectId,
        status: 'completed'
      });
      await transaction.save();

      console.log(`💸 Balance deducted: ${oldBalance} → ${userBalance.balance} for project ${projectId}`);
      
      return { 
        success: true, 
        newBalance: userBalance.balance,
        transaction 
      };
    } catch (error) {
      console.error(`❌ Failed to deduct balance for user ${userId}:`, error);
      throw error;
    }
  }

  // Add balance (after successful payment) - optimized for standalone MongoDB
  async addBalance(userId: string, amount: number, paymentIntentId: string): Promise<{ success: boolean; newBalance: number; transaction?: ITransaction }> {
    console.log(`💳 Adding balance: ₹${amount} for user ${userId} (Payment: ${paymentIntentId})`);
    
    try {
      // Check for duplicate transaction first (without session for standalone MongoDB)
      const existingTransaction = await Transaction.findOne({ reference: paymentIntentId });
      if (existingTransaction) {
        console.warn(`⚠️ Duplicate payment processing prevented for ${paymentIntentId}`);
        throw new Error('Payment has already been processed');
      }

      const userBalance = await UserBalance.findOne({ userId });
      if (!userBalance) {
        throw new Error('User balance not found');
      }
      
      // Add balance
      const oldBalance = userBalance.balance;
      userBalance.balance += amount;
      await userBalance.save();

      // Create transaction record
      const transaction = new Transaction({
        userId,
        type: 'credit',
        amount,
        currency: 'INR',
        description: `Balance top-up via Stripe (Direct)`,
        reference: paymentIntentId,
        status: 'completed'
      });
      await transaction.save();
      
      console.log(`✅ Balance updated: ${oldBalance} → ${userBalance.balance} (Transaction: ${transaction._id})`);
      
      return { 
        success: true, 
        newBalance: userBalance.balance,
        transaction 
      };
    } catch (error) {
      console.error(`❌ Failed to add balance for user ${userId}:`, error);
      throw error;
    }
  }

  // Create Stripe payment intent - optimized for direct payment flow
  async createPaymentIntent(amount: number, currency: string = 'inr', userId: string): Promise<Stripe.PaymentIntent> {
    console.log(`🎯 Creating payment intent: ₹${amount} for user ${userId}`);
    
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100, // Convert to smallest currency unit (paise for INR)
      currency,
      metadata: {
        userId,
        type: 'balance_topup',
        originalAmount: amount.toString(), // Store original amount for verification
        createdAt: new Date().toISOString()
      },
      automatic_payment_methods: {
        enabled: true,
      },
      description: `Balance top-up of ₹${amount} for user ${userId}`,
    });

    console.log(`✅ Payment intent created: ${paymentIntent.id} (₹${amount})`);
    return paymentIntent;
  }

  // Get user transaction history
  async getTransactionHistory(userId: string, limit: number = 50, offset: number = 0): Promise<ITransaction[]> {
    return await Transaction.find({ userId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(offset)
      .exec();
  }

  // Handle Stripe webhook events
  async handleWebhookEvent(event: Stripe.Event): Promise<void> {
    console.log(`🎯 Processing webhook event: ${event.type}`);
    
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const userId = paymentIntent.metadata['userId'];
        const amount = paymentIntent.amount / 100; // Convert back from smallest currency unit
        
        console.log('💰 Payment succeeded:', {
          paymentIntentId: paymentIntent.id,
          userId,
          amount,
          metadata: paymentIntent.metadata
        });
        
        if (userId && paymentIntent.metadata['type'] === 'balance_topup') {
          console.log(`💳 Adding balance: ₹${amount} for user ${userId}`);
          const result = await this.addBalance(userId, amount, paymentIntent.id);
          console.log('✅ Balance updated:', {
            newBalance: result.newBalance,
            transactionId: result.transaction?._id
          });
        } else {
          console.warn('⚠️ Payment succeeded but missing userId or incorrect type:', {
            hasUserId: !!userId,
            type: paymentIntent.metadata['type']
          });
        }
        break;
      
      case 'payment_intent.payment_failed':
        const failedPayment = event.data.object as Stripe.PaymentIntent;
        console.error('❌ Payment failed:', {
          paymentIntentId: failedPayment.id,
          userId: failedPayment.metadata['userId'],
          amount: failedPayment.amount / 100,
          lastError: failedPayment.last_payment_error
        });
        break;
      
      default:
        console.log(`❓ Unhandled event type: ${event.type}`);
    }
  }

  // Verify payment intent status
  async verifyPaymentIntent(paymentIntentId: string): Promise<Stripe.PaymentIntent> {
    return await stripe.paymentIntents.retrieve(paymentIntentId);
  }

  // Find transaction by reference (payment intent ID)
  async findTransactionByReference(reference: string): Promise<ITransaction | null> {
    return await Transaction.findOne({ reference });
  }

  // Process direct payment - comprehensive method for frontend payment confirmation
  async processDirectPayment(userId: string, amount: number, paymentIntentId: string): Promise<{ success: boolean; newBalance: number; transaction?: ITransaction; error?: string }> {
    console.log(`🔄 Processing direct payment: User ${userId}, Amount ₹${amount}, PaymentIntent ${paymentIntentId}`);
    
    try {
      // Step 1: Verify payment intent with Stripe
      console.log('🔍 Verifying payment with Stripe...');
      const paymentIntent = await this.verifyPaymentIntent(paymentIntentId);
      
      if (paymentIntent.status !== 'succeeded') {
        console.error(`❌ Payment verification failed. Status: ${paymentIntent.status}`);
        return { 
          success: false, 
          newBalance: 0, 
          error: `Payment not successful. Status: ${paymentIntent.status}` 
        };
      }

      // Step 2: Verify payment amount matches
      const stripeAmount = paymentIntent.amount / 100; // Convert from paise to rupees
      if (stripeAmount !== amount) {
        console.error(`❌ Amount mismatch. Expected: ₹${amount}, Stripe: ₹${stripeAmount}`);
        return { 
          success: false, 
          newBalance: 0, 
          error: `Amount mismatch. Expected ₹${amount}, got ₹${stripeAmount}` 
        };
      }

      // Step 3: Verify user ID from metadata
      const metadataUserId = paymentIntent.metadata['userId'];
      if (metadataUserId !== userId) {
        console.error(`❌ User ID mismatch. Expected: ${userId}, Metadata: ${metadataUserId}`);
        return { 
          success: false, 
          newBalance: 0, 
          error: 'User ID verification failed' 
        };
      }

      // Step 4: Check for duplicate processing
      const existingTransaction = await this.findTransactionByReference(paymentIntentId);
      if (existingTransaction) {
        console.warn(`⚠️ Payment already processed: ${paymentIntentId}`);
        const userBalance = await this.getUserBalance(userId);
        return { 
          success: true, 
          newBalance: userBalance.balance, 
          transaction: existingTransaction,
          error: 'Payment already processed (returning existing data)' 
        };
      }

      // Step 5: Add balance to user account
      console.log('💰 All verifications passed. Adding balance...');
      const result = await this.addBalance(userId, amount, paymentIntentId);
      
      console.log(`✅ Direct payment processed successfully: ${paymentIntentId}`);
      return result;

    } catch (error: any) {
      console.error(`❌ Direct payment processing failed:`, error);
      return { 
        success: false, 
        newBalance: 0, 
        error: error.message || 'Payment processing failed' 
      };
    }
  }

  // Get payment methods for a customer
  async getPaymentMethods(customerId: string): Promise<Stripe.PaymentMethod[]> {
    const paymentMethods = await stripe.paymentMethods.list({
      customer: customerId,
      type: 'card',
    });
    
    return paymentMethods.data;
  }
}

export const paymentService = new PaymentService(); 