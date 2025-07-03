"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupErrorHandling = void 0;
const setupErrorHandling = (app, nodeEnv) => {
    app.use((error, _req, res, _next) => {
        console.error('Global error handler:', error);
        res.status(500).json({
            success: false,
            message: nodeEnv === 'production'
                ? 'Internal server error'
                : error.message
        });
    });
};
exports.setupErrorHandling = setupErrorHandling;
//# sourceMappingURL=errorHandler.js.map