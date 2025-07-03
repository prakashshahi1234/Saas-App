import express from 'express';
import { paymentController } from '../controllers/paymentController';

const router = express.Router();

// Get user balance
router.get('/balance', paymentController.getUserBalance.bind(paymentController));

// Create payment intent for balance top-up
router.post('/create-payment-intent', paymentController.createPaymentIntent.bind(paymentController));

// Get transaction history
router.get('/transactions', paymentController.getTransactionHistory.bind(paymentController));

// Check if user can create project
router.get('/check-project-eligibility', paymentController.checkProjectCreationEligibility.bind(paymentController));

// Direct payment processing (immediate balance update after payment confirmation)
router.post('/process-direct-payment', paymentController.manualBalanceUpdate.bind(paymentController));

// Legacy endpoint for backward compatibility
router.post('/manual-balance-update', paymentController.manualBalanceUpdate.bind(paymentController));

// Stripe webhook endpoint (this should be before any body parsing middleware)
router.post('/webhook', express.raw({ type: 'application/json' }), paymentController.handleWebhook.bind(paymentController));

export default router; 