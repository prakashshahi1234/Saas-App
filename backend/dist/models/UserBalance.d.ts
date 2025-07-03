import mongoose, { Document } from 'mongoose';
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
    reference?: string;
    status: 'pending' | 'completed' | 'failed';
    createdAt: Date;
    updatedAt: Date;
}
export declare const UserBalance: mongoose.Model<IUserBalance, {}, {}, {}, mongoose.Document<unknown, {}, IUserBalance, {}> & IUserBalance & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export declare const Transaction: mongoose.Model<ITransaction, {}, {}, {}, mongoose.Document<unknown, {}, ITransaction, {}> & ITransaction & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=UserBalance.d.ts.map