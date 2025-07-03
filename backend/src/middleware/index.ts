import express from 'express';
import cors from 'cors';
import morgan from 'morgan';

export const setupMiddleware = (app: express.Application, frontendUrl: string): void => {
  // CORS configuration
  app.use(cors({
    origin: frontendUrl,
    credentials: true
  }));

  // Body parsing middleware
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));

  // HTTP request logging
  app.use(morgan('dev'));
}; 