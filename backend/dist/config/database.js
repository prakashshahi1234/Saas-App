"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.testConnection = exports.disconnectDB = exports.connectDB = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const connectDB = async () => {
    try {
        const conn = await mongoose_1.default.connect(process.env['MONGODB_URI'] || 'mongodb://localhost:27017/saas-app');
        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
        console.log(`📊 Database: ${conn.connection.name}`);
        await testConnection();
        return conn.connection;
    }
    catch (error) {
        console.error('❌ Error connecting to MongoDB:', error instanceof Error ? error.message : 'Unknown error');
        process.exit(1);
    }
};
exports.connectDB = connectDB;
const testConnection = async () => {
    try {
        if (!mongoose_1.default.connection.db) {
            throw new Error('Database connection not established');
        }
        const collections = await mongoose_1.default.connection.db.listCollections().toArray();
        console.log(`📋 Collections found: ${collections.length}`);
        const stats = await mongoose_1.default.connection.db.stats();
        console.log(`💾 Database size: ${(stats.dataSize / 1024 / 1024).toFixed(2)} MB`);
        console.log('✅ Database connection test successful');
    }
    catch (error) {
        console.error('❌ Database connection test failed:', error instanceof Error ? error.message : 'Unknown error');
        throw error;
    }
};
exports.testConnection = testConnection;
const disconnectDB = async () => {
    try {
        await mongoose_1.default.disconnect();
        console.log('✅ MongoDB disconnected');
    }
    catch (error) {
        console.error('❌ Error disconnecting from MongoDB:', error instanceof Error ? error.message : 'Unknown error');
    }
};
exports.disconnectDB = disconnectDB;
//# sourceMappingURL=database.js.map