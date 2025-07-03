"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const paymentController_1 = require("../controllers/paymentController");
const router = express_1.default.Router();
router.get('/balance', paymentController_1.paymentController.getUserBalance.bind(paymentController_1.paymentController));
router.post('/create-payment-intent', paymentController_1.paymentController.createPaymentIntent.bind(paymentController_1.paymentController));
router.get('/transactions', paymentController_1.paymentController.getTransactionHistory.bind(paymentController_1.paymentController));
router.get('/check-project-eligibility', paymentController_1.paymentController.checkProjectCreationEligibility.bind(paymentController_1.paymentController));
router.post('/process-direct-payment', paymentController_1.paymentController.manualBalanceUpdate.bind(paymentController_1.paymentController));
router.post('/manual-balance-update', paymentController_1.paymentController.manualBalanceUpdate.bind(paymentController_1.paymentController));
router.post('/webhook', express_1.default.raw({ type: 'application/json' }), paymentController_1.paymentController.handleWebhook.bind(paymentController_1.paymentController));
exports.default = router;
//# sourceMappingURL=paymentRoutes.js.map