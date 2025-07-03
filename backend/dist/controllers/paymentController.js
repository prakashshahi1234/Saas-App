"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.paymentController = exports.PaymentController = void 0;
const paymentService_1 = require("../services/paymentService");
const stripe_1 = __importDefault(require("stripe"));
class PaymentController {
    constructor(paymentService) {
        this.paymentService = paymentService;
    }
    async getUserBalance(req, res) {
        try {
            const userId = req.headers['user-id'];
            if (!userId) {
                res.status(401).json({
                    success: false,
                    message: 'User ID is required'
                });
                return;
            }
            const userBalance = await this.paymentService.getUserBalance(userId);
            res.status(200).json({
                success: true,
                data: {
                    balance: userBalance.balance,
                    currency: userBalance.currency
                }
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: error instanceof Error ? error.message : 'Failed to get user balance'
            });
        }
    }
    async createPaymentIntent(req, res) {
        try {
            const userId = req.headers['user-id'];
            const { amount } = req.body;
            if (!userId) {
                res.status(401).json({
                    success: false,
                    message: 'User ID is required'
                });
                return;
            }
            if (!amount || amount <= 0) {
                res.status(400).json({
                    success: false,
                    message: 'Valid amount is required'
                });
                return;
            }
            const paymentIntent = await this.paymentService.createPaymentIntent(amount, 'inr', userId);
            res.status(200).json({
                success: true,
                data: {
                    clientSecret: paymentIntent.client_secret,
                    paymentIntentId: paymentIntent.id
                }
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: error instanceof Error ? error.message : 'Failed to create payment intent'
            });
        }
    }
    async getTransactionHistory(req, res) {
        try {
            const userId = req.headers['user-id'];
            const { limit = 50, offset = 0 } = req.query;
            if (!userId) {
                res.status(401).json({
                    success: false,
                    message: 'User ID is required'
                });
                return;
            }
            const transactions = await this.paymentService.getTransactionHistory(userId, Number(limit), Number(offset));
            res.status(200).json({
                success: true,
                data: transactions,
                count: transactions.length
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: error instanceof Error ? error.message : 'Failed to get transaction history'
            });
        }
    }
    async handleWebhook(req, res) {
        const sig = req.headers['stripe-signature'];
        const endpointSecret = process.env['STRIPE_WEBHOOK_SECRET'] || '';
        console.log('🔗 Webhook received:', {
            hasSignature: !!sig,
            hasSecret: !!endpointSecret,
            secretPrefix: endpointSecret ? endpointSecret.substring(0, 7) : 'none'
        });
        let event;
        try {
            event = stripe_1.default.webhooks.constructEvent(req.body, sig, endpointSecret);
            console.log('✅ Webhook signature verified, event type:', event.type);
        }
        catch (err) {
            console.error('❌ Webhook signature verification failed:', err);
            res.status(400).json({
                success: false,
                message: 'Webhook signature verification failed'
            });
            return;
        }
        try {
            console.log('🔄 Processing webhook event:', event.type);
            await this.paymentService.handleWebhookEvent(event);
            console.log('✅ Webhook processed successfully');
            res.status(200).json({
                success: true,
                message: 'Webhook processed successfully'
            });
        }
        catch (error) {
            console.error('❌ Webhook processing failed:', error);
            res.status(500).json({
                success: false,
                message: 'Webhook processing failed'
            });
        }
    }
    async manualBalanceUpdate(req, res) {
        try {
            const userId = req.headers['user-id'];
            const { amount, paymentIntentId } = req.body;
            console.log(`📝 Direct payment request: User ${userId}, Amount ₹${amount}, PaymentIntent ${paymentIntentId}`);
            if (!userId) {
                res.status(401).json({
                    success: false,
                    message: 'User ID is required'
                });
                return;
            }
            if (!amount || !paymentIntentId) {
                res.status(400).json({
                    success: false,
                    message: 'Amount and payment intent ID are required'
                });
                return;
            }
            const result = await this.paymentService.processDirectPayment(userId, amount, paymentIntentId);
            if (!result.success) {
                res.status(400).json({
                    success: false,
                    message: result.error || 'Payment processing failed'
                });
                return;
            }
            res.status(200).json({
                success: true,
                message: 'Payment processed successfully',
                data: {
                    newBalance: result.newBalance,
                    transaction: result.transaction
                }
            });
        }
        catch (error) {
            console.error('❌ Direct payment endpoint error:', error);
            res.status(500).json({
                success: false,
                message: error instanceof Error ? error.message : 'Failed to process payment'
            });
        }
    }
    async checkProjectCreationEligibility(req, res) {
        try {
            const userId = req.headers['user-id'];
            const projectCreationFee = 100;
            if (!userId) {
                res.status(401).json({
                    success: false,
                    message: 'User ID is required'
                });
                return;
            }
            const hasSufficientBalance = await this.paymentService.hasSufficientBalance(userId, projectCreationFee);
            const userBalance = await this.paymentService.getUserBalance(userId);
            res.status(200).json({
                success: true,
                data: {
                    canCreateProject: hasSufficientBalance,
                    currentBalance: userBalance.balance,
                    requiredAmount: projectCreationFee,
                    shortfall: hasSufficientBalance ? 0 : projectCreationFee - userBalance.balance
                }
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: error instanceof Error ? error.message : 'Failed to check project creation eligibility'
            });
        }
    }
}
exports.PaymentController = PaymentController;
exports.paymentController = new PaymentController(paymentService_1.paymentService);
//# sourceMappingURL=paymentController.js.map