import { Request, Response } from 'express';
import { PaymentService } from '../services/paymentService';
export declare class PaymentController {
    private paymentService;
    constructor(paymentService: PaymentService);
    getUserBalance(req: Request, res: Response): Promise<void>;
    createPaymentIntent(req: Request, res: Response): Promise<void>;
    getTransactionHistory(req: Request, res: Response): Promise<void>;
    handleWebhook(req: Request, res: Response): Promise<void>;
    manualBalanceUpdate(req: Request, res: Response): Promise<void>;
    checkProjectCreationEligibility(req: Request, res: Response): Promise<void>;
}
export declare const paymentController: PaymentController;
//# sourceMappingURL=paymentController.d.ts.map