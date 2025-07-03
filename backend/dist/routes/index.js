"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupRoutes = void 0;
const projectRoutes_1 = __importDefault(require("./projectRoutes"));
const paymentRoutes_1 = __importDefault(require("./paymentRoutes"));
const quoteRoutes_1 = __importDefault(require("./quoteRoutes"));
const setupRoutes = (app, nodeEnv) => {
    app.get('/health', (_req, res) => {
        res.status(200).json({
            success: true,
            message: 'Server is running',
            timestamp: new Date().toISOString(),
            environment: nodeEnv,
            version: '1.0.0'
        });
    });
    app.use('/api/projects', projectRoutes_1.default);
    app.use('/api/payments', paymentRoutes_1.default);
    app.use('/api/quotes', quoteRoutes_1.default);
    app.use('*', (req, res) => {
        res.status(404).json({
            success: false,
            message: `Route ${req.originalUrl} not found`
        });
    });
};
exports.setupRoutes = setupRoutes;
//# sourceMappingURL=index.js.map