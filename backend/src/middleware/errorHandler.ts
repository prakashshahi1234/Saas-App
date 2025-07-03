import express, { Request, Response, NextFunction } from 'express';

export const setupErrorHandling = (app: express.Application, nodeEnv: string): void => {
  // Global error handler
  app.use((error: Error, _req: Request, res: Response, _next: NextFunction) => {
    console.error('Global error handler:', error);
    
    res.status(500).json({
      success: false,
      message: nodeEnv === 'production' 
        ? 'Internal server error' 
        : error.message
    });
  });
}; 