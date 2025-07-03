import express from 'express';
import dotenv from 'dotenv';
import { connectDB } from './config/database';
import { config } from './config/app';
import { setupMiddleware } from './middleware';
import { setupRoutes } from './routes';
import { setupErrorHandling } from './middleware/errorHandler';
import { setupGracefulShutdown } from './utils/gracefulShutdown';

// Load environment variables
dotenv.config();


// Create Express app
const app = express();

// Start server
const startServer = async (): Promise<void> => {
  try {
    // Setup middleware, routes, and error handling
    setupMiddleware(app, config.FRONTEND_URL);
    setupRoutes(app, config.NODE_ENV);
    setupErrorHandling(app, config.NODE_ENV);
    setupGracefulShutdown();

    // Connect to database
    await connectDB();
    
    // Start listening
    app.listen(config.PORT, () => {
      console.log(`🚀 Server running on port ${config.PORT}`);
      console.log(`📊 Environment: ${config.NODE_ENV}`);
      console.log(`🔗 Health check: http://localhost:${config.PORT}/health`);
      console.log(`🌐 Frontend URL: ${config.FRONTEND_URL}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Start the server
startServer(); 