import { Connection } from 'mongoose';
declare const connectDB: () => Promise<Connection>;
declare const testConnection: () => Promise<void>;
declare const disconnectDB: () => Promise<void>;
export { connectDB, disconnectDB, testConnection };
//# sourceMappingURL=database.d.ts.map