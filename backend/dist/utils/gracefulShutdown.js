"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupGracefulShutdown = void 0;
const setupGracefulShutdown = () => {
    const gracefulShutdown = (signal) => {
        console.log(`🛑 ${signal} received, shutting down gracefully`);
        process.exit(0);
    };
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
};
exports.setupGracefulShutdown = setupGracefulShutdown;
//# sourceMappingURL=gracefulShutdown.js.map