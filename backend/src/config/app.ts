// Application configuration
export const config = {
  PORT: process.env['PORT'] || 5000,
  NODE_ENV: process.env['NODE_ENV'] || 'development',
  FRONTEND_URL: process.env['FRONTEND_URL'] || 'http://localhost:3000',
  VERSION: '1.0.0'
} as const; 