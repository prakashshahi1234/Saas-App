"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const database_1 = require("./config/database");
const app_1 = require("./config/app");
const middleware_1 = require("./middleware");
const routes_1 = require("./routes");
const errorHandler_1 = require("./middleware/errorHandler");
const gracefulShutdown_1 = require("./utils/gracefulShutdown");
dotenv_1.default.config();
const app = (0, express_1.default)();
const startServer = async () => {
    try {
        (0, middleware_1.setupMiddleware)(app, app_1.config.FRONTEND_URL);
        (0, routes_1.setupRoutes)(app, app_1.config.NODE_ENV);
        (0, errorHandler_1.setupErrorHandling)(app, app_1.config.NODE_ENV);
        (0, gracefulShutdown_1.setupGracefulShutdown)();
        await (0, database_1.connectDB)();
        app.listen(app_1.config.PORT, () => {
            console.log(`🚀 Server running on port ${app_1.config.PORT}`);
            console.log(`📊 Environment: ${app_1.config.NODE_ENV}`);
            console.log(`🔗 Health check: http://localhost:${app_1.config.PORT}/health`);
            console.log(`🌐 Frontend URL: ${app_1.config.FRONTEND_URL}`);
        });
    }
    catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
};
startServer();
//# sourceMappingURL=server.js.map