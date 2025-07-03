import Stripe from 'stripe';
import { IUserBalance, ITransaction } from '../models/UserBalance';
export declare class PaymentService {
    getUserBalance(userId: string): Promise<IUserBalance>;
    hasSufficientBalance(userId: string, amount: number): Promise<boolean>;
    deductBalance(userId: string, amount: number, projectId: string): Promise<{
        success: boolean;
        newBalance: number;
        transaction?: ITransaction;
    }>;
    addBalance(userId: string, amount: number, paymentIntentId: string): Promise<{
        success: boolean;
        newBalance: number;
        transaction?: ITransaction;
    }>;
    createPaymentIntent(amount: number, currency: string | undefined, userId: string): Promise<Stripe.PaymentIntent>;
    getTransactionHistory(userId: string, limit?: number, offset?: number): Promise<ITransaction[]>;
    handleWebhookEvent(event: Stripe.Event): Promise<void>;
    verifyPaymentIntent(paymentIntentId: string): Promise<Stripe.PaymentIntent>;
    findTransactionByReference(reference: string): Promise<ITransaction | null>;
    processDirectPayment(userId: string, amount: number, paymentIntentId: string): Promise<{
        success: boolean;
        newBalance: number;
        transaction?: ITransaction;
        error?: string;
    }>;
    getPaymentMethods(customerId: string): Promise<Stripe.PaymentMethod[]>;
}
export declare const paymentService: PaymentService;
//# sourceMappingURL=paymentService.d.ts.map