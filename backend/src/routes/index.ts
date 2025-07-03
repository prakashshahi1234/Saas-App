import express, { Request, Response } from 'express';
import projectRoutes from './projectRoutes';
import paymentRoutes from './paymentRoutes';
import quoteRoutes from './quoteRoutes';

export const setupRoutes = (app: express.Application, nodeEnv: string): void => {
  // Health check endpoint
  app.get('/health', (_req: Request, res: Response) => {
    res.status(200).json({
      success: true,
      message: 'Server is running',
      timestamp: new Date().toISOString(),
      environment: nodeEnv,
      version: '1.0.0'
    });
  });

  // API routes
  app.use('/api/projects', projectRoutes);
  app.use('/api/payments', paymentRoutes);
  app.use('/api/quotes', quoteRoutes);

  // 404 handler
  app.use('*', (req: Request, res: Response) => {
    res.status(404).json({
      success: false,
      message: `Route ${req.originalUrl} not found`
    });
  });
}; 