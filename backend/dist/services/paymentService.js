"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.paymentService = exports.PaymentService = void 0;
const stripe_1 = __importDefault(require("stripe"));
const UserBalance_1 = require("../models/UserBalance");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const stripe = new stripe_1.default(process.env['STRIPE_SECRET_KEY'] || '', {
    apiVersion: '2025-06-30.basil',
});
console.log(process.env['STRIPE_SECRET_KEY'], 'stripe secret key');
class PaymentService {
    async getUserBalance(userId) {
        let userBalance = await UserBalance_1.UserBalance.findOne({ userId });
        if (!userBalance) {
            userBalance = new UserBalance_1.UserBalance({
                userId,
                balance: 0,
                currency: 'INR'
            });
            await userBalance.save();
        }
        return userBalance;
    }
    async hasSufficientBalance(userId, amount) {
        const userBalance = await this.getUserBalance(userId);
        return userBalance.balance >= amount;
    }
    async deductBalance(userId, amount, projectId) {
        try {
            const userBalance = await UserBalance_1.UserBalance.findOne({ userId });
            if (!userBalance || userBalance.balance < amount) {
                return { success: false, newBalance: userBalance?.balance || 0 };
            }
            const oldBalance = userBalance.balance;
            userBalance.balance -= amount;
            await userBalance.save();
            const transaction = new UserBalance_1.Transaction({
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
        }
        catch (error) {
            console.error(`❌ Failed to deduct balance for user ${userId}:`, error);
            throw error;
        }
    }
    async addBalance(userId, amount, paymentIntentId) {
        console.log(`💳 Adding balance: ₹${amount} for user ${userId} (Payment: ${paymentIntentId})`);
        try {
            const existingTransaction = await UserBalance_1.Transaction.findOne({ reference: paymentIntentId });
            if (existingTransaction) {
                console.warn(`⚠️ Duplicate payment processing prevented for ${paymentIntentId}`);
                throw new Error('Payment has already been processed');
            }
            const userBalance = await UserBalance_1.UserBalance.findOne({ userId });
            if (!userBalance) {
                throw new Error('User balance not found');
            }
            const oldBalance = userBalance.balance;
            userBalance.balance += amount;
            await userBalance.save();
            const transaction = new UserBalance_1.Transaction({
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
        }
        catch (error) {
            console.error(`❌ Failed to add balance for user ${userId}:`, error);
            throw error;
        }
    }
    async createPaymentIntent(amount, currency = 'inr', userId) {
        console.log(`🎯 Creating payment intent: ₹${amount} for user ${userId}`);
        const paymentIntent = await stripe.paymentIntents.create({
            amount: amount * 100,
            currency,
            metadata: {
                userId,
                type: 'balance_topup',
                originalAmount: amount.toString(),
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
    async getTransactionHistory(userId, limit = 50, offset = 0) {
        return await UserBalance_1.Transaction.find({ userId })
            .sort({ createdAt: -1 })
            .limit(limit)
            .skip(offset)
            .exec();
    }
    async handleWebhookEvent(event) {
        console.log(`🎯 Processing webhook event: ${event.type}`);
        switch (event.type) {
            case 'payment_intent.succeeded':
                const paymentIntent = event.data.object;
                const userId = paymentIntent.metadata['userId'];
                const amount = paymentIntent.amount / 100;
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
                }
                else {
                    console.warn('⚠️ Payment succeeded but missing userId or incorrect type:', {
                        hasUserId: !!userId,
                        type: paymentIntent.metadata['type']
                    });
                }
                break;
            case 'payment_intent.payment_failed':
                const failedPayment = event.data.object;
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
    async verifyPaymentIntent(paymentIntentId) {
        return await stripe.paymentIntents.retrieve(paymentIntentId);
    }
    async findTransactionByReference(reference) {
        return await UserBalance_1.Transaction.findOne({ reference });
    }
    async processDirectPayment(userId, amount, paymentIntentId) {
        console.log(`🔄 Processing direct payment: User ${userId}, Amount ₹${amount}, PaymentIntent ${paymentIntentId}`);
        try {
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
            const stripeAmount = paymentIntent.amount / 100;
            if (stripeAmount !== amount) {
                console.error(`❌ Amount mismatch. Expected: ₹${amount}, Stripe: ₹${stripeAmount}`);
                return {
                    success: false,
                    newBalance: 0,
                    error: `Amount mismatch. Expected ₹${amount}, got ₹${stripeAmount}`
                };
            }
            const metadataUserId = paymentIntent.metadata['userId'];
            if (metadataUserId !== userId) {
                console.error(`❌ User ID mismatch. Expected: ${userId}, Metadata: ${metadataUserId}`);
                return {
                    success: false,
                    newBalance: 0,
                    error: 'User ID verification failed'
                };
            }
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
            console.log('💰 All verifications passed. Adding balance...');
            const result = await this.addBalance(userId, amount, paymentIntentId);
            console.log(`✅ Direct payment processed successfully: ${paymentIntentId}`);
            return result;
        }
        catch (error) {
            console.error(`❌ Direct payment processing failed:`, error);
            return {
                success: false,
                newBalance: 0,
                error: error.message || 'Payment processing failed'
            };
        }
    }
    async getPaymentMethods(customerId) {
        const paymentMethods = await stripe.paymentMethods.list({
            customer: customerId,
            type: 'card',
        });
        return paymentMethods.data;
    }
}
exports.PaymentService = PaymentService;
exports.paymentService = new PaymentService();
//# sourceMappingURL=paymentService.js.map